/**
 * 对话框管理器
 * 提供自定义的alert、confirm、prompt对话框，替代系统默认对话框
 */

// 对话框类型
type DialogType = 'alert' | 'confirm' | 'prompt';

// 对话框选项
interface DialogOptions {
  title?: string;
  message: string;
  type: DialogType;
  inputType?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

export class DialogManager {
  private static instance: DialogManager;
  private activeDialog: HTMLElement | null = null;
  private activeOverlay: HTMLElement | null = null;

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): DialogManager {
    if (!DialogManager.instance) {
      DialogManager.instance = new DialogManager();
    }
    return DialogManager.instance;
  }

  /**
   * HTML转义辅助方法
   */
  private escapeHtml(text: string): string {
    return $('<div>').text(text).html();
  }

  /**
   * 安全显示对话框 - 如果已有对话框则先关闭
   */
  private async safeShowDialog<T>(dialogFunction: () => Promise<T>): Promise<T> {
    // 强制清理所有对话框（无论是否有活跃对话框）
    this.forceCleanupDialogs();

    return await dialogFunction();
  }

  /**
   * 创建基础对话框元素
   */
  private createBaseDialogElements(dialogClass: string): void {
    this.activeOverlay = $('<div>').addClass('dialog-overlay mobile-dialog-overlay')[0] as HTMLElement;
    this.activeDialog = $('<div>').addClass(`dialog ${dialogClass} mobile-dialog`)[0] as HTMLElement;
  }

  /**
   * 将对话框添加到页面中
   */
  private appendDialogToPage(): void {
    if (!this.activeOverlay) return;

    const $phoneScreen = $('.phone-screen');
    if ($phoneScreen.length) {
      $phoneScreen.append(this.activeOverlay);
    } else {
      // 如果找不到手机屏幕容器，回退到body
      $('body').append(this.activeOverlay);
    }
  }

  /**
   * 初始化对话框中的checkbox按钮样式
   */
  private initializeCheckboxButtons(): void {
    if (!this.activeDialog) return;

    $(this.activeDialog)
      .find('.checkbox-button')
      .each((_, button) => {
        const $button = $(button);
        const $checkbox = $button.find('input[type="checkbox"]');
        if (!$checkbox.length) return;

        const checkbox = $checkbox[0] as HTMLInputElement;

        // 设置初始状态
        this.updateCheckboxButtonState(button as HTMLElement, checkbox.checked);

        // 添加点击事件
        $button.on('click', e => {
          e.preventDefault();
          e.stopPropagation();

          if (checkbox.disabled) return;

          // 切换状态
          checkbox.checked = !checkbox.checked;
          this.updateCheckboxButtonState(button as HTMLElement, checkbox.checked);

          // 触发change事件 - 使用原生事件确保兼容性
          const changeEvent = new Event('change', { bubbles: true });
          checkbox.dispatchEvent(changeEvent);
        });

        // 监听外部状态变化
        $checkbox.on('change', () => {
          this.updateCheckboxButtonState(button as HTMLElement, checkbox.checked);
        });

        // 设置可访问性属性
        $button.attr({
          role: 'checkbox',
          tabindex: '0',
          'aria-checked': checkbox.checked.toString(),
        });
      });
  }

  /**
   * 更新checkbox按钮状态
   */
  private updateCheckboxButtonState(button: HTMLElement, checked: boolean): void {
    const $button = $(button);
    $button.toggleClass('checked', checked);
    $button.attr('aria-checked', checked.toString());
  }

  /**
   * 显示提示对话框（替代alert）
   */
  public alert(message: string, title = '提示', confirmText = '确定'): Promise<void> {
    return this.safeShowDialog(() =>
      this.showDialog({
        type: 'alert',
        title,
        message,
        confirmText,
      }),
    );
  }

  /**
   * 显示确认对话框（替代confirm）
   */
  public confirm(message: string, title = '确认', confirmText = '确定', cancelText = '取消'): Promise<boolean> {
    return this.safeShowDialog(
      () =>
        this.showDialog({
          type: 'confirm',
          title,
          message,
          confirmText,
          cancelText,
        }) as Promise<boolean>,
    );
  }

