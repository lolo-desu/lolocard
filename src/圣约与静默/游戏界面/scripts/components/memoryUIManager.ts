/**
 * 记忆UI管理器
 * 负责处理游戏中的记忆功能UI部分
 */

import { GameData } from '../models/gameData';
import { MemoryManager } from './memoryManager';
import { SaveManager } from './saveManager';
import { UIManager } from './uiManager';
import { GameStateGenerationService } from '../../services/game-state-generation.service';

export class MemoryUIManager {
  // 游戏数据引用
  private gameData: GameData | null = null;
  
  // 依赖的其他管理器
  private memoryManager: MemoryManager;
  private saveManager: SaveManager;
  private uiManager: UIManager;
  private gameStateGenerationService: GameStateGenerationService;

  constructor(
    memoryManager: MemoryManager, 
    saveManager: SaveManager, 
    uiManager: UIManager,
    gameStateGenerationService: GameStateGenerationService
  ) {
    this.memoryManager = memoryManager;
    this.saveManager = saveManager;
    this.uiManager = uiManager;
    this.gameStateGenerationService = gameStateGenerationService;
    
    console.log('记忆UI管理器初始化完成');
  }

  /**
   * 设置游戏数据
   * @param gameData 游戏数据
   */
  public setGameData(gameData: GameData | null) {
    this.gameData = gameData;
  }

  /**
   * 刷新记忆时间轴
   */
  public refreshMemoryTimeline() {
    if (!this.gameData) return;

    this.memoryManager.setMemories(this.gameData.storySummary);
    this.memoryManager.renderMemories();
  }

  /**
   * 保存记忆
   * @returns 新创建的记忆点
   */
  public saveMemory(): any {
    if (!this.gameData) return null;

    const newMemory = this.memoryManager.addMemory(
      `${this.gameData.story.currentChapter} - 在${this.gameData.story.location}`,
      // 可以考虑保存当前场景的截图
    );

    // 提示用户
    this.uiManager.showNotification('记忆点已保存', 'success');
    
    return newMemory;
  }

  /**
   * 穿越到记忆点
   * @param onSuccess 成功穿越后的回调函数
   */
  public async travelToMemory(onSuccess: () => void) {
    const selectedMemory = this.memoryManager.getSelectedMemory();
    if (!selectedMemory) {
      this.uiManager.showNotification('请先选择一个记忆点', 'warning');
      return;
    }

    // 显示确认对话框
    this.uiManager.showConfirmDialog(`确定要穿越到"${selectedMemory.content}"吗？`, async () => {
      this.uiManager.showLoading('正在穿越时间...');

      try {
        let newState: GameData | null = null;
        
        // 先尝试从世界书中加载游戏状态
        const loadedState = await this.saveManager.loadGameStateByID(selectedMemory.id);

        if (loadedState) {
          // 如果成功加载到，更新游戏状态
          newState = loadedState;
          console.log('从世界书中加载了游戏状态');
        } else {
          // 如果没有找到保存的状态，使用记忆点生成服务生成
          const generatedState = await this.gameStateGenerationService.generateMemoryState(selectedMemory);

          if (generatedState) {
            newState = generatedState;
            console.log('生成了新的记忆点游戏状态');
          } else {
            throw new Error('无法生成记忆点游戏状态');
          }
        }
        
        // 设置新的游戏状态
        this.gameData = newState;
        
        // 调用成功回调
        onSuccess();

        this.uiManager.showNotification('时间旅行成功', 'success');
      } catch (error) {
        console.error('穿越时间失败:', error);
        this.uiManager.showNotification('穿越失败: ' + (error instanceof Error ? error.message : '未知错误'), 'error');
      } finally {
        this.uiManager.hideLoading();
      }
    });
  }
  
  /**
   * 获取当前游戏数据
   */
  public getGameData(): GameData | null {
    return this.gameData;
  }
} 