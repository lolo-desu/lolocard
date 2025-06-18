/**
 * 选项管理器组件
 * 负责管理游戏中的选项显示和处理
 */

export class ChoiceManager {
  // 选项数据
  private choices: string[] = [];

  // 记录选项是否已经显示过
  private choicesShown: boolean = false;

  // 是否已隐藏选项
  private choicesHidden: boolean = false;

  // 选项选择回调
  private onChoiceSelectedCallback: ((choice: string) => void) | null = null;

  constructor() {
    // 绑定自定义选项按钮事件
    $('#custom-choice-button').on('click', () => {
      const customChoice = $('#custom-choice-input').val() as string;
      if (customChoice && customChoice.trim()) {
        this.selectChoice(customChoice.trim());
        $('#custom-choice-input').val('');
      }
    });

    // 绑定自定义选项输入框回车事件
    $('#custom-choice-input').on('keypress', e => {
      if (e.key === 'Enter') {
        const customChoice = $('#custom-choice-input').val() as string;
        if (customChoice && customChoice.trim()) {
          this.selectChoice(customChoice.trim());
          $('#custom-choice-input').val('');
        }
      }
    });

    // 绑定隐藏按钮事件
    $(document).on('click', '#hide-choices-btn', e => {
      e.stopPropagation(); // 防止触发其他点击事件
      this.hideChoices();
    });

    console.log('选项管理器初始化完成');
  }

  /**
   * 设置选项列表
   */
  public setChoices(choices: string[]) {
    this.choices = choices;
    this.choicesShown = false;
    this.choicesHidden = false;
  }

  /**
   * 渲染选项
   */
  public renderChoices() {
    const $presetChoices = $('.preset-choices');
    if ($presetChoices.length === 0) return;

    // 清空现有选项
    $presetChoices.empty();

    // 渲染每个选项按钮，添加索引数据属性以便于样式控制
    _.forEach(this.choices, (choice, index) => {
      $('<button>', {
        class: 'choice-button',
        text: choice,
        'data-index': index,
        'data-choice': choice,
        click: () => this.selectChoice(choice),
      }).appendTo($presetChoices);
    });

    // 根据选项数量设置容器宽度和样式
    const $choicesContainer = $('.choices-container');
    if (this.choices.length <= 2) {
      $choicesContainer.addClass('compact-choices');
    } else {
      $choicesContainer.removeClass('compact-choices');
    }
  }

  /**
   * 显示选项
   */
  public showChoices() {
    const $choicesContainer = $('.choices-container');
    const $presetChoices = $('.preset-choices');

    if ($choicesContainer.length === 0 || $presetChoices.length === 0) return;

    // 渲染选项
    this.renderChoices();

    // 显示选项容器并添加动画效果
    $choicesContainer.removeClass('hidden').hide().fadeIn(300);

    // 标记选项已显示
    this.choicesShown = true;
    this.choicesHidden = false;

    // 聚焦自定义输入框
    setTimeout(() => {
      $('#custom-choice-input').focus();
    }, 300);
  }

  /**
   * 隐藏选项
   */
  public hideChoices() {
    const self = this;
    $('.choices-container').fadeOut(300, function () {
      $(this).addClass('hidden').show();
      // 标记选项已隐藏
      self.choicesHidden = true;
    });
  }

  /**
   * 检查是否可以重新显示选项
   */
  public canReshowChoices(): boolean {
    return this.choicesShown && this.choicesHidden && this.choices.length > 0;
  }

  /**
   * 重新显示上次的选项
   */
  public reshowChoices() {
    if (this.canReshowChoices()) {
      this.showChoices();
    }
  }

  /**
   * 选择选项
   */
  private selectChoice(choice: string) {
    // 调用选择回调
    if (this.onChoiceSelectedCallback) {
      this.onChoiceSelectedCallback(choice);
    }

    // 隐藏选项
    this.hideChoices();
  }

  /**
   * 设置选项选择回调
   */
  public setOnChoiceSelected(callback: (choice: string) => void) {
    this.onChoiceSelectedCallback = callback;
  }

  /**
   * 添加选项
   */
  public addChoice(choice: string) {
    if (!_.includes(this.choices, choice)) {
      this.choices.push(choice);

      // 如果选项容器已显示，更新选项
      if (!$('.choices-container').hasClass('hidden')) {
        this.renderChoices();
      }
    }
  }

  /**
   * 移除选项
   */
  public removeChoice(choice: string) {
    _.pull(this.choices, choice);

    // 如果选项容器已显示，更新选项
    if (!$('.choices-container').hasClass('hidden')) {
      this.renderChoices();
    }
  }

  /**
   * 清空所有选项
   */
  public clearChoices() {
    this.choices = [];

    // 如果选项容器已显示，更新选项
    if (!$('.choices-container').hasClass('hidden')) {
      this.renderChoices();
    }
  }

  /**
   * 获取所有选项
   */
  public getAllChoices(): string[] {
    return _.clone(this.choices);
  }

  /**
   * 检查选项当前是否可见
   * @returns 选项是否可见
   */
  public areChoicesVisible(): boolean {
    // 如果选项已显示且未被隐藏，则认为选项当前可见
    return this.choicesShown && !this.choicesHidden;
  }
}
