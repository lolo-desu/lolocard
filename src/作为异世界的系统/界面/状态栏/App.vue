<template>
  <div class="status-system-wrapper">
    <section class="status-system">
      <div class="top-info-bar">
        <div class="info-left">
          <span class="status-indicator online" aria-hidden="true"></span>
          <span>{{ currentTimeLabel }}</span>
        </div>
        <div class="info-right">
          <div class="status-badge">{{ statData.世界.当前地点 }}</div>
        </div>
      </div>

      <div class="main-content">
        <div class="character-panel">
          <div class="mobile-section">
            <button class="collapse-toggle" :aria-expanded="sectionOpen('info')" @click="toggleSection('info')">
              <span>角色信息</span>
              <span class="chevron">{{ sectionOpen('info') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('info')" class="mobile-section__body">
              <div class="character-info-card">
                <div class="character-header">
                  <div
                    class="character-avatar"
                    :class="{ 'has-avatar': avatarUrl, uploading: avatarUploading }"
                    :style="avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}"
                    :title="avatarUploading ? '上传中...' : '点击上传头像'"
                    @click="uploadAvatar(hero.姓名)"
                  >
                    <div v-if="!avatarUrl && !avatarUploading" class="avatar-placeholder">
                      <span>+</span>
                    </div>
                    <div v-if="avatarUploading" class="avatar-loading">
                      <span>...</span>
                    </div>
                  </div>
                  <div class="character-basic-info">
                    <div class="character-name">{{ statData.主角.姓名 }}</div>
                    <div class="character-stats">
                      <div class="stat-item">
                        <span class="stat-label">性别:</span>
                        <span class="stat-value">{{ statData.主角.性别 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">年龄:</span>
                        <span class="stat-value">{{ statData.主角.年龄 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="character-description-section">
                  <div class="appearance-description">{{ hero.外貌.描述 }}</div>
                  <div class="self-evaluation">{{ hero.外貌.主角评价 }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mobile-section">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('abilities')"
              @click="toggleSection('abilities')"
            >
              <span>能力面板</span>
              <span class="chevron">{{ sectionOpen('abilities') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('abilities')" class="mobile-section__body">
              <div class="abilities-panel">
                <div
                  v-for="ability in orderedAbilities"
                  :key="ability.key"
                  class="ability-item"
                  :class="{ active: showBubble === ability.key }"
                  @click="toggleAbilityBubble(ability.key)"
                >
                  <div class="ability-item__name">{{ ability.key }}</div>
                  <div class="ability-item__value">{{ ability.数值 }}</div>
                  <div class="ability-item__desc">{{ abilityBaseDescriptions[ability.key] }}</div>
                  <div v-if="showBubble === ability.key" class="ability-bubble">
                    {{ ability.主角评价 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mobile-section status-effects-mobile-only">
            <button class="collapse-toggle" :aria-expanded="sectionOpen('effects')" @click="toggleSection('effects')">
              <span>状态效果</span>
              <span class="chevron">{{ sectionOpen('effects') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('effects')" class="mobile-section__body">
              <div class="status-effects-panel">
                <div v-if="buffList.length" class="status-effects-group">
                  <div class="status-effects-title">增益状态 ({{ buffList.length }})</div>
                  <ul class="status-effects-list">
                    <li v-for="buff in buffList" :key="buff.id" class="status-effect-item">
                      <div class="status-effect-name">{{ buff.name }}</div>
                      <p class="status-effect-desc">{{ buff.description }}</p>
                      <p v-if="buff.evaluation" class="status-effect-eval">「{{ buff.evaluation }}」</p>
                      <p v-if="buff.extra" class="status-effect-meta">{{ buff.extra }}</p>
                    </li>
                  </ul>
                </div>
                <div v-if="debuffList.length" class="status-effects-group">
                  <div class="status-effects-title">减益状态 ({{ debuffList.length }})</div>
                  <ul class="status-effects-list">
                    <li v-for="debuff in debuffList" :key="debuff.id" class="status-effect-item">
                      <div class="status-effect-name">{{ debuff.name }}</div>
                      <p class="status-effect-desc">{{ debuff.description }}</p>
                      <p v-if="debuff.evaluation" class="status-effect-eval">「{{ debuff.evaluation }}」</p>
                      <p v-if="debuff.extra" class="status-effect-meta">{{ debuff.extra }}</p>
                    </li>
                  </ul>
                </div>
                <p v-if="!buffList.length && !debuffList.length" class="status-effects-empty">暂无状态效果</p>
              </div>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="mobile-section">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('equipment')"
              @click="toggleSection('equipment')"
            >
              <span>装备栏</span>
              <span class="chevron">{{ sectionOpen('equipment') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('equipment')" class="mobile-section__body">
              <div class="equipment-section">
                <div class="section-title">装备栏</div>
                <div class="equipment-grid">
                  <div
                    v-for="slot in equipmentSlots"
                    :key="slot.label"
                    class="equipment-slot"
                    :class="{ active: activeEquipmentBubble === slot.label }"
                    @click="toggleEquipmentBubble(slot.label)"
                  >
                    <div class="slot-name">{{ slot.label }}</div>
                    <div class="slot-item">{{ slot.item || '空置' }}</div>
                    <div v-if="activeEquipmentBubble === slot.label" class="info-bubble equipment-bubble">
                      {{ slot.evaluation || '暂无评价' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mobile-section">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('inventory')"
              @click="toggleSection('inventory')"
            >
              <span>物品栏</span>
              <span class="chevron">{{ sectionOpen('inventory') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('inventory')" class="mobile-section__body">
              <div class="inventory-section">
                <div class="inventory-title">物品栏</div>
                <div class="inventory-container">
                  <div class="inventory-grid">
                    <div
                      v-for="item in paginatedInventory"
                      :key="item.id"
                      class="inventory-item"
                      :class="{ placeholder: item.placeholder, active: activeInventoryBubble === item.id }"
                      @click="!item.placeholder && toggleInventoryBubble(item.id)"
                    >
                      <div class="item-name">{{ item.名称 }}</div>
                      <div class="item-description">{{ item.描述 || item.主角评价 || '空槽位' }}</div>
                      <div
                        v-if="!item.placeholder && activeInventoryBubble === item.id"
                        class="info-bubble inventory-bubble"
                      >
                        {{ item.主角评价 || item.描述 || '暂无评价' }}
                      </div>
                    </div>
                  </div>
                  <div class="inventory-pagination">
                    <button class="page-button" :disabled="currentPage === 1" @click="prevPage">上一页</button>
                    <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
                    <button class="page-button" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="bottom-left">
          <div class="status-effects-trigger">
            <button
              class="status-tab-button positive"
              type="button"
              :class="{ active: statusPopoverTab === 'buff' && showStatusPopover }"
              @click="toggleStatusPopover('buff')"
            >
              Buff ({{ statusCounts.buff }})
            </button>
            <button
              class="status-tab-button negative"
              type="button"
              :class="{ active: statusPopoverTab === 'debuff' && showStatusPopover }"
              @click="toggleStatusPopover('debuff')"
            >
              Debuff ({{ statusCounts.debuff }})
            </button>
            <div v-if="showStatusPopover" class="status-effects-popover">
              <div class="popover-header">
                <span>状态概览</span>
                <button class="popover-close" type="button" aria-label="关闭状态概览" @click="closeStatusPopover">
                  ×
                </button>
              </div>
              <div class="status-effects-content">
                <template v-if="statusPopoverTab === 'buff'">
                  <p v-if="!buffList.length" class="status-effects-empty popover-empty">暂无增益状态</p>
                  <ul v-else class="status-effects-list">
                    <li v-for="buff in buffList" :key="buff.id" class="status-effect-item">
                      <div class="status-effect-name">{{ buff.name }}</div>
                      <p class="status-effect-desc">{{ buff.description }}</p>
                      <p v-if="buff.evaluation" class="status-effect-eval">「{{ buff.evaluation }}」</p>
                      <p v-if="buff.extra" class="status-effect-meta">{{ buff.extra }}</p>
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <p v-if="!debuffList.length" class="status-effects-empty popover-empty">暂无减益状态</p>
                  <ul v-else class="status-effects-list">
                    <li v-for="debuff in debuffList" :key="debuff.id" class="status-effect-item">
                      <div class="status-effect-name">{{ debuff.name }}</div>
                      <p class="status-effect-desc">{{ debuff.description }}</p>
                      <p v-if="debuff.evaluation" class="status-effect-eval">「{{ debuff.evaluation }}」</p>
                      <p v-if="debuff.extra" class="status-effect-meta">{{ debuff.extra }}</p>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-right">
          <button class="action-button" type="button" @click="show_publish_task = true">发布任务</button>
          <button class="action-button" type="button" @click="show_task_list = true">查看任务</button>
          <button class="action-button" type="button" @click="show_grant_reward = true">发布奖励</button>
          <button class="action-button" type="button" @click="show_create_shop_item = true">创建商品</button>
          <button class="action-button" type="button" @click="show_shop = true">查看商城</button>
        </div>
      </div>
    </section>

    <AutoTask v-if="show_publish_task" @close="show_publish_task = false" />

    <GrantReward v-if="show_grant_reward" @close="show_grant_reward = false" />

    <CreateShopItem v-if="show_create_shop_item" @close="show_create_shop_item = false" />

    <Shop v-if="show_shop" @close="show_shop = false" />

    <TaskList v-if="show_task_list" @close="show_task_list = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useAvatarManager } from './composables/useAvatarManager';
import { useDataStore } from './store';
import AutoTask from './view/AutoTask.vue';
import CreateShopItem from './view/CreateShopItem.vue';
import GrantReward from './view/GrantReward.vue';
import Shop from './view/Shop.vue';
import TaskList from './view/TaskList.vue';

type SectionKey = 'info' | 'abilities' | 'equipment' | 'inventory' | 'effects';
type StatusTab = 'buff' | 'debuff';

type StatusEffectEntry = {
  id: string;
  name: string;
  description: string;
  evaluation?: string;
  extra?: string;
};

const show_publish_task = ref(false);
const show_task_list = ref(false);
const show_grant_reward = ref(false);
const show_create_shop_item = ref(false);
const show_shop = ref(false);

const showStatusPopover = ref(false);
const statusPopoverTab = ref<StatusTab>('buff');
const activeEquipmentBubble = ref<string | null>(null);
const activeInventoryBubble = ref<string | null>(null);

const statData = toRef(useDataStore(), 'data');

const { uploading: avatarUploading, avatarUrl, uploadAvatar, loadAvatarForCharacter } = useAvatarManager();

const world = computed(() => statData.value.世界 ?? { 当前地点: '未知地点', 当前时间: '未知时间' });
const systemState = computed(() => statData.value.系统状态 ?? {});
const hero = computed(() => statData.value.主角 ?? {});

// 监听角色名称变化，自动加载头像
watch(
  () => hero.value.姓名,
  async newName => {
    if (newName && newName !== '角色名称') {
      await loadAvatarForCharacter(newName);
    }
  },
  { immediate: true },
);

const abilityOrder = ['力量', '敏捷', '体质', '感知', '意志', '魅力'] as const;
const abilityBaseDescriptions: Record<(typeof abilityOrder)[number], string> = {
  力量: '体能与攻击能力，决定近战输出与负重',
  敏捷: '移动、闪避与反应速度，影响先手与命中',
  体质: '生命力与耐久度，决定抗性与恢复速度',
  感知: '观察与洞察能力，影响侦查与魔力控制',
  意志: '精神力与抗干扰能力，决定技能稳定性',
  魅力: '影响交涉、统御与社交反馈的综合指标',
};
const orderedAbilities = computed(() => {
  const abilities: Record<string, any> = hero.value.能力面板 ?? {};
  return abilityOrder.map(key => ({
    key,
    数值: abilities[key]?.数值 ?? '--',
    主角评价: abilities[key]?.主角评价 ?? '暂无评价',
  }));
});

function mapStatusEntry(entry: unknown, index: number, prefix: string): StatusEffectEntry | null {
  if (!entry) {
    return null;
  }
  if (typeof entry === 'string') {
    return {
      id: `${prefix}-${index}`,
      name: entry,
      description: entry,
    };
  }
  if (typeof entry === 'object') {
    const record = entry as Record<string, any>;
    if ('$meta' in record) {
      return null;
    }
    const name = record.状态名 || record.name || '未命名状态';
    return {
      id: `${prefix}-${index}-${name}`,
      name,
      description: record.描述 || record.影响 || '暂无描述',
      evaluation: record.主角评价,
      extra: record.持续时间 || record.触发条件 || record.影响,
    };
  }
  return null;
}

function normalizeStatusEntries(value: unknown, prefix: string): StatusEffectEntry[] {
  if (!value) {
    return [];
  }
  const entries: StatusEffectEntry[] = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const parsed = mapStatusEntry(entry, index, prefix);
      if (parsed) {
        entries.push(parsed);
      }
    });
    return entries;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry], index) => {
      if (key === '$meta') {
        return;
      }
      const parsed = mapStatusEntry(entry, index, `${prefix}-${key}`);
      if (parsed) {
        entries.push(parsed);
      }
    });
  }
  return entries;
}

const showBubble = ref<string | null>(null);
const buffList = computed(() => normalizeStatusEntries(hero.value.Buff, 'buff'));
const debuffList = computed(() => normalizeStatusEntries(hero.value.Debuff, 'debuff'));
const statusCounts = computed(() => ({
  buff: buffList.value.length,
  debuff: debuffList.value.length,
}));

function toggleAbilityBubble(key: (typeof abilityOrder)[number]) {
  if (showBubble.value === key) {
    showBubble.value = null;
  } else {
    showBubble.value = key;
  }
}

function toggleEquipmentBubble(label: string) {
  activeEquipmentBubble.value = activeEquipmentBubble.value === label ? null : label;
}

function toggleInventoryBubble(id: string) {
  activeInventoryBubble.value = activeInventoryBubble.value === id ? null : id;
}

const equipmentSlots = computed(() => {
  const equipment = hero.value.装备栏 ?? {};
  const order = ['主手', '副手', '防具', '饰品'];
  return order.map(label => {
    const slot = equipment[label];
    if (slot && typeof slot === 'object') {
      const record = slot as Record<string, any>;
      return {
        label,
        item: record.装备 ?? record.名称 ?? record.value ?? '空置',
        evaluation: record.主角评价 ?? record.评价 ?? '',
      };
    }
    return {
      label,
      item: slot ?? '空置',
      evaluation: '',
    };
  });
});

const experienceValue = computed(() => hero.value.经验 ?? hero.value.exp ?? systemState.value?.经验 ?? 0);
const levelValue = computed(() => hero.value.等级 ?? hero.value.level ?? systemState.value?.等级 ?? 1);

const inventoryItems = computed(() => {
  const inventory = hero.value.物品栏 ?? {};
  if (typeof inventory !== 'object' || Array.isArray(inventory)) {
    return [];
  }
  return Object.entries(inventory).map(([name, item], index) => ({
    id: `${index}-${name}`,
    名称: name || '未知物品',
    描述: item?.描述 || '',
    主角评价: item?.主角评价,
    placeholder: false,
  }));
});

const itemsPerPage = 6;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(inventoryItems.value.length / itemsPerPage)));
const paginatedInventory = computed(() => {
  const total = inventoryItems.value.length;
  const slice =
    total === 0
      ? []
      : inventoryItems.value.slice(
          (currentPage.value - 1) * itemsPerPage,
          (currentPage.value - 1) * itemsPerPage + itemsPerPage,
        );
  const filled = [...slice];
  while (filled.length < itemsPerPage) {
    filled.push({
      id: `placeholder-${currentPage.value}-${filled.length}`,
      名称: '—',
      描述: '空槽位',
      主角评价: '',
      placeholder: true,
    });
  }
  return filled;
});

watch(
  () => inventoryItems.value.length,
  () => {
    currentPage.value = 1;
  },
);

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages;
  }
});

watch(currentPage, () => {
  activeInventoryBubble.value = null;
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
}
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
}

const currentTimeLabel = computed(() => world.value.当前时间 || new Date().toLocaleString('zh-CN'));

const isMobile = ref(false);
const sectionState = reactive<Record<SectionKey, boolean>>({
  info: false,
  abilities: false,
  equipment: false,
  inventory: false,
  effects: false,
});

function sectionOpen(key: SectionKey) {
  return isMobile.value ? sectionState[key] : true;
}

function toggleSection(key: SectionKey) {
  if (!isMobile.value) {
    return;
  }
  sectionState[key] = !sectionState[key];
}

function updateIsMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches;
}

// 设计基准宽度
const BASE_WIDTH = 800;

// 等比缩放状态栏（仅桌面端）
function updateScale() {
  const wrapper = document.querySelector('.status-system-wrapper') as HTMLElement;
  const statusSystem = document.querySelector('.status-system') as HTMLElement;

  if (!wrapper || !statusSystem) return;

  // 移动端不进行缩放，保持原样
  if (isMobile.value) {
    statusSystem.style.transform = '';
    statusSystem.style.width = '';
    wrapper.style.height = '';
    return;
  }

  // 桌面端进行等比缩放
  const wrapperWidth = wrapper.clientWidth;
  const scale = wrapperWidth / BASE_WIDTH;

  // 应用缩放
  statusSystem.style.transform = `scale(${scale})`;
  statusSystem.style.transformOrigin = 'top left';
  statusSystem.style.width = `${BASE_WIDTH}px`;

  // 调整容器高度以适应缩放后的内容
  const scaledHeight = statusSystem.offsetHeight * scale;
  wrapper.style.height = `${scaledHeight}px`;
}

// 通知父窗口调整iframe高度
function updateIframeHeight() {
  if (window.frameElement) {
    const height = document.documentElement.scrollHeight;
    (window.frameElement as HTMLIFrameElement).style.height = `${height}px`;
  }
}

// 使用ResizeObserver监听高度变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  window.addEventListener('resize', updateScale);

  // 初始缩放和高度调整
  setTimeout(() => {
    updateScale();
    updateIframeHeight();
  }, 0);

  // 监听内容高度变化
  resizeObserver = new ResizeObserver(() => {
    updateScale();
    updateIframeHeight();
  });

  const statusSystem = document.querySelector('.status-system');
  if (statusSystem) {
    resizeObserver.observe(statusSystem);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile);
  window.removeEventListener('resize', updateScale);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(isMobile, value => {
  if (!value) {
    (Object.keys(sectionState) as SectionKey[]).forEach(key => {
      sectionState[key] = true;
    });
  } else {
    showStatusPopover.value = false;
  }
  // 切换移动端/桌面端时重新计算缩放
  updateScale();
});

function toggleStatusPopover(tab: StatusTab) {
  if (showStatusPopover.value && statusPopoverTab.value === tab) {
    showStatusPopover.value = false;
    return;
  }
  statusPopoverTab.value = tab;
  showStatusPopover.value = true;
}

function closeStatusPopover() {
  showStatusPopover.value = false;
}
</script>

<style lang="scss">
@import url('https://fontsapi.zeoseven.com/570/main/result.css');

:root {
  --bg-dark: #0a0a0a;
  --bg-darker: #050505;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #000000;
  --bg-panel: #f5f5f5;
  --bg-input: #ffffff;
  --bg-card: #f0f0f0;
  --bg-card-hover: #e0e0e0;
  --bg-success: #90ee90;
  --bg-error: #ffb3b3;
  --bg-highlight: #ffffcc;
  --bg-warning: #ffe4b3;
  --pixel-font: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.status-system-wrapper {
  width: 100%;
  background: transparent;
  position: relative;
}

.status-system {
  width: 800px;
  aspect-ratio: 16/9;
  background: var(--bg-panel);
  border: 4px solid var(--border-color);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: var(--pixel-font);
  font-weight: normal;
  animation: fadeIn 0.5s ease-out;
}

.status-system::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 15px 15px;
  z-index: 1;
  pointer-events: none;
}

.top-info-bar {
  background: #333;
  color: var(--text-primary);
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  position: relative;
  z-index: 2;
  border-bottom: 3px solid var(--border-color);
}

.info-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.info-right {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.status-badge {
  background: var(--bg-input);
  color: #000;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  font-size: 10px;
  min-width: 240px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 2;
  min-height: 0;
}

.character-panel {
  flex: 2;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-card);
  min-height: 0;
  overflow: visible;
}

.mobile-section {
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.character-info-card {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.character-header {
  display: flex;
  gap: 15px;
  flex-shrink: 0;
}

.character-avatar {
  width: 70px;
  height: 70px;
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #666;
    opacity: 0.9;
  }

  &.has-avatar {
    background-color: transparent;
  }

  &.uploading {
    cursor: wait;
    opacity: 0.6;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #666;
    font-weight: bold;
    user-select: none;
  }

  .avatar-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.character-name {
  font-size: 18px;
  color: #000;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 0px #fff;
}

.character-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  font-size: 11px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 5px 8px;
  border: 1px solid var(--border-color);
  min-height: 24px;
}

.stat-label {
  color: #000;
  font-weight: bold;
  font-size: 10px;
}

.stat-value {
  color: #000;
  font-size: 10px;
}

.character-description-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.appearance-description {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-top: 2px solid var(--border-color);
  padding: 8px;
  font-size: 10px;
  color: #000;
  line-height: 1.4;
  min-height: 35px;
  /* 限制为两行 */
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.self-evaluation {
  background: #e8e8e8;
  border: 1px solid var(--border-color);
  border-left: 3px solid #666;
  padding: 8px 10px;
  font-size: 10px;
  color: #333;
  line-height: 1.4;
  min-height: 35px;
  /* 限制为两行 */
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.self-evaluation::before {
  content: '「';
  font-style: normal;
  font-weight: bold;
  color: #666;
  margin-right: 2px;
}

.abilities-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, minmax(60px, auto));
  gap: 6px;
  flex: 1;
  min-height: 0;
  align-content: start;
  position: relative;
  overflow: visible;
}

.ability-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 5px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.ability-item:hover {
  background: var(--bg-card-hover);
  border-color: #666;
}

.ability-item.active {
  background: #e3f2fd;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.ability-item__name {
  font-size: 10px;
  font-weight: bold;
  color: #000;
  margin-bottom: 3px;
}

.ability-item__value {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 2px;
}

.ability-item__desc {
  font-size: 7px;
  color: #666;
  line-height: 1.1;
}

.ability-bubble {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #f5f5f5;
  border: 2px solid var(--border-color);
  padding: 8px 10px;
  font-size: 9px;
  color: #000;
  white-space: normal;
  z-index: 20;
  animation: bubblePop 0.2s ease-out;
  max-width: 200px;
  min-width: 120px;
  text-align: left;
  line-height: 1.4;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.ability-bubble::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent var(--border-color) transparent;
}

.ability-bubble::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 5px 5px 5px;
  border-color: transparent transparent #f5f5f5 transparent;
  margin-bottom: -1px;
}

.info-bubble {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #f5f5f5;
  border: 2px solid var(--border-color);
  padding: 6px 8px;
  font-size: 8px;
  color: #000;
  white-space: normal;
  z-index: 25;
  animation: bubblePop 0.2s ease-out;
  max-width: 180px;
  min-width: 120px;
  text-align: left;
  line-height: 1.3;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.info-bubble::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 0 6px;
  border-color: var(--border-color) transparent transparent transparent;
}

.info-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #f5f5f5 transparent transparent transparent;
  margin-top: -1px;
}

@media (min-width: 769px) {
  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble {
    top: auto;
    bottom: calc(100% + 8px);
  }

  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble::before {
    bottom: auto;
    top: 100%;
    border-width: 6px 6px 0 6px;
    border-color: var(--border-color) transparent transparent transparent;
  }

  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble::after {
    bottom: auto;
    top: 100%;
    border-width: 5px 5px 0 5px;
    border-color: #f5f5f5 transparent transparent transparent;
    margin-bottom: 0;
    margin-top: -1px;
  }
}

@media (max-width: 768px) {
  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble {
    top: auto;
    bottom: calc(100% + 8px);
  }

  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble::before {
    bottom: auto;
    top: 100%;
    border-width: 6px 6px 0 6px;
    border-color: var(--border-color) transparent transparent transparent;
  }

  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble::after {
    bottom: auto;
    top: 100%;
    border-width: 5px 5px 0 5px;
    border-color: #f5f5f5 transparent transparent transparent;
    margin-bottom: 0;
    margin-top: -1px;
  }
}

@keyframes bubblePop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 3px solid var(--border-color);
  min-height: 0;
}

.equipment-section {
  flex: 1;
  padding: 10px;
  background: var(--bg-card);
  border-bottom: 2px solid var(--border-color);
  overflow: visible;
}

.inventory-section {
  flex: 1;
  padding: 10px;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.inventory-title,
.section-title {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 6px;
}

.inventory-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.equipment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  overflow: visible;
}

.equipment-slot {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 6px 8px;
  font-size: 9px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: visible;
}

.slot-name {
  color: #000;
  font-weight: bold;
  margin-bottom: 2px;
  font-size: 8px;
}

.slot-item {
  color: #000;
  font-size: 9px;
  word-break: break-word;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  flex: 1;
  overflow: visible;
}

.inventory-item {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 40px;
  position: relative;
  overflow: visible;
}

.equipment-slot.active,
.inventory-item.active {
  background: #e3f2fd;
  border-color: #1976d2;
}

.inventory-item:hover {
  background: var(--bg-card-hover);
}

.item-name {
  font-size: 9px;
  color: #000;
  font-weight: bold;
  margin-bottom: 2px;
  text-align: center;
}

.item-description {
  font-size: 7px;
  color: #666;
  line-height: 1.2;
  text-align: center;
  word-wrap: break-word;
}

.inventory-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 4px 0;
  flex-shrink: 0;
}

.page-info {
  font-size: 8px;
  color: #000;
}

.page-button {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  font-family: var(--pixel-font);
  font-size: 8px;
  color: #000;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-button:hover {
  background: var(--bg-card-hover);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inventory-item.placeholder {
  opacity: 0.5;
  border-style: dashed;
  pointer-events: none;
  cursor: default;
}

.inventory-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 10px;
}

.status-effects-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-effects-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-effects-title {
  font-weight: bold;
  font-size: 10px;
  color: #000;
}

.status-effects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-effect-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 6px;
  font-size: 8px;
  text-align: left;
  line-height: 1.3;
}

.status-effect-name {
  font-weight: bold;
  font-size: 9px;
  margin-bottom: 2px;
  color: #000;
}

.status-effect-desc {
  font-size: 8px;
  color: #111;
}

.status-effect-eval {
  font-size: 8px;
  color: #222;
  margin-top: 2px;
}

.status-effect-meta {
  font-size: 7px;
  color: #333;
  margin-top: 2px;
}

.status-effects-empty {
  font-size: 9px;
  color: #666;
  text-align: center;
}

.mobile-section.status-effects-mobile-only {
  display: none;
}

.status-effects-trigger {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  position: relative;
}

.status-tab-button {
  background: transparent;
  border: none;
  font-family: var(--pixel-font);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 2px;
  transition: color 0.2s;
}

.status-tab-button.active {
  color: #1976d2;
  text-decoration: underline;
}

.status-tab-button.positive::before,
.status-tab-button.negative::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 1px solid var(--border-color);
  margin-right: 4px;
  transform: translateY(-1px);
}

.status-tab-button.positive::before {
  background: #d4f6d0;
}

.status-tab-button.negative::before {
  background: #ffe0e0;
}

.status-effects-popover {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  width: 260px;
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 10px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  z-index: 30;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 10px;
  margin-bottom: 6px;
}

.popover-close {
  background: transparent;
  border: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  color: #000;
}

.status-effects-content {
  max-height: 220px;
  overflow-y: auto;
}

.popover-empty {
  margin: 0;
}

.bottom-bar {
  background: #333;
  color: var(--text-primary);
  padding: 4px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  position: relative;
  z-index: 2;
  border-top: 3px solid var(--border-color);
  flex-shrink: 0;
}

.bottom-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.bottom-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.action-button {
  background: var(--bg-input);
  color: #000;
  border: 2px solid var(--border-color);
  padding: 4px 12px;
  font-family: var(--pixel-font);
  font-size: 9px;
  cursor: pointer;
  transition: all 0.1s;
}

.action-button:hover {
  background: #dddddd;
}

.action-button:active {
  border-width: 2px 4px 2px 2px;
}

.system-tip {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error-banner {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-error);
  border: 2px solid #ff5c5c;
  padding: 6px 10px;
  font-size: 10px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: var(--bg-success);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

.status-indicator.offline {
  background: var(--bg-error);
}

.status-indicator.warning {
  background: var(--bg-warning);
}

.collapse-toggle {
  width: 100%;
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #222;
  color: var(--text-primary);
  border: none;
  border-top: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
  font-size: 12px;
  font-family: var(--pixel-font);
  margin: 0;
}

.mobile-section__body {
  display: block;
  overflow: visible;
}

.mobile-section {
  overflow: visible;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .status-system-wrapper {
    width: 100%;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .status-system {
    max-width: 100%;
    min-height: auto;
    width: 100% !important;
    aspect-ratio: unset;
    height: auto;
    transform: none !important;
  }

  .top-info-bar,
  .bottom-bar {
    padding: 6px 12px;
    font-size: 10px;
  }

  .main-content {
    flex-direction: column;
    overflow-y: visible;
    overflow-x: hidden;
    flex: 0 1 auto;
  }

  .character-panel {
    flex: none;
    border-bottom: 2px solid var(--border-color);
    padding: 0;
    gap: 0;
    min-height: 0;
    height: auto;
  }

  .right-panel {
    flex: none;
    flex-direction: column;
    border-left: none;
    border-top: none;
    padding: 0;
    min-height: 0;
    height: auto;
  }

  .equipment-section {
    border-bottom: 2px solid var(--border-color);
  }

  .inventory-section {
    border-bottom: none;
  }

  .character-info-card {
    padding: 8px;
    gap: 8px;
  }

  .character-avatar {
    width: 60px;
    height: 60px;
  }

  .character-name {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .character-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    font-size: 10px;
  }

  .stat-item {
    padding: 4px 6px;
    min-height: 22px;
  }

  .character-description {
    padding: 6px 8px;
    font-size: 9px;
    line-height: 1.5;
    min-height: 40px;
  }

  .collapse-toggle {
    display: flex;
    margin: 0;
    cursor: pointer;
    border-top: none;
  }

  .mobile-section:first-child .collapse-toggle {
    border-top: 2px solid var(--border-color);
  }

  .abilities-panel {
    grid-template-columns: repeat(2, 1fr);
    overflow: visible;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }

  .inventory-pagination {
    padding: 6px 0;
  }

  .page-button {
    padding: 4px 8px;
    font-size: 9px;
  }

  .page-info {
    font-size: 9px;
  }

  .bottom-bar {
    flex-shrink: 0;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
  }

  .bottom-left {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 9px;
    width: 100%;
    justify-content: space-between;
  }

  .bottom-right {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .action-button {
    padding: 10px 8px;
    font-size: 9px;
    width: 100%;
    text-align: center;

    &:nth-child(1),
    &:nth-child(2) {
      grid-column: span 1;
    }

    &:nth-child(3) {
      grid-column: span 2;
    }

    &:nth-child(4),
    &:nth-child(5) {
      grid-column: span 2;
    }
  }

  .system-tip {
    max-width: 100%;
    font-size: 8px;
  }

  .info-right {
    flex: none;
  }

  .status-badge {
    min-width: auto;
    max-width: 180px;
    font-size: 9px;
  }

  .equipment-section,
  .inventory-section {
    padding: 10px;
    border-bottom: none;
  }

  .mobile-section {
    margin-bottom: 0;
    border-bottom: 2px solid var(--border-color);
    flex-shrink: 0;
  }

  .mobile-section:last-child {
    border-bottom: none;
  }

  .mobile-section__body {
    padding: 10px;
    flex-shrink: 1;
    display: block;
  }

  .mobile-section__body[style*='display: none'] {
    display: none !important;
    height: 0;
    padding: 0;
    overflow: hidden;
  }

  .mobile-section__body > * {
    margin: 0;
  }

  .mobile-section.status-effects-mobile-only {
    display: flex;
  }

  .status-effects-trigger {
    display: none;
  }
}
</style>
