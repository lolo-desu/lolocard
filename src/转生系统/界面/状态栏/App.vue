<template>
  <div class="status-system-wrapper">
    <section class="status-system">
      <TopBar :current-time-label="currentTimeLabel" :location="world.当前地点" />

      <div class="main-content">
        <div class="character-panel">
          <div class="mobile-section">
            <button class="collapse-toggle" :aria-expanded="sectionOpen('info')" @click="toggleSection('info')">
              <span>角色信息</span>
              <span class="chevron">{{ sectionOpen('info') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('info')" class="mobile-section__body">
              <CharacterInfo
                :name="statData.主角.姓名"
                :gender="statData.主角.性别"
                :age="statData.主角.年龄"
                :appearance-description="hero.外貌.描述"
                :self-evaluation="formatEvaluation(hero.外貌.主角评价)"
              />
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
              <AbilitiesPanel :abilities="orderedAbilities" :descriptions="abilityBaseDescriptions" />
            </div>
          </div>

          <div class="mobile-section mobile-only">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('status')"
              @click="toggleSection('status')"
            >
              <span>状态</span>
              <span class="chevron">{{ sectionOpen('status') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('status')" class="mobile-section__body">
              <StatusEffectsPanel :buff-list="buffList" :debuff-list="debuffList" />
            </div>
          </div>

          <div class="mobile-section mobile-only">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('held-abilities')"
              @click="toggleSection('held-abilities')"
            >
              <span>持有能力</span>
              <span class="chevron">{{ sectionOpen('held-abilities') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('held-abilities')" class="mobile-section__body">
              <AbilityPanel :abilities="abilityList" />
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
              <EquipmentPanel :slots="equipmentSlots" />
            </div>
          </div>

          <div class="mobile-section inventory-container">
            <button
              class="collapse-toggle"
              :aria-expanded="sectionOpen('inventory')"
              @click="toggleSection('inventory')"
            >
              <span>物品栏</span>
              <span class="chevron">{{ sectionOpen('inventory') ? '−' : '+' }}</span>
            </button>
            <div v-show="sectionOpen('inventory')" class="mobile-section__body">
              <InventoryPanel :inventory="inventoryItems" :is-mobile="isMobile" />
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <template #left>
          <StatusPopover
            v-model:show="showStatusPopover"
            v-model:tab="statusPopoverTab"
            :buff-list="buffList"
            :debuff-list="debuffList"
            :buff-count="statusCounts.增益"
            :debuff-count="statusCounts.减益"
          />
          <AbilityPopover v-model:show="showAbilityPopover" :abilities="abilityList" />
        </template>
        <template #right>
          <button class="action-button" type="button" @click="show_publish_task = true">发布任务</button>
          <button class="action-button" type="button" @click="show_task_list = true">查看任务</button>
          <button class="action-button" type="button" @click="show_grant_reward = true">发布奖励</button>
          <button class="action-button" type="button" @click="show_create_shop_item = true">创建商品</button>
          <button class="action-button" type="button" @click="show_shop = true">查看商城</button>
        </template>
      </BottomBar>
    </section>

    <PublishTask v-if="show_publish_task" @close="show_publish_task = false" />
    <GrantReward v-if="show_grant_reward" @close="show_grant_reward = false" />
    <CreateShopItem v-if="show_create_shop_item" @close="show_create_shop_item = false" />
    <Shop v-if="show_shop" @close="show_shop = false" />
    <TaskList v-if="show_task_list" @close="show_task_list = false" />
  </div>
</template>

<script setup lang="ts">
import type { StatusTab } from './types';
import { abilityBaseDescriptions, abilityOrder } from './constants';
import { useDataStore } from './store';
import { useStatusEffects } from './composables/useStatusEffects';
import { useResponsive } from './composables/useResponsive';
import { useScaling } from './composables/useScaling';
import TopBar from './components/TopBar.vue';
import CharacterInfo from './components/CharacterInfo.vue';
import AbilitiesPanel from './components/AbilitiesPanel.vue';
import AbilityPanel from './components/AbilityPanel.vue';
import StatusEffectsPanel from './components/StatusEffectsPanel.vue';
import EquipmentPanel from './components/EquipmentPanel.vue';
import InventoryPanel from './components/InventoryPanel.vue';
import StatusPopover from './components/StatusPopover.vue';
import AbilityPopover from './components/AbilityPopover.vue';
import BottomBar from './components/BottomBar.vue';
import PublishTask from './view/PublishTask.vue';
import CreateShopItem from './view/CreateShopItem.vue';
import GrantReward from './view/GrantReward.vue';
import Shop from './view/Shop.vue';
import TaskList from './view/TaskList.vue';

const show_publish_task = ref(false);
const show_task_list = ref(false);
const show_grant_reward = ref(false);
const show_create_shop_item = ref(false);
const show_shop = ref(false);

const showStatusPopover = ref(false);
const statusPopoverTab = ref<StatusTab>('增益');
const showAbilityPopover = ref(false);

const statData = toRef(useDataStore(), 'data');

const world = computed(() => statData.value.世界 ?? { 当前地点: '未知地点', 当前时间: '未知时间' });
const hero = computed(() => statData.value.主角 ?? {});

function formatEvaluation(evaluation: string | undefined): string {
  return evaluation === '待初始化' || evaluation === undefined ? '暂无' : evaluation;
}

const orderedAbilities = computed(() => {
  const abilities: Record<string, any> = hero.value.能力面板 ?? {};
  return abilityOrder.map(key => ({
    key,
    数值: abilities[key]?.数值 ?? '--',
    主角评价: formatEvaluation(abilities[key]?.主角评价),
  }));
});

const { buffList, debuffList, statusCounts } = useStatusEffects(hero);

const abilityList = computed(() => {
  const abilities: Record<string, any> = hero.value.持有能力 ?? {};
  if (typeof abilities !== 'object' || Array.isArray(abilities)) {
    return [];
  }
  return Object.entries(abilities).map(([name, ability], index) => ({
    id: `${index}-${name}`,
    key: name,
    name,
    描述: ability?.描述 || '',
    主角评价: formatEvaluation(ability?.主角评价),
  }));
});

const equipmentSlots = computed(() => {
  const equipment: Record<string, any> = hero.value.装备栏 ?? {};
  const order = ['主手', '副手', '防具', '饰品'];
  return order.map(label => {
    const slot = equipment[label];
    if (slot && typeof slot === 'object') {
      const record = slot as Record<string, any>;
      return {
        label,
        item: record.装备 ?? record.名称 ?? record.value ?? '空置',
        evaluation: formatEvaluation(record.主角评价 ?? record.评价),
      };
    }
    return {
      label,
      item: slot ?? '空置',
      evaluation: '暂无',
    };
  });
});

const inventoryItems = computed(() => {
  const inventory = hero.value.物品栏 ?? {};
  if (typeof inventory !== 'object' || Array.isArray(inventory)) {
    return [];
  }
  return Object.entries(inventory).map(([name, item], index) => ({
    id: `${index}-${name}`,
    key: name,
    名称: name || '未知物品',
    描述: item?.描述 || '',
    主角评价: formatEvaluation(item?.主角评价),
    placeholder: false,
  }));
});


const currentTimeLabel = computed(() => world.value.当前时间 || new Date().toLocaleString('zh-CN'));

const { isMobile, sectionOpen, toggleSection } = useResponsive();
useScaling(isMobile);

watch(isMobile, value => {
  if (value) {
    showStatusPopover.value = false;
    showAbilityPopover.value = false;
  }
});

// 让状态和能力弹窗互斥
watch(showStatusPopover, value => {
  if (value) {
    showAbilityPopover.value = false;
  }
});

watch(showAbilityPopover, value => {
  if (value) {
    showStatusPopover.value = false;
  }
});
</script>

<style lang="scss">
@import './styles/variables.scss';
@import './styles/animations.scss';
@import './styles/base.scss';
</style>
