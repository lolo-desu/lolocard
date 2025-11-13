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

      <div class="form-actions">
        <button type="button" class="ghost" @click="emit('close')">取消</button>
        <button type="submit" class="primary" @click="handleSubmit">上架</button>
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

const ShopItemForm = z
  .object({
    名称: z.coerce.string(),
  })
  .extend(Schema.shape.商品列表.valueType.shape);
type ShopItemForm = z.infer<typeof ShopItemForm>;

const shop_item_form = ref<ShopItemForm>({
  名称: '',
  描述: '',
  主角评价: '',
  积分价格: 0,
});

function handleSubmit() {
  const result = ShopItemForm.safeParse(shop_item_form.value);
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
    _.set(store.data.商品列表, data.名称, Schema.shape.商品列表.valueType.parse(data));
    toastr.success('已创建商品');
  }
  emit('close');
}
</script>
