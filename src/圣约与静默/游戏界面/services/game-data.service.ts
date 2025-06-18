/**
 * 游戏数据服务
 * 负责加载和管理游戏数据
 */
import { DialogueStyle, GameData } from '../scripts/models/gameData';

export class GameDataService {
  // 游戏默认数据
  private defaultGameData: GameData = {
    story: {
      date: '1243年 夏',
      location: '修道院',
      scene: '图书室',
      dialogue: [
        {
          speaker: 'Cecilia修女',
          content: '欢迎来到修道院，这里是我们的图书室。',
          style: 'normal' as DialogueStyle,
          portrait: {
            character: 'cecilia',
            emotion: 'smile',
          },
          background: {
            location: '修道院',
            scene: '图书室',
          },
        },
        {
          speaker: '玩家',
          content: '谢谢你的接待，这里的藏书真是令人惊叹。',
          style: 'normal' as DialogueStyle,
          portrait: {
            character: 'player',
            emotion: 'default',
          },
        },
        {
          speaker: '旁白',
          content: 'Cecilia修女微笑着拿起一本古老的书籍。',
          style: 'special' as DialogueStyle,
        },
        {
          speaker: 'Cecilia修女',
          content: '这本是我们修道院最珍贵的草药学手稿，记载了很多珍贵的药方。',
          style: 'normal' as DialogueStyle,
          portrait: {
            character: 'cecilia',
            emotion: 'thoughtful',
          },
        },
        {
          speaker: '图书管理员',
          content: '午餐时间到了，请各位移步餐厅。',
          style: 'normal' as DialogueStyle,
          // 这是一个未预定义的角色，只显示名字，不显示立绘
        },
        {
          speaker: 'Cecilia修女',
          content: '不如我们去花园里继续聊吧？',
          style: 'normal' as DialogueStyle,
          portrait: {
            character: 'cecilia',
            emotion: 'smile',
          },
          background: {
            location: '修道院',
            scene: '花园',
          },
        },
      ],
      options: ['好的，我很乐意。', '我想先了解更多关于那本草药手稿的内容。', '我需要先休息一下，稍后再聊。'],
      currentDialogueIndex: 0,
      currentChapter: '第一章：修道院的秘密',
      currentFunds: 50,
    },
    storySummary: [
      {
        id: 1,
        content: '玩家来到修道院，与Cecilia修女在图书室相遇，得知了一本珍贵的草药学手稿。',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  constructor() {
    console.log('游戏数据服务已初始化');
  }

  /**
   * 加载游戏数据
   * @returns 游戏数据
   */
  public async loadGameData(): Promise<GameData> {
    // 在实际应用中，这里可能会从文件或API加载数据
    // 现在我们使用默认数据
    return this.defaultGameData;
  }

  /**
   * 保存游戏数据
   * @param gameData 游戏数据
   */
  public async saveGameData(gameData: GameData): Promise<void> {
    // 在实际应用中，这里可能会保存数据到文件或API
    console.log('游戏数据已保存');
  }
}
