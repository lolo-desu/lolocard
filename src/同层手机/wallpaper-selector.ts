// 壁纸选择器模块
// 负责壁纸选择器UI的创建和管理

import { Wallpaper, WallpaperManager } from './theme-manager';

export class WallpaperSelector {
  private wallpaperManager: WallpaperManager;
  private themeManager: any; // 主题管理器引用

  constructor(wallpaperManager: WallpaperManager, themeManager: any) {
    this.wallpaperManager = wallpaperManager;
    this.themeManager = themeManager;
  }

  // 显示壁纸选择器
  showWallpaperSelector(viewType: 'chat' | 'home' | 'settings', onApplyWallpaper: () => void): void {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'wallpaper-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    // 创建内容容器
    const container = document.createElement('div');
    container.className = 'wallpaper-container';
    container.style.cssText = `
      background-color: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 20px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    `;

    // 标题
    const title = document.createElement('h2');
    title.textContent = `选择${viewType === 'chat' ? '聊天' : viewType === 'home' ? '主屏幕' : '设置'}壁纸`;
    title.style.cssText = `
      margin-top: 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      text-align: center;
      margin-bottom: 20px;
    `;
    container.appendChild(title);

    // 创建选项卡
    const tabs = this.createTabs(container);
    container.appendChild(tabs);

    // 创建各个选项卡内容
    this.createBuiltinWallpaperTab(container, viewType, modal, onApplyWallpaper);
    this.createSolidColorTab(container, viewType, modal, onApplyWallpaper);
    this.createCustomWallpaperTab(container, viewType, modal, onApplyWallpaper);
    this.createUploadTab(container, viewType, modal, onApplyWallpaper);

    // 创建底部按钮
    this.createBottomButtons(container, viewType, modal, onApplyWallpaper);

    modal.appendChild(container);
    document.body.appendChild(modal);
  }

  // 创建选项卡
  private createTabs(container: HTMLElement): HTMLElement {
    const tabs = document.createElement('div');
    tabs.style.cssText = `
      display: flex;
      border-bottom: 1px solid ${document.body.classList.contains('dark-mode') ? '#3c3c3c' : '#eee'};
      margin-bottom: 15px;
    `;

    const createTab = (label: string, id: string, isActive: boolean = false) => {
      const tab = document.createElement('div');
      tab.textContent = label;
      tab.dataset.tabId = id;
      tab.style.cssText = `
        padding: 10px 15px;
        cursor: pointer;
        font-weight: ${isActive ? 'bold' : 'normal'};
        color: ${isActive ? 'var(--primary-blue)' : 'var(--text-secondary)'};
        border-bottom: ${isActive ? '2px solid var(--primary-blue)' : 'none'};
        margin-bottom: -1px;
      `;
      tab.addEventListener('click', () => {
        // 移除所有活动状态
        tabs.querySelectorAll('div').forEach(t => {
          t.style.fontWeight = 'normal';
          t.style.color = 'var(--text-secondary)';
          t.style.borderBottom = 'none';
        });

        // 设置当前标签为活动状态
        tab.style.fontWeight = 'bold';
        tab.style.color = 'var(--primary-blue)';
        tab.style.borderBottom = '2px solid var(--primary-blue)';

        // 隐藏所有内容
        container.querySelectorAll('.tab-content').forEach(c => {
          (c as HTMLElement).style.display = 'none';
        });

        // 显示选定的内容
        const content = container.querySelector(`.tab-content[data-tab-id="${id}"]`);
        if (content) {
          (content as HTMLElement).style.display = 'block';
        }
      });
      return tab;
    };

    tabs.appendChild(createTab('内置壁纸', 'builtin', true));
    tabs.appendChild(createTab('纯色壁纸', 'solid'));
    tabs.appendChild(createTab('自定义壁纸', 'custom'));
    tabs.appendChild(createTab('上传壁纸', 'upload'));

    return tabs;
  }

  // 创建内置壁纸选项卡
  private createBuiltinWallpaperTab(
    container: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const builtinContent = document.createElement('div');
    builtinContent.className = 'tab-content';
    builtinContent.dataset.tabId = 'builtin';
    builtinContent.style.cssText = 'display: block;';

    // 获取内置壁纸
    const builtinWallpapers = this.wallpaperManager.getBuiltInWallpapers().filter(w => w.type === 'image');

    // 创建壁纸网格
    const builtinGrid = document.createElement('div');
    builtinGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    `;

    builtinWallpapers.forEach(wallpaper => {
      const wallpaperItem = this.createWallpaperItem(wallpaper, viewType, false, modal, onApplyWallpaper);
      builtinGrid.appendChild(wallpaperItem);
    });

    builtinContent.appendChild(builtinGrid);
    container.appendChild(builtinContent);
  }

  // 创建纯色壁纸选项卡
  private createSolidColorTab(
    container: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const solidContent = document.createElement('div');
    solidContent.className = 'tab-content';
    solidContent.dataset.tabId = 'solid';
    solidContent.style.cssText = 'display: none;';

    // 获取纯色壁纸
    const solidWallpapers = this.wallpaperManager.getBuiltInWallpapers().filter(w => w.type === 'color');

    // 创建壁纸网格
    const solidGrid = document.createElement('div');
    solidGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    `;

    solidWallpapers.forEach(wallpaper => {
      const wallpaperItem = this.createWallpaperItem(wallpaper, viewType, false, modal, onApplyWallpaper);
      solidGrid.appendChild(wallpaperItem);
    });

    solidContent.appendChild(solidGrid);

    // 添加颜色选择器
    this.addColorPicker(solidContent, viewType, modal, onApplyWallpaper);

    container.appendChild(solidContent);
  }

