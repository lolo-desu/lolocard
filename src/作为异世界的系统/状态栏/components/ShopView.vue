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
            :class="{ selected: selectedItem === item.key, affordable: canAfford(item) }"
            @click="toggleItem(item.key)"
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

            <div v-if="selectedItem === item.key" class="item-detail-notice">
              <div v-if="!canAfford(item)" class="status-notice insufficient">
                ⚠️ 主角当前积分不足
              </div>
              <div v-else class="status-notice available">
                ✓ 主角积分充足，可购买此商品
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="shop-footer">
        <button class="footer-button" @click="emit('close')">返回</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ShopEntry } from '../types';

interface Props {
  shop: Record<string, ShopEntry>;
  availablePoints: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const selectedItem = ref<string | null>(null);

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

function toggleItem(key: string) {
  if (selectedItem.value === key) {
    selectedItem.value = null;
  } else {
    selectedItem.value = key;
  }
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
  width: min(900px, 95vw);
  max-height: 90vh;
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
  padding: 6px 15px;
  border-bottom: 3px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-title {
  margin: 0;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px 0px #000;
}

.shop-close {
  background: #fff;
  border: 2px solid #000;
  color: #000;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 20px;
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
  padding: 8px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.shop-balance {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: bold;
}

.balance-label {
  color: #666;
}

.balance-value {
  color: #d32f2f;
  font-size: 16px;
  text-shadow: 1px 1px 0 #fff;
}

.shop-hint {
  font-size: 11px;
  color: #666;
}

.shop-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 400px;
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
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }

  .empty-hint {
    font-size: 12px;
    color: #999;
  }
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.shop-item {
  background: #fff;
  border: 3px solid #000;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  }

  &.selected {
    border-color: #2196f3;
    background: #e3f2fd;
    box-shadow: 0 0 0 2px #2196f3;
  }

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
  margin-bottom: 12px;
  gap: 10px;
}

.item-name {
  font-size: 16px;
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
  font-size: 18px;
  font-weight: bold;
  color: #2e7d32;
}

.price-unit {
  font-size: 10px;
  color: #666;
}

.item-description {
  font-size: 12px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10px;
  min-height: 40px;
}

.item-evaluation {
  background: #fff9c4;
  border: 1px solid #f9a825;
  padding: 8px;
  font-size: 11px;
  margin-bottom: 10px;
  line-height: 1.4;
}

.eval-label {
  color: #666;
  margin-right: 5px;
}

.eval-text {
  color: #000;
}

.item-detail-notice {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed #ccc;
}

.status-notice {
  text-align: center;
  font-size: 11px;
  padding: 8px;
  border: 2px solid;
  line-height: 1.4;

  &.insufficient {
    color: #d32f2f;
    background: #ffebee;
    border-color: #ef5350;
  }

  &.available {
    color: #2e7d32;
    background: #e8f5e9;
    border-color: #66bb6a;
  }
}

.shop-footer {
  background: #333;
  border-top: 4px solid #000;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
}

.footer-button {
  background: #fff;
  border: 3px solid #000;
  color: #000;
  padding: 10px 30px;
  font-size: 16px;
  font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.1s;

  &:hover {
    background: #ddd;
  }

  &:active {
    border-width: 3px 5px 5px 3px;
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