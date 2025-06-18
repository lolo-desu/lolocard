import './index.scss';

/**
 * 对话界面核心功能
 * 提供简单的对话显示和点击/空格下一步功能
 */

class GalgameEngine {
  constructor() {
    this.currentIndex = 0;
    this.isAnimating = false;
    this.activeCharacters = {}; // 存储当前活动的角色
    this.isTransitioning = false; // 防止动画重叠
    this.currentBgPath = ''; // 当前显示的背景路径
    this.dialogHistory = []; // 存储对话历史

    // 获取DOM元素
    this.dialogBox = document.getElementById('dialog-box');
    this.characterName = document.getElementById('character-name');
    this.dialogText = document.getElementById('dialog-text');
    this.currentImage = document.getElementById('background-image-current');
    this.nextImage = document.getElementById('background-image-next');
    this.characterContainer = document.getElementById('character-container');
    this.historyPanel = document.getElementById('history-panel');
    this.historyContent = document.getElementById('history-content');

    // ===== 第一处可自定义：CG图片链接 =====
    // 在这里添加您的CG图片URL数组
    // 可以添加任意数量的图片链接
    // 注意: URL需要是可以直接访问的图片地址，你可以使用如catbox来进行将图片转为链接。推荐分辨率1920x1080
    const cgUrls = [
      // 示例格式：
      // 'https://example.com/image1.jpg',
      // 'https://example.com/image2.jpg',
      // 'https://example.com/image3.jpg',
      'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg',
      'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E5%A4%9C%E6%99%9A%E5%BC%80%E7%81%AF.jpg',
    ];

    // ===== 可自定义背景图片基础 URL =====
    this.imageBaseUrl = 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/背景/';

    // ===== 可自定义角色立绘链接 =====
    this.characterSpritesBaseUrl = 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/';

    // ===== 新增可自定义：角色立绘链接 =====
    // 角色立绘图片URL对象
    // 键名作为角色的标识符，值是包含不同服装的对象，每种服装包含不同表情的立绘URL
    const characterSprites = {
      络络: {
        水手服: {
          '微笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/微笑.png',
          '浅笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/浅笑.png',
          '生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/生气.png',
          '惊讶.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/惊讶.png',
          '害羞.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/害羞.png',
          '稍微脸红.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/稍微脸红.png',
          '手托下巴思考.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/手托下巴思考.png',
          '看透一切的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/看透一切的坏笑.png',
          '邪恶的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/邪恶的坏笑.png',
          '星星眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/星星眼.png',
          '晕晕眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/晕晕眼.png',
          '猫爪生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/猫爪生气.png',
          '流口水.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/流口水.png',
          '哭泣.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/哭泣.png',
          '擦眼泪.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/擦眼泪.png',
          '等待吻.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/等待吻.png',
          '性高潮.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/性高潮.png',
          '眼神空洞的催眠状态.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/眼神空洞的催眠状态.png',
          '无表情.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/无表情.png',
          '无人.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/无人.png',
        },
        格纹衫: {
          '微笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/微笑.png',
          '浅笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/浅笑.png',
          '生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/生气.png',
          '惊讶.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/惊讶.png',
          '害羞.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/害羞.png',
          '稍微脸红.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/稍微脸红.png',
          '手托下巴思考.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/手托下巴思考.png',
          '看透一切的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/看透一切的坏笑.png',
          '邪恶的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/邪恶的坏笑.png',
          '星星眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/星星眼.png',
          '晕晕眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/晕晕眼.png',
          '猫爪生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/猫爪生气.png',
          '流口水.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/流口水.png',
          '哭泣.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/哭泣.png',
          '擦眼泪.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/擦眼泪.png',
          '等待吻.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/等待吻.png',
          '性高潮.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/性高潮.png',
          '眼神空洞的催眠状态.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/眼神空洞的催眠状态.png',
          '无人.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/无人.png',
        },
        开衫: {
          '微笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/微笑.png',
          '浅笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/浅笑.png',
          '生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/生气.png',
          '惊讶.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/惊讶.png',
          '害羞.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/害羞.png',
          '稍微脸红.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/稍微脸红.png',
          '手托下巴思考.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/手托下巴思考.png',
          '看透一切的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/看透一切的坏笑.png',
          '邪恶的笑容.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/邪恶的笑容.png',
          '星星眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/星星眼.png',
          '晕晕眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/晕晕眼.png',
          '猫爪生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/猫爪生气.png',
          '流口水.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/流口水.png',
          '哭泣.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/哭泣.png',
          '擦眼泪.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/擦眼泪.png',
          '等待吻.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/等待吻.png',
          '性高潮.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/性高潮.png',
          '无表情.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/无表情.png',
          '无人.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/无人.png',
        },
        睡衣: {
          '微笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/微笑.png',
          '浅笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/浅笑.png',
          '生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/生气.png',
          '惊讶.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/惊讶.png',
          '害羞.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/害羞.png',
          '稍微脸红.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/稍微脸红.png',
          '看透一切的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/看透一切的坏笑.png',
          '邪恶的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/邪恶的坏笑.png',
          '星星眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/星星眼.png',
          '晕晕眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/晕晕眼.png',
          '猫爪生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/猫爪生气.png',
          '流口水.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/流口水.png',
          '哭泣.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/哭泣.png',
          '等待吻.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/等待吻.png',
          '性高潮.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/性高潮.png',
          '眼神空洞的催眠状态.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/眼神空洞的催眠状态.png',
          '无人.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/无人.png',
        },
        全裸: {
          '浅笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸浅笑.png',
          '生气.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸生气.png',
          '惊讶.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸惊讶.png',
          '害羞.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸害羞.png',
          '稍微脸红.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸微微害羞.png',
          '看透一切的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸得意脸smug.png',
          '邪恶的坏笑.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸邪恶的笑容.png',
          '坏笑.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸坏笑.png',
          '星星眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸闪耀眼.png',
          '晕晕眼.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸晕眼@_@.png',
          '流口水.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸看到食物馋到流口水.png',
          '哭泣.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸哭泣.png',
          '等待吻.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸等待接吻.png',
          '性高潮.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸色情高潮啊嘿颜.png',
          '眼神空洞的催眠状态.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸被催眠双眼无神留口水.png',
          '无人.png': 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/无人.png',
        },
      },
      你: {
        默认: {
          '默认.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E7%AD%89%E5%BE%85%E5%90%BB.png',
          '惊讶.png':
            'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%93%AD%E6%B3%A3.png',
        },
      },
    };

    try {
      const message = SillyTavern.chat[getCurrentMessageId()].mes;
      const gameDataString = message.match(/<Galgame>\s*```(?:json|yaml)?(.*)```\s*<\/Galgame>/s)[1]; // 获取数据并去除首尾空格

      if (!gameDataString) {
        throw new Error('游戏数据 <Galgame> 为空。');
      }

      let parsedData = null;

      // 尝试解析为 JSON
      try {
        parsedData = JSON.parse(gameDataString);
        console.log('游戏数据加载成功 (JSON 格式)');
      } catch (jsonError) {
        console.warn('JSON 解析失败，尝试解析为 YAML:', jsonError.message);
        // 如果 JSON 解析失败，尝试解析为 YAML
        try {
          parsedData = YAML.parse(gameDataString);
        } catch (yamlError) {
          console.error('YAML 解析也失败:', yamlError);
          // 如果两种解析都失败，抛出合并的错误信息
          throw new Error(
            `数据解析失败：既不是有效的 JSON 也不是有效的 YAML。JSON 错误: ${jsonError.message} | YAML 错误: ${yamlError.message}`,
          );
        }
      }

      // 检查解析后的数据是否有效（例如，是否为数组且不为空）
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.warn('加载的对话数据为空或格式无效 (预期为非空数组)，将加载默认提示信息。');
        this.dialogData = [{ name: '系统提示', text: '加载的对话数据为空或格式无效。', characters: 'narrator' }];
      } else {
        this.dialogData = parsedData;
        console.log('最终使用的游戏数据:', this.dialogData);
      }
    } catch (error) {
      // 捕获所有加载/解析过程中的错误
      console.error('加载或解析游戏数据时出错:', error);
      this.dialogData = [{ name: '系统提示', text: `加载对话数据失败：${error.message}`, characters: 'narrator' }];
    }
    // ===== 数据加载结束 =====

