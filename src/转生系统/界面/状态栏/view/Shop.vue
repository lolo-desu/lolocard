<template>
  <div class="shop-overlay">
    <div class="shop-container">
      <header class="shop-header">
        <h2 class="shop-title">系统商城</h2>
        <button class="shop-close" @click="emit('close')">×</button>
      </header>

      <div class="shop-info">
        <div class="shop-balance">
          <span class="balance-label">主角可用积分:</span>
          <span class="balance-value">{{ available_points }}</span>
        </div>
        <div class="shop-hint">仅供查看当前上架商品，购买需主角自行决定</div>
      </div>

      <div class="shop-content">
        <div v-if="Object.keys(shop).length === 0" class="shop-empty">
          <div class="empty-icon">🏪</div>
          <p>商城暂无商品</p>
          <p class="empty-hint">系统管理员可通过"创建商城"按钮上架商品</p>
        </div>

        <div v-else class="shop-grid">
          <div
            v-for="(item, name, index) in shop"
            :key="name"
            class="shop-item"
            :class="{
              affordable: available_points >= item.积分价格,
              active: activeBubble === name,
              'bubble-top': shouldShowBubbleOnTop(index),
            }"
            @click="toggleBubble(name)"
          >
            <div class="item-header">
              <div class="item-name">{{ name }}</div>
              <div class="item-price">
                <span class="price-value">{{ item.积分价格 }}</span>
                <span class="price-unit">积分</span>
              </div>
            </div>

            <div class="item-description">{{ item.描述 }}</div>

            <button class="delist-button" title="下架商品" @click.stop="dropItem(name)">×</button>
            <div v-if="activeBubble === name" class="info-bubble">
              {{ item.主角评价 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Confirm
    v-if="drop_visible"
    title="下架商品"
    :question="drop_question"
    @cancel="drop_visible = false"
    @confirm="onDropConfirm"
  />
</template>

<script setup lang="ts">
import Confirm from '../components/Confirm.vue';
import { useBubble } from '../composables/useBubble';
import { useDataStore } from '../store';

const store = useDataStore();
const shop = toRef(store.data, '商品列表');
const available_points = toRef(store.data.系统状态, '可用积分');

const emit = defineEmits<{
  close: [void];
}>();

const { activeBubble, toggleBubble } = useBubble<string>();

const drop_visible = ref<boolean>(false);
const drop_item = ref<string>('');
const drop_question = computed(() => `确定要下架商品 "${drop_item.value}" 吗？`);
function dropItem(item: string) {
  drop_visible.value = true;
  drop_item.value = item;
}
function onDropConfirm() {
  store.log(`商品'${drop_item.value}'已下架'`);
  _.unset(shop.value, drop_item.value);
  toastr.success('已下架商品');
  drop_visible.value = false;
}

function shouldShowBubbleOnTop(index: number): boolean {
  const columns = 2;
  const rowIndex = Math.floor(index / columns);
  return rowIndex === 0;
}
</script>

<style scoped lang="scss">
.shop-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.3s ease-out;
}

.shop-container {
  width: min(640px, 92vw);
  max-height: min(720px, calc(100% - 32px));
  margin: 16px;
  background: #f5f5f5;
  border: 4px solid #000;
  display: flex;
  flex-direction: column;
  font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
  box-shadow: 12px 12px 0 rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

.shop-header {
  background: #333;
  color: #fff;
  padding: 5px 12px;
  border-bottom: 3px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-title {
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0px #000;
}

.shop-close {
  background: #fff;
  border: 2px solid #000;
  color: #000;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  font-family: 'Courier New', monospace;
  transition: all 0.1s;

  &:hover {
    background: #ddd;
  }

  &:active {
    box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.3);
  }
}

.shop-info {
  background: #ffffcc;
  border-bottom: 2px solid #000;
  padding: 6px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.shop-balance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: bold;
}

.balance-label {
  color: #666;
}

.balance-value {
  color: #d32f2f;
  font-size: 13px;
  text-shadow: 1px 1px 0 #fff;
}

.shop-hint {
  font-size: 9px;
  color: #666;
}

.shop-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 220px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.08);
  }

  &::-webkit-scrollbar-thumb {
    background: #7a7a7a;
    border: 1px solid #f5f5f5;
  }
}

.shop-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;

  .empty-icon {
    font-size: 44px;
    margin-bottom: 10px;
    opacity: 0.3;
  }

  p {
    margin: 6px 0;
    font-size: 14px;
  }

  .empty-hint {
    font-size: 10px;
    color: #999;
  }
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.shop-item {
  background: #fff;
  border: 2px solid #000;
  padding: 8px;
  cursor: pointer;
  position: relative;

  &.active {
    border-color: #1976d2;
  }

  &:not(.affordable) {
    .item-price .price-value {
      color: #d32f2f;
    }
  }

  .delist-button {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    background: #e57373;
    color: white;
    border: 1px solid #000;
    cursor: pointer;
    font-size: 16px;
    line-height: 15px;
    font-family: 'Courier New', monospace;
    z-index: 10;
    display: none;
    transition: all 0.2s;

    &:hover {
      background: #d32f2f;
      transform: scale(1.1);
    }
  }

  &:hover .delist-button {
    display: block;
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.item-name {
  font-size: 13px;
  font-weight: bold;
  color: #000;
  flex: 1;
}

.item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-value {
  font-size: 14px;
  font-weight: bold;
  color: #2e7d32;
}

.price-unit {
  font-size: 9px;
  color: #666;
}

.item-description {
  font-size: 10px;
  color: #333;
  line-height: 1.3;
  margin-bottom: 6px;
  min-height: 32px;
}

.item-evaluation {
  background: #fff9c4;
  border: 1px solid #f9a825;
  padding: 5px;
  font-size: 9px;
  margin-bottom: 5px;
  line-height: 1.3;
}

.eval-label {
  color: #666;
  margin-right: 4px;
}

.eval-text {
  color: #000;
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

.shop-item.bubble-top .info-bubble {
  bottom: auto;
  top: calc(100% + 6px);

  &::before {
    top: auto;
    bottom: 100%;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent #000 transparent;
  }

  &::after {
    top: auto;
    bottom: 100%;
    border-width: 0 5px 5px 5px;
    border-color: transparent transparent #f5f5f5 transparent;
    margin-top: 0;
    margin-bottom: -1px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .shop-container {
    width: 100%;
    max-height: calc(100% - 12px);
    margin: 6px;
    border-width: 4px;
    box-shadow: none;
  }

  .shop-header {
    padding: 8px 12px;
  }

  .shop-title {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .shop-close {
    width: 28px;
    height: 28px;
    font-size: 22px;
  }

  .shop-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
  }

  .shop-balance {
    font-size: 13px;
  }

  .balance-value {
    font-size: 15px;
  }

  .shop-hint {
    font-size: 10px;
  }

  .shop-content {
    padding: 12px;
    min-height: 300px;
  }

  .shop-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .shop-item {
    padding: 12px;
  }

  .item-name {
    font-size: 14px;
  }

  .price-value {
    font-size: 16px;
  }

  .item-description {
    font-size: 11px;
  }

  .shop-footer {
    padding: 10px 12px;
  }

  .footer-button {
    padding: 8px 24px;
    font-size: 14px;
  }
}
</style>
