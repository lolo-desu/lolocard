import './styles/main.scss';
import { DataValidator, MVUInitVarData, MVUInitVarValue, ValueParser } from './types';

class MVUJsonEditor {
  private container: JQuery<HTMLElement>;
  private data: MVUInitVarData = {};
  private isDirty: boolean = false;

  constructor(containerId: string) {
    this.container = $(`#${containerId}`);
    this.init();
  }

  private init(): void {
    this.render();
    this.bindEvents();

    // 初始化示例数据
    this.loadSampleData();
  }

  private loadSampleData(): void {
    this.data = {
      日期: ['03月15日', '今天的日期，格式为 mm月dd日'],
      时间: ['09:00', '按照进行行动后实际经历的时间进行更新，每次行动后更新，格式为 hh:mm'],
      user: {
        身份: ['新来的牧师', '随故事进展改变，例如完成特定任务后更新'],
        当前位置: ['教堂', 'user当前所在的地点，当user移动到新区域时更新'],
        重要经历: ['', '记录与故事核心人物或关键事件相关的重要经历，累加记录'],
        与理的好感度: [0, "[-100, 100]范围，与角色'理'的互动会影响此值，积极互动增加，消极互动减少"],
      },
      理: {
        当前位置: ['教堂', "角色'理'当前所在的地点，会随剧情移动"],
        情绪状态: {
          pleasure: [0.1, '[-1,1]之间, 代表愉悦度。正面事件提升，负面事件降低。−1极端痛苦，0中性，1极端喜悦。'],
          arousal: [0.0, '[-1,1]之间, 代表生理或情绪上的激动程度。刺激性事件会改变此值。'],
        },
        当前所想: ['今天天气真好，希望能帮到更多的人。', "角色'理'当前脑海中的主要想法或感受，随互动和情境更新"],
      },
      世界: {
        当前事件阶段: [0, '标记主要故事件的进展阶段，例如：0-序章, 1-遭遇危机, 2-寻找线索...'],
        天气: ['晴朗', '当前世界的天气状况，可以是：晴朗, 多云, 小雨, 雷暴, 浓雾等'],
      },
    };
    this.renderData();
  }

  private render(): void {
    this.container.html(`
      <div class="mvu-editor">
        <div class="mvu-header">
          <h1 class="mvu-title">
            <i class="fas fa-folder" style="color: #3b82f6;"></i>
            角色设定管理器
          </h1>
          <p class="mvu-subtitle">像管理文件夹一样轻松管理您的角色属性和世界设定</p>
          <div class="mvu-toolbar">
            <button class="mvu-btn mvu-btn-primary mvu-tooltip" id="importBtn" data-tooltip="打开已有的设定文件">
              <i class="fas fa-folder-open"></i> 打开
            </button>
            <button class="mvu-btn mvu-btn-primary mvu-tooltip" id="exportBtn" data-tooltip="保存当前设定到文件">
              <i class="fas fa-save"></i> 保存
            </button>
            <button class="mvu-btn mvu-btn-secondary mvu-tooltip" id="addRootBtn" data-tooltip="新建设定项">
              <i class="fas fa-plus"></i> 新建
            </button>
            <button class="mvu-btn mvu-btn-secondary mvu-tooltip" id="clearBtn" data-tooltip="清空所有设定">
              <i class="fas fa-trash-alt"></i> 清空
            </button>
          </div>
        </div>
        <div class="mvu-content">
          <div class="mvu-editor-panel" id="editorPanel">
            <!-- 编辑器内容将在这里渲染 -->
          </div>
        </div>
        <div class="mvu-footer">
          <div class="mvu-status">
            <i class="fas fa-circle" id="statusIcon"></i>
            <span id="statusText">准备就绪</span>
            <span id="dirtyIndicator" class="mvu-dirty" style="display: none;">● 有未保存的修改</span>
          </div>
        </div>
      </div>
    `);
  }

  private bindEvents(): void {
    // 导入按钮
    this.container.find('#importBtn').on('click', () => this.importJson());

    // 导出按钮
    this.container.find('#exportBtn').on('click', () => this.exportJson());

    // 添加根项按钮
    this.container.find('#addRootBtn').on('click', () => this.addRootItem());

    // 清空按钮
    this.container.find('#clearBtn').on('click', () => this.clearData());
  }

  private renderData(): void {
    const panel = this.container.find('#editorPanel');
    panel.empty();

    if (Object.keys(this.data).length === 0) {
      this.renderEmptyState(panel);
    } else {
      const tree = $('<div class="mvu-tree"></div>');
      this.renderObject(this.data, tree, '');
      panel.append(tree);
    }
  }