  /**
   * 显示输入对话框（替代prompt）
   */
  public prompt(
    message: string,
    defaultValue = '',
    title = '请输入',
    confirmText = '确定',
    cancelText = '取消',
    inputType = 'text',
    placeholder = '',
  ): Promise<string | null> {
    return this.safeShowDialog(
      () =>
        this.showDialog({
          type: 'prompt',
          title,
          message,
          confirmText,
          cancelText,
          inputType,
          inputValue: defaultValue,
          inputPlaceholder: placeholder,
        }) as Promise<string | null>,
    );
  }

  /**
   * 显示可滚动文本对话框（用于显示长文本内容）
   */
  public showScrollableText(content: string, title = '内容', confirmText = '关闭'): Promise<void> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('scrollable-text-dialog');

          // 设置对话框内容
          this.activeDialog!.innerHTML = `
          <div class="dialog-header">
            <h3>${title}</h3>
          </div>
          <div class="dialog-body scrollable-content">
            <pre class="scrollable-text">${this.escapeHtml(content)}</pre>
          </div>
          <div class="dialog-footer">
            <button class="dialog-button copy-btn">复制</button>
            <button class="dialog-button primary-button">${confirmText}</button>
          </div>
        `;

          const $copyBtn = $(this.activeDialog!).find('.copy-btn');
          const $confirmBtn = $(this.activeDialog!).find('.primary-button');

