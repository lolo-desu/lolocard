# 变量管理器 - 角色卡收藏夹功能更新

## 更新日期
2025-11-09

## 更新内容

### 问题描述
原收藏夹功能是全局的，所有角色卡共享同一个收藏列表。当切换角色卡时，会看到其他角色卡的收藏变量，这些变量在当前角色的stat_data中不存在，因此显示为null，不符合设计预期。

### 解决方案
将收藏夹功能改为按角色卡分组存储，每个角色卡拥有独立的收藏列表。

### 技术实现

#### 1. 数据结构修改
```typescript
// 收藏项新增角色卡标识字段
type FavoriteItem = {
  path: string;
  label: string;
  addedAt: number;
  characterId: string; // 新增：角色卡标识符（使用avatar文件名）
};

// 新增全局收藏夹存储结构（按角色卡分组）
type FavoritesStorage = {
  [characterId: string]: FavoriteItem[];
};
```

#### 2. Store层修改

- **新增方法**：
  - `getCurrentCharacterId()`: 获取当前角色卡的唯一标识（使用avatar文件名）
  - 优先从`SillyTavern.characters[SillyTavern.characterId].avatar`获取
  - 备用方案：从`characters[this_chid].avatar`获取
  - 默认值：`'no-character'`

- **收藏夹数据**：
  - `allFavorites`: ref类型，存储所有角色卡的收藏
  - `favorites`: computed类型，自动返回当前角色卡的收藏列表

- **方法更新**：
  - `loadFavorites()`: 支持从旧版本数据迁移（数组格式转换为分组格式）
  - `saveFavorites()`: 保存分组格式的收藏数据
  - `addFavorite()`: 添加收藏时自动关联到当前角色卡
  - `removeFavorite()`: 只从当前角色卡的收藏中删除
  - `isFavorite()`: 只检查当前角色卡的收藏列表

#### 3. 角色卡切换监听

- 在`bootstrapVariableManager()`中注册角色切换事件监听
- 监听事件：`tavern_events.CHARACTER_SELECTED`
- 切换角色时自动刷新数据，收藏夹会自动更新（computed属性特性）
- 在`teardownVariableManager()`中移除监听器

### 兼容性处理

- **向后兼容**：旧版本的收藏数据（数组格式）会自动迁移到`legacy`角色下
- **数据格式**：localStorage存储从数组改为对象（按characterId分组）
- **UI组件**：FavoritesSection.vue无需修改，因为使用computed属性自动适配

### 使用说明

1. **收藏变量**：在变量树中点击收藏按钮，变量会自动关联到当前角色卡
2. **切换角色**：切换到其他角色卡时，收藏夹会自动显示该角色的收藏列表
3. **数据独立**：每个角色卡的收藏列表完全独立，互不影响
4. **旧数据迁移**：首次启动会自动将旧版本收藏数据迁移到`legacy`分组

### 测试要点

1. ✅ 在角色A中收藏变量，切换到角色B，不应看到角色A的收藏
2. ✅ 在角色B中收藏变量，切换回角色A，应看到之前的收藏
3. ✅ 删除收藏只影响当前角色，不影响其他角色
4. ✅ 旧版本用户的收藏数据能正常迁移并继续使用
5. ✅ 角色卡切换时，收藏夹自动更新，无需手动刷新

### 文件修改清单

- `src/变量管理器/store.ts`: 核心逻辑修改
  - 新增类型定义
  - 新增`getCurrentCharacterId()`方法
  - 修改收藏夹相关函数
  - 添加角色切换监听

- `src/变量管理器/components/FavoritesSection.vue`: 无需修改
  - 使用computed属性自动适配新逻辑

### 注意事项

- 角色卡标识使用`avatar`文件名，确保每个角色卡有唯一的avatar
- 如果无法获取角色信息，使用默认值`'no-character'`
- 收藏夹数据存储在localStorage中，key为`variable_manager_favorites`