    // 设置角色立绘
    this.characterSprites = characterSprites;

    // 初始化事件监听
    this.initEventListeners();

    // 显示第一条对话前，确保背景和界面已正确设置
    this.initializeBackground();

    // 显示第一条对话
    this.showDialog(0);
  }

  // 初始化背景图片
  initializeBackground() {
    if (this.dialogData && this.dialogData.length > 0 && this.dialogData[0].background) {
      // 设置初始背景
      const initialBgPath = this.dialogData[0].background;
      const initialBgUrl = this.getFullImageUrl(initialBgPath);

      console.log('初始化背景图片:', initialBgUrl);

      // 先检查元素是否存在
      if (!this.currentImage) {
        console.error('背景图片元素不存在!');
        return;
      }

      // 记录当前显示的背景，方便后续比较
      this.currentBgPath = initialBgPath;

      // 直接设置当前背景图片
      this.currentImage.src = initialBgUrl;
      this.currentImage.style.opacity = '1';

      this.currentImage.onerror = () => {
        console.error('背景图片加载失败:', initialBgUrl);
        // 尝试使用预设的CG URL
        this.currentImage.src =
          'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg';
      };

      // 检查图片是否已经加载完成
      if (this.currentImage.complete) {
        console.log('背景图片已加载完成');
      } else {
        this.currentImage.onload = () => {
          console.log('背景图片加载完成');
        };
      }
    }
  }

  // 获取完整的图片URL，处理URL编码问题
  getFullImageUrl(relativePath) {
    if (!relativePath) return '';

    // 使用预定义的硬编码URL
    if (relativePath === '商店街/黄昏.jpg') {
      return 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg';
    } else if (relativePath === '商店街/夜晚开灯.jpg') {
      return 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E5%A4%9C%E6%99%9A%E5%BC%80%E7%81%AF.jpg';
    }

    // 如果不是硬编码的图片，则尝试构建URL
    // 拆分路径以便正确编码每个部分
    try {
      const pathParts = relativePath.split('/');
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = encodedParts.join('/');

      return this.imageBaseUrl + encodedPath;
    } catch (error) {
      console.error('URL编码失败:', error, '原始路径:', relativePath);
      return '';
    }
  }

  initEventListeners() {
    // 点击屏幕任意位置进入下一步
    document.addEventListener('click', () => {
      this.nextDialog();
    });

    // 按空格键进入下一步
    document.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.nextDialog();
      }
    });
  }

  showDialog(index) {
    if (index >= this.dialogData.length) {
      // 对话结束，可以添加结束画面或循环播放
      console.log('对话结束，重新开始');
      this.currentIndex = 0;
      this.showDialog(0);
      return;
    }

    // 更新当前对话索引 - 非常重要
    this.currentIndex = index;

    const dialog = this.dialogData[index];
    if (!dialog) {
      console.error('对话数据不存在:', index);
      return;
    }

    // 检查是否需要背景转场 - 比较当前背景与目标背景
    const newBgPath = dialog.background || '';
    const needBackgroundTransition = newBgPath && this.currentBgPath !== newBgPath;

    console.log(
      `显示对话 #${index}`,
      dialog.name,
      '当前背景:',
      this.currentBgPath || '(无)',
      '新背景:',
      newBgPath || '(无)',
      '需要转场:',
      needBackgroundTransition,
    );

    // 如果需要背景转场，先执行背景转场
    if (needBackgroundTransition) {
      console.log('执行背景转场 - 从', this.currentBgPath || '(无)', '到', newBgPath);

      // 修复：检查是否切换到CG（没有角色的情况），如果是，先隐藏所有当前角色
      if (dialog.characters === 'narrator' || dialog.characters === 'protagonist' || !dialog.characters) {
        // 先移除所有当前角色，再进行背景转场
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        // 清空活动角色记录
        this.activeCharacters = {};
      }

      // 更新当前背景记录
      this.currentBgPath = newBgPath;

      this.fadeOutIn(() => {
        return newBgPath;
      }, dialog); // 传递当前对话以便在转场完成后更新
    } else {
      // 否则直接更新角色和对话
      this.updateDialogContent(dialog);
    }
  }

  // 更新对话内容
  updateDialogContent(dialog) {
    if (!dialog) {
      console.error('更新对话内容失败: 对话数据为空');
      return;
    }

    console.log('更新对话内容:', dialog.name, dialog.text);

    // 更新角色立绘
    this.updateCharacters(dialog);

    // 应用打字机效果
    this.characterName.textContent = dialog.name;
    this.applyTypingEffect(dialog.text);

    // 添加到对话历史
    this.addToHistory(dialog);
  }

  applyTypingEffect(text) {
    this.isAnimating = true;
    this.dialogText.textContent = '';
    document.getElementById('next-hint').style.opacity = '0'; // 隐藏提示

    // 计算打字速度 - 根据文本长度动态调整
    const baseSpeed = 30;
    const speedModifier = Math.max(0.5, Math.min(1.5, 300 / text.length));
    const speed = Math.floor(baseSpeed * speedModifier);

    let i = 0;
    // --- 修改点：移除了 lastPunctuation 变量 ---
    // let lastPunctuation = 0; // 上一个标点符号的位置
    // --- 修改结束 ---

    const typeWriter = () => {
      if (i < text.length && this.isAnimating) {
        const char = text.charAt(i);
        this.dialogText.textContent += char;
        i++;

        // --- 修改点：移除了标点符号的特殊停顿判断 ---
        // 不再检查是否为标点符号，统一使用计算出的 speed
        setTimeout(typeWriter, speed);
        // --- 修改结束 ---

        // --- 移除的代码块 ---
        // const isPunctuation = /[，。？！、：；]/.test(char);
        // if (isPunctuation) {
        //   lastPunctuation = i;
        //   setTimeout(typeWriter, speed * 5); // 标点符号后停顿更长时间
        // } else if (i - lastPunctuation <= 2) {
        //   // 标点符号后的前两个字符也稍微慢一点
        //   setTimeout(typeWriter, speed * 1.5);
        // } else {
        //   setTimeout(typeWriter, speed);
        // }
        // --- 移除结束 ---
      } else {
        this.isAnimating = false;
        document.getElementById('next-hint').style.opacity = '1'; // 显示提示
      }
    };

    // 开始打字效果
    typeWriter();
  }

  // 更新角色立绘显示
  updateCharacters(dialog) {
    // 转场中不更新角色显示，避免冲突
    if (this.isTransitioning) {
      console.log('正在转场中，延迟更新角色显示');
      return;
    }

    // 记录新的角色显示状态
    const newActiveCharacters = {};

    // 处理特殊视角模式
    document.body.classList.remove('narrator-mode', 'protagonist-mode');

    // 处理角色立绘配置
    if (dialog.characters) {
      // 旁白模式
      if (dialog.characters === 'narrator') {
        document.body.classList.add('narrator-mode');
        // 旁白模式下清空所有角色
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        this.activeCharacters = {};
        return;
      }
      // 主角视角模式
      else if (dialog.characters === 'protagonist') {
        document.body.classList.add('protagonist-mode');
        // 主角视角下清空所有角色
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        this.activeCharacters = {};
        return;
      }
      // 单个居中角色（新格式）
      else if (
        typeof dialog.characters === 'object' &&
        dialog.characters.id &&
        !dialog.characters.left &&
        !dialog.characters.right
      ) {
        const characterId = dialog.characters.id;
        const expression = dialog.characters.expression || '默认.png';
        const costume = dialog.characters.costume || '水手服'; // 默认使用水手服

        newActiveCharacters[characterId] = {
          position: 'center',
          expression: expression,
          costume: costume, // 记录服装信息
        };

        this.showCharacter(characterId, 'center', dialog.name === characterId, expression, costume);
      }
      // 左右两个角色（新格式）
      else if (typeof dialog.characters === 'object') {
        // 如果只有一个角色，则居中显示
        const hasLeftChar = !!dialog.characters.left;
        const hasRightChar = !!dialog.characters.right;

        if (hasLeftChar && !hasRightChar) {
          // 只有左边角色，居中显示
          const characterId = dialog.characters.left.id;
          const expression = dialog.characters.left.expression || '默认.png';
          const costume = dialog.characters.left.costume || '水手服'; // 默认使用水手服

          newActiveCharacters[characterId] = {
            position: 'center',
            expression: expression,
            costume: costume,
          };

          this.showCharacter(characterId, 'center', dialog.name === characterId, expression, costume);
        } else if (!hasLeftChar && hasRightChar) {
          // 只有右边角色，居中显示
          const characterId = dialog.characters.right.id;
          const expression = dialog.characters.right.expression || '默认.png';
          const costume = dialog.characters.right.costume || '水手服'; // 默认使用水手服

          newActiveCharacters[characterId] = {
            position: 'center',
            expression: expression,
            costume: costume,
          };

          this.showCharacter(characterId, 'center', dialog.name === characterId, expression, costume);
        } else {
          // 两个角色都有，左右显示
          if (dialog.characters.left && dialog.characters.left.id) {
            const characterId = dialog.characters.left.id;
            const expression = dialog.characters.left.expression || '默认.png';
            const costume = dialog.characters.left.costume || '水手服'; // 默认使用水手服

            newActiveCharacters[characterId] = {
              position: 'left',
              expression: expression,
              costume: costume,
            };

            this.showCharacter(characterId, 'left', dialog.name === characterId, expression, costume);
          }

          if (dialog.characters.right && dialog.characters.right.id) {
            const characterId = dialog.characters.right.id;
            const expression = dialog.characters.right.expression || '默认.png';
            const costume = dialog.characters.right.costume || '水手服'; // 默认使用水手服

            newActiveCharacters[characterId] = {
              position: 'right',
              expression: expression,
              costume: costume,
            };

            this.showCharacter(characterId, 'right', dialog.name === characterId, expression, costume);
          }
        }
      }
    } else {
      // 没有角色配置时，隐藏所有角色
      for (const characterId in this.activeCharacters) {
        this.hideCharacter(characterId);
      }
      this.activeCharacters = {};
      return;
    }

    // 移除不在新配置中的角色
    for (const characterId in this.activeCharacters) {
      if (!newActiveCharacters[characterId]) {
        this.hideCharacter(characterId);
      }
    }

    // 更新活动角色列表
    this.activeCharacters = newActiveCharacters;
  }

  // 显示角色立绘
  showCharacter(characterId, position, isSpeaking, expression = '默认', costume = '水手服') {
    // 转场中不更新角色显示，避免冲突
    if (this.isTransitioning) {
      console.log('正在转场中，跳过显示角色:', characterId);
      return;
    }

    // 获取角色的服装和表情立绘URL
    if (!this.characterSprites[characterId]) return;

    // 指定角色的服装，如果不存在则使用默认服装
    const characterCostumes = this.characterSprites[characterId];
    let costumeToUse = costume;

    // 如果指定的服装不存在，则使用第一个可用的服装
    if (!characterCostumes[costumeToUse]) {
      costumeToUse = Object.keys(characterCostumes)[0];
    }

    // 获取指定服装下的表情
    const costumeExpressions = characterCostumes[costumeToUse];

    // 如果指定的表情不存在，则使用默认表情
    let expressionToUse = expression;
    if (!costumeExpressions[expressionToUse]) {
      expressionToUse = Object.keys(costumeExpressions)[0] || '默认.png';
    }

    const spriteUrl = costumeExpressions[expressionToUse];

    // 如果没有找到有效的立绘URL，则退出
    if (!spriteUrl) return;

    // 获取角色ID和表情的组合ID
    const characterElementId = `character-${characterId}`;
    const oldPosition = this.activeCharacters[characterId]?.position;

    // 检查角色立绘是否已存在
    let characterElement = document.getElementById(characterElementId);

    // 如果不存在则创建新的立绘元素
    if (!characterElement) {
      characterElement = document.createElement('img');
      characterElement.id = characterElementId;
      characterElement.className = 'character-sprite character-enter';
      characterElement.src = spriteUrl;
      characterElement.dataset.expression = expressionToUse;
      characterElement.dataset.position = position;
      characterElement.alt = `${characterId}的立绘`;

      // 过渡前准备 - 如果是从一侧切换到另一侧，先使用原来的位置
      if (oldPosition && oldPosition !== position) {
        characterElement.classList.add(`character-${oldPosition}`);
      } else {
        characterElement.classList.add(`character-${position}`);
      }

      this.characterContainer.appendChild(characterElement);

      // 图片加载完成后添加激活类
      setTimeout(() => {
        // 再次检查是否在转场中，如果是则不显示
        if (this.isTransitioning) {
          if (characterElement && characterElement.parentNode) {
            characterElement.parentNode.removeChild(characterElement);
          }
          return;
        }

        characterElement.classList.remove('character-enter');
        characterElement.classList.add('character-active');

        // 如果位置改变，延迟后更新位置
        if (oldPosition && oldPosition !== position) {
          setTimeout(() => {
            characterElement.classList.remove(`character-${oldPosition}`);
            characterElement.classList.add(`character-${position}`);
            characterElement.dataset.position = position;
          }, 50);
        }

        // 单人居中显示时的特殊处理
        this.applyPositionStyle(characterElement, position);
      }, 50);
    }
    // 如果已存在但表情或位置不同
    else {
      // 表情变化
      if (characterElement.dataset.expression !== expressionToUse) {
        characterElement.src = spriteUrl;
        characterElement.dataset.expression = expressionToUse;
      }

      // 位置变化
      if (characterElement.dataset.position !== position) {
        // 使用过渡动画平滑切换位置
        setTimeout(() => {
          // 再次检查是否在转场中
          if (this.isTransitioning) return;

          characterElement.classList.remove(`character-${characterElement.dataset.position}`);
          characterElement.classList.add(`character-${position}`);
          characterElement.dataset.position = position;

          // 更新定位样式
          this.applyPositionStyle(characterElement, position);
        }, 50);
      }
    }

    // 应用说话/不说话状态 - 只用滤镜区分，不用透明度
    if (isSpeaking) {
      characterElement.classList.add('character-speaking');
      characterElement.classList.remove('character-dimmed');
      characterElement.style.opacity = '1'; // 确保完全不透明
      characterElement.style.zIndex = '10'; // 确保说话角色在前面
    } else {
      characterElement.classList.remove('character-speaking');
      characterElement.classList.add('character-dimmed');
      characterElement.style.opacity = '1'; // 确保完全不透明
      characterElement.style.zIndex = '5'; // 非说话角色在后面
    }
  }

  // 应用位置样式的辅助函数
  applyPositionStyle(element, position) {
    // 单人居中显示时的特殊处理
    if (position === 'center') {
      // 确保完全居中且底部不露出背景
      element.style.left = '50%';
      element.style.right = 'auto';
      element.style.transform = 'translateX(-50%)';
      element.style.bottom = '0';
      element.style.height = '98%';
      element.style.maxHeight = '98%';
    } else if (position === 'left') {
      // 左侧定位 - 调整为更靠近中心
      element.style.left = '30%';
      element.style.right = 'auto';
      element.style.transform = 'translateX(-50%)';
      element.style.bottom = '0';
      element.style.height = '95%';
      element.style.maxHeight = '95%';
    } else if (position === 'right') {
      // 右侧定位 - 调整为更靠近中心
      element.style.right = '30%';
      element.style.left = 'auto';
      element.style.transform = 'translateX(50%)';
      element.style.bottom = '0';
      element.style.height = '95%';
      element.style.maxHeight = '95%';
    }
  }

  // 隐藏角色立绘
  hideCharacter(characterId) {
    const characterElement = document.getElementById(`character-${characterId}`);
    if (characterElement) {
      // 防止重复触发淡出动画
      if (characterElement.classList.contains('character-exit')) return;

      characterElement.classList.add('character-exit');
      characterElement.classList.remove('character-active', 'character-speaking');

      // 动画结束后移除元素
      setTimeout(() => {
        if (characterElement && characterElement.parentNode) {
          characterElement.parentNode.removeChild(characterElement);
        }
      }, 800); // 增加延迟以配合CSS过渡时间
    }
  }

  nextDialog() {
    // 如果正在动画中，则跳过打字效果直接显示全部文本
    if (this.isAnimating) {
      this.isAnimating = false;
      const currentDialog = this.dialogData[this.currentIndex];
      this.dialogText.textContent = currentDialog.text;
      document.getElementById('next-hint').style.opacity = '1'; // 显示提示
      return;
    }

    // 增加对话索引
    this.currentIndex++;

    // --- 修改点：检查是否超出对话数据范围 ---
    if (this.currentIndex >= this.dialogData.length) {
      console.log('对话已全部播放完毕。');
      // 将索引退回到最后一条，防止后续可能的错误引用
      this.currentIndex = this.dialogData.length - 1;

      // 可选：隐藏"下一步"提示，明确告知用户对话结束
      const nextHint = document.getElementById('next-hint');
      if (nextHint) {
        nextHint.style.display = 'none';
      }

      // 显示重新播放按钮
      const restartBtn = document.getElementById('restart-btn');
      if (restartBtn) {
        restartBtn.style.display = 'block';
      }

      // 阻止进一步的操作，不再调用 showDialog
      return;
    }
    // --- 修改结束 ---

    // 如果索引有效，则显示下一条对话
    this.showDialog(this.currentIndex);
  }

  // 重新开始对话播放
  restartDialog() {
    console.log('重新开始对话播放');

    // 重置索引
    this.currentIndex = 0;

    // 重置角色立绘
    for (const characterId in this.activeCharacters) {
      this.hideCharacter(characterId);
    }
    this.activeCharacters = {};

    // 重置背景到初始状态
    if (this.dialogData && this.dialogData.length > 0 && this.dialogData[0].background) {
      this.currentBgPath = this.dialogData[0].background;
      const initialBgUrl = this.getFullImageUrl(this.currentBgPath);
      this.currentImage.src = initialBgUrl;
    }

    // 重置对话界面状态
    const nextHint = document.getElementById('next-hint');
    if (nextHint) {
      nextHint.style.display = 'block';
      nextHint.style.opacity = '1';
    }

    // 隐藏重新播放按钮
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.style.display = 'none';
    }

    // 显示第一条对话
    this.showDialog(0);
  }

  fadeOutIn(callback, dialogToUpdate) {
    // 如果已经在转场，则忽略
    if (this.isTransitioning) {
      console.log('已在转场中，忽略新的转场请求');
      return;
    }

    this.isTransitioning = true;
    console.log('开始背景转场');

    // 获取下一张图片的URL
    const relativeImagePath = callback(); // 获取 JSON 中定义的相对路径 (例如 "教室/白天.jpg")
    if (!relativeImagePath) {
      console.log('背景路径为空，跳过转场');
      this.isTransitioning = false;
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
      return;
    }

    let nextImageUrl = this.getFullImageUrl(relativeImagePath);
    console.log('切换背景图片:', relativeImagePath, '->', nextImageUrl);

    // 如果URL获取失败或与当前图片相同，则不执行转场
    if (!nextImageUrl || nextImageUrl === this.currentImage.src) {
      console.log('跳过背景转场: URL为空或相同');
      this.isTransitioning = false;
      // 即使没有转场，也要更新对话内容
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
      return;
    }

    // 执行转场动画
    const executeTransition = () => {
      console.log('执行背景转场动画');
      // 添加转场动画类
      document.body.classList.add('transitioning');

      // 淡入下一张图片
      this.nextImage.style.opacity = '1';

      // 转场完成后的处理
      setTimeout(() => {
        // 将下一张图片的URL复制到当前图片
        this.currentImage.src = this.nextImage.src;
        console.log('背景转场完成，当前背景:', this.currentImage.src);
        // 重置下一张图片的不透明度
        this.nextImage.style.opacity = '0';
        // 移除转场动画类
        document.body.classList.remove('transitioning');
        // 重置转场状态
        this.isTransitioning = false;

        // 转场完成后更新对话内容
        if (dialogToUpdate) {
          console.log('转场完成，更新对话内容:', dialogToUpdate.name);
          // 修复：确保转场完全结束后再更新对话内容和角色
          setTimeout(() => {
            this.updateDialogContent(dialogToUpdate);
          }, 50);
        }
      }, 1200); // 与CSS过渡时间匹配
    };

    // 设置下一张图片的URL
    this.nextImage.src = nextImageUrl;

    // 添加错误处理
    this.nextImage.onerror = () => {
      console.error('背景图片加载失败:', nextImageUrl);
      this.isTransitioning = false;
      // 即使加载失败，也要尝试更新对话内容
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
    };

    this.nextImage.onload = () => {
      console.log('背景图片加载完成');
      executeTransition();
    };
  }

  // 添加对话到历史记录
  addToHistory(dialog) {
    // 检查是否已经存在相同的对话（避免重复添加）
    const isDuplicate = this.dialogHistory.some(item => item.name === dialog.name && item.text === dialog.text);

    if (!isDuplicate) {
      this.dialogHistory.push({
        name: dialog.name,
        text: dialog.text,
        background: dialog.background || '',
      });

      // 更新历史面板内容
      this.updateHistoryPanel();
    }
  }

  // 更新历史面板内容
  updateHistoryPanel() {
    // 清空当前内容
    this.historyContent.innerHTML = '';

    // 如果没有历史记录，显示提示信息
    if (this.dialogHistory.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = '暂无对话历史';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#7D5B65';
      emptyMsg.style.padding = '20px';
      this.historyContent.appendChild(emptyMsg);
      return;
    }

    // 为每条历史记录创建元素
    this.dialogHistory.forEach((dialog, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.style.marginBottom = '15px';
      historyItem.style.padding = '15px';
      historyItem.style.borderRadius = '12px';
      historyItem.style.background = 'rgba(255, 255, 255, 0.5)';
      historyItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.7) inset';
      historyItem.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

      // 鼠标悬停效果
      historyItem.onmouseover = function () {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset';
      };

      historyItem.onmouseout = function () {
        this.style.transform = 'none';
        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.7) inset';
      };

      // 如果有角色名，则显示
      if (dialog.name && dialog.name !== '旁白') {
        const nameElem = document.createElement('div');
        nameElem.className = 'history-name';
        nameElem.textContent = dialog.name;
        nameElem.style.fontWeight = 'bold';
        nameElem.style.color = '#C18E98';
        nameElem.style.marginBottom = '8px';
        nameElem.style.position = 'relative';
        nameElem.style.paddingLeft = '15px';

        // 添加装饰元素
        const decorElem = document.createElement('span');
        decorElem.textContent = '❀';
        decorElem.style.position = 'absolute';
        decorElem.style.left = '0';
        decorElem.style.top = '50%';
        decorElem.style.transform = 'translateY(-50%)';
        decorElem.style.color = '#FFB0C0';
        decorElem.style.fontSize = '12px';

        nameElem.appendChild(decorElem);
        historyItem.appendChild(nameElem);
      } else if (dialog.name === '旁白') {
        // 旁白样式特殊处理
        historyItem.style.fontStyle = 'italic';
        historyItem.style.background = 'rgba(245, 235, 235, 0.7)';
        historyItem.style.borderLeft = '3px solid #FFCAD5';
      }

      // 添加对话文本
      const textElem = document.createElement('div');
      textElem.className = 'history-text';
      textElem.textContent = dialog.text;
      textElem.style.color = '#4D2B35';
      textElem.style.lineHeight = '1.5';
      textElem.style.letterSpacing = '0.3px';
      historyItem.appendChild(textElem);

      // 添加到历史内容区
      this.historyContent.appendChild(historyItem);
    });

    // 滚动到底部
    setTimeout(() => {
      this.historyContent.scrollTop = this.historyContent.scrollHeight;
    }, 100);
  }

  // 显示/隐藏历史面板
  toggleHistoryPanel(show) {
    if (show) {
      this.updateHistoryPanel();
      this.historyPanel.style.display = 'block';

      // 添加淡入动画效果
      this.historyPanel.style.opacity = '0';
      this.historyPanel.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        this.historyPanel.style.opacity = '1';
      }, 10);
    } else {
      // 淡出动画效果
      this.historyPanel.style.opacity = '0';
      setTimeout(() => {
        this.historyPanel.style.display = 'none';
      }, 300);
    }
  }
}

