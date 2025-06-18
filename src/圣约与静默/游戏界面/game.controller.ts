/**
 * 游戏控制器
 * 负责协调各个服务和组件，管理游戏的整体流程
 */
import { BackgroundManager } from './scripts/components/backgroundManager';
import { CharacterManager } from './scripts/components/characterManager';
import { ChoiceManager } from './scripts/components/choiceManager';
import { DialogueManager } from './scripts/components/dialogueManager';
import { JournalManager } from './scripts/components/journalManager';
import { MemoryManager } from './scripts/components/memoryManager';
import { MemoryUIManager } from './scripts/components/memoryUIManager';
import { SaveManager } from './scripts/components/saveManager';
import { SettingsManager } from './scripts/components/settingsManager';
import { UIManager } from './scripts/components/uiManager';
import { GameData } from './scripts/models/gameData';
import { CharacterResourceService } from './services/character-resource.service';
import { GameDataService } from './services/game-data.service';
import { GameStateGenerationService } from './services/game-state-generation.service';

export class GameController {
  // 游戏状态数据
  private gameData: GameData | null = null;

  // 服务
  private gameDataService: GameDataService;
  private gameStateGenerationService: GameStateGenerationService;
  private characterResourceService: CharacterResourceService;

  // 组件管理器
  private dialogueManager: DialogueManager;
  private characterManager: CharacterManager;
  private backgroundManager: BackgroundManager;
  private choiceManager: ChoiceManager;
  private memoryManager: MemoryManager;
  private memoryUIManager: MemoryUIManager;
  private uiManager: UIManager;
  private saveManager: SaveManager;
  private journalManager: JournalManager;
  private settingsManager: SettingsManager;

  constructor() {
    // 初始化服务
    this.gameDataService = new GameDataService();
    this.gameStateGenerationService = new GameStateGenerationService();
    this.characterResourceService = new CharacterResourceService();

    // 初始化各个管理器
    this.uiManager = new UIManager();
    this.saveManager = new SaveManager(this.uiManager);
    this.backgroundManager = new BackgroundManager();
    this.characterManager = new CharacterManager(this.characterResourceService);
    this.dialogueManager = new DialogueManager(
      this.characterResourceService,
      this.characterManager,
      this.backgroundManager,
    );
    this.choiceManager = new ChoiceManager();
    this.memoryManager = new MemoryManager();

    // 初始化新分离的管理器
    this.journalManager = new JournalManager();
    this.memoryUIManager = new MemoryUIManager(
      this.memoryManager,
      this.saveManager,
      this.uiManager,
      this.gameStateGenerationService,
    );

    // 初始化设置管理器
    this.settingsManager = new SettingsManager();

    // 初始化调试辅助功能
    this.gameStateGenerationService.initDebugHelpers();
    console.log('调试辅助功能已初始化，请在控制台使用 window.debugLLMResponse() 查看最近一次LLM响应');

    // 初始化游戏
    this.init();
  }

  /**
   * 初始化游戏
   */
  private async init() {
    console.log('初始化游戏界面...');

    // 注册事件监听器
    this.registerEventListeners();

    // 尝试获取游戏数据
    await this.loadGameData();

    // 更新UI
    this.updateUI();

    // 添加调试功能
    this.initDebugFunctions();

    console.log('游戏界面初始化完成!');
  }

  /**
   * 初始化调试功能
   */
  private initDebugFunctions() {
    // 添加调试确认对话框的全局函数
    (window as any).testConfirmDialog = () => {
      console.log('测试确认对话框');

      // 创建一个计数变量
      if (!(window as any).confirmTestCount) {
        (window as any).confirmTestCount = 0;
      }

      // 增加计数
      (window as any).confirmTestCount++;

      // 显示带计数的确认对话框
      this.uiManager.showConfirmDialog(
        `这是一个测试确认对话框 #${
          (window as any).confirmTestCount
        }，用于检查位置和点击功能。请点击"确认"按钮测试是否可点击。`,
        () => {
          console.log('确认对话框被确认');
          this.uiManager.showNotification(`确认对话框 #${(window as any).confirmTestCount} 测试成功!`, 'success');
        },
      );
    };

    console.log('调试功能已初始化，可在控制台使用 window.testConfirmDialog() 测试确认对话框');
  }

