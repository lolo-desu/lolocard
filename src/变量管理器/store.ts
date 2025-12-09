import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { isDebugMode } from './util';

type StatData = Record<string, any>;
type VariablesPayload = Record<string, any>;
type HistoryEntry = {
  data: StatData;
  timestamp: number;
};
type RefreshOptions = {
  force?: boolean;
};

// 收藏项类型
type FavoriteItem = {
  path: string; // 路径（不包括 stat_data）
  label: string; // 显示名称
  addedAt: number; // 添加时间戳
  characterId: string; // 角色卡标识符（avatar文件名）
};

// 全局收藏夹存储结构（按角色卡分组）
type FavoritesStorage = {
  [characterId: string]: FavoriteItem[];
};

// 修改记录类型
type ChangeRecord = {
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  byManager: boolean; // 是否通过变量管理器修改
  chatId: string; // 聊天标识符
  messageId: string; // 消息ID（楼层标识符）
};

const HISTORY_LIMIT = 30;
const AUTO_REFRESH_INTERVAL = 2000; // 2秒刷新间隔，保证快速响应
const CHANGE_HIGHLIGHT_DURATION = 1500; // 变更高亮持续时间
const CHANGE_RECORDS_LIMIT = 100; // 修改记录最大数量
const FAVORITES_STORAGE_KEY = 'variable_manager_favorites'; // LocalStorage 键
const CHANGE_RECORDS_STORAGE_KEY = 'variable_manager_change_records'; // LocalStorage 键

const LATEST_MESSAGE_OPTION = () =>
  ({
    type: 'message',
    message_id: 'latest',
  }) as const;

function snapshotStatData(statData: StatData): StatData {
  return klona(statData);
}

function flattenAllPaths(target: any, prefix = ''): string[] {
  if (!_.isObject(target)) {
    return prefix ? [prefix] : [];
  }
  const results: string[] = prefix ? [prefix] : [];
  if (Array.isArray(target)) {
    target.forEach((value, index) => {
      const nextPrefix = prefix ? `${prefix}.${index}` : `${index}`;
      results.push(...flattenAllPaths(value, nextPrefix));
    });
    return results;
  }
  Object.entries(target).forEach(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    results.push(...flattenAllPaths(value, nextPrefix));
  });
  return results;
}

function matchesKeyword(value: unknown, label: string, keyword: string): boolean {
  if (!keyword.trim()) {
    return true;
  }
  const lowerKeyword = keyword.trim().toLowerCase();
  const labelMatch = label.toLowerCase().includes(lowerKeyword);
  if (labelMatch) {
    return true;
  }
  if (!_.isObject(value)) {
    return String(value ?? '').toLowerCase().includes(lowerKeyword);
  }
  if (Array.isArray(value)) {
    return value.some((child, index) => matchesKeyword(child, `${index}`, lowerKeyword));
  }
  return Object.entries(value as Record<string, unknown>).some(([childKey, childValue]) =>
    matchesKeyword(childValue, childKey, lowerKeyword),
  );
}

