<template>
  <ActionModal title="发布奖励" description="将奖励发放到主角物品栏，或直接调整系统积分。" @close="emit('close')">
    <form class="form-grid">
      <label>
        <span>奖励类型</span>
        <select v-model="reward_form.类型">
          <option value="物品">物品</option>
          <option value="能力">能力</option>
          <option value="增益">增益</option>
          <option value="减益">减益</option>
        </select>
      </label>
      <label>
        <span>奖励名称</span>
        <input v-model="reward_form.名称" required placeholder="例如：龙鳞护符" />
      </label>
      <label>
        <span>描述</span>
        <textarea v-model="reward_form.描述" placeholder="效果、来历等" />
      </label>
      <label>
        <span>增加积分</span>
        <input v-model.number="reward_form.增加积分" type="number" min="0" placeholder="可选，输入数字则增加积分" />
      </label>
      <template v-if="reward_form.类型 === '增益' || reward_form.类型 === '减益'">
        <label>
          <span>持续时间</span>
          <input v-model="reward_form.持续时间" placeholder="例如：3回合、直到战斗结束" />
        </label>
        <label>
          <span>触发条件</span>
          <input v-model="reward_form.触发条件" placeholder="例如：受到攻击时触发" />
        </label>
      </template>

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

const RewardTypes = ['物品', '能力', '增益', '减益'] as const;

const RewardForm = z.object({
  名称: z.coerce.string(),
  描述: z.string().default(''),
  主角评价: z.string().default('待评价，需要立即更新'),
  增加积分: z.coerce.number().default(0),
  类型: z.enum(RewardTypes),
  持续时间: z.string().default('一次性奖励'),
  触发条件: z.string().default('系统发放'),
});
type RewardForm = z.infer<typeof RewardForm>;

const reward_form = ref<RewardForm>({
  类型: '物品',
  名称: '',
  描述: '',
  主角评价: '待评价，需要立即更新',
  增加积分: 0,
  持续时间: '永久',
  触发条件: '一直触发',
});

async function handleSubmit() {
  const result = RewardForm.safeDecode(reward_form.value);
  if (result.error) {
    toastr.error('填写奖励时出错');
    console.error(result.error);
    emit('close');
    return;
  }

  const data = result.data;
  if (!data.名称 && !data.增加积分) {
    toastr.error('未给予任何奖励');
    return;
  }

  const store = useDataStore();

  if (data.名称) {
    if (data.类型 === '物品') {
      _.set(
        store.data.主角.物品栏,
        data.名称,
        Schema.shape.主角.shape.物品栏.valueType.decode({
          描述: data.描述,
          主角评价: data.主角评价,
        }),
      );
    } else if (data.类型 === '能力') {
      _.set(
        store.data.主角.持有能力,
        data.名称,
        Schema.shape.主角.shape.持有能力.valueType.decode({
          描述: data.描述,
          主角评价: data.主角评价,
        }),
      );
    } else {
      _.set(
        store.data.主角.当前状态,
        data.名称,
        Schema.shape.主角.shape.当前状态.valueType.decode({
          类型: data.类型 === '增益' ? '增益' : '减益',
          描述: data.描述,
          主角评价: data.主角评价,
          持续时间: data.持续时间 || '一次性奖励',
          触发条件: data.触发条件 || '系统发放',
        }),
      );
    }
  }

  if (data.增加积分 > 0) {
    if (typeof store.data.系统状态.可用积分 === 'string') {
      store.data.系统状态.可用积分 = 0;
    }
    store.data.系统状态.可用积分 += data.增加积分;
  }

  const rewardParts: string[] = [];
  if (data.名称) {
    rewardParts.push(`类型：${data.类型}`, `名称：${data.名称}`, `描述：${data.描述 || '无描述'}`);
  }
  if (data.增加积分) {
    rewardParts.push(`增加积分：${data.增加积分}`);
  }
  store.log(`发放了一份奖励${rewardParts.length ? `（${rewardParts.join('，')}）` : ''}`);
  toastr.success('已发放奖励');
  emit('close');
}
</script>
