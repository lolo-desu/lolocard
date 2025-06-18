/**
 * 角色资源服务
 * 负责管理角色数据和立绘资源
 */

/**
 * 角色表情差分类型
 */
export type EmotionType = 'default' | 'smile' | 'sad' | 'angry' | 'shocked' | 'blush' | 'thoughtful';

/**
 * 角色资源数据接口
 */
export interface CharacterResource {
  id: string; // 角色唯一ID
  name: string; // 角色显示名称
  fullName: string; // 角色全名
  position: 'left' | 'right' | 'center'; // 立绘显示位置
  emotions: {
    [key in EmotionType]?: string; // 表情差分对应的图片URL
  };
  bio?: string; // 角色简介（可选）
}

export class CharacterResourceService {
  // 角色资源映射表
  private characters: Map<string, CharacterResource> = new Map();

  constructor() {
    console.log('角色资源服务已初始化');
    // 初始化角色数据
    this.initializeCharacters();
  }

  /**
   * 初始化角色数据
   */
  private initializeCharacters(): void {
    // 修女Cecilia
    this.characters.set('cecilia', {
      id: 'cecilia',
      name: 'Cecilia修女',
      fullName: 'Sister Cecilia',
      position: 'right',
      emotions: {
        default:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%BE%AE%E7%AC%91.png?ref_type=heads',
        smile:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%BE%AE%E7%AC%91.png?ref_type=heads',
        sad: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%93%AD%E6%B3%A3.png?ref_type=heads',
        shocked:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E6%83%8A%E8%AE%B6.png?ref_type=heads',
        blush:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%AE%B3%E7%BE%9E.png?ref_type=heads',
      },
      bio: '一位年轻的见习修女，专注于抄写工作，对草药学有浓厚兴趣。',
    });

    // 玩家角色
    this.characters.set('player', {
      id: 'player',
      name: '{{user}}',
      fullName: 'The Visitor',
      position: 'left',
      emotions: {
        default:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E9%BB%98%E8%AE%A4.png?ref_type=heads',
        smile:
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%BE%AE%E7%AC%91.png?ref_type=heads',
        sad: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%93%AD%E6%B3%A3.png?ref_type=heads',
      },
      bio: '一位到访修道院的神秘人物，对修道院的历史和草药学表示了浓厚兴趣。',
    });

    // 可以根据需要添加更多角色...
  }

  /**
   * 获取角色资源
   * @param characterId 角色ID
   * @returns 角色资源对象，不存在时返回undefined
   */
  public getCharacter(characterId: string): CharacterResource | undefined {
    return this.characters.get(characterId);
  }

  /**
   * 获取所有角色ID列表
   * @returns 角色ID数组
   */
  public getAllCharacterIds(): string[] {
    return Array.from(this.characters.keys());
  }

  /**
   * 获取角色表情图片URL
   * @param characterId 角色ID
   * @param emotion 表情类型，默认为'default'
   * @returns 表情图片URL，角色或表情不存在时返回undefined
   */
  public getCharacterEmotionUrl(characterId: string, emotion: EmotionType = 'default'): string | undefined {
    const character = this.characters.get(characterId);
    if (!character) return undefined;

    // 如果请求的表情不存在，返回默认表情
    return character.emotions[emotion] || character.emotions.default;
  }

  /**
   * 获取角色名称
   * @param characterId 角色ID
   * @returns 角色名称，不存在时返回"未知角色"
   */
  public getCharacterName(characterId: string): string {
    const character = this.characters.get(characterId);
    return character ? character.name : '未知角色';
  }

  /**
   * 添加一个新角色
   * @param character 角色资源对象
   * @returns 是否添加成功
   */
  public addCharacter(character: CharacterResource): boolean {
    if (this.characters.has(character.id)) {
      console.warn(`角色ID: ${character.id} 已存在，无法添加`);
      return false;
    }

    this.characters.set(character.id, character);
    return true;
  }

  /**
   * 更新角色信息
   * @param characterId 角色ID
   * @param updates 更新的字段
   * @returns 是否更新成功
   */
  public updateCharacter(characterId: string, updates: Partial<CharacterResource>): boolean {
    const character = this.characters.get(characterId);
    if (!character) {
      console.warn(`角色ID: ${characterId} 不存在，无法更新`);
      return false;
    }

    // 使用lodash合并对象
    const updatedCharacter = _.merge({}, character, updates);
    this.characters.set(characterId, updatedCharacter);

    return true;
  }
}
