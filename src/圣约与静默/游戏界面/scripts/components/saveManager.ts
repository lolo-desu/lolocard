/**
 * 存档管理器组件
 * 负责游戏存档和读取功能
 */
import { GameData } from '../models/gameData';
import { DialogueHistoryItem } from './dialogueManager';
import { UIManager } from './uiManager';

// 声明jQuery的modal方法
declare global {
  interface JQuery {
    modal(action?: string): JQuery;
  }
}

// 定义完整历史记录接口
export interface CompleteHistoryRecord {
  id: string; // 唯一标识符
  dialogues: Array<{
    speaker: string;
    content: string;
    style?: string;
  }>;
  memories: Array<{
    id: number;
    content: string;
  }>;
}

export class SaveManager {
  private uiManager: UIManager;
  private worldBookName: string = '修女的追忆记录'; // 使用固定名称
  private modalId: string = 'load-game-modal';
  // 对话历史记录键名
  private DIALOGUE_HISTORY_KEY: string = 'persistent_dialogue_history';
  // 完整历史记录键名
  private COMPLETE_HISTORY_KEY: string = 'complete_game_history';
  // 存档类型
  private SAVE_TYPE = {
    AUTO: 'auto_save_',
    MANUAL: 'save_',
  };
  // 当前最大存档ID
  private currentMaxSaveId = {
    auto: 0,
    manual: 0,
  };
  // 缓存完整历史记录
  private cachedCompleteHistory: CompleteHistoryRecord | null = null;

  constructor(uiManager: UIManager) {
    this.uiManager = uiManager;
    this.initializeLoadGameModal();
    this.initializeChatLorebook();

    // 确保jQuery和Bootstrap正确加载
    this.ensureBootstrapLoaded();

    // 初始化时加载历史记录
    this.loadCompleteHistory();
  }