  /**
   * 注册事件监听器
   */
  private registerEventListeners() {
    // 标签切换按钮
    $('.tab-button').on('click', e => {
      const tabId = $(e.currentTarget).data('tab');
      if (tabId) {
        this.switchTab(tabId);
      }
    });

    // 日记标签内的导航按钮
    $('.journal-nav-item').on('click', e => {
      const sectionId = $(e.currentTarget).data('section');
      if (sectionId) {
        this.journalManager.switchJournalSection(sectionId);
      }
    });

    // 保存游戏按钮 - 使用右上角的按钮
    $('#save-game').on('click', () => {
      this.saveGame();
    });

    // 加载游戏按钮 - 使用右上角的按钮
    $('#load-game').on('click', () => {
      this.loadGame();
    });

    // 设置按钮
    $('#settings-button').on('click', () => {
      this.showSettings();
    });

    // 保存记忆按钮
    $('#save-memory').on('click', () => {
      const newMemory = this.memoryUIManager.saveMemory();
      if (newMemory && this.gameData) {
        // 更新游戏数据
        this.gameData.storySummary.push(newMemory);
      }
    });

    // 穿越记忆按钮
    $('#travel-memory').on('click', () => {
      this.memoryUIManager.travelToMemory(() => {
        // 成功穿越后的回调
        this.gameData = this.memoryUIManager.getGameData();
        this.updateUI();
        this.switchTab('story-tab');
      });
    });

    // 历史记录按钮
    $('#dialogue-history').on('click', () => {
      this.showDialogueHistory();
    });

    // 选择按钮
    $(document).on('click', '.choice-button', e => {
      const choice = $(e.currentTarget).data('choice');
      this.makeChoice(choice);
    });

    // 获取游戏数据事件
    window.addEventListener('request_game_data', event => {
      if (event.detail && typeof event.detail.callback === 'function') {
        // 确保返回的游戏数据包含所有必要属性
        const currentGameData: GameData = {
          story: this.gameData?.story || {
            date: '未知日期',
            location: '未知位置',
            scene: '未知场景',
            dialogue: [],
            options: [],
            currentDialogueIndex: 0,
            currentChapter: '第1章',
            currentFunds: 0,
          },
          storySummary: this.gameData?.storySummary || [],
        };

        // 返回当前游戏数据的副本
        event.detail.callback(currentGameData);
      }
    });

    // 游戏加载完成事件
    window.addEventListener('gameloaded', event => {
      if (event.detail && event.detail.gameData) {
        // 更新游戏数据
        this.gameData = event.detail.gameData;

        // 重新渲染游戏状态
        this.updateUI();
        this.switchTab('story-tab');

        // 显示成功加载的通知
        this.uiManager.showNotification('游戏已加载', 'success');
      }
    });

    // 对话框点击事件 - 点击对话框进入下一步或重新显示选项
    $('#dialogue-container').on('click', e => {
      // 防止点击对话控制按钮时触发下一步
      if (!$(e.target).closest('.dialogue-controls').length) {
        // 检查是否可以重新显示选项
        if (this.choiceManager.canReshowChoices()) {
          this.choiceManager.reshowChoices();
        } else {
          this.nextDialogue();
        }
      }
    });

    // 选项选择回调
    this.choiceManager.setOnChoiceSelected(choice => {
      this.makeChoice(choice);
    });
  }

  /**
   * 加载游戏数据
   */
  private async loadGameData() {
    try {
      this.gameData = await this.gameDataService.loadGameData();

      // 更新各管理器的游戏数据
      this.journalManager.setGameData(this.gameData);
      this.memoryUIManager.setGameData(this.gameData);
    } catch (error) {
      console.error('加载游戏数据失败:', error);
    }
  }

  /**
   * 切换标签页
   */
  private switchTab(tabId: string) {
    // 移除所有标签按钮的激活状态
    $('.tab-button').removeClass('active');

    // 移除所有标签内容的激活状态
    $('.tab-pane').removeClass('active');

    // 激活选中的标签按钮和内容
    $(`[data-tab="${tabId}"]`).addClass('active');
    $(`#${tabId}`).addClass('active');

    // 如果是记忆标签，刷新记忆时间轴
    if (tabId === 'memory-tab') {
      this.memoryUIManager.refreshMemoryTimeline();
    }

    // 如果是日记标签，刷新角色信息
    if (tabId === 'journal-tab') {
      this.journalManager.refreshJournalContent();
    }
  }

  /**
   * 显示对话历史记录
   */
  private async showDialogueHistory() {
    // 尝试从世界书获取对话历史
    const dialogueHistory = await this.saveManager.getDialogueHistory();
    if (dialogueHistory) {
      this.dialogueManager.showDialogueHistory(dialogueHistory);
    }
  }

  /**
   * 显示设置
   */
  private showSettings() {
    console.log('显示设置');
    this.settingsManager.showSettingsDialog();
  }

  /**
   * 保存游戏
   */
  private saveGame() {
    console.log('保存游戏...');
    // 显示确认对话框
    this.uiManager.showInputDialog('请输入典籍标题', '当前进度记录', async saveName => {
      try {
        this.uiManager.showLoading('正在记录典籍...');
        // 调用存档管理器保存游戏
        const success = await this.saveManager.saveGameState(this.gameData!, true, saveName);
        if (success) {
          this.uiManager.showNotification('典籍记录成功', 'success');
        }
      } catch (error) {
        console.error('保存游戏失败:', error);
        this.uiManager.showNotification('典籍记录失败', 'error');
      } finally {
        this.uiManager.hideLoading();
      }
    });
  }

  /**
   * 加载游戏
   */
  private loadGame() {
    console.log('加载游戏...');
    // 显示存档列表
    this.saveManager.loadGame();
  }

