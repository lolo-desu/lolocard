/**
 * 记忆管理器组件
 * 负责管理游戏中的记忆系统和时间旅行机制
 */

import { StoryMemory } from '../models/gameData';

export class MemoryManager {
  // 记忆数据
  private memories: StoryMemory[] = [];
  private selectedMemoryId: number | null = null;

  // 使用会话存储跟踪是否已经保存过场景
  private hasCreatedMemory: boolean = false;
  private alreadySavedKey: string = 'memory_already_saved';

  // 标记是否正在处理切换标签的操作
  private isTabSwitching: boolean = false;

  // 记忆选择回调
  private onMemorySelectedCallback: ((memoryId: number) => void) | null = null;
  private onMemorySavedCallback: ((memory: StoryMemory) => void) | null = null;
  private onMemoryTravelCallback: ((memoryId: number) => void) | null = null;

  constructor() {
    // 绑定穿越按钮事件
    $('#travel-to-memory').on('click', () => {
      this.travelToSelectedMemory();
    });

    // 检查是否已保存过场景
    this.checkIfAlreadySaved();

    // 设置标签切换事件监听，确保只在需要时刷新
    $('a[data-bs-toggle="tab"]').on('hide.bs.tab', e => {
      if ($(e.target).attr('href') === '#memory-tab') {
        this.isTabSwitching = true;
      }
    });

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', e => {
      if ($(e.target).attr('href') === '#memory-tab') {
        // 在切换回记忆标签时，确保正确刷新数据而不是UI
        // 重要：使用setTimeout是为了让DOM完全更新
        setTimeout(() => {
          // 先清空时间轴，防止重复
          $('#memory-timeline').empty();
          this.renderMemories();
          this.isTabSwitching = false;
        }, 50);
      }
    });

    console.log('记忆管理器初始化完成');
  }

  /**
   * 检查是否已经保存过场景
   */
  private checkIfAlreadySaved() {
    const saved = sessionStorage.getItem(this.alreadySavedKey);
    if (saved === 'true') {
      this.hasCreatedMemory = true;
      // 更新UI状态
      this.updateSaveButtonState();
    }
  }

  /**
   * 更新保存按钮状态
   */
  private updateSaveButtonState() {
    if (this.hasCreatedMemory) {
      $('.memory-button')
        .prop('disabled', true)
        .css('opacity', '0.5')
        .attr('title', '此场景已保存，每个场景只能保存一次')
        .text('已保存');
    }
  }

  /**
   * 设置记忆列表
   */
  public setMemories(memories: StoryMemory[]) {
    // 去重处理，确保每个ID只存在一次
    const uniqueMemories: { [key: number]: StoryMemory } = {};

    // 使用对象键值对去重
    memories.forEach(memory => {
      uniqueMemories[memory.id] = memory;
    });

    // 转换回数组
    this.memories = Object.values(uniqueMemories);
    console.log(`设置了${this.memories.length}个记忆点（去重后）`);
  }

  /**
   * 渲染记忆时间轴
   */
  public renderMemories() {
    const $timeline = $('#memory-timeline');
    if ($timeline.length === 0) return;

    // 如果正在切换标签，不立即渲染
    if (this.isTabSwitching) {
      return;
    }

    // 清空现有时间轴
    $timeline.empty();

    // 去重并按时间轴顺序排序记忆（按ID递增）
    const uniqueMemories: { [key: number]: StoryMemory } = {};
    this.memories.forEach(memory => {
      uniqueMemories[memory.id] = memory;
    });
    const sortedMemories = _.sortBy(Object.values(uniqueMemories), 'id');

    // 确保内存中的记忆也是去重的
    this.memories = sortedMemories;

    // 没有记忆点时显示提示
    if (sortedMemories.length === 0) {
      $timeline.html('<div class="memory-empty-timeline">尚未创建记忆点。保存当前场景来创建一个新的记忆点。</div>');
      return;
    }

    // 创建记忆节点 - 简化为纯圆点设计
    _.forEach(sortedMemories, (memory, index) => {
      // 创建简单的记忆节点
      const $node = $('<div>', {
        class: `memory-node-simple ${this.selectedMemoryId === memory.id ? 'selected' : ''}`,
        'data-id': memory.id,
        title: this.formatTimestamp(memory.timestamp || ''),
        click: () => this.selectMemory(memory.id),
      }).appendTo($timeline);
    });

    console.log(`已渲染${sortedMemories.length}个记忆点`);

    // 更新保存按钮状态
    this.updateSaveButtonState();
  }

  /**
   * 格式化时间戳为更简短的格式
   */
  private formatTimestamp(timestamp: string): string {
    // 提取日期和时间的关键部分
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // 如果不是标准日期格式，直接返回原始字符串
        return timestamp;
      }

      // 返回简短格式：月/日 时:分
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch (e) {
      // 如果解析失败，返回原始时间戳
      return timestamp;
    }
  }

  /**
   * 选择记忆
   */
  public selectMemory(memoryId: number) {
    // 查找记忆
    const memory = _.find(this.memories, { id: memoryId });
    if (!memory) {
      console.error(`未找到ID为${memoryId}的记忆`);
      return;
    }

    this.selectedMemoryId = memoryId;

    // 更新记忆内容
    const $content = $('#memory-content');
    if ($content.length > 0) {
      $content.empty();

      // 如果有图片，显示图片
      if (memory.image) {
        $('<div>', {
          class: 'memory-content-image',
          css: { backgroundImage: `url('${memory.image}')` },
        }).appendTo($content);
      }

      // 创建记忆内容元素
      $('<div>', {
        class: 'memory-content-text',
        text: memory.content,
      }).appendTo($content);

      // 如果有时间戳，显示时间戳
      if (memory.timestamp) {
        $('<div>', {
          class: 'memory-timestamp',
          text: memory.timestamp,
        }).appendTo($content);
      }
    }

    // 更新记忆节点样式
    $('.memory-node-simple').removeClass('selected');
    $(`.memory-node-simple[data-id="${memoryId}"]`).addClass('selected');

    // 启用穿越按钮
    $('#travel-to-memory').prop('disabled', false);

    // 调用选择回调
    if (this.onMemorySelectedCallback) {
      this.onMemorySelectedCallback(memoryId);
    }
  }

  /**
   * 穿越到选中的记忆
   */
  private travelToSelectedMemory() {
    if (this.selectedMemoryId === null) {
      console.error('没有选中的记忆点');
      return;
    }

    // 调用穿越回调
    if (this.onMemoryTravelCallback) {
      this.onMemoryTravelCallback(this.selectedMemoryId);
    }
  }

  /**
   * 添加新记忆
   */
  public addMemory(content: string, image?: string): StoryMemory | null {
    // 检查是否已经保存过
    if (this.hasCreatedMemory) {
      console.warn('此场景已保存过，每个场景只能保存一次');
      this.showOneTimeOnlyMessage();
      return null;
    }

    // 生成新ID（通常应使用游戏状态数据中的下一个ID）
    const memoryIds = _.map(this.memories, 'id');
    const newId = this.memories.length > 0 ? (_.max(memoryIds) || 0) + 1 : 1;

    // 创建新记忆
    const newMemory: StoryMemory = {
      id: newId,
      content,
      timestamp: new Date().toLocaleString(),
      image,
    };

    // 添加到记忆列表
    this.memories.push(newMemory);

    // 标记为已保存并存储到会话
    this.hasCreatedMemory = true;
    sessionStorage.setItem(this.alreadySavedKey, 'true');

    // 重新渲染时间轴
    this.renderMemories();

    // 选中新记忆
    this.selectMemory(newId);

    // 调用保存回调
    if (this.onMemorySavedCallback) {
      this.onMemorySavedCallback(newMemory);
    }

    return newMemory;
  }

  /**
   * 显示只能保存一次的提示
   */
  private showOneTimeOnlyMessage() {
    // 显示一个临时提示信息
    const $notification = $('<div>', {
      class: 'notification notification-warning',
      text: '此场景已保存过，每个场景只能保存一次',
    }).appendTo('#notification-container');

    // 添加显示类
    setTimeout(() => {
      $notification.addClass('notification-show');
    }, 10);

    // 一段时间后隐藏和移除
    setTimeout(() => {
      $notification.addClass('notification-hide').removeClass('notification-show');
      setTimeout(() => {
        $notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * 删除记忆
   */
  public deleteMemory(memoryId: number) {
    // 查找记忆索引
    const index = _.findIndex(this.memories, { id: memoryId });
    if (index === -1) {
      console.error(`未找到ID为${memoryId}的记忆`);
      return;
    }

    // 删除记忆
    this.memories.splice(index, 1);

    // 重新渲染时间轴
    this.renderMemories();

    // 如果删除的是当前选中的记忆，清除选择
    if (this.selectedMemoryId === memoryId) {
      this.selectedMemoryId = null;
      this.setEmptyMemoryContent();

      // 禁用穿越按钮
      $('#travel-to-memory').prop('disabled', true);
    }
  }

  /**
   * 获取当前选中的记忆
   */
  public getSelectedMemory(): StoryMemory | null {
    if (this.selectedMemoryId === null) return null;

    return _.find(this.memories, { id: this.selectedMemoryId }) || null;
  }

  /**
   * 获取所有记忆
   */
  public getAllMemories(): StoryMemory[] {
    // 确保返回的数据是去重的
    const uniqueMemories: { [key: number]: StoryMemory } = {};
    this.memories.forEach(memory => {
      uniqueMemories[memory.id] = memory;
    });
    return _.cloneDeep(Object.values(uniqueMemories));
  }

  /**
   * 设置空记忆内容
   */
  public setEmptyMemoryContent(message: string = '选择一个记忆点或保存当前场景') {
    $('#memory-content').html(`<div class="memory-empty-message">${message}</div>`);

    // 禁用穿越按钮
    $('#travel-to-memory').prop('disabled', true);
  }

  /**
   * 设置记忆选择回调
   */
  public setOnMemorySelected(callback: (memoryId: number) => void) {
    this.onMemorySelectedCallback = callback;
  }

  /**
   * 设置记忆保存回调
   */
  public setOnMemorySaved(callback: (memory: StoryMemory) => void) {
    this.onMemorySavedCallback = callback;
  }

  /**
   * 设置记忆穿越回调
   */
  public setOnMemoryTravel(callback: (memoryId: number) => void) {
    this.onMemoryTravelCallback = callback;
  }

  /**
   * 清空记忆列表
   */
  public clearMemories() {
    this.memories = [];
    this.selectedMemoryId = null;

    // 重置保存状态
    this.hasCreatedMemory = false;
    sessionStorage.removeItem(this.alreadySavedKey);

    this.renderMemories();
    this.setEmptyMemoryContent();
  }

  /**
   * 初始化显示
   */
  public initializeDisplay() {
    // 去重处理
    const uniqueMemories: { [key: number]: StoryMemory } = {};
    this.memories.forEach(memory => {
      uniqueMemories[memory.id] = memory;
    });
    this.memories = Object.values(uniqueMemories);

    if (this.memories.length > 0) {
      this.renderMemories();
    } else {
      this.setEmptyMemoryContent();
    }

    // 检查是否已保存
    this.checkIfAlreadySaved();
  }
}
