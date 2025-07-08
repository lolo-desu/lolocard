## 开发与调试

项目中包含调试模式，可以方便开发和测试各种消息类型。

### 启用调试模式

调试模式默认开启。在发布前，需要在 `src/同层手机/index.ts` 文件中将 `BLMX_DEV_MODE` 设置为 `false`：

```typescript
// 开发模式标志 - 发布前将此值设置为false
(window as any).BLMX_DEV_MODE = false;
```

### 调试功能

在开发模式下，系统会自动加载测试数据，包括各种类型的消息。您还可以在浏览器控制台中使用以下命令：

- `window.blmxApp.showTestEntryTypes()` - 显示可用的测试数据类型
- `window.blmxApp.addTestEntry('类型')` - 添加指定类型的测试数据
- `window.blmxApp.clearDebugData()` - 清除所有数据

可用的测试数据类型包括：
- `text-user` / `text-char` - 文本消息
- `sticker-user` / `sticker-char` - 表情包
- `image-user` / `image-char` - 图片
- `voice-user` / `voice-char` - 语音
- `transfer-user` / `transfer-char` - 转账
- `gift-user` / `gift-char` - 礼物
- `moment-user` / `moment-char` - 朋友圈

### 发布前清理

发布前，请确保：
1. 将 `BLMX_DEV_MODE` 设置为 `false`
2. 或者完全删除调试数据相关代码 