  /**
   * 更新UI
   */
  private updateUI() {
    if (!this.gameData) {
      console.error('无法更新UI：游戏数据不存在');
      return;
    }

    try {
      // 更新顶部日期
      $('#game-date').text(this.gameData.story.date);

      // 设置对话
      this.dialogueManager.setDialogues(this.gameData.story.dialogue);
      this.dialogueManager.renderDialogue(this.gameData.story.currentDialogueIndex);

      // 设置背景
      this.backgroundManager.setBackground(this.gameData.story.location, this.gameData.story.scene);

      // 设置选项
      this.choiceManager.setChoices(this.gameData.story.options);

      // 更新内存UI（如果记忆标签是活跃的）
      if ($('#memory-tab').hasClass('active')) {
        this.memoryUIManager.refreshMemoryTimeline();
      }

      // 更新日记（如果日记标签是活跃的）
      if ($('#journal-tab').hasClass('active')) {
        this.journalManager.refreshJournalContent();
      }

      console.log('UI已更新');
    } catch (error) {
      console.error('更新UI时发生错误:', error);
    }
  }

  /**
   * 显示下一条对话
   */
  private nextDialogue() {
    if (!this.gameData) return;

    // 尝试显示下一条对话
    const hasMoreDialogue = this.dialogueManager.showNextDialogue();

    if (hasMoreDialogue) {
      // 更新游戏数据中的当前对话索引
      this.gameData.story.currentDialogueIndex = this.dialogueManager.getCurrentDialogueIndex();
    } else if (this.gameData.story.options.length > 0) {
      // 新增：检查是否是最后一条对话，且已经显示了选项
      const isDialogueFinished = this.dialogueManager.isDialogueFinished();
      const isChoicesAlreadyShown = this.choiceManager.areChoicesVisible();

      // 只有在对话已结束且选项还没显示的情况下才显示选项
      if (isDialogueFinished && !isChoicesAlreadyShown) {
        console.log('对话已结束，显示选项');
        this.choiceManager.showChoices();
      } else if (isChoicesAlreadyShown) {
        console.log('选项已显示，不再重复显示');
      }
    } else {
      // 没有更多对话也没有选项，可以添加额外逻辑
      console.log('对话结束，且没有可用选项');
    }
  }

  /**
   * 选择选项
   */
  private async makeChoice(choice: string) {
    if (!this.gameData) return;

    console.log(`玩家选择了: ${choice}`);

    // 判断是否为自定义行动（不在预定义选项列表中）
    const isCustomAction = !this.gameData.story.options.includes(choice);

    // 隐藏选项
    this.choiceManager.hideChoices();

    // 显示加载提示
    this.uiManager.showLoading('正在生成回应...');

    // 保存玩家选择前的状态，以便出错时恢复
    const previousDialogueLength = this.gameData.story.dialogue.length;
    const previousDialogueIndex = this.gameData.story.currentDialogueIndex;

    // 添加玩家选择到对话
    const playerChoice = {
      speaker: '玩家',
      content: choice,
      style: 'normal' as const,
      // 不设置portrait，使用默认规则
    };

    this.gameData.story.dialogue.push(playerChoice);
    this.dialogueManager.setDialogues(this.gameData.story.dialogue);
    this.gameData.story.currentDialogueIndex = this.gameData.story.dialogue.length - 1;
    this.dialogueManager.showDialogue(this.gameData.story.currentDialogueIndex);

    try {
      // 根据是否是自定义行动调用不同的处理方法
      const newGameState = isCustomAction
        ? await this.gameStateGenerationService.handleCustomAction(choice)
        : await this.gameStateGenerationService.generateNextGameState(choice);

      if (newGameState) {
        // 更新游戏状态
        this.gameData = newGameState;

        // 更新UI
        this.updateUI();

        // 保存到世界书
        await this.saveManager.saveGameState(this.gameData);
      } else {
        // 生成失败，恢复到玩家选择前的状态
        if (this.gameData) {
          // 移除玩家选择
          this.gameData.story.dialogue = this.gameData.story.dialogue.slice(0, previousDialogueLength);
          this.gameData.story.currentDialogueIndex = previousDialogueIndex;

          // 更新对话显示
          this.dialogueManager.setDialogues(this.gameData.story.dialogue);
          this.dialogueManager.showDialogue(this.gameData.story.currentDialogueIndex);

          // 重新显示选项
          this.choiceManager.showChoices();

          this.uiManager.showNotification('生成游戏状态失败，请重新选择', 'warning');
        }
      }
    } catch (error) {
      console.error('处理玩家选择时出错:', error);

      // 出错时恢复到玩家选择前的状态
      if (this.gameData) {
        // 移除玩家选择
        this.gameData.story.dialogue = this.gameData.story.dialogue.slice(0, previousDialogueLength);
        this.gameData.story.currentDialogueIndex = previousDialogueIndex;

        // 更新对话显示
        this.dialogueManager.setDialogues(this.gameData.story.dialogue);
        this.dialogueManager.showDialogue(this.gameData.story.currentDialogueIndex);

        // 重新显示选项
        this.choiceManager.showChoices();

        this.uiManager.showNotification('生成响应时出错，请重新选择', 'error');
      }
    } finally {
      // 隐藏加载提示
      this.uiManager.hideLoading();
    }
  }
}