  /**
   * 确保Bootstrap正确加载
   */
  private ensureBootstrapLoaded(): void {
    // 检查jQuery是否已加载
    if (typeof $ === 'undefined') {
      console.error('jQuery未加载，这可能导致modal功能失效');
      return;
    }

    // 检查Bootstrap的modal功能是否可用
    if (typeof $.fn.modal !== 'function') {
      console.warn('Bootstrap modal未检测到，尝试加载');

      // 尝试动态添加Bootstrap的CSS和JS
      if (!document.getElementById('bootstrap-css')) {
        const bootstrapCss = document.createElement('link');
        bootstrapCss.id = 'bootstrap-css';
        bootstrapCss.rel = 'stylesheet';
        bootstrapCss.href = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrapCss);
      }

      if (!document.getElementById('bootstrap-js')) {
        const bootstrapJs = document.createElement('script');
        bootstrapJs.id = 'bootstrap-js';
        bootstrapJs.src = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js';
        bootstrapJs.onload = () => {
          console.log('Bootstrap已成功加载');
          // 重新初始化modal
          this.initializeLoadGameModal();
        };
        document.body.appendChild(bootstrapJs);
      }
    }
  }

  /**
   * 初始化聊天世界书
   */
  private async initializeChatLorebook(): Promise<void> {
    try {
      console.log(`正在初始化固定世界书: ${this.worldBookName}`);

      // 检查API可用性
      if (typeof window.getLorebooks !== 'function' || typeof window.createLorebook !== 'function') {
        console.error('世界书API不可用，无法初始化聊天世界书');
        return;
      }

      // 获取所有世界书
      const lorebooks = await window.getLorebooks();

      // 检查我们的固定世界书是否存在
      const worldBookExists = lorebooks.includes(this.worldBookName);

      if (!worldBookExists) {
        // 创建新的世界书
        console.log(`创建新的固定世界书: ${this.worldBookName}`);
        await window.createLorebook(this.worldBookName);

        // 设置为当前聊天的世界书
        if (typeof window.setChatLorebook === 'function') {
          await window.setChatLorebook(this.worldBookName);
        }
      } else {
        console.log(`找到现有的固定世界书: ${this.worldBookName}`);

        // 确保设置为当前聊天的世界书
        if (typeof window.setChatLorebook === 'function') {
          await window.setChatLorebook(this.worldBookName);
        }
      }

      // 初始化当前最大存档ID
      await this.initializeMaxSaveIds();
    } catch (error) {
      console.error('初始化聊天世界书失败:', error);
    }
  }

  /**
   * 初始化最大存档ID
   */
  private async initializeMaxSaveIds(): Promise<void> {
    try {
      // 获取所有世界书条目
      const allEntries = await this.getAllWorldBookEntries();
      if (!allEntries || !allEntries.length) return;

      // 找出自动存档最大ID
      const autoSaves = allEntries.filter(entry => this.checkEntryKeyStartsWith(entry, this.SAVE_TYPE.AUTO));
      if (autoSaves.length > 0) {
        this.currentMaxSaveId.auto = Math.max(
          ...autoSaves.map(entry => {
            const idMatch = this.getEntryKey(entry).match(/(\d+)$/);
            return idMatch ? parseInt(idMatch[1], 10) : 0;
          }),
        );
      }

      // 找出手动存档最大ID
      const manualSaves = allEntries.filter(entry => this.checkEntryKeyStartsWith(entry, this.SAVE_TYPE.MANUAL));
      if (manualSaves.length > 0) {
        this.currentMaxSaveId.manual = Math.max(
          ...manualSaves.map(entry => {
            const idMatch = this.getEntryKey(entry).match(/(\d+)$/);
            return idMatch ? parseInt(idMatch[1], 10) : 0;
          }),
        );
      }

      console.log(`初始化存档ID: 自动存档=${this.currentMaxSaveId.auto}, 手动存档=${this.currentMaxSaveId.manual}`);
    } catch (error) {
      console.error('初始化最大存档ID失败:', error);
    }
  }

  /**
   * 辅助函数：获取实际使用的键值
   */
  private getEntryKey(entry: any): string {
    if (Array.isArray(entry.key) && entry.key.length > 0) {
      return entry.key[0];
    } else if (typeof entry.key === 'string') {
      return entry.key;
    }
    return '';
  }

  /**
   * 获取所有世界书条目
   */
  private async getAllWorldBookEntries(): Promise<any[]> {
    try {
      if (!this.worldBookName) {
        console.warn('无法获取世界书条目：世界书名为空');
        // 尝试重新初始化世界书
        await this.initializeChatLorebook();
        if (!this.worldBookName) {
          return [];
        }
      }

      // 检查API可用性
      if (typeof window.getLorebookEntries !== 'function') {
        console.error('世界书API不可用：getLorebookEntries函数未定义');
        return [];
      }

      console.log(`正在获取世界书 ${this.worldBookName} 的所有条目...`);

      // 尝试获取世界书条目
      let entries;
      try {
        entries = await window.getLorebookEntries(this.worldBookName);
      } catch (apiError) {
        console.error(`调用getLorebookEntries API出错:`, apiError);

        // 如果失败，尝试使用triggerSlash作为后备方案
        if (typeof window.triggerSlash === 'function') {
          try {
            console.log('尝试使用triggerSlash作为后备方案获取条目');
            const entriesJson = await window.triggerSlash(`/getlbentries ${this.worldBookName}`);
            if (entriesJson) {
              try {
                entries = JSON.parse(entriesJson);
              } catch (parseError) {
                console.error('解析triggerSlash返回结果失败:', parseError);
              }
            }
          } catch (slashError) {
            console.error('使用triggerSlash获取条目失败:', slashError);
          }
        }
      }

      // 检查获取到的条目
      if (!entries) {
        console.log(`没有从世界书 ${this.worldBookName} 获取到条目`);
        return [];
      }

      if (!Array.isArray(entries)) {
        console.error('获取的条目不是数组类型:', entries);
        return [];
      }

      console.log(`成功获取世界书条目，共 ${entries.length} 个`);

      // 检查每个条目是否有效
      if (entries.length > 0) {
        const invalidEntries = entries.filter(entry => !entry || !entry.uid || typeof entry.uid !== 'number');
        if (invalidEntries.length > 0) {
          console.warn(`发现 ${invalidEntries.length} 个无效条目（缺少UID或UID类型错误）`);
        }
      } else {
        console.log('世界书条目为空，可能是新创建的世界书');
      }

      return entries;
    } catch (error) {
      console.error('获取世界书条目失败:', error);
      return [];
    }
  }

  /**
   * 检查条目键是否以指定前缀开头
   */
  private checkEntryKeyStartsWith(entry: any, prefix: string): boolean {
    if (!entry || !entry.key) return false;

    if (Array.isArray(entry.key)) {
      // 对于数组类型的key，检查是否有任意元素以prefix开头
      return entry.key.some((k: string) => k && typeof k === 'string' && k.startsWith(prefix));
    } else if (typeof entry.key === 'string') {
      // 对于字符串类型的key，直接检查
      return entry.key.startsWith(prefix);
    }

    return false;
  }

  /**
   * 根据键名查找条目
   */
  private findEntryByKey(entries: any[], exactKey: string): any {
    if (!entries || !Array.isArray(entries)) {
      console.warn('查找条目时传入的条目列表无效');
      return null;
    }

    if (!exactKey) {
      console.warn('查找条目时传入的键名为空');
      return null;
    }

    const foundEntry = entries.find(entry => {
      if (!entry) return false;

      if (Array.isArray(entry.key)) {
        return entry.key.includes(exactKey);
      }
      return entry.key === exactKey;
    });

    if (foundEntry) {
      if (!foundEntry.uid || typeof foundEntry.uid !== 'number' || isNaN(foundEntry.uid)) {
        console.warn(`找到键名为 ${exactKey} 的条目，但其UID无效: ${foundEntry.uid}`);
      } else {
        console.log(`找到键名为 ${exactKey} 的条目，UID: ${foundEntry.uid}`);
      }
    } else {
      console.log(`未找到键名为 ${exactKey} 的条目`);
    }

    return foundEntry;
  }

  /**
   * 初始化加载游戏弹窗
   */
  private initializeLoadGameModal(): void {
    // 检查是否已存在弹窗
    if ($(`#${this.modalId}`).length === 0) {
      // 创建弹窗
      const modalHtml = `
      <div id="${this.modalId}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="loadGameModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="loadGameModalTitle"><i class="fas fa-book-open"></i> 修道院典籍记录</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="save-tabs">
                <button class="save-tab-btn active" data-tab="auto"><i class="fas fa-clock"></i> 时间记忆</button>
                <button class="save-tab-btn" data-tab="manual"><i class="fas fa-bookmark"></i> 永久典籍</button>
              </div>
              <div class="save-tab-content">
                <div id="auto-saves-container" class="save-tab-pane active">
                  <ul id="auto-save-list" class="save-list">
                    <li class="save-item empty">暂无自动记录点</li>
                  </ul>
                </div>
                <div id="manual-saves-container" class="save-tab-pane">
                  <ul id="manual-save-list" class="save-list">
                    <li class="save-item empty">暂无手动保存的典籍</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="btn-create-manual-save">
                <i class="fas fa-feather-alt"></i> 记录当前典籍
              </button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">关闭</button>
            </div>
          </div>
        </div>
      </div>`;

      // 添加到页面
      $('body').append(modalHtml);

      // 确保模态框样式正确
      const modalStyles = `
        <style>
          #${this.modalId} {
            background-color: rgba(0, 0, 0, 0.5);
          }
          #${this.modalId}.show {
            display: block !important;
          }
          .save-tabs {
            display: flex;
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 15px;
          }
          .save-tab-btn {
            background: none;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            outline: none;
          }
          .save-tab-btn.active {
            border-bottom: 2px solid #5d6e41;
          }
          .save-tab-pane {
            display: none;
          }
          .save-tab-pane.active {
            display: block;
          }
          .save-list {
            list-style: none;
            padding: 0;
          }
          .save-item {
            margin-bottom: 10px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: box-shadow 0.3s;
          }
          .save-item:hover {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .save-item.empty {
            color: #6c757d;
            cursor: default;
            text-align: center;
          }
          .save-item-thumbnail {
            height: 120px;
            background-size: cover;
            background-position: center;
            border-radius: 4px;
          }
          .save-item-header {
            display: flex;
            justify-content: space-between;
            margin: 10px 0 5px;
          }
          .save-item-title {
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .save-item-date {
            font-size: 0.8em;
            color: #6c757d;
          }
          .save-item-content {
            font-size: 0.9em;
            color: #333;
            margin-bottom: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .save-item-actions {
            display: flex;
            justify-content: space-between;
          }
          .btn-load, .btn-delete {
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
          }
          .btn-load {
            background-color: #5d6e41;
            color: white;
          }
          .btn-delete {
            background-color: #dc3545;
            color: white;
          }
        </style>
      `;
      $('head').append(modalStyles);

      // 移除原有事件绑定，防止重复绑定
      $(document).off('click', `#${this.modalId} .save-tab-btn`);
      $(document).off('click', '#btn-create-manual-save');

      // 重新绑定标签切换事件
      $(document).on('click', `#${this.modalId} .save-tab-btn`, e => {
        const tabId = $(e.currentTarget).data('tab');
        $(`#${this.modalId} .save-tab-btn`).removeClass('active');
        $(`#${this.modalId} .save-tab-pane`).removeClass('active');
        $(e.currentTarget).addClass('active');

        if (tabId === 'auto') {
          $(`#auto-saves-container`).addClass('active');
        } else {
          $(`#manual-saves-container`).addClass('active');
        }
      });

      // 绑定创建手动存档按钮事件
      $(document).on('click', '#btn-create-manual-save', () => {
        console.log('创建手动存档按钮被点击');
        this.createManualSave();
      });

      // 绑定关闭按钮事件
      $(document).on('click', `#${this.modalId} .close, #${this.modalId} .btn-secondary`, () => {
        this.closeLoadGameModal();
      });

      // 如果点击模态框外部，关闭模态框
      $(document).on('click', `#${this.modalId}`, e => {
        if ($(e.target).attr('id') === this.modalId) {
          this.closeLoadGameModal();
        }
      });

      console.log(`加载游戏弹窗已初始化，ID: ${this.modalId}`);
    }
  }

  /**
   * 关闭加载游戏弹窗
   */
  private closeLoadGameModal(): void {
    if (typeof $.fn.modal === 'function') {
      $(`#${this.modalId}`).modal('hide');
    } else {
      $(`#${this.modalId}`).css('display', 'none').removeClass('show');
    }
  }

  /**
   * 创建手动存档
   */
  private async createManualSave(): Promise<void> {
    try {
      console.log('开始创建手动存档流程');

      // 显示确认对话框，让用户填写存档名称
      this.uiManager.showInputDialog('请输入典籍标题', '手动存档', async saveName => {
        console.log('用户输入的存档名称:', saveName);

        if (!saveName) {
          saveName = '手动存档';
          console.log('使用默认存档名称:', saveName);
        }

        this.uiManager.showLoading('正在记录典籍...');

        try {
          // 获取当前游戏状态
          console.log('获取当前游戏状态');
          const gameData = await this.getCurrentGameData();

          if (!gameData) {
            console.error('无法获取当前游戏状态');
            this.uiManager.showNotification('无法获取当前游戏状态', 'error');
            return;
          }

          console.log('成功获取当前游戏状态，准备保存');

          // 保存游戏状态
          const saveResult = await this.saveGameState(gameData, true, saveName);

          if (saveResult) {
            console.log('手动存档成功保存');
            this.uiManager.showNotification(`典籍"${saveName}"已成功记录`, 'success');

            // 重新加载存档列表
            console.log('刷新存档列表');
            this.refreshSaveList();
          } else {
            console.error('保存游戏状态失败');
            this.uiManager.showNotification('记录典籍失败', 'error');
          }
        } catch (error) {
          console.error('创建手动存档失败:', error);
          this.uiManager.showNotification('记录典籍失败', 'error');
        } finally {
          this.uiManager.hideLoading();
        }
      });
    } catch (error) {
      console.error('创建手动存档流程出错:', error);
      this.uiManager.showNotification('记录典籍失败', 'error');
    }
  }

  /**
   * 获取当前游戏数据
   */
  private async getCurrentGameData(): Promise<GameData | null> {
    // 这里需要从游戏控制器中获取当前游戏数据
    // 为简化实现，暂时通过自定义事件获取
    return new Promise(resolve => {
      // 创建自定义事件，请求当前游戏数据
      const requestEvent = new CustomEvent('request_game_data', {
        detail: { callback: (gameData: GameData) => resolve(gameData) },
      });
      window.dispatchEvent(requestEvent);

      // 如果5秒内没有响应，返回null
      setTimeout(() => resolve(null), 5000);
    });
  }

  /**
   * 显示加载游戏弹窗
   */
  public async showLoadGameModal(): Promise<void> {
    try {
      this.uiManager.showLoading('正在获取存档列表...');

      // 先刷新存档列表
      await this.refreshSaveList();

      // 确保jQuery和Bootstrap正确加载
      this.ensureBootstrapLoaded();

      // 检查modal方法是否可用
      if (typeof $.fn.modal !== 'function') {
        console.log('Bootstrap modal方法不可用，使用替代方法显示弹窗');

        // 替代方法：直接显示元素
        const modalElement = $(`#${this.modalId}`);
        modalElement
          .css({
            display: 'block',
            'padding-right': '17px',
          })
          .addClass('show');

        // 添加overflow样式到body
        $('body').addClass('modal-open').css('overflow', 'hidden');
      } else {
        console.log('使用Bootstrap modal方法显示弹窗');

        // 使用Bootstrap的modal方法
        try {
          $(`#${this.modalId}`).modal('show');
        } catch (modalError) {
          console.error('显示modal出错:', modalError);

          // 后备方案：直接显示元素
          $(`#${this.modalId}`)
            .css({
              display: 'block',
              'padding-right': '17px',
            })
            .addClass('show');

          // 添加overflow样式到body
          $('body').addClass('modal-open').css('overflow', 'hidden');
        }
      }

      this.uiManager.hideLoading();
    } catch (error) {
      console.error('显示加载游戏弹窗失败:', error);
      this.uiManager.showNotification('获取存档列表失败', 'error');
      this.uiManager.hideLoading();
    }
  }

  /**
   * 刷新存档列表
   */
  private async refreshSaveList(): Promise<void> {
    try {
      // 获取所有存档
      const { autoSaves, manualSaves } = await this.getAllSaves();

      // 更新自动存档列表
      const $autoSaveList = $('#auto-save-list');
      $autoSaveList.empty();

      if (autoSaves.length === 0) {
        $autoSaveList.append('<li class="save-item empty">暂无自动存档</li>');
      } else {
        // 按ID倒序排列，最新的存档在最前面
        const sortedAutoSaves = autoSaves.sort((a, b) => b.saveId - a.saveId);

        for (const save of sortedAutoSaves) {
          this.appendSaveItem($autoSaveList, save);
        }
      }

      // 更新手动存档列表
      const $manualSaveList = $('#manual-save-list');
      $manualSaveList.empty();

      if (manualSaves.length === 0) {
        $manualSaveList.append('<li class="save-item empty">暂无手动存档</li>');
      } else {
        // 按ID倒序排列，最新的存档在最前面
        const sortedManualSaves = manualSaves.sort((a, b) => b.saveId - a.saveId);

        for (const save of sortedManualSaves) {
          this.appendSaveItem($manualSaveList, save);
        }
      }
    } catch (error) {
      console.error('刷新存档列表失败:', error);
      throw error;
    }
  }

  /**
   * 添加存档项到列表
   */
  private appendSaveItem($list: JQuery, save: any): void {
    // 生成缩略图URL
    let thumbnailUrl = '';
    if (save.thumbnail) {
      thumbnailUrl = save.thumbnail;
    } else {
      // 使用默认图片，根据存档类型选择不同的默认图片
      thumbnailUrl = save.isAuto
        ? 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E4%B9%A6%E5%BA%97%E5%86%85/%E4%B9%A6%E5%BA%97.jpg?ref_type=heads'
        : 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%85%AC%E5%9B%AD/%E7%99%BD%E5%A4%A9.jpg?ref_type=heads';
    }

    const $saveItem = $('<li>', {
      class: 'save-item',
      'data-key': save.key,
    });

    // 添加缩略图
    $('<div>', {
      class: 'save-item-thumbnail',
      style: `background-image: url(${thumbnailUrl})`,
    }).appendTo($saveItem);

    // 添加标题和日期
    const $header = $('<div>', { class: 'save-item-header' });

    $('<div>', {
      class: 'save-item-title',
      text: save.title,
    }).appendTo($header);

    $('<div>', {
      class: 'save-item-date',
      text: save.date,
    }).appendTo($header);

    $header.appendTo($saveItem);

    // 添加内容摘要
    $('<div>', {
      class: 'save-item-content',
      text: save.content || '无可用内容',
    }).appendTo($saveItem);

    // 添加操作按钮
    const $actions = $('<div>', { class: 'save-item-actions' });

    // 创建加载按钮
    const $loadBtn = $('<button>', {
      class: 'btn-load',
      html: '<i class="fas fa-book-reader"></i> 阅读',
      'data-key': save.key,
    });

    // 创建删除按钮
    const $deleteBtn = $('<button>', {
      class: 'btn-delete',
      html: '<i class="fas fa-trash-alt"></i> 销毁',
      'data-key': save.key,
      'data-title': save.title,
    });

    // 将按钮添加到操作区域
    $actions.append($loadBtn).append($deleteBtn);
    $actions.appendTo($saveItem);

    // 将整个存档项添加到列表
    $list.append($saveItem);

    // 使用直接事件绑定，避免使用on代理导致的问题
    $loadBtn.on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击加载按钮，key:', save.key);
      this.loadGameFromKey(save.key);
      return false;
    });

    $deleteBtn.on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击删除按钮，key:', save.key, 'title:', save.title);
      this.deleteSave(save.key, save.title);
      return false;
    });

    // 为整个存档项添加点击事件
    $saveItem.on('click', e => {
      // 如果点击的是操作按钮，不进行处理
      if ($(e.target).closest('.save-item-actions').length > 0) {
        return;
      }

      // 否则触发加载存档
      console.log('点击存档项，key:', save.key);
      this.loadGameFromKey(save.key);
    });
  }

  /**
   * 删除存档
   */
  private async deleteSave(saveKey: string, saveTitle: string): Promise<void> {
    try {
      console.log('准备删除存档，key:', saveKey, 'title:', saveTitle);

      // 确认删除
      this.uiManager.showConfirmDialog(`确定要销毁典籍"${saveTitle}"吗？此操作不可逆。`, async () => {
        console.log('用户确认删除存档，开始删除过程');
        this.uiManager.showLoading('正在销毁典籍...');

        try {
          const allEntries = await window.getLorebookEntries(this.worldBookName);
          const saveEntry = this.findEntryByKey(allEntries, saveKey);

          if (saveEntry && saveEntry.uid) {
            console.log(`找到存档条目，准备删除 UID=${saveEntry.uid}`);
            await window.deleteLorebookEntry(this.worldBookName, saveEntry.uid);

            // 刷新存档列表
            await this.refreshSaveList();

            this.uiManager.showNotification(`典籍"${saveTitle}"已成功销毁`, 'success');
          } else {
            console.error('找不到要删除的存档条目');
            this.uiManager.showNotification('找不到指定的典籍记录', 'error');
          }
        } catch (error) {
          console.error('删除存档过程中出错:', error);
          this.uiManager.showNotification(
            '销毁典籍失败: ' + (error instanceof Error ? error.message : '未知错误'),
            'error',
          );
        } finally {
          this.uiManager.hideLoading();
        }
      });
    } catch (error) {
      console.error('删除存档过程出错:', error);
      this.uiManager.showNotification('销毁典籍失败', 'error');
    }
  }

  /**
   * 获取所有游戏存档
   */
  public async getAllSaves(): Promise<{ autoSaves: any[]; manualSaves: any[] }> {
    try {
      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        await this.initializeChatLorebook();
      }

      // 检查API是否可用
      if (!this.worldBookName || typeof window.getLorebookEntries !== 'function') {
        console.warn('世界书API不可用，无法获取存档');
        return { autoSaves: [], manualSaves: [] };
      }

      // 获取所有世界书条目
      const allEntries = await this.getAllWorldBookEntries();
      if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
        return { autoSaves: [], manualSaves: [] };
      }

      // 筛选出自动存档条目
      const autoSaveEntries = allEntries.filter(entry => this.checkEntryKeyStartsWith(entry, this.SAVE_TYPE.AUTO));

      // 筛选出手动存档条目
      const manualSaveEntries = allEntries.filter(entry => this.checkEntryKeyStartsWith(entry, this.SAVE_TYPE.MANUAL));

      console.log(`找到 ${autoSaveEntries.length} 个自动存档和 ${manualSaveEntries.length} 个手动存档`);

      // 处理自动存档数据
      const autoSaves = await Promise.all(autoSaveEntries.map(entry => this.processSaveEntry(entry, true)));

      // 处理手动存档数据
      const manualSaves = await Promise.all(manualSaveEntries.map(entry => this.processSaveEntry(entry, false)));

      // 过滤掉处理失败的存档并按ID排序
      return {
        autoSaves: autoSaves.filter(save => save !== null).sort((a, b) => b.saveId - a.saveId),
        manualSaves: manualSaves.filter(save => save !== null).sort((a, b) => b.saveId - a.saveId),
      };
    } catch (error) {
      console.error('获取存档列表失败:', error);
      return { autoSaves: [], manualSaves: [] };
    }
  }

  /**
   * 处理存档条目
   */
  private async processSaveEntry(entry: any, isAuto: boolean): Promise<any> {
    try {
      if (!entry || !entry.key) {
        console.warn('无效的存档条目:', entry);
        return null;
      }

      // 获取键值（可能是字符串或数组）
      let entryKey = '';
      if (Array.isArray(entry.key) && entry.key.length > 0) {
        // 查找符合条件的键
        const prefix = isAuto ? this.SAVE_TYPE.AUTO : this.SAVE_TYPE.MANUAL;
        const matchingKey = entry.key.find((k: string) => k && typeof k === 'string' && k.startsWith(prefix));
        if (matchingKey) {
          entryKey = matchingKey;
        } else {
          entryKey = entry.key[0]; // 默认使用第一个键
        }
      } else if (typeof entry.key === 'string') {
        entryKey = entry.key;
      } else {
        console.warn('无效的键值类型:', entry.key);
        return null;
      }

      // 从键中提取存档ID
      const idMatch = entryKey.match(/(\d+)$/);
      const saveId = idMatch ? parseInt(idMatch[1], 10) : 0;

      // 获取简要内容用于显示
      const savePreview = {
        key: entryKey,
        uid: entry.uid, // 保存UID用于后续操作
        title: entry.comment || (isAuto ? `自动记录点 #${saveId}` : `永久典籍 #${saveId}`),
        saveId: saveId,
        date: new Date(entry.created_at || Date.now()).toLocaleString(),
        content: '',
        thumbnail: '',
        isAuto: isAuto,
      };

      // 尝试获取存档内容的摘要和缩略图
      try {
        // 优先使用条目的直接内容
        let content = '';
        if (entry.content) {
          content = entry.content;
        } else if (typeof window.triggerSlash === 'function') {
          content = await window.triggerSlash(`/getentryfield file=${this.worldBookName} field=content ${entryKey}`);
        }

        if (content) {
          try {
            const gameData = JSON.parse(content);
            if (gameData.storySummary && gameData.storySummary.length > 0) {
              const latestSummary = gameData.storySummary[gameData.storySummary.length - 1];
              savePreview.content = latestSummary.content;

              // 如果有图片，则使用该图片作为缩略图
              if (latestSummary.image) {
                savePreview.thumbnail = latestSummary.image;
              }
            }
          } catch (jsonError) {
            console.warn('解析存档内容失败:', jsonError);
          }
        }
      } catch (error) {
        console.warn('无法获取存档内容摘要:', error);
      }

      return savePreview;
    } catch (error) {
      console.error('处理存档数据出错:', error);
      return null;
    }
  }

  /**
   * 从存档键加载游戏
   */
  private async loadGameFromKey(saveKey: string): Promise<void> {
    try {
      console.log('准备加载存档，key:', saveKey);

      // 确认加载
      this.uiManager.showConfirmDialog('确定要加载此存档吗？当前游戏进度将丢失。', async () => {
        console.log('用户确认加载存档，开始加载过程');
        this.uiManager.showLoading('正在加载存档...');

        try {
          // 加载游戏状态
          const gameData = await this.loadGameState(saveKey);

          if (gameData) {
            console.log('存档加载成功，准备关闭弹窗并更新游戏状态');

            // 关闭弹窗
            this.closeLoadGameModal();

            // 触发加载完成事件，传递游戏数据给游戏控制器
            console.log('触发gameloaded事件');
            const loadEvent = new CustomEvent('gameloaded', {
              detail: { gameData },
            });
            window.dispatchEvent(loadEvent);

            this.uiManager.showNotification('加载存档成功', 'success');
          } else {
            console.error('加载游戏状态失败，gameData为null');
            this.uiManager.showNotification('加载存档失败', 'error');
          }
        } catch (error) {
          console.error('加载存档处理过程中出错:', error);
          this.uiManager.showNotification(
            '加载存档失败: ' + (error instanceof Error ? error.message : '未知错误'),
            'error',
          );
        } finally {
          this.uiManager.hideLoading();
        }
      });
    } catch (error) {
      console.error('加载存档过程出错:', error);
      this.uiManager.showNotification('加载存档失败', 'error');
    }
  }

  /**
   * 将当前游戏状态保存到世界书
   * @param gameData 游戏数据
   * @param isManual 是否为手动存档
   * @param customName 自定义存档名称（仅用于手动存档）
   */
  public async saveGameState(gameData: GameData, isManual: boolean = false, customName?: string): Promise<boolean> {
    if (!gameData || !gameData.storySummary || gameData.storySummary.length === 0) {
      console.warn('没有可保存的游戏状态');
      return false;
    }

    try {
      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        console.log('世界书名称为空，重新初始化');
        await this.initializeChatLorebook();

        if (!this.worldBookName) {
          console.error('初始化世界书失败，无法保存游戏状态');
          this.uiManager.showNotification('无法初始化世界书，保存失败', 'error');
          return false;
        }
      }

      // 检查世界书API是否可用
      if (typeof window.getLorebookEntries !== 'function') {
        console.error('世界书API不可用');
        this.uiManager.showNotification('世界书API不可用，无法保存游戏状态', 'error');
        return false;
      }

      // 根据保存类型确定存档ID和键名前缀
      const saveType = isManual ? this.SAVE_TYPE.MANUAL : this.SAVE_TYPE.AUTO;
      const nextId = isManual ? ++this.currentMaxSaveId.manual : ++this.currentMaxSaveId.auto;
      const saveKey = `${saveType}${nextId}`;

      // 创建存档名称
      let saveName = '';
      let dialogueCount = gameData.story.dialogue.length;
      let memoriesCount = gameData.storySummary.length;

      if (isManual && customName) {
        saveName = `${customName} #${nextId} [对话:${dialogueCount}条|记忆:${memoriesCount}条]`;
      } else if (isManual) {
        saveName = `手动存档 #${nextId} [对话:${dialogueCount}条|记忆:${memoriesCount}条]`;
      } else {
        // 自动存档名称，格式为"自动存档#ID-记忆描述"
        const latestSummary = gameData.storySummary[gameData.storySummary.length - 1];
        const shortDescription =
          latestSummary.content.substring(0, 30) + (latestSummary.content.length > 30 ? '...' : '');
        saveName = `自动存档 #${nextId}-${shortDescription} [对话:${dialogueCount}条|记忆:${memoriesCount}条]`;
      }

      // 先保存完整历史记录，确保对话历史和游戏状态同步
      await this.saveDialogueHistory(gameData);

      // 准备保存数据
      const saveData = JSON.stringify(gameData);

      // 记录开始保存时间，用于超时判断
      const startTime = Date.now();
      const MAX_RETRY = 3;
      const TIMEOUT_MS = 10000; // 10秒超时

      for (let retry = 0; retry < MAX_RETRY; retry++) {
        try {
          // 获取所有条目，检查是否已存在相同key的条目
          console.log(`获取世界书条目，尝试 ${retry + 1}/${MAX_RETRY}`);
          const allEntries = await window.getLorebookEntries(this.worldBookName);
          const saveEntry = this.findEntryByKey(allEntries, saveKey);

          // 设定一个Promise，当超时时拒绝
          const saveWithTimeout = async <T>(promise: Promise<T>): Promise<T> => {
            const timeout = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('操作超时')), TIMEOUT_MS);
            });
            return Promise.race([promise, timeout]);
          };

          // 如果存在相同key的条目，更新而不是创建新条目
          if (saveEntry) {
            console.log(`存档 ${saveKey} 已存在，将更新条目 uid=${saveEntry.uid}`);

            if (typeof saveEntry.uid !== 'number' || isNaN(saveEntry.uid)) {
              throw new Error(`无效的UID: ${saveEntry.uid}`);
            }

            // 创建需要更新的条目对象
            const updateEntry = {
              uid: saveEntry.uid,
              comment: saveName,
              content: saveData,
            };

            try {
              if (typeof window.setLorebookEntries === 'function') {
                await saveWithTimeout(window.setLorebookEntries(this.worldBookName, [updateEntry]));
                console.log(`成功更新条目 UID=${saveEntry.uid}`);
                // 更新成功，跳出重试循环
                break;
              } else if (typeof window.editLorebookEntry === 'function') {
                await saveWithTimeout(
                  window.editLorebookEntry(this.worldBookName, saveEntry.uid, {
                    comment: saveName,
                    content: saveData,
                  }),
                );
                console.log(`成功更新条目 UID=${saveEntry.uid} (使用editLorebookEntry)`);
                break;
              } else {
                // 如果没有更新API，则删除后重建
                await saveWithTimeout(window.deleteLorebookEntry(this.worldBookName, saveEntry.uid));
                const newUid = await saveWithTimeout(
                  window.createLorebookEntry(this.worldBookName, {
                    key: [saveKey],
                    comment: saveName,
                    content: saveData,
                  }),
                );

                if (newUid > 0) {
                  console.log(`成功删除旧条目并创建新条目 UID=${newUid}`);
                  break;
                } else {
                  throw new Error(`创建新条目失败，返回的UID无效: ${newUid}`);
                }
              }
            } catch (updateError) {
              console.error(`更新条目尝试 ${retry + 1} 失败:`, updateError);

              // 如果不是最后一次尝试，等待后重试
              if (retry < MAX_RETRY - 1) {
                console.log(`等待500ms后重试...`);
                await new Promise(resolve => setTimeout(resolve, 500));
              } else {
                throw updateError; // 最后一次尝试失败，向上抛出错误
              }
            }
          } else {
            // 创建新条目
            console.log(`存档 ${saveKey} 不存在，将创建新条目`);

            // 准备创建的条目对象
            const newEntry = {
              key: [saveKey],
              comment: saveName,
              content: saveData,
            };

            try {
              let success = false;

              // 尝试使用新API创建条目
              if (typeof window.createLorebookEntries === 'function') {
                const result = await saveWithTimeout(window.createLorebookEntries(this.worldBookName, [newEntry]));

                if (result && result.new_uids && result.new_uids.length > 0) {
                  console.log(`成功创建新条目，UID=${result.new_uids[0]}`);
                  success = true;
                } else {
                  console.warn('createLorebookEntries返回结果无效，将尝试旧API');
                }
              }

              // 如果新API失败或不可用，尝试旧API
              if (!success && typeof window.createLorebookEntry === 'function') {
                const uid = await saveWithTimeout(window.createLorebookEntry(this.worldBookName, newEntry));

                if (uid > 0) {
                  console.log(`成功创建新条目，UID=${uid}`);
                  success = true;
                } else {
                  throw new Error(`创建条目失败，返回的UID无效: ${uid}`);
                }
              }

              if (success) {
                break; // 创建成功，跳出重试循环
              } else {
                throw new Error('没有可用的API创建条目');
              }
            } catch (createError) {
              console.error(`创建条目尝试 ${retry + 1} 失败:`, createError);

              // 如果不是最后一次尝试，等待后重试
              if (retry < MAX_RETRY - 1) {
                console.log(`等待500ms后重试...`);
                await new Promise(resolve => setTimeout(resolve, 500));
              } else {
                throw createError; // 最后一次尝试失败，向上抛出错误
              }
            }
          }
        } catch (error) {
          // 处理最后一次失败的情况
          if (retry === MAX_RETRY - 1) {
            throw error;
          }
        }
      }

      // 保存成功，记录当前ID
      if (isManual) {
        this.currentMaxSaveId.manual = nextId;
      } else {
        this.currentMaxSaveId.auto = nextId;
      }

      console.log(`已成功保存游戏状态到世界书，包含 ${dialogueCount} 条对话和 ${memoriesCount} 条记忆`);
      return true;
    } catch (error) {
      console.error('保存游戏状态到世界书失败:', error);
      this.uiManager.showNotification(
        '保存游戏状态失败: ' + (error instanceof Error ? error.message : '未知错误'),
        'error',
      );
      return false;
    }
  }

  /**
   * 加载完整历史记录
   */
  private async loadCompleteHistory(): Promise<CompleteHistoryRecord | null> {
    try {
      // 如果已有缓存记录，直接返回
      if (this.cachedCompleteHistory) {
        return this.cachedCompleteHistory;
      }

      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        await this.initializeChatLorebook();
      }

      // 检查API是否可用
      if (typeof window.getLorebookEntries !== 'function') {
        console.warn('世界书API不可用，无法加载完整历史记录');
        return null;
      }

      // 获取所有世界书条目
      const allEntries = await window.getLorebookEntries(this.worldBookName);
      if (!allEntries || !Array.isArray(allEntries)) {
        console.warn('未找到世界书条目');
        return null;
      }

      // 查找完整历史记录条目
      const historyEntry = this.findEntryByKey(allEntries, this.COMPLETE_HISTORY_KEY);

      if (!historyEntry) {
        console.log('未找到完整历史记录条目，将创建新记录');
        // 创建新的完整历史记录
        const newHistory: CompleteHistoryRecord = {
          id: `history_${Date.now()}`,
          dialogues: [],
          memories: [],
        };
        this.cachedCompleteHistory = newHistory;
        return newHistory;
      }

      // 获取条目内容
      let historyContent = '';

      // 尝试获取条目内容
      if (historyEntry.content) {
        historyContent = historyEntry.content;
      } else if (typeof window.triggerSlash === 'function') {
        // 使用triggerSlash获取
        historyContent = await window.triggerSlash(
          `/getentryfield file=${this.worldBookName} field=content ${this.COMPLETE_HISTORY_KEY}`,
        );
      }

      if (!historyContent) {
        console.log('完整历史记录内容为空，将创建新记录');
        // 创建新的完整历史记录
        const newHistory: CompleteHistoryRecord = {
          id: `history_${Date.now()}`,
          dialogues: [],
          memories: [],
        };
        this.cachedCompleteHistory = newHistory;
        return newHistory;
      }

      try {
        // 解析JSON内容
        const history = JSON.parse(historyContent) as CompleteHistoryRecord;
        if (!history.id || !Array.isArray(history.dialogues) || !Array.isArray(history.memories)) {
          throw new Error('历史记录格式不正确');
        }
        console.log(
          `成功加载完整历史记录，包含 ${history.dialogues.length} 条对话和 ${history.memories.length} 条记忆`,
        );
        this.cachedCompleteHistory = history;
        return history;
      } catch (parseError) {
        console.error('解析完整历史记录失败:', parseError);
        // 创建新的完整历史记录
        const newHistory: CompleteHistoryRecord = {
          id: `history_${Date.now()}`,
          dialogues: [],
          memories: [],
        };
        this.cachedCompleteHistory = newHistory;
        return newHistory;
      }
    } catch (error) {
      console.error('加载完整历史记录失败:', error);
      return null;
    }
  }

  /**
   * 保存完整历史记录
   */
  private async saveCompleteHistory(history: CompleteHistoryRecord): Promise<boolean> {
    try {
      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        await this.initializeChatLorebook();
      }

      // 检查API是否可用
      if (!this.worldBookName || typeof window.getLorebookEntries !== 'function') {
        console.warn('世界书API不可用，无法保存完整历史记录');
        return false;
      }

      // 获取所有世界书条目
      const allEntries = await window.getLorebookEntries(this.worldBookName);

      // 查找完整历史记录条目
      const historyEntry = this.findEntryByKey(allEntries, this.COMPLETE_HISTORY_KEY);

      // 历史记录标题
      const historyTitle = `完整游戏历史记录 - 最后更新: ${new Date().toLocaleString()}`;

      // 转换为JSON字符串
      const historyContent = JSON.stringify(history);

      if (historyEntry) {
        // 更新现有条目
        if (typeof window.editLorebookEntry === 'function') {
          await window.editLorebookEntry(this.worldBookName, historyEntry.uid, {
            comment: historyTitle,
            content: historyContent,
          });
        } else {
          // 回退到旧API：删除并重建
          await window.deleteLorebookEntry(this.worldBookName, historyEntry.uid);
          await window.createLorebookEntry(this.worldBookName, {
            keys: [this.COMPLETE_HISTORY_KEY],
            comment: historyTitle,
            content: historyContent,
          });
        }
        console.log('更新了完整历史记录');
      } else {
        // 创建新条目
        await window.createLorebookEntry(this.worldBookName, {
          keys: [this.COMPLETE_HISTORY_KEY],
          comment: historyTitle,
          content: historyContent,
        });
        console.log('创建了新的完整历史记录条目');
      }

      // 更新缓存
      this.cachedCompleteHistory = history;
      return true;
    } catch (error) {
      console.error('保存完整历史记录失败:', error);
      return false;
    }
  }

  /**
   * 保存对话历史到世界书
   * 使用完整历史记录存储所有对话和记忆
   */
  private async saveDialogueHistory(gameData: GameData): Promise<boolean> {
    if (!gameData.story || !gameData.story.dialogue) {
      console.warn('没有可保存的对话历史');
      return false;
    }

    try {
      // 加载当前的完整历史记录
      let completeHistory = await this.loadCompleteHistory();

      if (!completeHistory) {
        // 创建新的完整历史记录
        completeHistory = {
          id: `history_${Date.now()}`,
          dialogues: [],
          memories: [],
        };
      }

      // 添加所有对话到历史记录（避免重复）
      const existingDialogueCount = completeHistory.dialogues.length;

      // 转换所有对话为简化格式
      const allDialogues = gameData.story.dialogue.map(dialogue => ({
        speaker: dialogue.speaker,
        content: dialogue.content,
        style: dialogue.style,
      }));

      // 避免重复添加对话，只添加新的对话
      if (existingDialogueCount < allDialogues.length) {
        completeHistory.dialogues = allDialogues;
        console.log(`更新对话历史：从 ${existingDialogueCount} 条增加到 ${allDialogues.length} 条`);
      }

      // 添加所有记忆点到历史记录（避免重复）
      if (gameData.storySummary && gameData.storySummary.length > 0) {
        // 映射现有记忆点的ID
        const existingMemoryIds = new Set(completeHistory.memories.map(m => m.id));

        // 添加不存在的新记忆点
        for (const memory of gameData.storySummary) {
          if (!existingMemoryIds.has(memory.id)) {
            completeHistory.memories.push({
              id: memory.id,
              content: memory.content,
            });
            existingMemoryIds.add(memory.id);
          }
        }

        console.log(`更新记忆历史：当前共有 ${completeHistory.memories.length} 条记忆`);
      }

      // 保存完整历史记录
      const saveResult = await this.saveCompleteHistory(completeHistory);

      // 同时更新旧版对话历史记录格式（向后兼容）
      await this.saveLegacyDialogueHistory(gameData, completeHistory);

      return saveResult;
    } catch (error) {
      console.error('保存对话历史到世界书失败:', error);
      return false;
    }
  }

  /**
   * 保存旧版格式的对话历史（向后兼容）
   */
  private async saveLegacyDialogueHistory(
    gameData: GameData,
    completeHistory: CompleteHistoryRecord,
  ): Promise<boolean> {
    try {
      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        await this.initializeChatLorebook();
      }

      // 检查API是否可用
      if (!this.worldBookName || typeof window.getLorebookEntries !== 'function') {
        console.warn('世界书API不可用，无法保存旧版对话历史');
        return false;
      }

      // 获取所有世界书条目
      const allEntries = await window.getLorebookEntries(this.worldBookName);

      // 查找对话历史条目
      const dialogueHistoryEntry = this.findEntryByKey(allEntries, this.DIALOGUE_HISTORY_KEY);

      // 构建旧版日志格式
      let logContent = '';
      for (const dialogue of completeHistory.dialogues) {
        if (dialogue.speaker === '玩家') {
          logContent += `选择:${dialogue.content};`;
        } else {
          logContent += `${dialogue.speaker}:${dialogue.content};`;
        }
      }

      // 添加记忆穿越点
      for (const memory of completeHistory.memories) {
        if (memory.content.includes('穿越') || memory.content.includes('回到')) {
          logContent += `回到过去:${memory.content};`;
        }
      }

      // 对话历史标题
      const dialogueTitle = `对话历史记录 - ${new Date().toLocaleString()}`;

      // 包装为旧版格式
      const updatedContent = `<log>${logContent}</log>`;

      // 更新或创建条目
      try {
        if (dialogueHistoryEntry) {
          // 更新现有条目
          if (typeof window.editLorebookEntry === 'function') {
            await window.editLorebookEntry(this.worldBookName, dialogueHistoryEntry.uid, {
              comment: dialogueTitle,
              content: updatedContent,
            });
          } else {
            // 回退到旧API：删除并重建
            await window.deleteLorebookEntry(this.worldBookName, dialogueHistoryEntry.uid);
            await window.createLorebookEntry(this.worldBookName, {
              keys: [this.DIALOGUE_HISTORY_KEY],
              comment: dialogueTitle,
              content: updatedContent,
            });
          }
          console.log('更新了旧版对话历史记录');
        } else {
          // 创建新条目
          await window.createLorebookEntry(this.worldBookName, {
            keys: [this.DIALOGUE_HISTORY_KEY],
            comment: dialogueTitle,
            content: updatedContent,
          });
          console.log('创建了新的旧版对话历史记录条目');
        }
        return true;
      } catch (error) {
        console.error('保存旧版对话历史失败:', error);
        return false;
      }
    } catch (error) {
      console.error('保存旧版对话历史到世界书失败:', error);
      return false;
    }
  }

  /**
   * 从世界书获取对话历史
   * 优先使用新的完整历史记录格式
   */
  public async getDialogueHistory(): Promise<DialogueHistoryItem[] | null> {
    try {
      // 先尝试获取完整历史记录
      const completeHistory = await this.loadCompleteHistory();

      if (completeHistory && completeHistory.dialogues && completeHistory.dialogues.length > 0) {
        console.log(`从完整历史记录中获取 ${completeHistory.dialogues.length} 条对话历史`);

        // 转换为DialogueHistoryItem格式
        const dialogueHistoryItems: DialogueHistoryItem[] = completeHistory.dialogues.map(d => ({
          speaker: d.speaker,
          content: d.content,
          style: d.style || 'normal',
        }));

        return dialogueHistoryItems;
      }

      // 如果没有完整历史记录，回退到旧版记录格式
      console.log('未找到完整历史记录，尝试旧版格式');

      // 确保聊天世界书已初始化
      if (!this.worldBookName) {
        await this.initializeChatLorebook();
      }

      // 检查API是否可用
      if (typeof window.getLorebookEntries !== 'function') {
        console.warn('世界书API不可用，无法获取对话历史');
        return null;
      }

      // 获取所有世界书条目
      const allEntries = await window.getLorebookEntries(this.worldBookName);
      if (!allEntries || !Array.isArray(allEntries) || allEntries.length === 0) {
        console.warn('没有找到世界书条目');
        return null;
      }

      // 查找持久化对话历史条目
      const dialogueEntry = this.findEntryByKey(allEntries, this.DIALOGUE_HISTORY_KEY);

      if (!dialogueEntry) {
        console.warn('没有找到对话历史条目');
        return null;
      }

      // 获取条目内容
      let dialogueContent = '';

      // 尝试直接从条目获取内容
      if (dialogueEntry.content) {
        dialogueContent = dialogueEntry.content;
      }
      // 如果没有直接内容，使用triggerSlash获取
      else if (typeof window.triggerSlash === 'function') {
        // 获取实际键值（可能是数组中的第一个元素）
        let actualKey = this.DIALOGUE_HISTORY_KEY;
        if (Array.isArray(dialogueEntry.key) && dialogueEntry.key.length > 0) {
          actualKey = dialogueEntry.key[0];
        } else if (typeof dialogueEntry.key === 'string') {
          actualKey = dialogueEntry.key;
        }

        dialogueContent = await window.triggerSlash(
          `/getentryfield file=${this.worldBookName} field=content ${actualKey}`,
        );
      }

      if (!dialogueContent) {
        console.warn('对话历史内容为空');
        return null;
      }

      try {
        // 尝试解析对话历史内容
        // 首先检查是否有<log>标签
        if (dialogueContent.includes('<log>') && dialogueContent.includes('</log>')) {
          const logMatch = dialogueContent.match(/<log>([\s\S]*?)<\/log>/);

          if (logMatch && logMatch[1]) {
            // 解析日志内容
            const logContent = logMatch[1];
            // 分割成独立的对话条目
            const dialogueEntries = logContent.split(';').filter(entry => entry.trim().length > 0);

            // 转换为DialogueHistoryItem格式
            const dialogueHistoryItems: DialogueHistoryItem[] = [];

            for (const entry of dialogueEntries) {
              if (entry.includes(':')) {
                const [type, content] = entry.split(':', 2);

                if (type === '选择') {
                  dialogueHistoryItems.push({
                    speaker: '玩家',
                    content: content,
                    style: 'normal',
                  });
                } else if (type === '回到过去') {
                  dialogueHistoryItems.push({
                    speaker: '旁白',
                    content: `【时间穿越：${content}】`,
                    style: 'special',
                  });
                } else {
                  // 普通对话
                  dialogueHistoryItems.push({
                    speaker: type,
                    content: content,
                    style: 'normal',
                  });
                }
              }
            }

            console.log(`从旧版格式读取了 ${dialogueHistoryItems.length} 条对话历史`);
            return dialogueHistoryItems;
          }
        } else {
          // 尝试作为JSON解析
          try {
            const dialogues = JSON.parse(dialogueContent) as DialogueHistoryItem[];

            if (Array.isArray(dialogues)) {
              console.log(`从JSON格式读取了 ${dialogues.length} 条对话历史`);
              return dialogues;
            }
          } catch (jsonError) {
            console.warn('无法解析对话历史为JSON格式:', jsonError);
          }
        }
      } catch (parseError) {
        console.error('解析对话历史内容失败:', parseError);
      }

      return null;
    } catch (error) {
      console.error('获取对话历史失败:', error);
      return null;
    }
  }

  /**
   * 从键名加载游戏状态
   */
  public async loadGameState(saveKey: string): Promise<GameData | null> {
    const MAX_RETRY = 3;

    for (let retry = 0; retry < MAX_RETRY; retry++) {
      try {
        // 确保聊天世界书已初始化
        if (!this.worldBookName) {
          console.log('世界书名称为空，重新初始化');
          await this.initializeChatLorebook();

          if (!this.worldBookName) {
            console.error('初始化世界书失败，无法加载游戏状态');
            this.uiManager.showNotification('无法初始化世界书，加载失败', 'error');
            return null;
          }
        }

        // 检查API函数是否可用
        if (typeof window.getLorebookEntries !== 'function') {
          console.error('世界书读取API不可用');
          this.uiManager.showNotification('世界书API不可用，无法加载存档', 'error');
          return null;
        }

        // 获取所有世界书条目
        console.log(`获取世界书条目，尝试 ${retry + 1}/${MAX_RETRY}`);
        const allEntries = await window.getLorebookEntries(this.worldBookName);

        // 尝试查找对应的存档条目
        const saveEntry = this.findEntryByKey(allEntries, saveKey);

        if (!saveEntry) {
          console.warn(`找不到存档键 ${saveKey}`);

          // 如果不是最后一次尝试，等待后重试
          if (retry < MAX_RETRY - 1) {
            console.log(`等待500ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue; // 继续下一次重试
          } else {
            this.uiManager.showNotification(`找不到指定存档`, 'warning');
            return null;
          }
        }

        // 获取条目内容
        let entryContent = '';

        try {
          // 尝试直接从条目获取内容
          if (saveEntry.content) {
            entryContent = saveEntry.content;
            console.log('直接从条目获取到内容');
          }
          // 如果没有直接内容，使用triggerSlash获取
          else if (typeof window.triggerSlash === 'function') {
            // 获取实际键值（可能是数组中的第一个元素）
            let actualKey = saveKey;
            if (Array.isArray(saveEntry.key) && saveEntry.key.length > 0) {
              actualKey = saveEntry.key[0];
            } else if (typeof saveEntry.key === 'string') {
              actualKey = saveEntry.key;
            }

            console.log(`通过triggerSlash获取条目内容，key=${actualKey}`);
            entryContent = await window.triggerSlash(
              `/getentryfield file=${this.worldBookName} field=content ${actualKey}`,
            );

            if (entryContent) {
              console.log('通过triggerSlash成功获取内容');
            }
          }

          if (!entryContent) {
            console.warn(`存档键 ${saveKey} 对应的内容为空`);

            // 如果不是最后一次尝试，等待后重试
            if (retry < MAX_RETRY - 1) {
              console.log(`等待500ms后重试...`);
              await new Promise(resolve => setTimeout(resolve, 500));
              continue; // 继续下一次重试
            } else {
              this.uiManager.showNotification(`存档内容为空`, 'warning');
              return null;
            }
          }

          // 解析保存的状态
          try {
            console.log('解析存档内容...');
            const savedState = JSON.parse(entryContent);

            // 确保对话索引设置为0
            if (savedState && savedState.story) {
              savedState.story.currentDialogueIndex = 0;
              console.log('成功解析存档内容，重置对话索引');
              return savedState;
            } else {
              console.warn('解析的存档缺少必要数据');

              // 如果不是最后一次尝试并且是格式问题，可能是加载不完整，重试
              if (retry < MAX_RETRY - 1) {
                console.log(`等待500ms后重试...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                continue; // 继续下一次重试
              } else {
                this.uiManager.showNotification('存档数据不完整或格式错误', 'error');
                return null;
              }
            }
          } catch (parseError) {
            console.error('解析存档内容失败:', parseError);

            // 如果不是最后一次尝试，等待后重试
            if (retry < MAX_RETRY - 1) {
              console.log(`等待500ms后重试...`);
              await new Promise(resolve => setTimeout(resolve, 500));
              continue; // 继续下一次重试
            } else {
              this.uiManager.showNotification('存档内容格式错误', 'error');
              return null;
            }
          }
        } catch (contentError) {
          console.error(`获取存档 ${saveKey} 内容失败:`, contentError);

          // 如果不是最后一次尝试，等待后重试
          if (retry < MAX_RETRY - 1) {
            console.log(`等待500ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue; // 继续下一次重试
          } else {
            this.uiManager.showNotification('获取存档内容失败', 'error');
            return null;
          }
        }
      } catch (retryError) {
        console.error(`加载游戏存档尝试 ${retry + 1} 失败:`, retryError);

        // 如果不是最后一次尝试，等待后重试
        if (retry < MAX_RETRY - 1) {
          console.log(`等待500ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          this.uiManager.showNotification(
            '加载存档失败: ' + (retryError instanceof Error ? retryError.message : '未知错误'),
            'error',
          );
          return null;
        }
      }
    }

    return null; // 如果所有重试都失败，返回null
  }

  /**
   * 根据ID加载游戏状态
   */
  public async loadGameStateByID(summaryId: number, isManual: boolean = false): Promise<GameData | null> {
    const saveKey = isManual ? `${this.SAVE_TYPE.MANUAL}${summaryId}` : `${this.SAVE_TYPE.AUTO}${summaryId}`;
    return this.loadGameState(saveKey);
  }

  /**
   * 获取完整历史记录
   * 包含所有对话和记忆点
   */
  public async getCompleteHistory(): Promise<CompleteHistoryRecord | null> {
    return this.loadCompleteHistory();
  }

  /**
   * 加载游戏
   */
  public loadGame() {
    // 显示加载游戏弹窗
    this.showLoadGameModal();
  }
}
