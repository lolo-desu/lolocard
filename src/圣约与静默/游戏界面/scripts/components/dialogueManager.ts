/**
 * 对话管理器组件
 * 负责管理游戏中的对话显示、控制和效果
 */

import { CharacterResourceService } from '../../services/character-resource.service';
import { Dialogue, EmotionType } from '../models/gameData';
import { BackgroundManager } from './backgroundManager';
import { CharacterManager } from './characterManager';

/**
 * 对话历史条目接口
 * 用于外部传入的对话历史记录
 */
export interface DialogueHistoryItem {
  speaker: string;
  content: string;
  style?: string;
  portrait?: {
    character: string;
    emotion: EmotionType;
  };
  background?: {
    location: string;
    scene: string;
  };
}

export class DialogueManager {
  // 对话数据
  private dialogues: Dialogue[] = [];
  private currentDialogueIndex: number = 0;

  // 服务引用
  private characterResourceService: CharacterResourceService;
  private characterManager: CharacterManager;
  private backgroundManager: BackgroundManager;

  // 自动播放设置
  private isAutoPlaying: boolean = false;
  private autoPlayInterval: number | null = null;
  private autoPlaySpeed: number = 3000; // 毫秒

  constructor(
    characterResourceService: CharacterResourceService,
    characterManager: CharacterManager,
    backgroundManager: BackgroundManager,
  ) {
    this.characterResourceService = characterResourceService;
    this.characterManager = characterManager;
    this.backgroundManager = backgroundManager;

    // 绑定自动播放按钮
    $('#auto-play').on('click', () => {
      this.toggleAutoPlay();
    });

    // 不再需要绑定下一步按钮，改为在GameController中绑定对话框点击
    // $('.dialogue-next-button').on('click', () => {
    //   this.showNextDialogue();
    // });

    console.log('对话管理器初始化完成');
  }

  /**
   * 设置对话列表
   */
  public setDialogues(dialogues: Dialogue[]) {
    this.dialogues = dialogues;
    this.currentDialogueIndex = 0;
  }

  /**
   * 显示特定索引的对话
   */
  public showDialogue(index: number) {
    if (index < 0 || index >= this.dialogues.length) {
      console.error('无效的对话索引');
      return;
    }

    // 更新当前索引
    this.currentDialogueIndex = index;
    const dialogue = this.dialogues[index];

    // 更新发言人名称 - 直接使用speaker属性，不做处理
    const speakerName = dialogue.speaker;
    $('.speaker-name').text(speakerName);

    // 创建新对话文本元素
    const $dialogueText = $('<div>', {
      class: `dialogue-text style-${dialogue.style || 'normal'}`,
      text: dialogue.content,
    });

    // 清空并添加新内容
    $('.dialogue-content').empty().append($dialogueText);

    // 滚动到底部
    $('.dialogue-content').scrollTop($('.dialogue-content')[0].scrollHeight);

    // 更新角色立绘
    this.updateCharacterDisplay(dialogue);

    // 更新背景（如果有指定）
    this.updateBackground(dialogue);
  }

  /**
   * 更新角色立绘显示
   */
  private updateCharacterDisplay(dialogue: Dialogue) {
    // 如果对话没有指定portrait，尝试使用默认规则
    if (!dialogue.portrait) {
      // 判断角色是否在预设名单中
      const character = this.characterResourceService.getCharacter(dialogue.speaker);
      if (character) {
        // 如果是预设角色，按原有逻辑显示
        this.characterManager.updateCharactersByDialogue(dialogue.speaker, 'default');
      } else {
        // 如果不是预设角色，只显示名字，不显示立绘
        this.characterManager.hideCharacter('all');
      }
      return;
    }

    // 如果有指定portrait，使用指定的角色和表情
    const { character, emotion } = dialogue.portrait;

    // 判断这个角色在左边还是右边
    let position: 'left' | 'right' = 'right'; // 默认右侧

    // 尝试获取角色资源来确定位置
    const characterResource = this.characterResourceService.getCharacter(character);
    if (characterResource && characterResource.position) {
      position = characterResource.position as 'left' | 'right';
    }

    // 设置角色立绘
    this.characterManager.setCharacter(character, emotion, position);
  }

  /**
   * 更新背景显示
   */
  private updateBackground(dialogue: Dialogue) {
    // 如果对话指定了背景，则更新背景
    if (dialogue.background) {
      const { location, scene } = dialogue.background;
      this.backgroundManager.setBackground(location, scene);
    }
  }

  /**
   * 显示下一条对话
   */
  public showNextDialogue() {
    if (this.currentDialogueIndex < this.dialogues.length - 1) {
      this.showDialogue(this.currentDialogueIndex + 1);
      return true;
    }
    return false; // 没有更多对话了
  }

  /**
   * 显示上一条对话
   */
  public showPreviousDialogue() {
    if (this.currentDialogueIndex > 0) {
      this.showDialogue(this.currentDialogueIndex - 1);
      return true;
    }
    return false; // 已经是第一条对话
  }

