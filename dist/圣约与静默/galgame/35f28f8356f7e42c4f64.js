import "./index.scss";

class GalgameEngine {
  constructor() {
    this.currentIndex = 0;
    this.isAnimating = false;
    this.activeCharacters = {};
    this.isTransitioning = false;
    this.currentBgPath = "";
    this.dialogHistory = [];
    this.dialogBox = document.getElementById("dialog-box");
    this.characterName = document.getElementById("character-name");
    this.dialogText = document.getElementById("dialog-text");
    this.currentImage = document.getElementById("background-image-current");
    this.nextImage = document.getElementById("background-image-next");
    this.characterContainer = document.getElementById("character-container");
    this.historyPanel = document.getElementById("history-panel");
    this.historyContent = document.getElementById("history-content");
    const cgUrls = [ "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg", "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E5%A4%9C%E6%99%9A%E5%BC%80%E7%81%AF.jpg" ];
    this.imageBaseUrl = "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/背景/";
    this.characterSpritesBaseUrl = "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/";
    const characterSprites = {
      络络: {
        水手服: {
          "微笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/微笑.png",
          "浅笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/浅笑.png",
          "生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/生气.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/惊讶.png",
          "害羞.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/害羞.png",
          "稍微脸红.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/稍微脸红.png",
          "手托下巴思考.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/手托下巴思考.png",
          "看透一切的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/看透一切的坏笑.png",
          "邪恶的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/邪恶的坏笑.png",
          "星星眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/星星眼.png",
          "晕晕眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/晕晕眼.png",
          "猫爪生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/猫爪生气.png",
          "流口水.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/流口水.png",
          "哭泣.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/哭泣.png",
          "擦眼泪.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/擦眼泪.png",
          "等待吻.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/等待吻.png",
          "性高潮.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/性高潮.png",
          "眼神空洞的催眠状态.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/眼神空洞的催眠状态.png",
          "无表情.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/无表情.png",
          "无人.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/水手服/无人.png"
        },
        格纹衫: {
          "微笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/微笑.png",
          "浅笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/浅笑.png",
          "生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/生气.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/惊讶.png",
          "害羞.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/害羞.png",
          "稍微脸红.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/稍微脸红.png",
          "手托下巴思考.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/手托下巴思考.png",
          "看透一切的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/看透一切的坏笑.png",
          "邪恶的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/邪恶的坏笑.png",
          "星星眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/星星眼.png",
          "晕晕眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/晕晕眼.png",
          "猫爪生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/猫爪生气.png",
          "流口水.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/流口水.png",
          "哭泣.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/哭泣.png",
          "擦眼泪.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/擦眼泪.png",
          "等待吻.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/等待吻.png",
          "性高潮.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/性高潮.png",
          "眼神空洞的催眠状态.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/眼神空洞的催眠状态.png",
          "无人.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/格纹衫/无人.png"
        },
        开衫: {
          "微笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/微笑.png",
          "浅笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/浅笑.png",
          "生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/生气.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/惊讶.png",
          "害羞.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/害羞.png",
          "稍微脸红.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/稍微脸红.png",
          "手托下巴思考.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/手托下巴思考.png",
          "看透一切的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/看透一切的坏笑.png",
          "邪恶的笑容.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/邪恶的笑容.png",
          "星星眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/星星眼.png",
          "晕晕眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/晕晕眼.png",
          "猫爪生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/猫爪生气.png",
          "流口水.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/流口水.png",
          "哭泣.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/哭泣.png",
          "擦眼泪.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/擦眼泪.png",
          "等待吻.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/等待吻.png",
          "性高潮.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/性高潮.png",
          "无表情.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/无表情.png",
          "无人.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/开衫/无人.png"
        },
        睡衣: {
          "微笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/微笑.png",
          "浅笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/浅笑.png",
          "生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/生气.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/惊讶.png",
          "害羞.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/害羞.png",
          "稍微脸红.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/稍微脸红.png",
          "看透一切的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/看透一切的坏笑.png",
          "邪恶的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/邪恶的坏笑.png",
          "星星眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/星星眼.png",
          "晕晕眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/晕晕眼.png",
          "猫爪生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/猫爪生气.png",
          "流口水.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/流口水.png",
          "哭泣.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/哭泣.png",
          "等待吻.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/等待吻.png",
          "性高潮.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/性高潮.png",
          "眼神空洞的催眠状态.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/眼神空洞的催眠状态.png",
          "无人.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/睡衣/无人.png"
        },
        全裸: {
          "浅笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸浅笑.png",
          "生气.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸生气.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸惊讶.png",
          "害羞.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸害羞.png",
          "稍微脸红.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸微微害羞.png",
          "看透一切的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸得意脸smug.png",
          "邪恶的坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸邪恶的笑容.png",
          "坏笑.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸坏笑.png",
          "星星眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸闪耀眼.png",
          "晕晕眼.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸晕眼@_@.png",
          "流口水.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸看到食物馋到流口水.png",
          "哭泣.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸哭泣.png",
          "等待吻.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸等待接吻.png",
          "性高潮.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸色情高潮啊嘿颜.png",
          "眼神空洞的催眠状态.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/全裸被催眠双眼无神留口水.png",
          "无人.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/角色/全裸/无人.png"
        }
      },
      你: {
        默认: {
          "默认.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E7%AD%89%E5%BE%85%E5%90%BB.png",
          "惊讶.png": "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%A7%92%E8%89%B2/%E6%B0%B4%E6%89%8B%E6%9C%8D/%E5%93%AD%E6%B3%A3.png"
        }
      }
    };
    try {
      const message = SillyTavern.chat[getCurrentMessageId()].mes;
      const gameDataString = message.match(/<Galgame>\s*```(?:json|yaml)?(.*)```\s*<\/Galgame>/s)[1];
      if (!gameDataString) {
        throw new Error("游戏数据 <Galgame> 为空。");
      }
      let parsedData = null;
      try {
        parsedData = JSON.parse(gameDataString);
        console.log("游戏数据加载成功 (JSON 格式)");
      } catch (jsonError) {
        console.warn("JSON 解析失败，尝试解析为 YAML:", jsonError.message);
        try {
          parsedData = YAML.parse(gameDataString);
        } catch (yamlError) {
          console.error("YAML 解析也失败:", yamlError);
          throw new Error(`数据解析失败：既不是有效的 JSON 也不是有效的 YAML。JSON 错误: ${jsonError.message} | YAML 错误: ${yamlError.message}`);
        }
      }
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.warn("加载的对话数据为空或格式无效 (预期为非空数组)，将加载默认提示信息。");
        this.dialogData = [ {
          name: "系统提示",
          text: "加载的对话数据为空或格式无效。",
          characters: "narrator"
        } ];
      } else {
        this.dialogData = parsedData;
        console.log("最终使用的游戏数据:", this.dialogData);
      }
    } catch (error) {
      console.error("加载或解析游戏数据时出错:", error);
      this.dialogData = [ {
        name: "系统提示",
        text: `加载对话数据失败：${error.message}`,
        characters: "narrator"
      } ];
    }
    this.characterSprites = characterSprites;
    this.initEventListeners();
    this.initializeBackground();
    this.showDialog(0);
  }
  initializeBackground() {
    if (this.dialogData && this.dialogData.length > 0 && this.dialogData[0].background) {
      const initialBgPath = this.dialogData[0].background;
      const initialBgUrl = this.getFullImageUrl(initialBgPath);
      console.log("初始化背景图片:", initialBgUrl);
      if (!this.currentImage) {
        console.error("背景图片元素不存在!");
        return;
      }
      this.currentBgPath = initialBgPath;
      this.currentImage.src = initialBgUrl;
      this.currentImage.style.opacity = "1";
      this.currentImage.onerror = () => {
        console.error("背景图片加载失败:", initialBgUrl);
        this.currentImage.src = "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg";
      };
      if (this.currentImage.complete) {
        console.log("背景图片已加载完成");
      } else {
        this.currentImage.onload = () => {
          console.log("背景图片加载完成");
        };
      }
    }
  }
  getFullImageUrl(relativePath) {
    if (!relativePath) return "";
    if (relativePath === "商店街/黄昏.jpg") {
      return "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E9%BB%84%E6%98%8F.jpg";
    } else if (relativePath === "商店街/夜晚开灯.jpg") {
      return "https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E8%83%8C%E6%99%AF/%E5%95%86%E5%BA%97%E8%A1%97/%E5%A4%9C%E6%99%9A%E5%BC%80%E7%81%AF.jpg";
    }
    try {
      const pathParts = relativePath.split("/");
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      const encodedPath = encodedParts.join("/");
      return this.imageBaseUrl + encodedPath;
    } catch (error) {
      console.error("URL编码失败:", error, "原始路径:", relativePath);
      return "";
    }
  }
  initEventListeners() {
    document.addEventListener("click", () => {
      this.nextDialog();
    });
    document.addEventListener("keydown", event => {
      if (event.code === "Space") {
        event.preventDefault();
        this.nextDialog();
      }
    });
  }
  showDialog(index) {
    if (index >= this.dialogData.length) {
      console.log("对话结束，重新开始");
      this.currentIndex = 0;
      this.showDialog(0);
      return;
    }
    this.currentIndex = index;
    const dialog = this.dialogData[index];
    if (!dialog) {
      console.error("对话数据不存在:", index);
      return;
    }
    const newBgPath = dialog.background || "";
    const needBackgroundTransition = newBgPath && this.currentBgPath !== newBgPath;
    console.log(`显示对话 #${index}`, dialog.name, "当前背景:", this.currentBgPath || "(无)", "新背景:", newBgPath || "(无)", "需要转场:", needBackgroundTransition);
    if (needBackgroundTransition) {
      console.log("执行背景转场 - 从", this.currentBgPath || "(无)", "到", newBgPath);
      if (dialog.characters === "narrator" || dialog.characters === "protagonist" || !dialog.characters) {
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        this.activeCharacters = {};
      }
      this.currentBgPath = newBgPath;
      this.fadeOutIn(() => newBgPath, dialog);
    } else {
      this.updateDialogContent(dialog);
    }
  }
  updateDialogContent(dialog) {
    if (!dialog) {
      console.error("更新对话内容失败: 对话数据为空");
      return;
    }
    console.log("更新对话内容:", dialog.name, dialog.text);
    this.updateCharacters(dialog);
    this.characterName.textContent = dialog.name;
    this.applyTypingEffect(dialog.text);
    this.addToHistory(dialog);
  }
  applyTypingEffect(text) {
    this.isAnimating = true;
    this.dialogText.textContent = "";
    document.getElementById("next-hint").style.opacity = "0";
    const baseSpeed = 30;
    const speedModifier = Math.max(.5, Math.min(1.5, 300 / text.length));
    const speed = Math.floor(baseSpeed * speedModifier);
    let i = 0;
    const typeWriter = () => {
      if (i < text.length && this.isAnimating) {
        const char = text.charAt(i);
        this.dialogText.textContent += char;
        i++;
        setTimeout(typeWriter, speed);
      } else {
        this.isAnimating = false;
        document.getElementById("next-hint").style.opacity = "1";
      }
    };
    typeWriter();
  }
  updateCharacters(dialog) {
    if (this.isTransitioning) {
      console.log("正在转场中，延迟更新角色显示");
      return;
    }
    const newActiveCharacters = {};
    document.body.classList.remove("narrator-mode", "protagonist-mode");
    if (dialog.characters) {
      if (dialog.characters === "narrator") {
        document.body.classList.add("narrator-mode");
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        this.activeCharacters = {};
        return;
      } else if (dialog.characters === "protagonist") {
        document.body.classList.add("protagonist-mode");
        for (const characterId in this.activeCharacters) {
          this.hideCharacter(characterId);
        }
        this.activeCharacters = {};
        return;
      } else if (typeof dialog.characters === "object" && dialog.characters.id && !dialog.characters.left && !dialog.characters.right) {
        const characterId = dialog.characters.id;
        const expression = dialog.characters.expression || "默认.png";
        const costume = dialog.characters.costume || "水手服";
        newActiveCharacters[characterId] = {
          position: "center",
          expression,
          costume
        };
        this.showCharacter(characterId, "center", dialog.name === characterId, expression, costume);
      } else if (typeof dialog.characters === "object") {
        const hasLeftChar = !!dialog.characters.left;
        const hasRightChar = !!dialog.characters.right;
        if (hasLeftChar && !hasRightChar) {
          const characterId = dialog.characters.left.id;
          const expression = dialog.characters.left.expression || "默认.png";
          const costume = dialog.characters.left.costume || "水手服";
          newActiveCharacters[characterId] = {
            position: "center",
            expression,
            costume
          };
          this.showCharacter(characterId, "center", dialog.name === characterId, expression, costume);
        } else if (!hasLeftChar && hasRightChar) {
          const characterId = dialog.characters.right.id;
          const expression = dialog.characters.right.expression || "默认.png";
          const costume = dialog.characters.right.costume || "水手服";
          newActiveCharacters[characterId] = {
            position: "center",
            expression,
            costume
          };
          this.showCharacter(characterId, "center", dialog.name === characterId, expression, costume);
        } else {
          if (dialog.characters.left && dialog.characters.left.id) {
            const characterId = dialog.characters.left.id;
            const expression = dialog.characters.left.expression || "默认.png";
            const costume = dialog.characters.left.costume || "水手服";
            newActiveCharacters[characterId] = {
              position: "left",
              expression,
              costume
            };
            this.showCharacter(characterId, "left", dialog.name === characterId, expression, costume);
          }
          if (dialog.characters.right && dialog.characters.right.id) {
            const characterId = dialog.characters.right.id;
            const expression = dialog.characters.right.expression || "默认.png";
            const costume = dialog.characters.right.costume || "水手服";
            newActiveCharacters[characterId] = {
              position: "right",
              expression,
              costume
            };
            this.showCharacter(characterId, "right", dialog.name === characterId, expression, costume);
          }
        }
      }
    } else {
      for (const characterId in this.activeCharacters) {
        this.hideCharacter(characterId);
      }
      this.activeCharacters = {};
      return;
    }
    for (const characterId in this.activeCharacters) {
      if (!newActiveCharacters[characterId]) {
        this.hideCharacter(characterId);
      }
    }
    this.activeCharacters = newActiveCharacters;
  }
  showCharacter(characterId, position, isSpeaking, expression = "默认", costume = "水手服") {
    if (this.isTransitioning) {
      console.log("正在转场中，跳过显示角色:", characterId);
      return;
    }
    if (!this.characterSprites[characterId]) return;
    const characterCostumes = this.characterSprites[characterId];
    let costumeToUse = costume;
    if (!characterCostumes[costumeToUse]) {
      costumeToUse = Object.keys(characterCostumes)[0];
    }
    const costumeExpressions = characterCostumes[costumeToUse];
    let expressionToUse = expression;
    if (!costumeExpressions[expressionToUse]) {
      expressionToUse = Object.keys(costumeExpressions)[0] || "默认.png";
    }
    const spriteUrl = costumeExpressions[expressionToUse];
    if (!spriteUrl) return;
    const characterElementId = `character-${characterId}`;
    const oldPosition = this.activeCharacters[characterId]?.position;
    let characterElement = document.getElementById(characterElementId);
    if (!characterElement) {
      characterElement = document.createElement("img");
      characterElement.id = characterElementId;
      characterElement.className = "character-sprite character-enter";
      characterElement.src = spriteUrl;
      characterElement.dataset.expression = expressionToUse;
      characterElement.dataset.position = position;
      characterElement.alt = `${characterId}的立绘`;
      if (oldPosition && oldPosition !== position) {
        characterElement.classList.add(`character-${oldPosition}`);
      } else {
        characterElement.classList.add(`character-${position}`);
      }
      this.characterContainer.appendChild(characterElement);
      setTimeout(() => {
        if (this.isTransitioning) {
          if (characterElement && characterElement.parentNode) {
            characterElement.parentNode.removeChild(characterElement);
          }
          return;
        }
        characterElement.classList.remove("character-enter");
        characterElement.classList.add("character-active");
        if (oldPosition && oldPosition !== position) {
          setTimeout(() => {
            characterElement.classList.remove(`character-${oldPosition}`);
            characterElement.classList.add(`character-${position}`);
            characterElement.dataset.position = position;
          }, 50);
        }
        this.applyPositionStyle(characterElement, position);
      }, 50);
    } else {
      if (characterElement.dataset.expression !== expressionToUse) {
        characterElement.src = spriteUrl;
        characterElement.dataset.expression = expressionToUse;
      }
      if (characterElement.dataset.position !== position) {
        setTimeout(() => {
          if (this.isTransitioning) return;
          characterElement.classList.remove(`character-${characterElement.dataset.position}`);
          characterElement.classList.add(`character-${position}`);
          characterElement.dataset.position = position;
          this.applyPositionStyle(characterElement, position);
        }, 50);
      }
    }
    if (isSpeaking) {
      characterElement.classList.add("character-speaking");
      characterElement.classList.remove("character-dimmed");
      characterElement.style.opacity = "1";
      characterElement.style.zIndex = "10";
    } else {
      characterElement.classList.remove("character-speaking");
      characterElement.classList.add("character-dimmed");
      characterElement.style.opacity = "1";
      characterElement.style.zIndex = "5";
    }
  }
  applyPositionStyle(element, position) {
    if (position === "center") {
      element.style.left = "50%";
      element.style.right = "auto";
      element.style.transform = "translateX(-50%)";
      element.style.bottom = "0";
      element.style.height = "98%";
      element.style.maxHeight = "98%";
    } else if (position === "left") {
      element.style.left = "30%";
      element.style.right = "auto";
      element.style.transform = "translateX(-50%)";
      element.style.bottom = "0";
      element.style.height = "95%";
      element.style.maxHeight = "95%";
    } else if (position === "right") {
      element.style.right = "30%";
      element.style.left = "auto";
      element.style.transform = "translateX(50%)";
      element.style.bottom = "0";
      element.style.height = "95%";
      element.style.maxHeight = "95%";
    }
  }
  hideCharacter(characterId) {
    const characterElement = document.getElementById(`character-${characterId}`);
    if (characterElement) {
      if (characterElement.classList.contains("character-exit")) return;
      characterElement.classList.add("character-exit");
      characterElement.classList.remove("character-active", "character-speaking");
      setTimeout(() => {
        if (characterElement && characterElement.parentNode) {
          characterElement.parentNode.removeChild(characterElement);
        }
      }, 800);
    }
  }
  nextDialog() {
    if (this.isAnimating) {
      this.isAnimating = false;
      const currentDialog = this.dialogData[this.currentIndex];
      this.dialogText.textContent = currentDialog.text;
      document.getElementById("next-hint").style.opacity = "1";
      return;
    }
    this.currentIndex++;
    if (this.currentIndex >= this.dialogData.length) {
      console.log("对话已全部播放完毕。");
      this.currentIndex = this.dialogData.length - 1;
      const nextHint = document.getElementById("next-hint");
      if (nextHint) {
        nextHint.style.display = "none";
      }
      const restartBtn = document.getElementById("restart-btn");
      if (restartBtn) {
        restartBtn.style.display = "block";
      }
      return;
    }
    this.showDialog(this.currentIndex);
  }
  restartDialog() {
    console.log("重新开始对话播放");
    this.currentIndex = 0;
    for (const characterId in this.activeCharacters) {
      this.hideCharacter(characterId);
    }
    this.activeCharacters = {};
    if (this.dialogData && this.dialogData.length > 0 && this.dialogData[0].background) {
      this.currentBgPath = this.dialogData[0].background;
      const initialBgUrl = this.getFullImageUrl(this.currentBgPath);
      this.currentImage.src = initialBgUrl;
    }
    const nextHint = document.getElementById("next-hint");
    if (nextHint) {
      nextHint.style.display = "block";
      nextHint.style.opacity = "1";
    }
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
      restartBtn.style.display = "none";
    }
    this.showDialog(0);
  }
  fadeOutIn(callback, dialogToUpdate) {
    if (this.isTransitioning) {
      console.log("已在转场中，忽略新的转场请求");
      return;
    }
    this.isTransitioning = true;
    console.log("开始背景转场");
    const relativeImagePath = callback();
    if (!relativeImagePath) {
      console.log("背景路径为空，跳过转场");
      this.isTransitioning = false;
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
      return;
    }
    let nextImageUrl = this.getFullImageUrl(relativeImagePath);
    console.log("切换背景图片:", relativeImagePath, "->", nextImageUrl);
    if (!nextImageUrl || nextImageUrl === this.currentImage.src) {
      console.log("跳过背景转场: URL为空或相同");
      this.isTransitioning = false;
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
      return;
    }
    const executeTransition = () => {
      console.log("执行背景转场动画");
      document.body.classList.add("transitioning");
      this.nextImage.style.opacity = "1";
      setTimeout(() => {
        this.currentImage.src = this.nextImage.src;
        console.log("背景转场完成，当前背景:", this.currentImage.src);
        this.nextImage.style.opacity = "0";
        document.body.classList.remove("transitioning");
        this.isTransitioning = false;
        if (dialogToUpdate) {
          console.log("转场完成，更新对话内容:", dialogToUpdate.name);
          setTimeout(() => {
            this.updateDialogContent(dialogToUpdate);
          }, 50);
        }
      }, 1200);
    };
    this.nextImage.src = nextImageUrl;
    this.nextImage.onerror = () => {
      console.error("背景图片加载失败:", nextImageUrl);
      this.isTransitioning = false;
      if (dialogToUpdate) {
        this.updateDialogContent(dialogToUpdate);
      }
    };
    this.nextImage.onload = () => {
      console.log("背景图片加载完成");
      executeTransition();
    };
  }
  addToHistory(dialog) {
    const isDuplicate = this.dialogHistory.some(item => item.name === dialog.name && item.text === dialog.text);
    if (!isDuplicate) {
      this.dialogHistory.push({
        name: dialog.name,
        text: dialog.text,
        background: dialog.background || ""
      });
      this.updateHistoryPanel();
    }
  }
  updateHistoryPanel() {
    this.historyContent.innerHTML = "";
    if (this.dialogHistory.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.textContent = "暂无对话历史";
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.color = "#7D5B65";
      emptyMsg.style.padding = "20px";
      this.historyContent.appendChild(emptyMsg);
      return;
    }
    this.dialogHistory.forEach((dialog, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.style.marginBottom = "15px";
      historyItem.style.padding = "15px";
      historyItem.style.borderRadius = "12px";
      historyItem.style.background = "rgba(255, 255, 255, 0.5)";
      historyItem.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.7) inset";
      historyItem.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
      historyItem.onmouseover = function() {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset";
      };
      historyItem.onmouseout = function() {
        this.style.transform = "none";
        this.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.7) inset";
      };
      if (dialog.name && dialog.name !== "旁白") {
        const nameElem = document.createElement("div");
        nameElem.className = "history-name";
        nameElem.textContent = dialog.name;
        nameElem.style.fontWeight = "bold";
        nameElem.style.color = "#C18E98";
        nameElem.style.marginBottom = "8px";
        nameElem.style.position = "relative";
        nameElem.style.paddingLeft = "15px";
        const decorElem = document.createElement("span");
        decorElem.textContent = "❀";
        decorElem.style.position = "absolute";
        decorElem.style.left = "0";
        decorElem.style.top = "50%";
        decorElem.style.transform = "translateY(-50%)";
        decorElem.style.color = "#FFB0C0";
        decorElem.style.fontSize = "12px";
        nameElem.appendChild(decorElem);
        historyItem.appendChild(nameElem);
      } else if (dialog.name === "旁白") {
        historyItem.style.fontStyle = "italic";
        historyItem.style.background = "rgba(245, 235, 235, 0.7)";
        historyItem.style.borderLeft = "3px solid #FFCAD5";
      }
      const textElem = document.createElement("div");
      textElem.className = "history-text";
      textElem.textContent = dialog.text;
      textElem.style.color = "#4D2B35";
      textElem.style.lineHeight = "1.5";
      textElem.style.letterSpacing = "0.3px";
      historyItem.appendChild(textElem);
      this.historyContent.appendChild(historyItem);
    });
    setTimeout(() => {
      this.historyContent.scrollTop = this.historyContent.scrollHeight;
    }, 100);
  }
  toggleHistoryPanel(show) {
    if (show) {
      this.updateHistoryPanel();
      this.historyPanel.style.display = "block";
      this.historyPanel.style.opacity = "0";
      this.historyPanel.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        this.historyPanel.style.opacity = "1";
      }, 10);
    } else {
      this.historyPanel.style.opacity = "0";
      setTimeout(() => {
        this.historyPanel.style.display = "none";
      }, 300);
    }
  }
}