export const useVariableManagerStore = defineStore('simple-variable-manager', () => {
  const variables = ref<VariablesPayload>({});
  const statData = ref<StatData>({});
  const schema = ref<Record<string, any> | undefined>(undefined);
  const initialized = ref(false);
  const expandedPaths = ref<Set<string>>(new Set());
  const searchKeyword = ref('');
  const undoStack = ref<HistoryEntry[]>([]);
  const redoStack = ref<HistoryEntry[]>([]);
  const changedPaths = ref<Set<string>>(new Set()); // 跟踪最近更改的路径

  // 修改记录
  const changeRecords = ref<ChangeRecord[]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  // 获取当前角色卡ID（使用avatar作为唯一标识）
  function getCurrentCharacterId(): string {
    try {
      const win = window as any;

      // 从SillyTavern全局变量获取
      if (win.SillyTavern?.characters && win.SillyTavern?.characterId !== undefined) {
        const charId = win.SillyTavern.characterId;
        const character = win.SillyTavern.characters[charId];
        if (character?.avatar) {
          return character.avatar;
        }
      }

      // 备用方案：从this_chid和characters获取
      if (win.this_chid !== undefined && win.characters) {
        const character = win.characters[win.this_chid];
        if (character?.avatar) {
          return character.avatar;
        }
      }

      // 如果都获取不到，返回默认值
      if (isDebugMode()) {
        console.warn('[变量管理器] 无法获取角色ID，使用默认值: no-character');
      }
      return 'no-character';
    } catch (error) {
      if (isDebugMode()) {
        console.error('[变量管理器] 获取角色ID时出错:', error);
      }
      return 'no-character';
    }
  }

  // 收藏功能 - 存储所有角色卡的收藏
  const allFavorites = ref<FavoritesStorage>({});

  // 当前角色ID（响应式引用，以便Vue能追踪变化）
  const currentCharacterId = ref<string>(getCurrentCharacterId());

  // 当前角色卡的收藏（计算属性）
  const favorites = computed(() => {
    const charId = currentCharacterId.value;
    return allFavorites.value[charId] || [];
  });

  function findChangedPaths(oldData: any, newData: any, prefix = ''): string[] {
    const changed: string[] = [];

    // 检查两个值是否不同
    if (!_.isEqual(oldData, newData)) {
      if (prefix) {
        changed.push(prefix);
      }

      // 如果都是对象，递归检查子路径
      if (_.isPlainObject(oldData) && _.isPlainObject(newData)) {
        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
        allKeys.forEach(key => {
          const nextPrefix = prefix ? `${prefix}.${key}` : key;
          changed.push(...findChangedPaths(oldData[key], newData[key], nextPrefix));
        });
      } else if (Array.isArray(oldData) && Array.isArray(newData)) {
        const maxLen = Math.max(oldData.length, newData.length);
        for (let i = 0; i < maxLen; i++) {
          const nextPrefix = prefix ? `${prefix}.${i}` : `${i}`;
          changed.push(...findChangedPaths(oldData[i], newData[i], nextPrefix));
        }
      }
    }

    return changed;
  }

  function loadFromVariables(payload: VariablesPayload, trackChanges = false) {
    const oldStatData = trackChanges ? klona(statData.value) : null;

    variables.value = payload;
    statData.value = klona(_.get(payload, 'stat_data', {}));
    schema.value = _.get(payload, 'schema');
    initialized.value = true;

    // 如果需要跟踪变更，找出所有改变的路径
    if (trackChanges && oldStatData) {
      const changed = findChangedPaths(oldStatData, statData.value);
      if (changed.length > 0) {
        changedPaths.value = new Set(changed);
        // 跟踪外部修改
        trackExternalChanges(oldStatData, statData.value);
        // 一段时间后清除高亮
        setTimeout(() => {
          changedPaths.value = new Set();
        }, CHANGE_HIGHLIGHT_DURATION);
      }
    }
  }

  let autoRefreshTimer: number | null = null;

  async function refreshFromSource(options: RefreshOptions = {}): Promise<boolean> {
    const { force = false } = options;
    try {
      const payload = getVariables(LATEST_MESSAGE_OPTION());
      const nextStatData = _.get(payload, 'stat_data', {});
      const shouldApply = force || !_.isEqual(nextStatData, statData.value);
      if (shouldApply) {
        loadFromVariables(payload, !force); // 非强制刷新时跟踪变更
      }

      // 每次刷新时检查角色ID是否变化
      const latestCharId = getCurrentCharacterId();
      if (latestCharId !== currentCharacterId.value) {
        currentCharacterId.value = latestCharId;
      }

      return shouldApply;
    } catch {
      loadFromVariables({ stat_data: {} }, false);
      if (isDebugMode()) {
        console.warn('[变量管理器] 无法获取最新楼层变量，请确认当前聊天中存在可编辑的楼层。');
      }
      return false;
    }
  }

  function startAutoRefresh() {
    if (autoRefreshTimer !== null) {
      return;
    }
    autoRefreshTimer = window.setInterval(() => {
      void refreshFromSource();
    }, AUTO_REFRESH_INTERVAL);
  }

  function stopAutoRefresh() {
    if (autoRefreshTimer !== null) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
    }
  }

  function pushHistory(snapshot: StatData) {
    undoStack.value.push({ data: snapshotStatData(snapshot), timestamp: Date.now() });
    if (undoStack.value.length > HISTORY_LIMIT) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }

  // 获取当前聊天ID
  function getCurrentChatId(): string {
    try {
      // 尝试从全局变量获取聊天ID
      const win = window as any;
      if (win.chat_metadata?.chat_id) {
        return win.chat_metadata.chat_id;
      }
      // 尝试从其他可能的全局变量获取
      if (win.this_chid !== undefined) {
        return String(win.this_chid);
      }
      // 如果都获取不到，使用默认值
      return 'default';
    } catch {
      return 'default';
    }
  }

  // 获取当前消息ID
  function getCurrentMessageId(): string {
    try {
      const win = window as any;
      // 尝试从全局变量获取当前消息ID
      if (win.chat?.length > 0) {
        // 获取最后一条消息的ID
        const lastMessage = win.chat[win.chat.length - 1];
        if (lastMessage?.mes_id !== undefined) {
          return String(lastMessage.mes_id);
        }
        // 如果没有mes_id，使用索引
        return String(win.chat.length - 1);
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // 记录变更
  function recordChange(path: string, oldValue: any, newValue: any, byManager: boolean) {
    const chatId = getCurrentChatId();
    const messageId = getCurrentMessageId();

    changeRecords.value.unshift({
      path,
      oldValue,
      newValue,
      timestamp: Date.now(),
      byManager,
      chatId,
      messageId,
    });

    // 限制记录数量（每个聊天独立计数）
    const chatRecords = changeRecords.value.filter(r => r.chatId === chatId);
    if (chatRecords.length > CHANGE_RECORDS_LIMIT) {
      // 移除当前聊天最旧的记录
      const oldestChatRecord = chatRecords[chatRecords.length - 1];
      const index = changeRecords.value.indexOf(oldestChatRecord);
      if (index > -1) {
        changeRecords.value.splice(index, 1);
      }
    }

    // 保存到 localStorage
    saveChangeRecords();
  }

  async function persistStatData(nextStatData: StatData, { keepHistory = false, recordChangePath }: { keepHistory?: boolean; recordChangePath?: string } = {}) {
    const previousPayload = klona(variables.value);
    const previousSnapshot = snapshotStatData(statData.value);

    const optimisticPayload = klona(previousPayload);
    _.set(optimisticPayload, 'stat_data', nextStatData);
    variables.value = optimisticPayload;
    statData.value = klona(nextStatData);

    try {
      await Promise.resolve(
        updateVariablesWith(current => {
          _.set(current, 'stat_data', nextStatData);
          return current;
        }, LATEST_MESSAGE_OPTION()),
      );

      if (!keepHistory) {
        pushHistory(previousSnapshot);
      }

      // 记录变更（通过变量管理器修改）
      if (recordChangePath) {
        const oldValue = _.get(previousSnapshot, recordChangePath);
        const newValue = _.get(nextStatData, recordChangePath);
        recordChange(recordChangePath, oldValue, newValue, true);
      }

      await refreshFromSource({ force: true });
    } catch {
      toastr.error('写入 stat_data 失败', '变量管理器');
      variables.value = previousPayload;
      statData.value = snapshotStatData(previousSnapshot);
    }
  }

async function setValue(path: string, value: any) {
  const next = snapshotStatData(statData.value);
  _.set(next, path, value);
  await persistStatData(next, { recordChangePath: path });
}

async function incrementValue(path: string, delta: number) {
  const next = snapshotStatData(statData.value);
  const numeric = Number(_.get(next, path) ?? 0);
  _.set(next, path, numeric + delta);
  await persistStatData(next, { recordChangePath: path });
}

async function toggleBoolean(path: string) {
  const next = snapshotStatData(statData.value);
  _.set(next, path, !_.get(next, path));
  await persistStatData(next, { recordChangePath: path });
}

async function undo() {
  const previous = undoStack.value.pop();
  if (!previous) {
    return;
  }
  redoStack.value.push({ data: snapshotStatData(statData.value), timestamp: Date.now() });
  await persistStatData(previous.data, { keepHistory: true });
}

async function redo() {
  const nextState = redoStack.value.pop();
  if (!nextState) {
    return;
  }
  undoStack.value.push({ data: snapshotStatData(statData.value), timestamp: Date.now() });
  await persistStatData(nextState.data, { keepHistory: true });
}

  function expandAll() {
    expandedPaths.value = new Set(flattenAllPaths(statData.value));
    void refreshFromSource();
  }

  function collapseAll() {
    expandedPaths.value = new Set();
    void refreshFromSource();
  }

  function toggleExpand(path: string) {
    const updated = new Set(expandedPaths.value);
    if (updated.has(path)) {
      updated.delete(path);
    } else {
      updated.add(path);
    }
    expandedPaths.value = updated;
    void refreshFromSource();
  }

  function isExpanded(path: string) {
    return expandedPaths.value.has(path);
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword;
    void refreshFromSource();
  }

  async function deleteValue(path: string) {
    const oldValue = _.get(statData.value, path);
    const next = snapshotStatData(statData.value);

    // 分离路径的最后一段和父路径
    const pathParts = path.split('.');
    const lastKey = pathParts.pop();
    const parentPath = pathParts.join('.');

    if (!lastKey) {
      // 如果没有最后一个键，说明路径无效
      return;
    }

    // 获取父对象
    const parent = parentPath ? _.get(next, parentPath) : next;

    if (!parent) {
      // 父对象不存在，无需删除
      return;
    }

    // 判断父对象是数组还是对象
    if (Array.isArray(parent)) {
      // 如果是数组，使用 splice 删除元素
      const index = parseInt(lastKey, 10);
      if (!isNaN(index) && index >= 0 && index < parent.length) {
        parent.splice(index, 1);
      }
    } else if (_.isPlainObject(parent)) {
      // 如果是对象，使用 delete 删除属性
      delete parent[lastKey];
    }

    recordChange(path, oldValue, undefined, true);
    await persistStatData(next);
  }

  function isPathChanged(path: string): boolean {
    return changedPaths.value.has(path);
  }

  // 收藏功能
  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 兼容旧版本数据：如果是数组，转换为新格式
        if (Array.isArray(parsed)) {
          allFavorites.value = { legacy: parsed };
        } else {
          allFavorites.value = parsed;
        }
      }
    } catch {
      // 静默失败
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites.value));
    } catch {
      // 静默失败
    }
  }

  function addFavorite(path: string, label: string) {
    const charId = currentCharacterId.value;
    const currentList = allFavorites.value[charId] || [];

    // 检查是否已收藏
    if (currentList.some((f: FavoriteItem) => f.path === path)) {
      return;
    }

    // 创建新的收藏项
    const newItem: FavoriteItem = {
      path,
      label,
      addedAt: Date.now(),
      characterId: charId,
    };

    // 创建新数组（触发响应式更新）
    allFavorites.value = {
      ...allFavorites.value,
      [charId]: [...currentList, newItem],
    };

    saveFavorites();
  }

  function removeFavorite(path: string) {
    const charId = currentCharacterId.value;
    const currentList = allFavorites.value[charId];
    if (currentList) {
      // 创建新数组（触发响应式更新）
      allFavorites.value = {
        ...allFavorites.value,
        [charId]: currentList.filter((f: FavoriteItem) => f.path !== path),
      };
      saveFavorites();
    }
  }

  function isFavorite(path: string): boolean {
    const charId = currentCharacterId.value;
    const result = allFavorites.value[charId]?.some((f: FavoriteItem) => f.path === path) ?? false;
    return result;
  }

  // 修改记录功能
  function loadChangeRecords() {
    try {
      const stored = localStorage.getItem(CHANGE_RECORDS_STORAGE_KEY);
      if (stored) {
        changeRecords.value = JSON.parse(stored);
      }
    } catch {
      // 静默失败
    }
  }

  function saveChangeRecords() {
    try {
      localStorage.setItem(CHANGE_RECORDS_STORAGE_KEY, JSON.stringify(changeRecords.value));
    } catch {
      // 静默失败
    }
  }

  function clearChangeRecords() {
    changeRecords.value = [];
    saveChangeRecords();
  }

  // 监听外部变更（非管理器修改）
  function trackExternalChanges(oldData: StatData, newData: StatData) {
    const changed = findChangedPaths(oldData, newData);
    changed.forEach(path => {
      const oldValue = _.get(oldData, path);
      const newValue = _.get(newData, path);
      // 记录所有叶子节点的变更（字符串、数字、布尔值、null等）
      const isLeaf = !_.isPlainObject(newValue) && (!Array.isArray(newValue) || newValue.length === 0);
      if (isLeaf || oldValue === undefined || newValue === undefined) {
        recordChange(path, oldValue, newValue, false);
      }
    });
  }

  // 初始化时加载收藏和记录
  loadFavorites();
  loadChangeRecords();

  return {
    statData,
    schema,
    initialized,
    searchKeyword,
    canUndo,
    canRedo,
    isExpanded,
    toggleExpand,
    expandAll,
    collapseAll,
    refreshFromSource,
    startAutoRefresh,
    stopAutoRefresh,
    setValue,
    incrementValue,
    toggleBoolean,
    deleteValue,
    setSearchKeyword,
    undo,
    redo,
    matchesKeyword,
    isPathChanged,
    // 收藏功能
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    currentCharacterId, // 导出响应式角色ID
    // 修改记录
    changeRecords,
    clearChangeRecords,
    trackExternalChanges,
    getCurrentChatId,
    getCurrentCharacterId,
  };
});

