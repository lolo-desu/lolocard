<template>
  <ActionModal title="发布奖励" description="将奖励发放到主角物品栏，或直接调整系统积分。" @close="emit('close')">
    <form class="form-grid">
      <label>
        <span>奖励名称</span>
        <input v-model="reward_form.名称" required placeholder="例如：龙鳞护符" />
      </label>
      <label>
        <span>描述</span>
        <textarea v-model="reward_form.描述" placeholder="效果、来历等" />
      </label>
      <label>
        <span>主角评价</span>
        <textarea v-model="reward_form.主角评价" placeholder="展示给主角的文案" />
      </label>
      <label>
        <span>增加积分</span>
        <input v-model.number="reward_form.增加积分" type="number" min="0" placeholder="可选，输入数字则增加积分" />
      </label>
      <label class="form-grid__checkbox">
        <input v-model="reward_form.写入背包" type="checkbox" />
        <span>写入主角物品栏</span>
      </label>

      <div class="form-actions">
        <button type="button" class="ghost" @click="emit('close')">取消</button>
        <button type="submit" class="primary" @click="handleSubmit">发放</button>
      </div>
    </form>
  </ActionModal>
</template>

<script lang="ts" setup>
import { Schema } from '../../../schema';
import ActionModal from '../components/ActionModal.vue';
import { useDataStore } from '../store';

const emit = defineEmits<{
  close: [void];
}>();

const RewardForm = z
  .object({
    名称: z.coerce.string(),
    增加积分: z.coerce.number(),
    写入背包: z.coerce.boolean(),
  })
  .extend(Schema.shape.主角.shape.物品栏.valueType.shape);
type RewardForm = z.infer<typeof RewardForm>;

const reward_form = ref<RewardForm>({
  名称: '',
  描述: '',
  主角评价: '',
  增加积分: 0,
  写入背包: true,
});

function handleSubmit() {
  const result = RewardForm.safeParse(reward_form.value);
  if (result.error) {
    toastr.success('填写奖励时出错');
    emit('close');
    return;
  }

  const data = result.data;
  const store = useDataStore();
  if (data.写入背包 === true && data.名称) {
    _.set(store.data.主角.物品栏, data.名称, Schema.shape.主角.shape.物品栏.valueType.parse(data));
  }
  if (data.增加积分 > 0) {
    if (typeof store.data.系统状态.可用积分 === 'string') {
      store.data.系统状态.可用积分 = 0;
    }
    store.data.系统状态.可用积分 += data.增加积分;
  }
  toastr.success('已发放奖励');
  emit('close');
}
</script>