$(() => {
  const engine = new GalgameEngine;
  function initToggleUIButton() {
    const toggleBtn = document.getElementById("toggle-ui-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        document.body.classList.toggle("ui-hidden");
        if (document.body.classList.contains("ui-hidden")) {
          toggleBtn.textContent = "💬";
          toggleBtn.title = "显示界面";
          const characterElements = document.querySelectorAll(".character-sprite");
          characterElements.forEach(element => {
            element.classList.remove("character-speaking", "character-dimmed");
          });
        } else {
          toggleBtn.textContent = "💭";
          toggleBtn.title = "隐藏界面";
          engine.updateCharacters(engine.dialogData[engine.currentIndex]);
        }
      });
      toggleBtn.textContent = "💭";
      toggleBtn.title = "隐藏界面";
    }
  }
  initToggleUIButton();
  const historyBtn = document.getElementById("history-btn");
  const closeHistoryBtn = document.getElementById("close-history");
  if (historyBtn && closeHistoryBtn) {
    historyBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      engine.toggleHistoryPanel(true);
    });
    closeHistoryBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      engine.toggleHistoryPanel(false);
    });
    document.getElementById("history-panel").addEventListener("click", function(e) {
      e.stopPropagation();
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && engine.historyPanel.style.display === "block") {
        engine.toggleHistoryPanel(false);
      }
    });
  }
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      engine.restartDialog();
    });
    restartBtn.title = "重新开始";
  }
});