  private renderEmptyState(container: JQuery<HTMLElement>): void {
    const emptyState = $(`
      <div class="mvu-empty-state">
        <div class="mvu-empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <div class="mvu-empty-title">文件夹是空的</div>
        <div class="mvu-empty-description">
          这里还没有任何设定文件。您可以创建新的设定，<br>
          或者打开已有的设定文件开始编辑。
        </div>
        <div class="mvu-empty-actions">
          <button class="mvu-btn mvu-btn-primary" id="quickAddBtn">
            <i class="fas fa-file-plus"></i> 新建设定
          </button>
          <button class="mvu-btn mvu-btn-secondary" id="quickImportBtn">
            <i class="fas fa-folder-open"></i> 打开文件
          </button>
        </div>
      </div>
    `);

    emptyState.find('#quickAddBtn').on('click', () => this.addRootItem());
    emptyState.find('#quickImportBtn').on('click', () => this.importJson());
    container.append(emptyState);
  }

  private renderObject(obj: any, container: JQuery<HTMLElement>, path: string): void {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (Array.isArray(value) && value.length === 2) {
        // 这是一个 InitVar 值对 [value, description]
        this.renderValuePair(key, value as MVUInitVarValue, container, currentPath);
      } else if (typeof value === 'object' && value !== null) {
        // 这是一个嵌套对象
        this.renderNestedObject(key, value, container, currentPath);
      }
    });
  }

  private renderValuePair(key: string, value: MVUInitVarValue, container: JQuery<HTMLElement>, path: string): void {
    const item = $(`
      <div class="mvu-item mvu-value-pair" data-path="${path}">
        <div class="mvu-item-header">
          <span class="mvu-key">${key}</span>
          <div class="mvu-actions">
            <button class="mvu-btn-icon mvu-btn-edit mvu-tooltip" data-tooltip="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="mvu-btn-icon mvu-btn-delete mvu-tooltip" data-tooltip="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="mvu-value-content">
          <div class="mvu-value-display">
            <span class="mvu-value">${this.formatValue(value[0])}</span>
            <span class="mvu-description">${value[1]}</span>
          </div>
        </div>
      </div>
    `);

    // 绑定编辑事件
    item.find('.mvu-btn-edit').on('click', () => this.editValuePair(path, key, value));

    // 绑定删除事件
    item.find('.mvu-btn-delete').on('click', () => this.deleteItem(path));

    container.append(item);
  }

  private renderNestedObject(key: string, obj: any, container: JQuery<HTMLElement>, path: string): void {
    const item = $(`
      <div class="mvu-item mvu-nested-object" data-path="${path}">
        <div class="mvu-item-header">
          <button class="mvu-toggle">
            <i class="fas fa-chevron-down"></i>
          </button>
          <span class="mvu-key">${key}</span>
          <div class="mvu-actions">
            <button class="mvu-btn-icon mvu-btn-add mvu-tooltip" data-tooltip="添加子项">
              <i class="fas fa-plus"></i>
            </button>
            <button class="mvu-btn-icon mvu-btn-delete mvu-tooltip" data-tooltip="删除文件夹">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="mvu-children">
        </div>
      </div>
    `);

    const children = item.find('.mvu-children');
    this.renderObject(obj, children, path);

    // 绑定折叠/展开事件
    item.find('.mvu-toggle').on('click', function () {
      const $this = $(this);
      const icon = $this.find('i');
      const childrenDiv = $this.closest('.mvu-item').find('.mvu-children');

      if (childrenDiv.is(':visible')) {
        childrenDiv.slideUp(200);
        icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
      } else {
        childrenDiv.slideDown(200);
        icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
      }
    });

    // 绑定添加子项事件
    item.find('.mvu-btn-add').on('click', () => this.addChildItem(path));

    // 绑定删除事件
    item.find('.mvu-btn-delete').on('click', () => this.deleteItem(path));

    container.append(item);
  }

  private formatValue(value: any): string {
    return ValueParser.format(value);
  }

  private editValuePair(path: string, key: string, currentValue: [any, string]): void {
    // 创建编辑对话框
    const dialog = this.createEditDialog(key, currentValue[0], currentValue[1]);

    dialog.dialog({
      title: `编辑 ${key}`,
      width: 500,
      height: 400,
      modal: true,
      resizable: false,
      buttons: {
        保存: () => {
          const newValue = dialog.find('#valueInput').val() as string;
          const newDescription = dialog.find('#descriptionInput').val() as string;

          // 尝试解析值的类型
          const parsedValue = this.parseValue(newValue);

          // 更新数据
          this.setValueByPath(path, [parsedValue, newDescription]);
          this.markDirty();
          this.renderData();

          dialog.dialog('close');
        },
        取消: () => {
          dialog.dialog('close');
        },
      },
      close: () => {
        dialog.remove();
      },
    });
  }

  private createEditDialog(_key: string, value: any, description: string): JQuery<HTMLElement> {
    return $(`
      <div class="mvu-edit-dialog">
        <div class="mvu-form-group">
          <label for="valueInput">当前值:</label>
          <input type="text" id="valueInput" class="mvu-input" value="${value}" placeholder="输入数值或文字" />
          <small class="mvu-hint">可以是文字、数字或 true/false</small>
        </div>
        <div class="mvu-form-group">
          <label for="descriptionInput">说明:</label>
          <textarea id="descriptionInput" class="mvu-textarea" rows="5" placeholder="描述这个设定的作用和更新规则">${description}</textarea>
          <small class="mvu-hint">说明这个设定的含义、取值范围和更新条件</small>
        </div>
      </div>
    `);
  }

  private parseValue(valueStr: string): any {
    return ValueParser.parse(valueStr);
  }

  private addRootItem(): void {
    this.showAddItemDialog('', false);
  }

  private addChildItem(parentPath: string): void {
    this.showAddItemDialog(parentPath, true);
  }

  private showAddItemDialog(parentPath: string, isChild: boolean): void {
    const dialog = $(`
      <div class="mvu-add-dialog">
        <div class="mvu-form-group">
          <label for="keyInput">名称:</label>
          <input type="text" id="keyInput" class="mvu-input" placeholder="例如：角色名字、当前位置、好感度" />
          <small class="mvu-hint">给这个设定起个容易理解的名字</small>
        </div>
        <div class="mvu-form-group">
          <label>类型:</label>
          <div class="mvu-radio-group">
            <label><input type="radio" name="itemType" value="value" checked> 📄 文件 (具体的设定值)</label>
            <label><input type="radio" name="itemType" value="object"> 📁 文件夹 (包含多个设定)</label>
          </div>
        </div>
        <div id="valueFields">
          <div class="mvu-form-group">
            <label for="newValueInput">初始值:</label>
            <input type="text" id="newValueInput" class="mvu-input" placeholder="例如：小明、教堂、0、true" />
            <small class="mvu-hint">这个设定的初始数值</small>
          </div>
          <div class="mvu-form-group">
            <label for="newDescriptionInput">说明:</label>
            <textarea id="newDescriptionInput" class="mvu-textarea" rows="3" placeholder="例如：角色的真实姓名，在剧情中不会改变"></textarea>
            <small class="mvu-hint">解释这个设定的作用和更新规则</small>
          </div>
        </div>
      </div>
    `);

    // 切换类型时显示/隐藏值字段
    dialog.find('input[name="itemType"]').on('change', function () {
      const valueFields = dialog.find('#valueFields');
      if ($(this).val() === 'value') {
        valueFields.show();
      } else {
        valueFields.hide();
      }
    });

    dialog.dialog({
      title: isChild ? '新建子项' : '新建设定',
      width: 450,
      height: 350,
      modal: true,
      resizable: false,
      buttons: {
        创建: () => {
          const key = dialog.find('#keyInput').val() as string;
          const type = dialog.find('input[name="itemType"]:checked').val() as string;

          if (!key.trim()) {
            toastr.error('请输入设定名称');
            return;
          }

          let newItem: any;
          if (type === 'value') {
            const value = this.parseValue(dialog.find('#newValueInput').val() as string);
            const description = dialog.find('#newDescriptionInput').val() as string;
            newItem = [value, description];
          } else {
            newItem = {};
          }

          const fullPath = parentPath ? `${parentPath}.${key}` : key;
          this.setValueByPath(fullPath, newItem);
          this.markDirty();
          this.renderData();

          dialog.dialog('close');
        },
        取消: () => {
          dialog.dialog('close');
        },
      },
      close: () => {
        dialog.remove();
      },
    });
  }

  private deleteItem(path: string): void {
    if (confirm('🗑️ 确定要删除这个设定吗？\n删除后无法恢复！')) {
      this.deleteValueByPath(path);
      this.markDirty();
      this.renderData();
      toastr.success('设定已删除');
    }
  }

  private setValueByPath(path: string, value: any): void {
    const keys = path.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as MVUInitVarData;
    }

    current[keys[keys.length - 1]] = value;
  }

  private deleteValueByPath(path: string): void {
    const keys = path.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as MVUInitVarData;
    }

    delete current[keys[keys.length - 1]];
  }

  private clearData(): void {
    if (confirm('🧹 确定要清空所有设定吗？\n这将删除您创建的所有内容，无法恢复！')) {
      this.data = {};
      this.markDirty();
      this.renderData();
      toastr.success('所有设定已清空');
    }
  }

  private importJson(): void {
    const input = $('<input type="file" accept=".json" style="display: none;">');

    input.on('change', e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 显示加载状态
      this.showLoading('正在导入文件...');

      const reader = new FileReader();
      reader.onload = event => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);

          // 验证数据格式
          const validationResult = DataValidator.validate(jsonData);
          if (validationResult.valid) {
            // 如果当前有未保存的更改，询问用户
            if (this.isDirty && !confirm('📝 当前有未保存的修改，确定要打开新文件吗？\n未保存的修改将会丢失！')) {
              this.hideLoading();
              return;
            }

            this.data = jsonData;
            this.markClean();
            this.renderData();
            this.hideLoading();
            toastr.success(`🎉 文件打开成功！共载入 ${this.countItems(jsonData)} 个设定`);
          } else {
            this.hideLoading();
            this.showValidationErrors(validationResult.errors);
          }
        } catch (error) {
          this.hideLoading();
          toastr.error('❌ 文件格式有问题：' + (error as Error).message);
        }
      };

      reader.onerror = () => {
        this.hideLoading();
        toastr.error('❌ 文件读取失败，请重试');
      };

      reader.readAsText(file);
    });

    input.trigger('click');
  }

  private exportJson(): void {
    if (Object.keys(this.data).length === 0) {
      toastr.warning('⚠️ 还没有任何设定可以保存');
      return;
    }

    try {
      // 验证数据格式
      const validationResult = DataValidator.validate(this.data);
      if (!validationResult.valid) {
        toastr.error('❌ 设定格式有问题，无法保存');
        this.showValidationErrors(validationResult.errors);
        return;
      }

      const jsonStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 生成带时间戳的文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `mvu-initvar-${timestamp}.json`;

      const a = $('<a>').attr({
        href: url,
        download: filename,
      });

      a[0].click();
      URL.revokeObjectURL(url);

      const itemCount = this.countItems(this.data);
      toastr.success(`💾 文件保存成功！共保存了 ${itemCount} 个设定`);
    } catch (error) {
      toastr.error('❌ 保存失败：' + (error as Error).message);
    }
  }

  private markDirty(): void {
    this.isDirty = true;
    this.container.find('#dirtyIndicator').show();
    this.container.find('#statusText').text('已修改');
    this.container
      .find('#statusIcon')
      .removeClass('fa-circle')
      .addClass('fa-exclamation-circle')
      .css('color', '#f59e0b');
  }

  private markClean(): void {
    this.isDirty = false;
    this.container.find('#dirtyIndicator').hide();
    this.container.find('#statusText').text('已保存');
    this.container
      .find('#statusIcon')
      .removeClass('fa-exclamation-circle')
      .addClass('fa-circle')
      .css('color', '#10b981');
  }

  public isDirtyState(): boolean {
    return this.isDirty;
  }

  private showLoading(message: string = '加载中...'): void {
    const panel = this.container.find('#editorPanel');
    panel.html(`
      <div class="mvu-loading">
        <div class="mvu-spinner"></div>
        <div style="margin-left: 12px; color: #666;">${message}</div>
      </div>
    `);
  }

  private hideLoading(): void {
    this.renderData();
  }

  private countItems(data: any): number {
    let count = 0;
    const countRecursive = (obj: any): void => {
      for (const value of Object.values(obj)) {
        if (Array.isArray(value) && value.length === 2) {
          count++;
        } else if (typeof value === 'object' && value !== null) {
          countRecursive(value);
        }
      }
    };
    countRecursive(data);
    return count;
  }

  private showValidationErrors(errors: any[]): void {
    const errorMessages = errors.map(error => `📍 ${error.path || '根目录'}: ${error.message}`).join('\n');
    const dialog = $(`
      <div class="mvu-validation-errors">
        <h3>❌ 文件格式有问题</h3>
        <p>发现以下问题：</p>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 12px; max-height: 200px; overflow-y: auto; line-height: 1.4;">${errorMessages}</pre>
        <p><small>💡 请修正这些问题后重新打开文件。</small></p>
      </div>
    `);

    dialog.dialog({
      title: '⚠️ 无法打开文件',
      width: 500,
      height: 350,
      modal: true,
      resizable: false,
      buttons: {
        知道了: function () {
          $(this).dialog('close');
        },
      },
      close: function () {
        $(this).remove();
      },
    });
  }
}

// 初始化编辑器
$(() => {
  new MVUJsonEditor('mvuEditor');
});