let characterSwitchListener: (() => void) | null = null;

export function bootstrapVariableManager() {
  const store = useVariableManagerStore();
  if (!store.initialized) {
    store.refreshFromSource({ force: true });
  }
  store.startAutoRefresh();

  // 延迟更新角色ID，确保SillyTavern已加载完成
  setTimeout(() => {
    store.currentCharacterId = store.getCurrentCharacterId();
  }, 500);

  // 监听角色卡切换事件
  try {
    const win = window as any;
    if (win.eventSource && win.tavern_events) {
      // 监听角色切换事件
      characterSwitchListener = () => {
        // 更新响应式角色ID（这会触发 favorites computed 重新计算）
        store.currentCharacterId = store.getCurrentCharacterId();
        // 刷新数据
        void store.refreshFromSource({ force: true });
      };

      // CHARACTER_SELECTED 是角色选择事件
      win.eventSource.on(win.tavern_events.CHARACTER_SELECTED, characterSwitchListener);
    }
  } catch {
    // 静默失败
  }
}

export function teardownVariableManager() {
  const store = useVariableManagerStore();
  store.stopAutoRefresh();

  // 移除角色卡切换监听
  try {
    const win = window as any;
    if (characterSwitchListener && win.eventSource && win.tavern_events) {
      win.eventSource.removeListener(win.tavern_events.CHARACTER_SELECTED, characterSwitchListener);
      characterSwitchListener = null;
    }
  } catch {
    // 静默失败
  }
}
