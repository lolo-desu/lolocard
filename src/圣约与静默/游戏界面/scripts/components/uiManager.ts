/**
 * UI管理器组件
 * 负责管理游戏中的通用UI显示和交互
 */

export class UIManager {
  // 当前确认回调
  private currentConfirmCallback: (() => void) | null = null;

  constructor() {
    // 初始化Toastr配置
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      timeOut: 3000,
    };

    // 绑定确认对话框按钮事件 - 这里不需要预绑定，我们会在显示时动态绑定
    console.log('UI管理器初始化完成');
  }

  /**
   * 显示加载提示
   */
  public showLoading(message: string = '加载中...') {
    $('.loading-text').text(message);
    $('.loading-indicator').removeClass('hidden');
  }

  /**
   * 隐藏加载提示
   */
  public hideLoading() {
    $('.loading-indicator').addClass('hidden');
  }

  /**
   * 显示确认对话框
   */
  public showConfirmDialog(message: string, onConfirm: () => void) {
    // 保存确认回调
    this.currentConfirmCallback = onConfirm;

    console.log('显示确认对话框:', message);

    // 设置确认消息
    $('#confirm-message').text(message);

    // 显示对话框容器
    $('#confirm-container').removeClass('hidden');

    // 绑定按钮事件
    $('#confirm-yes')
      .off('click')
      .on('click', () => this.handleConfirmYes());

    $('#confirm-no')
      .off('click')
      .on('click', () => this.hideConfirmDialog());

    // 点击对话框外部关闭
    $(document).on('click.confirm-outside', e => {
      if ($(e.target).closest('.confirm-dialog').length === 0 && !$('#confirm-container').hasClass('hidden')) {
        this.hideConfirmDialog();
      }
    });
  }

  /**
   * 隐藏确认对话框
   */
  public hideConfirmDialog() {
    // 隐藏对话框
    $('#confirm-container').addClass('hidden');

    // 移除外部点击事件处理器
    $(document).off('click.confirm-outside');

    // 重置回调
    this.currentConfirmCallback = null;
  }

  /**
   * 处理确认按钮点击
   */
  private handleConfirmYes() {
    // 调用确认回调
    if (this.currentConfirmCallback) {
      this.currentConfirmCallback();
    }

    // 隐藏对话框
    this.hideConfirmDialog();
  }

  /**
   * 显示通知
   */
  public showNotification(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 3000,
  ) {
    // 使用toastr库显示通知
    toastr.options.timeOut = duration;

    switch (type) {
      case 'success':
        toastr.success(message);
        break;
      case 'warning':
        toastr.warning(message);
        break;
      case 'error':
        toastr.error(message);
        break;
      default:
        toastr.info(message);
    }
  }

  /**
   * 切换全屏显示
   */
  public toggleFullscreen() {
    if (!document.fullscreenElement) {
      // 进入全屏
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * 显示文本提示
   */
  public showTooltip(element: HTMLElement, message: string) {
    // 使用jQuery UI的tooltip
    $(element)
      .attr('title', message)
      .tooltip({
        content: message,
        position: { my: 'center bottom', at: 'center top-5' },
        show: { effect: 'fadeIn', duration: 200 },
        hide: { effect: 'fadeOut', duration: 200 },
      })
      .tooltip('open');

    // 自动关闭
    setTimeout(() => {
      $(element).tooltip('close');
    }, 2000);
  }

  /**
   * 显示输入对话框
   * @param title 对话框标题
   * @param defaultValue 默认值
   * @param callback 输入完成回调函数
   */
  public showInputDialog(title: string, defaultValue: string, callback: (value: string) => void): void {
    // 检查是否已存在对话框
    if ($('#input-dialog').length > 0) {
      $('#input-dialog').remove();
    }

    // 创建对话框
    const dialogHtml = `
      <div id="input-dialog" class="modal fade">
        <div class="modal-dialog modal-dialog-centered monastery-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="fas fa-feather-alt"></i> ${title}</h5>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="input-dialog-container">
                <label for="input-dialog-value" class="monastery-label">为您的记录命名：</label>
                <input type="text" id="input-dialog-value" class="form-control monastery-input" value="${defaultValue}">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary monastery-btn monastery-btn-primary" id="input-dialog-confirm">
                <i class="fas fa-save"></i> 确定
              </button>
              <button type="button" class="btn btn-secondary monastery-btn monastery-btn-secondary" data-dismiss="modal">
                <i class="fas fa-times"></i> 取消
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    $('body').append(dialogHtml);

    // 绑定确认按钮事件
    $('#input-dialog-confirm').on('click', () => {
      const value = $('#input-dialog-value').val() as string;
      $('#input-dialog').modal('hide');
      callback(value);
    });

    // 绑定回车键事件
    $('#input-dialog-value').on('keypress', e => {
      if (e.which === 13) {
        // Enter键
        $('#input-dialog-confirm').click();
      }
    });

    // 显示对话框
    $('#input-dialog').modal('show');

    // 自动聚焦输入框
    $('#input-dialog-value').focus();
  }
}