// 当页面加载完成后初始化游戏引擎
$(() => {
  const engine = new GalgameEngine();

  // 处理UI显示/隐藏功能
  function initToggleUIButton() {
    const toggleBtn = document.getElementById('toggle-ui-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // 防止点击事件触发对话推进
        document.body.classList.toggle('ui-hidden');

        // 更新按钮文本
        if (document.body.classList.contains('ui-hidden')) {
          toggleBtn.textContent = '💬';
          toggleBtn.title = '显示界面';

          // 在UI隐藏模式下取消角色立绘的高亮/淡化效果
          const characterElements = document.querySelectorAll('.character-sprite');
          characterElements.forEach(element => {
            element.classList.remove('character-speaking', 'character-dimmed');
          });
        } else {
          toggleBtn.textContent = '💭';
          toggleBtn.title = '隐藏界面';

          // 恢复当前对话的角色状态
          engine.updateCharacters(engine.dialogData[engine.currentIndex]);
        }
      });

      // 设置初始状态
      toggleBtn.textContent = '💭';
      toggleBtn.title = '隐藏界面';
    }
  }

  // 初始化UI切换按钮
  initToggleUIButton();

  // 初始化历史对话按钮
  const historyBtn = document.getElementById('history-btn');
  const closeHistoryBtn = document.getElementById('close-history');

  if (historyBtn && closeHistoryBtn) {
    // 打开历史面板
    historyBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // 防止点击事件触发对话推进
      engine.toggleHistoryPanel(true);
    });

    // 关闭历史面板
    closeHistoryBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // 防止点击事件触发对话推进
      engine.toggleHistoryPanel(false);
    });

    // 点击历史面板内部不触发对话推进
    document.getElementById('history-panel').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // ESC键关闭历史面板
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && engine.historyPanel.style.display === 'block') {
        engine.toggleHistoryPanel(false);
      }
    });
  }

  // 初始化重新播放按钮
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // 防止点击事件触发对话推进
      engine.restartDialog();
    });

    // 设置按钮标题
    restartBtn.title = '重新开始';
  }
});
