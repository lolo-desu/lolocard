<template>
  <div class="task-overlay">
    <div class="task-container">
      <header class="task-header">
        <h2 class="task-title">任务列表</h2>
        <button class="task-close" @click="emit('close')">×</button>
      </header>

      <div class="task-info">
        <div class="task-hint">主角当前接受的所有任务</div>
      </div>

      <div class="task-content">
        <div v-if="Object.keys(tasks).length === 0" class="task-empty">
          <div class="empty-icon">📝</div>
          <p>暂无任务</p>
          <p class="empty-hint">系统管理员可通过"发布任务"按钮发布新任务</p>
        </div>

        <div v-else class="task-list">
          <div v-for="(item, name) in tasks" :key="name" class="task-item" :class="`task-type-${item.类型}`">
            <div class="task-item-header">
              <div class="task-name">{{ name }}</div>
              <div class="task-type-badge">{{ item.类型 }}</div>
            </div>

            <div class="task-section">
              <div class="task-section-title">任务说明</div>
              <div class="task-section-content">{{ item.说明 }}</div>
            </div>

            <div class="task-section">
              <div class="task-section-title">任务目标</div>
              <div class="task-section-content">{{ item.目标 }}</div>
            </div>

            <div class="task-footer">
              <div class="task-reward">
                <span class="reward-label">奖励:</span>
                <span class="reward-text">{{ item.奖励 }}</span>
              </div>
              <div class="task-penalty">
                <span class="penalty-label">惩罚:</span>
                <span class="penalty-text">{{ item.惩罚 }}</span>
              </div>
            </div>

            <div class="task-actions">
              <button class="action-button delete" @click="deleteItem(name)">删除</button>
              <button class="action-button fail" @click="failItem(name)">失败</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Confirm
    v-if="delete_visible"
    title="删除任务"
    :question="delete_question"
    @cancel="delete_visible = false"
    @confirm="onDeleteConfirm"
  />
  <Confirm v-if="fail_visible" title="标记任务为失败" :question="fail_question" @cancel="fail_visible = false" @confirm="onFailConfirm" />
</template>

<script setup lang="ts">
import Confirm from '../components/Confirm.vue';
import { useDataStore } from '../store';

const store = useDataStore();
const tasks = toRef(store.data, '任务列表');

const emit = defineEmits<{
  close: [void];
}>();

const delete_visible = ref<boolean>(false);
const delete_item = ref<string>('');
const delete_question = computed(() => `确定要删除任务 "${delete_item.value}" 吗？该任务将会消失。`);
function deleteItem(item: string) {
  delete_visible.value = true;
  delete_item.value = item;
}
function onDeleteConfirm() {
  store.log(`任务'${delete_item.value}'已消失`);
  _.unset(tasks.value, delete_item.value);
  toastr.success('已删除任务');
  delete_visible.value = false;
}

const fail_visible = ref<boolean>(false);
const fail_item = ref<string>('');
const fail_question = computed(() => `确定要将任务 "${fail_item.value}" 标记为失败吗？`);
function failItem(item: string) {
  fail_visible.value = true;
  fail_item.value = item;
}
function onFailConfirm() {
  store.log(`任务'${fail_item.value}'被标记为失败！惩罚：${_.get(tasks.value, fail_item.value).惩罚}`);
  _.unset(tasks.value, fail_item.value);
  toastr.success('已标记任务为失败');
  fail_visible.value = false;
}
</script>

<style scoped lang="scss">
.task-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.3s ease-out;
}

.task-container {
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

.task-header {
  background: #333;
  color: #fff;
  padding: 5px 12px;
  border-bottom: 3px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0px #000;
}

.task-close {
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

.task-info {
  background: #ffffcc;
  border-bottom: 2px solid #000;
  padding: 6px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.task-hint {
  font-size: 9px;
  color: #666;
}

.task-content {
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

.task-empty {
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: #fff;
  border: 2px solid #000;
  padding: 10px;
  padding-bottom: 40px;
  position: relative;

  &.task-type-主线 {
    border-left: 4px solid #d32f2f;
  }

  &.task-type-支线 {
    border-left: 4px solid #1976d2;
  }

  &.task-type-每日 {
    border-left: 4px solid #388e3c;
  }

  &.task-type-临危受命 {
    border-left: 4px solid #f57c00;
  }
}

.task-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 8px;
}

.task-name {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-type-badge {
  background: #000;
  color: #fff;
  padding: 2px 6px;
  font-size: 9px;
  border: 1px solid #000;
  text-transform: uppercase;
}

.task-section {
  margin-bottom: 8px;
}

.task-section-title {
  font-size: 10px;
  font-weight: bold;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.task-section-content {
  font-size: 11px;
  color: #333;
  line-height: 1.4;
  padding: 6px 8px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  white-space: pre-wrap;
}

.task-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ccc;
}

.task-actions {
  position: absolute;
  bottom: 8px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.action-button {
  background: #fff;
  border: 1px solid #000;
  padding: 3px 8px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &.delete {
    border-color: #757575;
    color: #757575;
    &:hover {
      background: #f5f5f5;
      border-color: #000;
      color: #000;
    }
  }

  &.fail {
    border-color: #d32f2f;
    color: #d32f2f;
    &:hover {
      background: #d32f2f;
      color: #fff;
    }
  }
}

.task-reward,
.task-penalty {
  font-size: 10px;
  display: flex;
  gap: 6px;
}

.task-reward {
  .reward-label {
    color: #2e7d32;
    font-weight: bold;
  }

  .reward-text {
    color: #333;
  }
}

.task-penalty {
  .penalty-label {
    color: #d32f2f;
    font-weight: bold;
  }

  .penalty-text {
    color: #333;
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
  .task-container {
    width: 100%;
    max-height: calc(100% - 12px);
    margin: 6px;
    border-width: 4px;
    box-shadow: none;
  }

  .task-header {
    padding: 8px 12px;
  }

  .task-title {
    font-size: 14px;
    letter-spacing: 1px;
  }

  .task-close {
    width: 28px;
    height: 28px;
    font-size: 22px;
  }

  .task-info {
    padding: 10px 12px;
  }

  .task-hint {
    font-size: 10px;
  }

  .task-content {
    padding: 12px;
    min-height: 300px;
  }

  .task-list {
    gap: 16px;
  }

  .task-item {
    padding: 12px;
  }

  .task-name {
    font-size: 15px;
  }

  .task-type-badge {
    font-size: 10px;
  }

  .task-section-content {
    font-size: 12px;
  }
}
</style>
