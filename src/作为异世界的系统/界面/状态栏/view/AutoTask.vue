<template>
  <ActionModal title="自动发布任务" @close="emit('close')">
    <form class="form-grid">
      <label>
        <span>任务类型</span>
        <select v-model="task_form.类型">
          <option v-for="type in TASK_TYPES" :key="type" :value="type">{{ type }}</option>
        </select>
      </label>
      <label>
        <span>难度</span>
        <select v-model="task_form.难度">
          <option v-for="difficulty in DIFFICULTIES" :key="difficulty" :value="difficulty">{{ difficulty }}</option>
        </select>
      </label>
      <label>
        <span>奖励丰厚程度</span>
        <select v-model="task_form.奖励">
          <option v-for="reward in REWARDS" :key="reward" :value="reward">{{ reward }}</option>
        </select>
      </label>
      <label class="form-grid__checkbox">
        <input v-model="task_form.是否色情" type="checkbox" />
        <span>包含色情内容</span>
      </label>

      <div class="form-actions">
        <button type="button" class="ghost" @click="emit('close')">取消</button>
        <button type="submit" class="primary" @click="handleSubmit">生成</button>
      </div>
    </form>
  </ActionModal>
</template>

<script lang="ts" setup>
import { Schema, TASK_TYPES } from '../../../schema';
import ActionModal from '../components/ActionModal.vue';

const emit = defineEmits<{
  close: [void];
}>();

const DIFFICULTIES = ['简单', '普通', '困难'] as const;
const REWARDS = ['微薄', '一般', '丰厚'] as const;

const TaskForm = z.object({
  类型: Schema.shape.任务列表.valueType.shape.类型,
  难度: z.enum(DIFFICULTIES),
  奖励: z.enum(REWARDS),
  是否色情: z.coerce.boolean(),
});
type TaskForm = z.infer<typeof TaskForm>;

const task_form = ref<TaskForm>({
  类型: '主线',
  难度: '简单',
  奖励: '微薄',
  是否色情: true,
});

async function handleSubmit() {
  const message = `系统发布了一个${task_form.value.难度}的${task_form.value.类型}任务，奖励${task_form.value.奖励}，本次任务${task_form.value.是否色情 ? '必须' : '禁止'}包含色情内容<!--必须立即根据剧情生成合适的任务-->`;
  await createChatMessages([{ role: 'user', message }]);
  await triggerSlash('/trigger');
  toastr.success('已触发自动任务生成');
  emit('close');
}
</script>
