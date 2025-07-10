// 调试事件绑定的工具
export class EventDebugger {
  // 检查关键元素是否存在
  static checkElements(): void {
    console.log('[DEBUG] 检查关键元素...');

    const elements = [
      '#wechat-input-field',
      '#send-btn',
      '#plus-btn',
      '#smile-btn',
      '#microphone-btn',
      '#app-wechat',
      '#app-settings',
      '#wechat-back-btn-dummy',
      '#settings-back-btn',
      '#wechat-options-btn',
      '#moments-back-btn',
    ];

    elements.forEach(selector => {
      const element = $(selector);
      if (element.length > 0) {
        console.log(`[DEBUG] ✓ ${selector} 存在`);
      } else {
        console.log(`[DEBUG] ✗ ${selector} 不存在`);
      }
    });
  }

  // 检查事件绑定
  static checkEventBindings(): void {
    console.log('[DEBUG] 检查事件绑定...');

    // 检查发送按钮
    const sendBtn = $('#send-btn')[0];
    if (sendBtn) {
      const listeners = (sendBtn as any)._events || {};
      console.log('[DEBUG] 发送按钮事件:', Object.keys(listeners));
    }

    // 检查输入框
    const inputField = $('#wechat-input-field')[0];
    if (inputField) {
      const listeners = (inputField as any)._events || {};
      console.log('[DEBUG] 输入框事件:', Object.keys(listeners));
    }
  }

  // 手动触发测试事件
  static testEvents(): void {
    console.log('[DEBUG] 测试事件触发...');

    // 测试发送按钮点击
    const sendBtn = $('#send-btn');
    if (sendBtn.length > 0) {
      console.log('[DEBUG] 模拟点击发送按钮...');
      sendBtn.trigger('click');
    }

    // 测试导航按钮
    const homeBtn = $('#app-wechat');
    if (homeBtn.length > 0) {
      console.log('[DEBUG] 模拟点击微信按钮...');
      homeBtn.trigger('click');
    }
  }

  // 添加临时事件监听器进行测试
  static addTestListeners(): void {
    console.log('[DEBUG] 添加测试事件监听器...');

    // 为所有按钮添加测试监听器
    $('button, .btn, [role="button"]').on('click.debug', function (e) {
      console.log('[DEBUG] 按钮被点击:', this.id || this.className, e);
    });

    // 为导航元素添加测试监听器
    $(
      '#app-wechat, #app-settings, #wechat-back-btn-dummy, #settings-back-btn, #wechat-options-btn, #moments-back-btn',
    ).on('click.debug', function (e) {
      console.log('[DEBUG] 导航元素被点击:', this.id, e);
    });
  }

  // 移除测试监听器
  static removeTestListeners(): void {
    console.log('[DEBUG] 移除测试事件监听器...');
    $('*').off('.debug');
  }

  // 运行完整的调试检查
  static runFullDebug(): void {
    console.log('[DEBUG] 开始完整的事件调试...');

    setTimeout(() => {
      this.checkElements();
      this.checkEventBindings();
      this.addTestListeners();

      console.log('[DEBUG] 调试完成。现在可以点击任何按钮查看调试信息。');
      console.log('[DEBUG] 使用 EventDebugger.removeTestListeners() 移除调试监听器。');
    }, 1000);
  }
}

// 在全局作用域中暴露调试器
if (typeof window !== 'undefined') {
  (window as any).EventDebugger = EventDebugger;

  // 自动运行调试
  $(document).ready(() => {
    setTimeout(() => {
      console.log('[DEBUG] 事件调试器已加载。使用 EventDebugger.runFullDebug() 开始调试。');
    }, 2000);
  });
}
