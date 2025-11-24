<template>
  <ActionModal title="发布任务" @close="emit('close')">
    <form class="form-grid">
      <div class="form-actions" style="margin-bottom: 12px; padding-bottom: 0; border: none">
        <button type="button" class="primary" style="width: 100%" @click="show_auto_task = true">自动发布任务</button>
      </div>
      <label>
        <span>名称</span>
        <input v-model="task_form.名称" required placeholder="例如：夺回王城" />
      </label>
      <label>
        <span>类型</span>
        <select v-model="task_form.类型">
          <option v-for="type in TASK_TYPES" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </label>
      <label>
        <span>说明</span>
        <textarea v-model="task_form.说明" placeholder="交代背景、系统指示等" />
      </label>
      <label>
        <span>目标</span>
        <textarea v-model="task_form.目标" placeholder="列出具体步骤或达成条件" />
      </label>
      <label>
        <span>奖励</span>
        <input v-model="task_form.奖励" placeholder="积分、道具、权限..." />
      </label>
      <label>
        <span>惩罚</span>
        <input v-model="task_form.惩罚" placeholder="失败后承担的代价（可选）" />
      </label>

      <div class="form-actions">
        <button type="button" class="ghost" @click="emit('close')">取消</button>
        <button type="submit" class="primary" @click="handleSubmit">发布</button>
      </div>
    </form>
  </ActionModal>

  <AutoTask v-if="show_auto_task" @close="show_auto_task = false" />
</template>

<script lang="ts" setup>
import { Schema, TASK_TYPES } from '../../../schema';
import ActionModal from '../components/ActionModal.vue';
import { useDataStore } from '../store';
import AutoTask from './AutoTask.vue';

const show_auto_task = ref(false);

const emit = defineEmits<{
  close: [void];
}>();

const TaskForm = z.object({ 名称: z.coerce.string() }).extend(Schema.shape.任务列表.valueType.shape);
type TaskForm = z.infer<typeof TaskForm>;

const task_form = ref<TaskForm>({
  名称: '',
  类型: '主线',
  说明: '',
  目标: '',
  奖励: '',
  惩罚: '',
});

function handleSubmit() {
  const result = TaskForm.safeDecode(task_form.value);
  if (result.error) {
    toastr.error('填写奖励时出错');
    emit('close');
    return;
  }

  const data = result.data;
  if (!data.名称) {
    toastr.error('必须填写名称');
    return;
  }

  const store = useDataStore();
  store.log(`已发布新任务'${data.名称}'`);
  _.set(store.data.任务列表, data.名称, Schema.shape.任务列表.valueType.decode(data));
  toastr.success('已发布任务');
  emit('close');
}
</script>