  // 创建自定义壁纸选项卡
  private createCustomWallpaperTab(
    container: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const customContent = document.createElement('div');
    customContent.className = 'tab-content';
    customContent.dataset.tabId = 'custom';
    customContent.style.cssText = 'display: none;';

    // 获取自定义壁纸
    const customWallpapers = this.wallpaperManager.getCustomWallpapers();

    if (customWallpapers.length === 0) {
      const noCustomWallpapers = document.createElement('p');
      noCustomWallpapers.textContent = '没有自定义壁纸。请在"上传壁纸"选项卡中添加。';
      noCustomWallpapers.style.cssText = `
        text-align: center;
        color: var(--text-secondary);
        margin: 30px 0;
      `;
      customContent.appendChild(noCustomWallpapers);
    } else {
      // 创建壁纸网格
      const customGrid = document.createElement('div');
      customGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      `;

      customWallpapers.forEach(wallpaper => {
        const wallpaperItem = this.createWallpaperItem(wallpaper, viewType, true, modal, onApplyWallpaper);
        customGrid.appendChild(wallpaperItem);
      });

      customContent.appendChild(customGrid);
    }

    container.appendChild(customContent);
  }

  // 创建上传选项卡
  private createUploadTab(
    container: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const uploadContent = document.createElement('div');
    uploadContent.className = 'tab-content';
    uploadContent.dataset.tabId = 'upload';
    uploadContent.style.cssText = 'display: none; padding: 10px 0;';

    // 从本地上传部分
    this.createLocalUploadSection(uploadContent, viewType, modal, onApplyWallpaper);

    // 从URL添加部分
    this.createUrlUploadSection(uploadContent, viewType, modal, onApplyWallpaper);

    container.appendChild(uploadContent);
  }

  // 添加颜色选择器
  private addColorPicker(
    solidContent: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.style.cssText = `
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid ${document.body.classList.contains('dark-mode') ? '#3c3c3c' : '#eee'};
    `;

    const colorPickerLabel = document.createElement('p');
    colorPickerLabel.textContent = '自定义颜色:';
    colorPickerLabel.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 0.9rem;
      color: var(--text-primary);
    `;

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#ffffff';
    colorPicker.style.cssText = `
      width: 100%;
      height: 40px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;

    const colorNameInput = document.createElement('input');
    colorNameInput.type = 'text';
    colorNameInput.placeholder = '颜色名称 (可选)';
    colorNameInput.style.cssText = `
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
    `;

    const addColorBtn = document.createElement('button');
    addColorBtn.textContent = '添加此颜色';
    addColorBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    `;

    addColorBtn.addEventListener('click', () => {
      const color = colorPicker.value;
      const name = colorNameInput.value.trim() || `颜色 ${color}`;

      const newWallpaper = this.wallpaperManager.createSolidColorWallpaper(color, name);

      if (newWallpaper) {
        // 应用新壁纸
        this.wallpaperManager.setWallpaper(viewType, newWallpaper);
        onApplyWallpaper();

        // 关闭模态框
        document.body.removeChild(modal);
      } else {
        // 显示错误消息
        alert('创建纯色壁纸失败，请确保颜色格式正确。');
      }
    });

    colorPickerContainer.appendChild(colorPickerLabel);
    colorPickerContainer.appendChild(colorPicker);
    colorPickerContainer.appendChild(colorNameInput);
    colorPickerContainer.appendChild(addColorBtn);

    solidContent.appendChild(colorPickerContainer);
  }

  // 创建本地上传部分
  private createLocalUploadSection(
    uploadContent: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const localUploadSection = document.createElement('div');
    localUploadSection.style.cssText = 'margin-bottom: 20px;';

    const localUploadTitle = document.createElement('h3');
    localUploadTitle.textContent = '从本地上传';
    localUploadTitle.style.cssText = `
      font-size: 1rem;
      color: var(--text-primary);
      margin: 0 0 10px 0;
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
    `;

    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = '上传并应用';
    uploadBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    `;

    uploadBtn.addEventListener('click', async () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const newWallpaper = await this.wallpaperManager.createWallpaperFromFile(file);

        if (newWallpaper) {
          // 应用新壁纸
          this.wallpaperManager.setWallpaper(viewType, newWallpaper);
          onApplyWallpaper();

          // 关闭模态框
          document.body.removeChild(modal);
        }
      }
    });

    localUploadSection.appendChild(localUploadTitle);
    localUploadSection.appendChild(fileInput);
    localUploadSection.appendChild(uploadBtn);
    uploadContent.appendChild(localUploadSection);
  }

  // 创建URL上传部分
  private createUrlUploadSection(
    uploadContent: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const urlUploadSection = document.createElement('div');
    urlUploadSection.style.cssText = `
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid ${document.body.classList.contains('dark-mode') ? '#3c3c3c' : '#eee'};
    `;

    const urlUploadTitle = document.createElement('h3');
    urlUploadTitle.textContent = '从URL添加';
    urlUploadTitle.style.cssText = `
      font-size: 1rem;
      color: var(--text-primary);
      margin: 0 0 10px 0;
    `;

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = '输入图片URL';
    urlInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
    `;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '壁纸名称 (可选)';
    nameInput.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
    `;

    const addUrlBtn = document.createElement('button');
    addUrlBtn.textContent = '添加并应用';
    addUrlBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    `;

    addUrlBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      const name = nameInput.value.trim() || 'URL壁纸';

      if (url) {
        const newWallpaper = await this.wallpaperManager.createWallpaperFromUrl(url, name);

        if (newWallpaper) {
          // 应用新壁纸
          this.wallpaperManager.setWallpaper(viewType, newWallpaper);
          onApplyWallpaper();

          // 关闭模态框
          document.body.removeChild(modal);
        } else {
          alert('无效的URL。请输入有效的图片URL。');
        }
      }
    });

