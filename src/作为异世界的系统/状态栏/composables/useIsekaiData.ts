import { klona } from 'klona';
import _ from 'lodash';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { DirectMessagePayload, IsekaiStatData, PublishTaskPayload, RewardPayload, ShopEntry, ShopItemPayload } from '../types';

const MESSAGE_OPTION = {
  type: 'message',
  message_id: 'latest',
} as const;

const REFRESH_INTERVAL = 4000;

const DEFAULT_STATE: IsekaiStatData = {
  世界: {
    当前时间: '未知时间',
    当前地点: '未知地点',
  },
  主角: {
    姓名: '未命名旅人',
    性别: '未知',
    年龄: '未知',
    外貌: {
      描述: '暂无描述',
      自我评价: '……',
    },
    能力面板: {
      力量: { 数值: '??', 自我评价: '未知' },
      敏捷: { 数值: '??', 自我评价: '未知' },
      体质: { 数值: '??', 自我评价: '未知' },
      感知: { 数值: '??', 自我评价: '未知' },
      意志: { 数值: '??', 自我评价: '未知' },
      魅力: { 数值: '??', 自我评价: '未知' },
    },
    物品栏: [],
    装备栏: {
      主手: '空置',
      副手: '空置',
      防具: '空置',
      饰品: '空置',
    },
  },
  系统状态: {
    系统模式: '观察',
    可用积分: 0,
    当前提示: '暂无提示',
    对主角可见形象: '未设定',
    玩家ID: '{{user}}',
  },
  商城: {},
  任务列表: {},
};

function normalizeStatData(source?: unknown): IsekaiStatData {
  const base = klona(DEFAULT_STATE);
  if (!source || typeof source !== 'object') {
    return base;
  }

  return _.mergeWith(base, klona(source), (_objValue, srcValue) => {
    if (Array.isArray(srcValue)) {
      return srcValue.slice();
    }
    return undefined;
  }) as IsekaiStatData;
}

export function useIsekaiData() {
  const statData = ref<IsekaiStatData>(normalizeStatData());
  const loading = ref(true);
  const syncing = ref(false);
  const lastUpdated = ref<number | null>(null);
  const error = ref<string | null>(null);
  let timer: number | null = null;

  const refresh = async () => {
    try {
      const payload = getVariables(MESSAGE_OPTION);
      const next = normalizeStatData(_.get(payload, 'stat_data'));
      if (!_.isEqual(next, statData.value)) {
        statData.value = next;
      }
      lastUpdated.value = Date.now();
      loading.value = false;
      error.value = null;
      return true;
    } catch (err) {
      console.error('[状态栏] 获取 stat_data 失败', err);
      error.value = '无法读取最新变量，请确认聊天楼层可编辑。';
      loading.value = false;
      return false;
    }
  };

  const mutateStatData = async (updater: (draft: IsekaiStatData) => void) => {
    syncing.value = true;
    try {
      await Promise.resolve(
        updateVariablesWith(current => {
          const currentStat = normalizeStatData(_.get(current, 'stat_data'));
          const draft = klona(currentStat);
          updater(draft);
          _.set(current, 'stat_data', draft);
          statData.value = draft;
          return current;
        }, MESSAGE_OPTION),
      );
      lastUpdated.value = Date.now();
      error.value = null;
    } finally {
      syncing.value = false;
    }
  };

  const publishTask = async (payload: PublishTaskPayload) => {
    await mutateStatData(draft => {
      if (!draft.任务列表 || typeof draft.任务列表 !== 'object') {
        draft.任务列表 = {};
      }
      draft.任务列表[payload.任务名] = { ...payload };
    });
  };

  const grantReward = async (payload: RewardPayload) => {
    await mutateStatData(draft => {
      const inventory = Array.isArray(draft.主角?.物品栏) ? draft.主角.物品栏 : [];
      if (payload.写入背包 !== false) {
        inventory.push([payload.名称, payload.描述, payload.主角评价 ?? '']);
      }
      _.set(draft, '主角.物品栏', inventory);

      if (typeof payload.增加积分 === 'number' && !Number.isNaN(payload.增加积分)) {
        const current = Number(draft.系统状态?.可用积分 ?? 0);
        const nextPoints = Number.isNaN(current) ? payload.增加积分 : current + payload.增加积分;
        draft.系统状态.可用积分 = nextPoints;
      }
    });
  };

  const createShopItem = async (payload: ShopItemPayload) => {
    await mutateStatData(draft => {
      if (!draft.商城 || typeof draft.商城 !== 'object') {
        draft.商城 = {};
      }
      const entry: ShopEntry = {
        物品名称: payload.物品名称,
        描述: payload.描述,
        主角评价: payload.主角评价,
        '价格(积分)': payload.价格,
      };
      draft.商城[payload.物品名称] = entry;
    });
  };


  const removeTask = async (taskKey: string) => {
    await mutateStatData(draft => {
      if (draft.任务列表 && draft.任务列表[taskKey]) {
        delete draft.任务列表[taskKey];
      }
    });
  };

  onMounted(() => {
    void refresh();
    timer = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL);
  });

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return {
    statData,
    loading,
    syncing,
    lastUpdated,
    error,
    refresh,
    publishTask,
    grantReward,
    createShopItem,
    removeTask,
  };
}
