import type { StatusEffectEntry } from '../types';

export function normalizeStatusEntries(value: unknown): StatusEffectEntry[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const entries: StatusEffectEntry[] = [];
  const statusObj = value as Record<string, any>;

  Object.entries(statusObj).forEach(([name, data]) => {
    if (name === '$meta' || !data || typeof data !== 'object') {
      return;
    }

    const statusData = data as Record<string, any>;
    entries.push({
      id: `status-${name}`,
      key: name,
      name,
      类型: statusData.类型 || '增益',
      持续时间: statusData.持续时间 || '',
      触发条件: statusData.触发条件 || '',
      描述: statusData.描述 || '',
      主角评价: statusData.主角评价 || '',
    });
  });

  return entries;
}

export function useStatusEffects(heroData: ComputedRef<Record<string, any>>) {
  const allStatus = computed(() => normalizeStatusEntries(heroData.value.当前状态));

  const buffList = computed(() => allStatus.value.filter(s => s.类型 === '增益'));
  const debuffList = computed(() => allStatus.value.filter(s => s.类型 === '减益'));

  const statusCounts = computed(() => ({
    增益: buffList.value.length,
    减益: debuffList.value.length,
  }));

  return {
    allStatus,
    buffList,
    debuffList,
    statusCounts,
  };
}
