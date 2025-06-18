/**
 * 角色管理器组件
 * 负责管理游戏中的角色立绘显示
 */

import { CharacterResource, CharacterResourceService, EmotionType } from '../../services/character-resource.service';

export class CharacterManager {
  // 角色资源服务
  private characterResourceService: CharacterResourceService;

  // 当前显示的角色
  private currentCharacters: {
    left?: { id: string; emotion: EmotionType };
    right?: { id: string; emotion: EmotionType };
  } = {};

  constructor(characterResourceService: CharacterResourceService) {
    this.characterResourceService = characterResourceService;
    console.log('角色管理器初始化完成');
  }

  /**
   * 设置角色立绘
   * @param characterId 角色ID
   * @param emotion 表情差分
   * @param position 位置 ('left' 或 'right')
   */
  public setCharacter(characterId: string, emotion: EmotionType = 'default', position: 'left' | 'right') {
    const $element = $(`.character-${position}`);

    if ($element.length === 0) {
      console.error(`未找到${position}侧角色容器元素`);
      return;
    }

    // 获取角色资源
    const character = this.characterResourceService.getCharacter(characterId);

    if (!character) {
      console.error(`未找到ID为${characterId}的角色资源`);
      this.hideCharacter(position);
      return;
    }

    // 获取对应表情的立绘URL
    const imageUrl = this.characterResourceService.getCharacterEmotionUrl(characterId, emotion);

    if (!imageUrl) {
      console.error(`角色${characterId}没有${emotion}表情差分`);
      // 尝试使用默认表情
      const defaultImageUrl = this.characterResourceService.getCharacterEmotionUrl(characterId);
      if (!defaultImageUrl) {
        this.hideCharacter(position);
        return;
      }
      // 使用默认表情
      this.setCharacterImage($element, character, defaultImageUrl, position, 'default');
    } else {
      // 使用指定表情
      this.setCharacterImage($element, character, imageUrl, position, emotion);
    }
  }

  /**
   * 设置角色图像
   */
  private setCharacterImage(
    $element: JQuery,
    character: CharacterResource,
    imageUrl: string,
    position: 'left' | 'right',
    emotion: EmotionType,
  ) {
    // 设置角色立绘
    $element
      .css({
        backgroundImage: `url('${imageUrl}')`,
        opacity: 1,
      })
      .data({
        characterId: character.id,
        characterName: character.name,
      });

    // 存储当前显示的角色
    this.currentCharacters[position] = {
      id: character.id,
      emotion: emotion,
    };

    console.log(`已设置${character.name}的${emotion}表情立绘在${position}侧`);
  }

  /**
   * 更新角色表情
   * @param characterId 角色ID
   * @param emotion 表情差分
   */
  public updateEmotion(characterId: string, emotion: EmotionType = 'default') {
    // 查找角色当前在哪一侧
    let position: 'left' | 'right' | null = null;

    if (this.currentCharacters.left?.id === characterId) {
      position = 'left';
    } else if (this.currentCharacters.right?.id === characterId) {
      position = 'right';
    }

    if (!position) {
      console.warn(`未找到ID为${characterId}的角色在场景中`);
      return;
    }

    // 更新表情
    this.setCharacter(characterId, emotion, position);
  }

  /**
   * 隐藏角色立绘
   * @param position 位置 ('left', 'right' 或 'all')
   */
  public hideCharacter(position: 'left' | 'right' | 'all') {
    if (position === 'left' || position === 'all') {
      $('.character-left').css({
        backgroundImage: 'none',
        opacity: 0,
      });
      delete this.currentCharacters.left;
    }

    if (position === 'right' || position === 'all') {
      $('.character-right').css({
        backgroundImage: 'none',
        opacity: 0,
      });
      delete this.currentCharacters.right;
    }
  }

  /**
   * 设置角色立绘特效
   * @param position 位置 ('left' 或 'right')
   * @param effect 特效名称 ('shake', 'focus', 'blur', 等)
   */
  public setCharacterEffect(position: 'left' | 'right', effect: string) {
    const $element = $(`.character-${position}`);

    if ($element.length === 0) {
      console.error(`未找到${position}侧角色容器元素`);
      return;
    }

    // 移除所有效果类
    $element.removeClass('effect-shake effect-focus effect-blur');

    // 添加指定效果类
    if (effect) {
      $element.addClass(`effect-${effect}`);

      // 使用jQuery UI的效果
      switch (effect) {
        case 'shake':
          $element.effect('shake', { times: 3, distance: 5 }, 500);
          break;
        case 'focus':
          $('.characters-container .character').not($element).animate({ opacity: 0.5 }, 500);
          $element.animate({ opacity: 1 }, 500);
          break;
        case 'blur':
          $element.fadeOut(250).fadeIn(250);
          break;
      }
    }
  }

  /**
   * 交换角色立绘位置
   */
  public swapCharacters() {
    const $leftChar = $('.character-left');
    const $rightChar = $('.character-right');

    if ($leftChar.length === 0 || $rightChar.length === 0) return;

    // 保存当前角色状态
    const leftChar = this.currentCharacters.left;
    const rightChar = this.currentCharacters.right;

    // 如果两边都有角色，交换它们
    if (leftChar && rightChar) {
      this.setCharacter(rightChar.id, rightChar.emotion, 'left');
      this.setCharacter(leftChar.id, leftChar.emotion, 'right');

      // 添加过渡动画
      $leftChar.add($rightChar).css('transition', 'all 0.5s ease-in-out');
    }
  }

  /**
   * 根据对话更新角色显示
   * @param speakerId 发言角色ID
   * @param emotion 表情差分
   */
  public updateCharactersByDialogue(speakerId: string, emotion: EmotionType = 'default') {
    // 如果是旁白，不更新角色
    if (speakerId === 'narrator') return;

    // 获取角色资源
    const character = this.characterResourceService.getCharacter(speakerId);
    if (!character) {
      // 对于未预定义的角色，不执行立绘更新
      console.log(`未找到ID为${speakerId}的角色资源，跳过立绘更新`);
      return;
    }

    // 检查角色是否已在场景中
    let position: 'left' | 'right' = 'right'; // 默认位置

    if (this.currentCharacters.left?.id === speakerId) {
      position = 'left';
    } else if (this.currentCharacters.right?.id === speakerId) {
      position = 'right';
    } else {
      // 如果角色不在场景中，根据角色预设位置添加
      if (character.position === 'left' || character.position === 'right') {
        position = character.position;
      }

      // 添加角色到场景
      this.setCharacter(speakerId, emotion, position);
      return;
    }

    // 更新已在场景中的角色表情
    this.updateEmotion(speakerId, emotion);
  }
}
