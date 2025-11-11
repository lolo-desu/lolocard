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
          <span class="balance-value">{{ availablePoints }}</span>
        </div>
        <div class="shop-hint">仅供查看当前上架商品，购买需主角自行决定</div>
      </div>

      <div class="shop-content">
        <div v-if="shopItems.length === 0" class="shop-empty">
          <div class="empty-icon">🏪</div>
          <p>商城暂无商品</p>
          <p class="empty-hint">系统管理员可通过"创建商城"按钮上架商品</p>
        </div>

        <div v-else class="shop-grid">
          <div
            v-for="item in shopItems"
            :key="item.key"
            class="shop-item"
            :class="{ affordable: canAfford(item) }"
          >
            <div class="item-header">
              <div class="item-name">{{ item.物品名称 }}</div>
              <div class="item-price">
                <span class="price-value">{{ item['价格(积分)'] }}</span>
                <span class="price-unit">积分</span>
              </div>
            </div>

            <div class="item-description">{{ item.描述 }}</div>

            <div v-if="item.主角评价" class="item-evaluation">
              <span class="eval-label">主角评价:</span>
              <span class="eval-text">{{ item.主角评价 }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ShopEntry } from '../types';

interface Props {
  shop: Record<string, ShopEntry>;
  availablePoints: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const shopItems = computed(() => {
  return Object.entries(props.shop).map(([key, entry]) => ({
    key,
    ...entry,
  }));
});

const normalizedPoints = computed(() => {
  const points = props.availablePoints;
  if (typeof points === 'number') return points;
  const parsed = Number(points);
  return Number.isFinite(parsed) ? parsed : 0;
});

function canAfford(item: ShopEntry): boolean {
  return normalizedPoints.value >= item['价格(积分)'];
}

</script>

<style scoped lang="scss">
.shop-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.3s ease-out;
}

.shop-container {
  width: min(640px, 92vw);
  max-height: 85vh;
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
  cursor: default;
  position: relative;

  &:not(.affordable) {
    .item-price .price-value {
      color: #d32f2f;
    }
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
    width: 100vw;
    max-height: 100vh;
    border-width: 0;
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