    urlUploadSection.appendChild(urlUploadTitle);
    urlUploadSection.appendChild(urlInput);
    urlUploadSection.appendChild(nameInput);
    urlUploadSection.appendChild(addUrlBtn);
    uploadContent.appendChild(urlUploadSection);
  }

  // 创建壁纸项
  private createWallpaperItem(
    wallpaper: Wallpaper,
    viewType: 'chat' | 'home' | 'settings',
    showDeleteButton: boolean,
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;

    // 预览
    const preview = document.createElement('div');
    preview.style.cssText = `
      width: 100%;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    if (wallpaper.type === 'color') {
      // 确保纯色壁纸预览正确
      preview.style.backgroundImage = 'none';
      preview.style.backgroundColor = wallpaper.value;
    } else {
      preview.style.backgroundImage = `url("${wallpaper.value}")`;
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
    }

    // 名称
    const name = document.createElement('div');
    name.textContent = wallpaper.name;
    name.style.cssText = `
      padding: 8px;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-primary);
      background-color: ${
        document.body.classList.contains('dark-mode') ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      };
    `;

    // 删除按钮
    if (showDeleteButton) {
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '&times;';
      deleteBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(255, 0, 0, 0.7);
        color: white;
        border: none;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
        z-index: 1;
      `;

      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();

        if (confirm('确定要删除这个壁纸吗？')) {
          this.wallpaperManager.deleteCustomWallpaper(wallpaper.id);

          // 如果当前正在使用这个壁纸，则重置为默认
          const currentWallpaper = this.wallpaperManager.getCurrentWallpaper(viewType);
          if (currentWallpaper && currentWallpaper.id === wallpaper.id) {
            this.wallpaperManager.setWallpaper(viewType, null);
            onApplyWallpaper();
          }

          // 移除元素
          item.parentElement?.removeChild(item);
        }
      });

      item.appendChild(deleteBtn);
    }

    // 点击应用壁纸
    item.addEventListener('click', () => {
      // 确保壁纸管理器使用当前主题名称
      const currentTheme = this.themeManager.getCurrentTheme();
      this.wallpaperManager.setCurrentThemeName(currentTheme.name);

      this.wallpaperManager.setWallpaper(viewType, wallpaper);
      onApplyWallpaper();

      // 关闭模态框
      document.body.removeChild(modal);
    });

    item.appendChild(preview);
    item.appendChild(name);

    return item;
  }

  // 创建底部按钮
  private createBottomButtons(
    container: HTMLElement,
    viewType: 'chat' | 'home' | 'settings',
    modal: HTMLElement,
    onApplyWallpaper: () => void,
  ): void {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid ${document.body.classList.contains('dark-mode') ? '#3c3c3c' : '#eee'};
    `;

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '恢复默认';
    resetBtn.style.cssText = `
      padding: 10px 15px;
      background: ${document.body.classList.contains('dark-mode') ? '#3c3c3c' : '#f1f5f9'};
      color: var(--text-primary);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    `;

    resetBtn.addEventListener('click', () => {
      // 移除自定义壁纸设置，将使用主题默认壁纸
      this.wallpaperManager.setWallpaper(viewType, null);
      onApplyWallpaper();

      // 关闭模态框
      document.body.removeChild(modal);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
      padding: 10px 20px;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
    `;

    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    buttonsContainer.appendChild(resetBtn);
    buttonsContainer.appendChild(closeBtn);
    container.appendChild(buttonsContainer);
  }
}