  /**
   * 渲染对话内容
   * 用于初始化或重新渲染对话界面
   */
  public renderDialogue(index: number = this.currentDialogueIndex) {
    this.showDialogue(index);
  }

  /**
   * 添加新对话
   */
  public addDialogue(dialogue: Dialogue) {
    this.dialogues.push(dialogue);

    // 如果添加的是第一条对话，则显示它
    if (this.dialogues.length === 1) {
      this.renderDialogue(0);
    }
  }

  /**
   * 清空所有对话
   */
  public clearDialogues() {
    this.dialogues = [];
    this.currentDialogueIndex = 0;

    // 清空对话内容
    $('.dialogue-content').empty();
    $('.speaker-name').text('');

    // 清空角色显示
    this.characterManager.hideCharacter('all');
  }

  /**
   * 切换自动播放
   */
  public toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;

    // 获取自动播放按钮
    const $autoPlayButton = $('#auto-play');

    if (this.isAutoPlaying) {
      // 启动自动播放
      this.autoPlayInterval = window.setInterval(() => {
        const hasMoreDialogue = this.showNextDialogue();
        if (!hasMoreDialogue) {
          // 没有更多对话了，停止自动播放
          this.stopAutoPlay();
        }
      }, this.autoPlaySpeed);

      // 更新按钮样式
      $autoPlayButton.addClass('active').html('<i class="fas fa-pause"></i>');
    } else {
      // 停止自动播放
      this.stopAutoPlay();

      // 更新按钮样式
      $autoPlayButton.removeClass('active').html('<i class="fas fa-play"></i>');
    }
  }

  /**
   * 停止自动播放
   */
  private stopAutoPlay() {
    if (this.autoPlayInterval !== null) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    this.isAutoPlaying = false;

    // 更新按钮样式
    $('#auto-play').removeClass('active').html('<i class="fas fa-play"></i>');
  }

  /**
   * 设置自动播放速度
   */
  public setAutoPlaySpeed(speed: number) {
    this.autoPlaySpeed = speed;

    // 如果自动播放正在进行，重启它以应用新速度
    if (this.isAutoPlaying) {
      this.stopAutoPlay();
      this.toggleAutoPlay();
    }
  }

  /**
   * 获取当前对话
   */
  public getCurrentDialogue(): Dialogue | null {
    if (this.currentDialogueIndex >= 0 && this.currentDialogueIndex < this.dialogues.length) {
      return this.dialogues[this.currentDialogueIndex];
    }
    return null;
  }

  /**
   * 获取所有对话
   */
  public getAllDialogues(): Dialogue[] {
    return _.cloneDeep(this.dialogues);
  }

  /**
   * 显示对话历史记录
   * @param externalDialogues 可选的外部对话历史数据
   */
  public showDialogueHistory(externalDialogues?: DialogueHistoryItem[]) {
    // 保存当前索引
    const currentIndex = this.currentDialogueIndex;

    // 显示所有对话
    const $dialogueContent = $('.dialogue-content');
    $dialogueContent.empty();

    // 决定使用哪个对话历史数据源
    const dialoguesToShow = externalDialogues || this.dialogues;

    // 使用lodash遍历对话
    _.forEach(dialoguesToShow, (dialogue, index) => {
      // 创建对话项容器
      const $dialogueItem = $('<div>', {
        class: 'dialogue-history-item',
        'data-index': index,
      });

      // 创建发言人元素
      const $speakerName = $('<div>', {
        class: 'speaker-name-history',
        text: dialogue.speaker,
      });

      // 创建对话内容元素
      const $dialogueText = $('<div>', {
        class: `dialogue-text-history style-${dialogue.style || 'normal'}`,
        text: dialogue.content,
      });

      // 添加到容器
      $dialogueItem.append($speakerName).append($dialogueText);

      // 添加到对话内容区域
      $dialogueContent.append($dialogueItem);
    });

    // 显示历史记录模式通知
    $('#dialogue-history-notice').show();

    // 添加"返回"按钮
    const $returnButton = $('<button>', {
      id: 'return-from-history',
      class: 'btn btn-primary',
      text: '返回对话',
      click: () => {
        // 隐藏通知
        $('#dialogue-history-notice').hide();
        // 移除历史记录样式
        $dialogueContent.removeClass('history-mode');
        // 渲染当前对话
        this.renderDialogue(currentIndex);
      },
    });

    // 添加返回按钮
    $dialogueContent.append($returnButton);

    // 添加历史记录样式
    $dialogueContent.addClass('history-mode');
  }

  /**
   * 获取当前对话索引
   */
  public getCurrentDialogueIndex(): number {
    return this.currentDialogueIndex;
  }

  /**
   * 对话是否已结束
   */
  public isDialogueFinished(): boolean {
    return this.currentDialogueIndex >= this.dialogues.length - 1;
  }
}