          const handleCopy = async () => {
            try {
              await navigator.clipboard.writeText(content);
              // 临时改变按钮文字提示复制成功
              const originalText = $copyBtn.text();
              $copyBtn.text('已复制');
              setTimeout(() => {
                $copyBtn.text(originalText);
              }, 1000);
            } catch (error) {
              console.error('复制失败:', error);
              // 降级方案：选择文本
              const $textElement = $(this.activeDialog!).find('.scrollable-text');
              if ($textElement.length) {
                const range = document.createRange();
                range.selectNodeContents($textElement[0]);
                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          };

          const handleConfirm = () => {
            this.closeDialog();
            resolve();
          };

          const handleCancel = () => {
            this.closeDialog();
            resolve();
          };

          $copyBtn.on('click', handleCopy);
          $confirmBtn.on('click', handleConfirm);

          // ESC键关闭
          $(document).on('keydown.dialog', (e: any) => {
            if (e.key === 'Escape') {
              handleCancel();
              $(document).off('keydown.dialog');
            }
          });

          // 添加到手机屏幕容器内
          $(this.activeOverlay!).append(this.activeDialog!);
          this.appendDialogToPage();
        }),
    );
  }

  /**
   * 显示对话框
   */
  private showDialog(options: DialogOptions): Promise<any> {
    // 创建对话框元素
    const { overlay, dialog } = this.createDialogElements(options);

    // 保存引用
    this.activeOverlay = overlay;
    this.activeDialog = dialog;

    // 添加到页面中
    this.appendDialogToPage();

    // 处理输入框自动聚焦
    if (options.type === 'prompt') {
      const $inputEl = $(dialog).find('input, textarea');
      if ($inputEl.length) {
        setTimeout(() => $inputEl.trigger('focus'), 100);
      }
    }

    return new Promise(resolve => {
      // 确认按钮点击处理
      const confirmButton = dialog.querySelector('.primary-button');
      if (confirmButton) {
        confirmButton.addEventListener('click', () => {
          if (options.type === 'prompt') {
            const inputEl = dialog.querySelector('input, textarea') as HTMLInputElement;
            const value = inputEl ? inputEl.value : null;
            this.closeDialog();
            resolve(value);
          } else {
            this.closeDialog();
            resolve(options.type === 'confirm' ? true : undefined);
          }
        });
      }

      // 取消按钮点击处理
      const cancelButton = dialog.querySelector('.cancel-button');
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          this.closeDialog();
          resolve(options.type === 'prompt' ? null : false);
        });
      }

      // 点击遮罩层关闭（仅对alert有效）
      if (options.type === 'alert') {
        overlay.addEventListener('click', e => {
          if (e.target === overlay) {
            this.closeDialog();
            resolve(undefined);
          }
        });
      }

      // 键盘事件处理
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (options.type === 'prompt') {
            const inputEl = dialog.querySelector('input, textarea') as HTMLInputElement;
            const value = inputEl ? inputEl.value : null;
            this.closeDialog();
            resolve(value);
          } else if (options.type === 'confirm') {
            this.closeDialog();
            resolve(true);
          } else {
            // alert
            this.closeDialog();
            resolve(undefined);
          }
          document.removeEventListener('keydown', handleKeyDown);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.closeDialog();
          resolve(options.type === 'prompt' ? null : false);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    });
  }

  /**
   * 创建对话框元素
   */
  private createDialogElements(options: DialogOptions): { overlay: HTMLElement; dialog: HTMLElement } {
    // 创建遮罩层
    const $overlay = $('<div>').addClass('custom-dialog-overlay');

    // 创建对话框
    const $dialog = $('<div>').addClass(`custom-dialog ${options.className || ''}`);

    // 创建标题
    const $header = $('<div>').addClass('dialog-header');
    const $title = $('<h3>')
      .addClass('dialog-title')
      .text(options.title || '');
    $header.append($title);
    $dialog.append($header);

    // 创建内容
    const $body = $('<div>').addClass('dialog-body');

    // 添加消息
    const $message = $('<div>').text(options.message);
    $body.append($message);

    // 如果是prompt，添加输入框
    if (options.type === 'prompt') {
      const $inputContainer = $('<div>').addClass('dialog-input-container');
      const $input = $(options.inputType === 'textarea' ? '<textarea>' : '<input>');

      if (options.inputType !== 'textarea') {
        $input.attr('type', options.inputType || 'text');
      }

      if (options.inputValue) {
        $input.val(options.inputValue);
      }

      if (options.inputPlaceholder) {
        $input.attr('placeholder', options.inputPlaceholder);
      }

      $inputContainer.append($input);
      $body.append($inputContainer);
    }

    $dialog.append($body);

    // 创建按钮区域
    const $footer = $('<div>').addClass('dialog-footer');

    // 根据类型添加不同的按钮
    if (options.type === 'confirm' || options.type === 'prompt') {
      const $cancelButton = $('<button>')
        .addClass('dialog-button cancel-button')
        .text(options.cancelText || '取消');
      $footer.append($cancelButton);
    }

    const $confirmButton = $('<button>')
      .addClass('dialog-button primary-button')
      .text(options.confirmText || '确定');
    $footer.append($confirmButton);

    $dialog.append($footer);
    $overlay.append($dialog);

    return { overlay: $overlay[0], dialog: $dialog[0] };
  }

  /**
   * 显示朋友圈评论/点赞对话框
   */
  public showCommentDialog(): Promise<{ type: 'like' | 'comment'; content?: string } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('comment-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>互动</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="comment-text">评论内容</label>
            <textarea id="comment-text" placeholder="说点什么..." rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button cancel-btn">取消</button>
          <button class="dialog-button like-btn">点赞</button>
          <button class="dialog-button confirm-btn">发送</button>
        </div>
      `;

          const $dialog = $(this.activeDialog!);
          const $cancelBtn = $dialog.find('.cancel-btn');
          const $likeBtn = $dialog.find('.like-btn');
          const $confirmBtn = $dialog.find('.confirm-btn');
          const $commentText = $dialog.find('#comment-text');

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleLike = () => {
            this.closeDialog();
            resolve({ type: 'like' });
          };

          const handleComment = () => {
            const content = $commentText.val() as string;
            if (!content) {
              // 在输入框上显示错误提示，而不是弹出新的alert
              $commentText.css('borderColor', '#ff4444');
              $commentText.attr('placeholder', '请输入评论内容');
              $commentText.trigger('focus');
              return;
            }
            this.closeDialog();
            resolve({ type: 'comment', content });
          };

          $cancelBtn.on('click', handleCancel);
          $likeBtn.on('click', handleLike);
          $confirmBtn.on('click', handleComment);

          // 键盘事件处理
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              // Ctrl+Enter 发送评论
              e.preventDefault();
              handleComment();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到文本框
          setTimeout(() => {
            $commentText.trigger('focus');
          }, 100);
        }),
    );
  }

  /**
   * 显示转账对话框
   */
  public showTransferDialog(): Promise<{ amount: string; note: string } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('transfer-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>转账</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="transfer-amount">转账金额 *</label>
            <input type="number" id="transfer-amount" placeholder="请输入转账金额" step="0.01" min="0.01">
          </div>
          <div class="form-group">
            <label for="transfer-note">转账备注</label>
            <input type="text" id="transfer-note" placeholder="请输入转账备注（可选）">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button cancel-btn">取消</button>
          <button class="dialog-button confirm-btn">确认转账</button>
        </div>
      `;

          const $dialog = $(this.activeDialog!);
          const $cancelBtn = $dialog.find('.cancel-btn');
          const $confirmBtn = $dialog.find('.confirm-btn');
          const $amountInput = $dialog.find('#transfer-amount');
          const $noteInput = $dialog.find('#transfer-note');

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            const amount = $amountInput.val() as string;
            const note = $noteInput.val() as string;

            if (!amount || parseFloat(amount) <= 0) {
              // 在输入框上显示错误提示，而不是弹出新的alert
              $amountInput.css('borderColor', '#ff4444');
              $amountInput.attr('placeholder', '请输入有效的转账金额');
              $amountInput.trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({ amount: parseFloat(amount).toFixed(2), note: note || '' });
          };

          $cancelBtn.on('click', handleCancel);
          $confirmBtn.on('click', handleConfirm);

          // 回车键确认
          $(document).on('keydown.transfer-dialog', (e: any) => {
            if (e.key === 'Enter') {
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              $(document).off('keydown.transfer-dialog');
            }
          });

          // 添加到手机屏幕容器内
          $(this.activeOverlay!).append(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到金额输入框
          setTimeout(() => {
            $amountInput.trigger('focus');
          }, 100);
        }),
    );
  }

  /**
   * 显示红包对话框
   */
  public showRedPacketDialog(): Promise<{ amount: string; note: string } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('red-packet-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>🧧 发送红包</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="red-packet-amount">红包金额 *</label>
            <input type="number" id="red-packet-amount" placeholder="请输入红包金额" step="0.01" min="0.01">
          </div>
          <div class="form-group">
            <label for="red-packet-note">红包祝福语</label>
            <input type="text" id="red-packet-note" placeholder="恭喜发财，大吉大利！" value="恭喜发财，大吉大利！">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button cancel-btn">取消</button>
          <button class="dialog-button confirm-btn">发送红包</button>
        </div>
      `;

          const $dialog = $(this.activeDialog!);
          const $cancelBtn = $dialog.find('.cancel-btn');
          const $confirmBtn = $dialog.find('.confirm-btn');
          const $amountInput = $dialog.find('#red-packet-amount');
          const $noteInput = $dialog.find('#red-packet-note');

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            const amount = $amountInput.val() as string;
            const note = $noteInput.val() as string;

            if (!amount || parseFloat(amount) <= 0) {
              // 在输入框上显示错误提示，而不是弹出新的alert
              $amountInput.css('borderColor', '#ff4444');
              $amountInput.attr('placeholder', '请输入有效的红包金额');
              $amountInput.trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({ amount: parseFloat(amount).toFixed(2), note: note || '恭喜发财，大吉大利！' });
          };

          $cancelBtn.on('click', handleCancel);
          $confirmBtn.on('click', handleConfirm);

          // 回车键确认
          $(document).on('keydown.red-packet-dialog', (e: any) => {
            if (e.key === 'Enter') {
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              $(document).off('keydown.red-packet-dialog');
            }
          });

          // 添加到手机屏幕容器内
          $(this.activeOverlay!).append(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到金额输入框
          setTimeout(() => {
            $amountInput.trigger('focus');
          }, 100);
        }),
    );
  }

  /**
   * 显示礼物对话框
   */
  public showGiftDialog(): Promise<{ name: string; price?: string } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('gift-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>🎁 发送礼物</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="gift-name">礼物名称 *</label>
            <input type="text" id="gift-name" placeholder="请输入礼物名称">
          </div>
          <div class="form-group">
            <label for="gift-price">礼物价格</label>
            <input type="number" id="gift-price" placeholder="请输入价格（可选）" step="0.01" min="0">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button cancel-btn">取消</button>
          <button class="dialog-button confirm-btn">发送礼物</button>
        </div>
      `;

          const cancelBtn = this.activeDialog!.querySelector('.cancel-btn') as HTMLButtonElement;
          const confirmBtn = this.activeDialog!.querySelector('.confirm-btn') as HTMLButtonElement;
          const nameInput = this.activeDialog!.querySelector('#gift-name') as HTMLInputElement;
          const priceInput = this.activeDialog!.querySelector('#gift-price') as HTMLInputElement;

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            const name = nameInput.value.trim();
            const price = priceInput.value.trim();

            if (!name) {
              // 在输入框上显示错误提示，而不是弹出新的alert
              $(nameInput).css('borderColor', '#ff4444');
              $(nameInput).attr('placeholder', '请输入礼物名称');
              $(nameInput).trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({
              name,
              price: price && parseFloat(price) > 0 ? parseFloat(price).toFixed(2) : undefined,
            });
          };

          cancelBtn.addEventListener('click', handleCancel);
          confirmBtn.addEventListener('click', handleConfirm);

          // 回车键确认
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到名称输入框
          setTimeout(() => {
            $(nameInput).trigger('focus');
          }, 100);
        }),
    );
  }

  /**
   * 显示自定义输入对话框（替代系统prompt）
   */
  public showInputDialog(
    title: string,
    label: string,
    defaultValue: string = '',
    placeholder: string = '',
    inputType: 'text' | 'url' | 'email' = 'text',
  ): Promise<string | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('input-dialog');

          this.activeDialog!.innerHTML = `
            <div class="dialog-header">
              <h3>${title}</h3>
            </div>
            <div class="dialog-body">
              <div class="form-group">
                <label for="input-field">${label}</label>
                <input type="${inputType}" id="input-field" placeholder="${placeholder}" value="${defaultValue}">
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-button cancel-btn">取消</button>
              <button class="dialog-button confirm-btn">确定</button>
            </div>
          `;

          const $dialog = $(this.activeDialog!);
          const $cancelBtn = $dialog.find('.cancel-btn');
          const $confirmBtn = $dialog.find('.confirm-btn');
          const $inputField = $dialog.find('#input-field');

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            const value = $inputField.val() as string;
            this.closeDialog();
            resolve(value);
          };

          $cancelBtn.on('click', handleCancel);
          $confirmBtn.on('click', handleConfirm);

          // 回车键确认
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到输入框并选中默认值
          setTimeout(() => {
            $inputField.trigger('focus');
            if (defaultValue) {
              $inputField.trigger('select');
            }
          }, 100);
        }),
    );
  }

  /**
   * 显示语音输入对话框
   */
  public showVoiceDialog(): Promise<{ text: string; duration: number } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('voice-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>🎤 语音消息</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="voice-text">语音内容</label>
            <textarea id="voice-text" placeholder="请输入语音内容..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="voice-duration">语音时长（秒）</label>
            <input type="number" id="voice-duration" placeholder="请输入秒数" min="1" max="60" value="3">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button cancel-btn">取消</button>
          <button class="dialog-button confirm-btn">发送</button>
        </div>
      `;

          const cancelBtn = this.activeDialog!.querySelector('.cancel-btn') as HTMLButtonElement;
          const confirmBtn = this.activeDialog!.querySelector('.confirm-btn') as HTMLButtonElement;
          const textArea = this.activeDialog!.querySelector('#voice-text') as HTMLTextAreaElement;
          const durationInput = this.activeDialog!.querySelector('#voice-duration') as HTMLInputElement;

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            const text = textArea.value.trim();
            const durationStr = durationInput.value.trim();

            if (!text) {
              // 在文本框上显示错误提示，而不是弹出新的alert
              $(textArea).css('borderColor', '#ff4444');
              $(textArea).attr('placeholder', '请输入语音内容');
              $(textArea).trigger('focus');
              return;
            }

            const duration = parseInt(durationStr, 10);
            if (!durationStr || isNaN(duration) || duration <= 0 || duration > 60) {
              // 在输入框上显示错误提示，而不是弹出新的alert
              $(durationInput).css('borderColor', '#ff4444');
              $(durationInput).attr('placeholder', '请输入有效的语音时长（1-60秒）');
              $(durationInput).trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({ text, duration });
          };

          cancelBtn.addEventListener('click', handleCancel);
          confirmBtn.addEventListener('click', handleConfirm);

          // 回车键确认（在textarea中使用Ctrl+Enter）
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到文本框
          setTimeout(() => {
            $(textArea).trigger('focus');
          }, 100);
        }),
    );
  }

  /**
   * 显示礼物/转账接收对话框
   */
  public showReceiveDialog(type: 'gift' | 'transfer', data: any): Promise<'accept' | 'reject' | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          // 创建基础对话框元素
          this.createBaseDialogElements('receive-dialog');

          const isGift = type === 'gift';
          const title = isGift ? '收到礼物' : '收到转账';
          const icon = isGift ? '🎁' : '💰';

          let content = '';
          if (isGift) {
            content = `
          <div class="receive-content">
            <div class="receive-icon">${icon}</div>
            <div class="receive-info">
              <div class="receive-title">${data.name}</div>
              ${data.price ? `<div class="receive-price">¥${data.price}</div>` : ''}
              ${data.note ? `<div class="receive-note">${data.note}</div>` : ''}
            </div>
          </div>
        `;
          } else {
            content = `
          <div class="receive-content">
            <div class="receive-icon">${icon}</div>
            <div class="receive-info">
              <div class="receive-title">转账金额</div>
              <div class="receive-price">¥${data.amount}</div>
              ${data.note ? `<div class="receive-note">${data.note}</div>` : ''}
            </div>
          </div>
        `;
          }

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>${title}</h3>
        </div>
        <div class="dialog-body">
          ${content}
        </div>
        <div class="dialog-footer">
          <button class="dialog-button reject-btn">拒绝</button>
          <button class="dialog-button accept-btn">接收</button>
        </div>
      `;

          const rejectBtn = this.activeDialog!.querySelector('.reject-btn') as HTMLButtonElement;
          const acceptBtn = this.activeDialog!.querySelector('.accept-btn') as HTMLButtonElement;

          const handleReject = () => {
            this.closeDialog();
            resolve('reject');
          };

          const handleAccept = () => {
            this.closeDialog();
            resolve('accept');
          };

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          rejectBtn.addEventListener('click', handleReject);
          acceptBtn.addEventListener('click', handleAccept);

          // 键盘事件处理
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              // Enter键接受转账/礼物
              e.preventDefault();
              handleAccept();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();
        }),
    );
  }

  /**
   * 显示朋友圈发布对话框
   */
  public showMomentDialog(defaultTime?: string): Promise<{
    text: string;
    image: string;
    image_type: 'none' | 'url' | 'desc';
    image_desc: string;
    date: string;
    time: string;
  } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          const currentDate = window.currentGameDate || new Date();
          const defaultDateTime =
            defaultTime ||
            `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate
              .getDate()
              .toString()
              .padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate
              .getMinutes()
              .toString()
              .padStart(2, '0')}`;

          // 创建基础对话框元素
          this.createBaseDialogElements('moment-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>发布朋友圈</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="moment-text">这一刻的想法...</label>
            <textarea id="moment-text" placeholder="分享你的想法..." rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>📷 图片类型</label>
            <div class="radio-group">
              <label><input type="radio" name="image-type" value="desc" checked> 图片描述</label>
              <label><input type="radio" name="image-type" value="url"> 图片链接</label>
            </div>
          </div>

          <div class="form-group">
            <label for="image-content" id="image-content-label">图片描述（可选）</label>
            <input type="text" id="image-content" placeholder="请输入图片描述...（可选）">
          </div>

          <div class="form-group url-desc-group" style="display: none;">
            <label for="image-desc">图片描述（供AI识别，可选）</label>
            <input type="text" id="image-desc" placeholder="描述图片内容，仅供AI识别...（可选）">
          </div>

          <div class="form-group">
            <label for="moment-datetime">发布时间</label>
            <input type="text" id="moment-datetime" value="${defaultDateTime}" placeholder="YYYY-MM-DD HH:MM">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn dialog-btn-cancel">取消</button>
          <button class="dialog-btn dialog-btn-confirm">发布</button>
        </div>
      `;

          // 添加事件监听器
          const imageTypeRadios = this.activeDialog!.querySelectorAll(
            'input[name="image-type"]',
          ) as NodeListOf<HTMLInputElement>;
          const imageContentLabel = this.activeDialog!.querySelector('#image-content-label') as HTMLElement;
          const imageContentInput = this.activeDialog!.querySelector('#image-content') as HTMLInputElement;
          const urlDescGroup = this.activeDialog!.querySelector('.url-desc-group') as HTMLElement;

          // 初始化checkbox按钮样式（如果有其他checkbox的话）
          this.initializeCheckboxButtons();

          // 图片类型切换
          imageTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
              const isDesc = radio.value === 'desc';
              imageContentLabel.textContent = isDesc ? '图片描述（可选）' : '图片链接（可选）';
              imageContentInput.placeholder = isDesc ? '请输入图片描述...（可选）' : '请输入图片链接...（可选）';
              urlDescGroup.style.display = isDesc ? 'none' : 'block';
            });
          });

          // 按钮事件
          const cancelBtn = this.activeDialog!.querySelector('.dialog-btn-cancel') as HTMLElement;
          const confirmBtn = this.activeDialog!.querySelector('.dialog-btn-confirm') as HTMLElement;

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            // 检查对话框是否还存在
            if (!this.activeDialog) {
              return;
            }

            const textArea = this.activeDialog!.querySelector('#moment-text') as HTMLTextAreaElement;
            const imageTypeInput = this.activeDialog!.querySelector(
              'input[name="image-type"]:checked',
            ) as HTMLInputElement;
            const imageContentField = this.activeDialog!.querySelector('#image-content') as HTMLInputElement;
            const imageDescField = this.activeDialog!.querySelector('#image-desc') as HTMLInputElement;
            const datetimeInput = this.activeDialog!.querySelector('#moment-datetime') as HTMLInputElement;

            if (!textArea || !datetimeInput) {
              return;
            }

            const text = textArea.value;
            const imageContent = imageContentField ? imageContentField.value.trim() : '';
            const hasImage = imageContent !== '';
            const imageType = hasImage && imageTypeInput ? (imageTypeInput.value as 'url' | 'desc') : 'none';
            const imageDesc = imageType === 'url' && imageDescField ? imageDescField.value.trim() : imageContent;
            const datetime = datetimeInput.value;

            // 验证输入
            if ((!text || text.trim() === '') && (!imageContent || imageContent.trim() === '')) {
              // 在文本框上显示错误提示，而不是弹出新的alert
              $(textArea).css('borderColor', '#ff4444');
              $(textArea).attr('placeholder', '请输入朋友圈内容或添加图片');
              $(textArea).trigger('focus');
              return;
            }

            // 解析时间
            const datetimeMatch = datetime.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
            if (!datetimeMatch) {
              // 在时间输入框上显示错误提示，而不是弹出新的alert
              $(datetimeInput).css('borderColor', '#ff4444');
              $(datetimeInput).attr('placeholder', '格式：YYYY-MM-DD HH:MM');
              $(datetimeInput).trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({
              text: text.trim(),
              image: imageContent.trim(),
              image_type: imageType,
              image_desc: imageDesc.trim(),
              date: datetimeMatch[1],
              time: datetimeMatch[2],
            });
          };

          cancelBtn.addEventListener('click', handleCancel);
          confirmBtn.addEventListener('click', handleConfirm);

          // 键盘事件处理
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              // Ctrl+Enter 发布朋友圈
              e.preventDefault();
              handleConfirm();
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到文本框
          setTimeout(() => {
            if (this.activeDialog) {
              const $textArea = $(this.activeDialog).find('#moment-text');
              if ($textArea.length) {
                $textArea.trigger('focus');
              }
            }
          }, 100);
        }),
    );
  }

  /**
   * 显示时间跳跃对话框
   */
  public showTimeJumpDialog(defaultTime?: string): Promise<{
    date: string;
    time: string;
    description: string;
  } | null> {
    return this.safeShowDialog(
      () =>
        new Promise(resolve => {
          const currentDate = window.currentGameDate || new Date();
          const defaultDateTime =
            defaultTime ||
            `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate
              .getDate()
              .toString()
              .padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate
              .getMinutes()
              .toString()
              .padStart(2, '0')}`;

          // 创建基础对话框元素
          this.createBaseDialogElements('time-jump-dialog');

          this.activeDialog!.innerHTML = `
        <div class="dialog-header">
          <h3>时间跳跃</h3>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="jump-datetime">跳跃到时间</label>
            <input type="text" id="jump-datetime" value="${defaultDateTime}" placeholder="YYYY-MM-DD HH:MM">
          </div>

          <div class="form-group">
            <label for="event-description">📝 记录这段时间发生了什么</label>
            <textarea id="event-description" placeholder="描述这段时间发生的事情...（可选）" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn dialog-btn-cancel">取消</button>
          <button class="dialog-btn dialog-btn-confirm">跳跃</button>
        </div>
      `;

          // 初始化checkbox按钮样式（如果有其他checkbox的话）
          this.initializeCheckboxButtons();

          // 按钮事件
          const cancelBtn = this.activeDialog!.querySelector('.dialog-btn-cancel') as HTMLElement;
          const confirmBtn = this.activeDialog!.querySelector('.dialog-btn-confirm') as HTMLElement;

          const handleCancel = () => {
            this.closeDialog();
            resolve(null);
          };

          const handleConfirm = () => {
            // 检查对话框是否还存在
            if (!this.activeDialog) {
              return;
            }

            const datetimeInput = this.activeDialog!.querySelector('#jump-datetime') as HTMLInputElement;
            const descriptionInput = this.activeDialog!.querySelector('#event-description') as HTMLTextAreaElement;

            if (!datetimeInput) {
              return;
            }

            const datetime = datetimeInput.value;
            const description = descriptionInput ? descriptionInput.value.trim() : '';

            // 解析时间
            const datetimeMatch = datetime.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
            if (!datetimeMatch) {
              // 在时间输入框上显示错误提示，而不是弹出新的alert
              $(datetimeInput).css('borderColor', '#ff4444');
              $(datetimeInput).attr('placeholder', '格式：YYYY-MM-DD HH:MM');
              $(datetimeInput).trigger('focus');
              return;
            }

            this.closeDialog();
            resolve({
              date: datetimeMatch[1],
              time: datetimeMatch[2],
              description: description, // 可以为空字符串
            });
          };

          cancelBtn.addEventListener('click', handleCancel);
          confirmBtn.addEventListener('click', handleConfirm);

          // 键盘事件处理
          const handleKeyDown = (e: KeyboardEvent) => {
            // 检查对话框是否还存在
            if (!this.activeDialog) {
              document.removeEventListener('keydown', handleKeyDown);
              return;
            }

            if (e.key === 'Enter') {
              // Enter键确认时间跳转
              e.preventDefault();
              handleConfirm();
              document.removeEventListener('keydown', handleKeyDown);
            } else if (e.key === 'Escape') {
              handleCancel();
              document.removeEventListener('keydown', handleKeyDown);
            }
          };
          document.addEventListener('keydown', handleKeyDown);

          // 添加到手机屏幕容器内
          this.activeOverlay!.appendChild(this.activeDialog!);
          this.appendDialogToPage();

          // 聚焦到时间输入框
          setTimeout(() => {
            if (this.activeDialog) {
              const $timeInput = $(this.activeDialog).find('#jump-datetime');
              if ($timeInput.length) {
                $timeInput.trigger('focus');
                $timeInput.trigger('select');
              }
            }
          }, 100);
        }),
    );
  }

  /**
   * 强制清理所有对话框元素
   */
  private forceCleanupDialogs(): void {
    // 清理所有可能残留的对话框元素
    const $container = $('.phone-screen').length ? $('.phone-screen') : $('body');

    // 使用通用选择器清理所有对话框相关元素
    const selectors = [
      '[class*="dialog-overlay"]',
      '[class*="dialog"]',
      '.custom-dialog-overlay',
      '.mobile-dialog-overlay',
      '.custom-dialog',
      '.mobile-dialog',
    ];

    selectors.forEach(selector => {
      $container.find(selector).each((_, element) => {
        try {
          $(element).remove();
        } catch (error) {
          console.warn('移除对话框元素时出错:', error);
        }
      });
    });

    // 清理引用
    this.activeDialog = null;
    this.activeOverlay = null;
  }

  /**
   * 关闭对话框
   */
  private closeDialog(): void {
    this.forceCleanupDialogs();
  }
}
