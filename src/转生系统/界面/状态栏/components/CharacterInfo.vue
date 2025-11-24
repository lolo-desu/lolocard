<template>
  <div class="character-info-card">
    <div class="character-header">
      <div
        class="character-avatar"
        :class="{ 'has-avatar': avatarUrl, uploading: avatarUploading }"
        :style="avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}"
        :title="avatarUploading ? '上传中...' : '点击上传头像'"
        @click="uploadAvatar(name)"
      >
        <div v-if="!avatarUrl && !avatarUploading" class="avatar-placeholder">
          <span>+</span>
        </div>
        <div v-if="avatarUploading" class="avatar-loading">
          <span>...</span>
        </div>
      </div>
      <div class="character-basic-info">
        <div class="character-name">{{ name }}</div>
        <div class="character-stats">
          <div class="stat-item">
            <span class="stat-label">性别:</span>
            <span class="stat-value">{{ gender }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">年龄:</span>
            <span class="stat-value">{{ age }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="character-description-section">
      <div class="appearance-description">{{ appearanceDescription }}</div>
      <div class="self-evaluation">{{ selfEvaluation }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAvatarManager } from '../composables/useAvatarManager';

const props = defineProps<{
  name: string;
  gender: string;
  age: string | number;
  appearanceDescription: string;
  selfEvaluation: string;
}>();

const { uploading: avatarUploading, avatarUrl, uploadAvatar, loadAvatarForCharacter } = useAvatarManager();

// 监听角色名称变化，自动加载头像
watch(
  () => props.name,
  async newName => {
    if (newName && newName !== '角色名称') {
      await loadAvatarForCharacter(newName);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
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

@media (max-width: 768px) {
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
}
</style>
