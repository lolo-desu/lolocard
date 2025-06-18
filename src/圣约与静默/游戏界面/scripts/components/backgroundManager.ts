/**
 * 背景管理器组件
 * 负责管理游戏中的背景图片显示和切换
 */

export class BackgroundManager {
  // 背景图片映射
  private backgroundMap: _.Dictionary<string> = {};

  constructor() {
    // 初始化背景图片映射
    this.initBackgroundMap();

    console.log('背景管理器初始化完成');
  }

  /**
   * 初始化背景图片映射
   */
  private initBackgroundMap() {
    // 设置基本背景映射
    this.backgroundMap = {
      公园_白天:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%85%AC%E5%9B%AD/%E7%99%BD%E5%A4%A9.jpg?ref_type=heads',
      公园_黄昏:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%85%AC%E5%9B%AD/%E9%BB%84%E6%98%8F.jpg?ref_type=heads',
      书店_内部:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E4%B9%A6%E5%BA%97%E5%86%85/%E4%B9%A6%E5%BA%97.jpg?ref_type=heads',
      修道院_图书室:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E4%B9%A6%E5%BA%97%E5%86%85/%E4%B9%A6%E5%BA%97.jpg?ref_type=heads',
      修道院_办公室:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%85%AC%E5%9B%AD/%E9%BB%84%E6%98%8F.jpg?ref_type=heads',
      修道院_花园:
        'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%85%AC%E5%9B%AD/%E7%99%BD%E5%A4%A9.jpg?ref_type=heads',
    };
  }

  /**
   * 设置背景图片
   * @param location 位置
   * @param scene 场景
   */
  public setBackground(location: string, scene: string) {
    // 生成背景键
    const backgroundKey = `${location}_${scene}`;

    // 获取背景图片URL
    let backgroundUrl = this.backgroundMap[backgroundKey];

    // 如果没有找到特定的背景，尝试使用该位置的默认背景
    if (!backgroundUrl) {
      backgroundUrl = this.backgroundMap[`${location}_默认`];
    }

    // 如果还是没有找到，使用第一张图片作为默认
    if (!backgroundUrl && !_.isEmpty(this.backgroundMap)) {
      backgroundUrl = _.values(this.backgroundMap)[0];
    }

    if (backgroundUrl) {
      // 设置背景图片
      $('.background-container').css('backgroundImage', `url('${backgroundUrl}')`);
      console.log(`已设置背景: ${backgroundKey}`);
    } else {
      console.warn(`未找到背景: ${backgroundKey}`);
      // 设置默认背景颜色
      $('.background-container').css({
        backgroundImage: 'none',
        backgroundColor: '#2a2a2a',
      });
    }
  }

  /**
   * 添加背景图片映射
   * @param key 背景键
   * @param url 图片URL
   */
  public addBackground(key: string, url: string) {
    this.backgroundMap[key] = url;
  }

  /**
   * 应用背景切换特效
   * @param effect 特效名称
   */
  public applyBackgroundEffect(effect: 'fade' | 'slide' | 'zoom') {
    // 移除所有特效类
    $('.background-container').removeClass('effect-fade effect-slide effect-zoom');

    if (effect) {
      // 添加指定特效类并使用jQuery UI的效果
      const $bg = $('.background-container');

      switch (effect) {
        case 'fade':
          $bg.addClass('effect-fade');
          $bg.hide().fadeIn(1000);
          break;
        case 'slide':
          $bg.addClass('effect-slide');
          $bg.hide().slideDown(1000);
          break;
        case 'zoom':
          $bg.addClass('effect-zoom');
          $bg.hide().show('scale', {}, 1000);
          break;
      }

      // 一段时间后移除特效类
      setTimeout(() => {
        $bg.removeClass(`effect-${effect}`);
      }, 1000);
    }
  }

  /**
   * 获取所有背景键
   */
  public getAllBackgroundKeys(): string[] {
    return _.keys(this.backgroundMap);
  }
}
