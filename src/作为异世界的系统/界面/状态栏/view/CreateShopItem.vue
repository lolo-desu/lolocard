<template>
  <ActionModal title="创建商城条目" description="为商城上架新商品，供主角在系统界面中兑换。" @close="emit('close')">
    <form class="form-grid">
      <label>
        <span>物品名称</span>
        <input v-model="shop_item_form.名称" required placeholder="例如：星辉精粹" />
      </label>
      <label>
        <span>描述</span>
        <textarea v-model="shop_item_form.描述" placeholder="简述功效与限制" />
      </label>
      <label>
        <span>价格(积分)</span>
        <input v-model.number="shop_item_form.积分价格" type="number" min="0" required placeholder="所需积分数" />
      </label>

    </form>

    <div class="form-actions with-auto">
      <button type="button" class="ghost" @click="emit('close')">取消</button>
      <button type="button" class="ghost" @click="showAutoModal = true">自动</button>
      <button type="submit" class="primary" @click="handleSubmit">上架</button>
    </div>
  </ActionModal>

  <ActionModal v-if="showAutoModal" title="自动创建商品" description="系统会一次性生成多件符合剧情的商品。" @close="closeAutoModal">
    <form class="form-grid">
      <label>
        <span>创建数量</span>
        <input v-model.number="autoCreateCount" type="number" min="1" :max="AUTO_CREATE_LIMIT" required />
        <small>范围：1 - {{ AUTO_CREATE_LIMIT }}</small>
      </label>
      <div class="form-actions">
        <button type="button" class="ghost" @click="closeAutoModal">取消</button>
        <button type="button" class="primary" @click="handleAutoCreate">确认生成</button>
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

const AUTO_CREATE_LIMIT = 5;

const ShopItemForm = z
  .object({
    名称: z.coerce.string(),
  })
  .extend(Schema.shape.商品列表.valueType.shape);
type ShopItemForm = z.infer<typeof ShopItemForm>;

const shop_item_form = ref<ShopItemForm>({
  名称: '',
  描述: '',
  主角评价: '待评价，需要立即更新',
  积分价格: 0,
});

const autoCreateCount = ref(1);
const showAutoModal = ref(false);

function handleSubmit() {
  const result = ShopItemForm.safeDecode(shop_item_form.value);
  if (result.error) {
    toastr.success('填写商品时出错');
    emit('close');
    return;
  }

  const data = result.data;
  if (!data.名称) {
    toastr.error('必须填写名称');
    return;
  }

  const store = useDataStore();
  if (data.名称) {
    store.log(`已创建商品'${data.名称}'`);
    _.set(store.data.商品列表, data.名称, Schema.shape.商品列表.valueType.decode(data));
    toastr.success('已创建商品');
  }
  emit('close');
}

function closeAutoModal() {
  showAutoModal.value = false;
}

async function handleAutoCreate() {
  const parsed = Number.isFinite(autoCreateCount.value) ? Math.floor(autoCreateCount.value) : 1;
  const count = _.clamp(parsed, 1, AUTO_CREATE_LIMIT);
  const prompt = `系统上架了 ${count} 件商品<!--商品必须根据当前背景与人设来生成符合情节逻辑的变量内容，本次必须新增 ${count} 件商品变量-->`;
  try {
    await triggerSlash(`/send ${prompt} || /trigger`);
    toastr.success(`已请求系统自动生成 ${count} 件商品`);
    closeAutoModal();
    emit('close');
  } catch (error) {
    console.error(error);
    toastr.error('触发自动创建失败，请稍后重试');
  }
}
</script>

<style scoped>
.form-actions.with-auto {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
