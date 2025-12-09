import { AppController } from './app-controller';
import { EventHandler } from './event-handler';
import { styleManager } from './style-manager';
import { DialogManager } from './dialog-manager';
import { initWechatHome } from './wechat-home';

// 开发模式标志 - 发布前将此值设置为false
// 使用window全局变量存储，避免循环依赖
(window as any).BLMX_DEV_MODE = false;

// 解决循环依赖问题，将EventHandler类存储在全局变量中
(window as any).EventHandlerClass = EventHandler;

// 添加全局标志来防止重复处理AI响应
(window as any).BLMX_PROCESSING_AI_RESPONSE = false;

// 使用jQuery的$(async () => {})语法
$(async () => {
  try {
    // 重置全局标志，确保页面刷新时不会保留旧的状态
    (window as any).BLMX_PROCESSING_AI_RESPONSE = false;

    // 创建并初始化应用控制器
    const appController = new AppController();
    await appController.initialize();

    // 将控制器实例存储在全局变量中，以便调试
    (window as any).blmxApp = appController;
    (window as any).blmxStyleManager = styleManager;
    (window as any).dialogManager = DialogManager.getInstance();

    // 初始化微信主界面 Tab
    initWechatHome(appController);

    // 主屏幕应用入口
    $('#app-wechat').on('click', () => appController.navigateTo('wechatHome'));
    $('#app-settings').on('click', () => appController.navigateTo('settings'));

    if ((window as any).BLMX_DEV_MODE) {
      console.log('[BLMX] 开发模式已启用，已加载测试数据');
      console.log('[BLMX] 可用的调试命令:');
      console.log('  window.blmxApp.showTestEntryTypes() - 显示可用的测试数据类型');
      console.log('  window.blmxApp.addTestEntry(类型) - 添加指定类型的测试数据');
      console.log('  window.blmxApp.clearDebugData() - 清除所有数据');
    }
  } catch (error) {
    console.error('[BLMX] 初始化失败:', error);

    // 使用自定义对话框替代alert
    // 确保手机屏幕元素已经存在
    setTimeout(() => {
      const dialogManager = DialogManager.getInstance();
      dialogManager.alert('初始化失败，请查看控制台获取详细信息。', '错误');
    }, 500); // 延迟显示对话框，确保DOM已经加载
  }
});
