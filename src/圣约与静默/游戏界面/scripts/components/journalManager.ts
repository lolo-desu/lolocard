/**
 * 日记管理器
 * 负责处理游戏中的日记功能，仅显示空白占位页
 */

import { GameData } from '../models/gameData';

export class JournalManager {
  // 游戏数据引用
  private gameData: GameData | null = null;

  constructor() {
    console.log('日记管理器初始化完成');
  }

  /**
   * 设置游戏数据
   * @param gameData 游戏数据
   */
  public setGameData(gameData: GameData | null) {
    this.gameData = gameData;
  }

  /**
   * 切换日记部分
   */
  public switchJournalSection(sectionId: string) {
    // 移除所有导航项的激活状态
    $('.journal-nav-item').removeClass('active');

    // 移除所有内容区域的激活状态
    $('.journal-section').removeClass('active');

    // 激活选中的导航项和内容区域
    $(`[data-section="${sectionId}"]`).addClass('active');
    $(`#${sectionId}-section`).addClass('active');

    // 显示所有部分的空白占位页
    this.showPlaceholder(sectionId);
  }

  /**
   * 刷新日记内容
   */
  public refreshJournalContent() {
    // 默认显示角色信息部分
    this.showPlaceholder('characters');
  }

  /**
   * 显示对应区域的空白占位页
   * @param sectionId 区域ID
   */
  private showPlaceholder(sectionId: string) {
    const $container = $(`#${sectionId}-section`);
    if (!$container.length) return;

    // 清空现有内容
    $container.empty();

    // 获取显示标题
    let title = '日记';
    switch (sectionId) {
      case 'characters':
        title = '角色信息';
        break;
      case 'monastery':
        title = '修道院';
        break;
      case 'knowledge':
        title = '知识库';
        break;
    }

    // 添加空白页占位内容
    $('<div>', {
      class: 'journal-placeholder',
      css: {
        padding: '20px',
        textAlign: 'center',
      },
    })
      .append(
        $('<h3>', {
          text: title,
          css: { marginBottom: '15px' },
        }),
      )
      .append(
        $('<p>', {
          text: '内容暂未实现',
          css: {
            color: '#888',
            fontStyle: 'italic',
          },
        }),
      )
      .appendTo($container);

    console.log(`日记${title}部分已清空，仅保留占位符`);
  }

  /**
   * 选择角色
   * 保留方法签名但简化实现
   */
  public selectCharacter(characterId: string) {
    // 仅记录交互，不执行实际操作
    console.log(`尝试选择角色: ${characterId}，但该功能已简化为占位符`);
  }
}
