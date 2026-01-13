<template>
  <div class="fluid-container">
    <div class="fluid-circle circle1"></div>
    <div class="fluid-circle circle2"></div>
    <div class="fluid-circle circle3"></div>

    <div class="title-container">
      <div class="main-bg"></div>
      <div class="bg-decoration"></div>
      <div class="subtitle">lolodesu</div>
      <h1 class="main-title">
        <span class="white-text">白化</span><span class="blue-text">蓝染</span>的<span class="pink-text">日记本</span>
      </h1>
    </div>

    <div class="content-container">
      <div class="note-title">🎉酒馆助手安装测试通过 - 使用说明</div>
      <div class="note-paper">
        <p>当你能看到这个界面时，酒馆助手已经安装成功</p>
        <p>但你<strong>必须保证酒馆助手版本为4.3.18以上</strong>，否则无法正常游玩</p>
        <p>
          链接是：<a
            href="https://discord.com/channels/1134557553011998840/1296494001406345318/1296494001406345318"
            target="_blank"
            >【类脑ΟΔΥΣΣΕΙΑ】酒馆助手</a
          >
          或<a href="https://discord.com/channels/1291925535324110879/1374297592854216774" target="_blank"
            >【旅程ΟΡΙΖΟΝΤΑΣ】酒馆助手</a
          >
        </p>
        <p>
          直接使用链接安装：<a href="https://gitlab.com/novi028/JS-Slash-Runner" target="_blank"
            >https://gitlab.com/novi028/JS-Slash-Runner</a
          >
          <button
            type="button"
            class="copy-button"
            data-copy="https://gitlab.com/novi028/JS-Slash-Runner"
            :class="{ copied: copy_button_copied }"
            @click="handleCopy('https://gitlab.com/novi028/JS-Slash-Runner')"
          >
            {{ copy_button_copied ? '已复制!' : '复制' }}
          </button>
        </p>
        <br />
        <p><strong>模型兼容性推荐：</strong></p>
        <p>✅ claude 4.5 Sonnet - 完美兼容</p>
        <p>✅ chatgpt-4o-latest - 文笔非常好！兼容性取决于预设</p>
        <p>✅ gpt 4.5 - 文笔超级超级好！完美兼容，但是再也玩不到了qwq</p>
        <p>
          ✅ gemini 2.5/3.0 Pro - 需要使用精简预设以及减少注意力占用才能完美运行；
          另外如果你喜欢<strong>世界书条目只放到角色定义和深度0</strong>，可以去酒馆助手内置库里添加<strong>深度条目排斥器</strong>x
        </p>
        <p>❓ Grok 3 - 不掉格式，但文风需要预设好好调整</p>
        <p>❓ DeepSeek - 新v3勉强能玩，R1祝你好运？</p>
        <br />
        <p>世界书部分内容涉及剧透，酌情观看</p>
        <br />
        <p><strong>设置可以在世界书里切换：</strong></p>
        <p>🎭 主角性别：会影响涩涩CG哦！</p>
        <p>🌙 样式主题：只影响选择框……抱歉，其余界面偷懒没做暗色设计只有亮色</p>
        <p>⚙️ 选择框触发方式：点击选择框时是会立即发送内容还是将内容放置在输入栏</p>
        <p>🎨 始终使用galgame界面： 想一直玩流式galgame界面？开启这个吧！</p>
        <br />
        <p><strong>能不能出galgame界面取决于预设和上下文：</strong></p>
        <p>这张卡原本是设计成平时纯文字、关键剧情galgame的</p>
        <p>青空莉后来加上了流式galgame界面，但没怎么调整世界书</p>
        <p>所以请不要太在意AI输出的是纯文字还是galgame界面（</p>
        <br />
        <p><strong>快捷输入说明：</strong></p>
        <p>通过酒馆助手的脚本按钮实现了快捷输入</p>
        <p>如果不需要请到脚本库中编辑脚本来关闭按钮</p>
        <p>🕛度过：快速度过时间直到你的选项</p>
        <p>🗺️地点：前往某一地点</p>
      </div>
    </div>

    <div class="content-container">
      <div class="note-title">你好，我是络络</div>
      <div class="note-paper">
        <p>...是角色卡中的络络而不是lolodesu_喔（目移）</p>
        <br />
        <p>真的没想到，我们能在这里相遇！很高兴见到你～</p>
        <br />
        <p>欢迎来到《白化蓝染的日记本》，这是我的小小世界。</p>
        <br />
        <p>让我来讲讲关于我的故事吧...</p>
        <br />
        <p>
          在准备这个故事的过程中——或者说，在重新整理那些珍贵回忆的日子里，发生了许多事情。有时确实会感到一点辛苦，但更多的是遇见了许多温柔又善良的朋友们。正是大家的陪伴和鼓励，让这段时光变得格外有意义，让我度过了非常、非常开心的日子。真的，最喜欢大宇宙的大家了！
        </p>
        <br />
        <p>好期待即将与你一起经历的故事呢～</p>
        <br />
        <p>
          嗯...这张卡...啊不对，这本日记（慌乱），其实没什么特别的啦，记录的都是些很琐碎的日常小事：学校的点点滴滴，路边的小花，微风的细语，还有一些...嗯，藏在心底，不太敢说出口的，笨拙的心意。这是关于我和你的故事，可能有点慢节奏，有点安静，创作初衷也只是为了教程做准备而已，没有什么特别吸引人的设定，故事可能也有点普通，我的角色设计也挺常见的。
        </p>
        <br />
        <p>但我真的希望，这本小小的日记能像角落里的一盏温暖小灯，在你需要的时候，能带给你一丝温暖，一份安静的陪伴。</p>
        <br />
        <p>真的，真的很感谢你愿意翻开这个故事。</p>
      </div>

      <div class="note-title">请选择开局</div>
      <div class="opening-options">
        <button type="button" class="option-button" data-index="1" @click="selectOpening(1)">
          <span>开局1: 来一下天台我有重要的话想要和你说，可以吗...？</span>
        </button>
        <button type="button" class="option-button" data-index="2" @click="selectOpening(2)">
          <span>开局2: 直接去你家门口堵你！</span>
        </button>
        <button type="button" class="option-button" data-index="3" @click="selectOpening(3)">
          <span>开局3: 不知不觉已经一个月了呀</span>
        </button>
        <button type="button" class="option-button" data-index="4" @click="selectOpening(4)">
          <span>开局4: 络络要带你去哪里？</span>
        </button>
      </div>
    </div>

    <div class="content-container">
      <div class="note-title">感谢与碎碎念</div>

      <button
        type="button"
        class="expand-button"
        :class="{ expanded: expanded_sections.friend_list }"
        @click="toggleExpanded('friend_list')"
      >
        友人清单
      </button>
      <div class="expandable-section" :class="{ expanded: expanded_sections.friend_list }">
        <div class="note-section">
          <p>以下是帮助过lolodesu_的友人清单和她的一些文字：（没时间更新清单对不起）</p>
          <p><i>对不起，完全没能RP（）</i></p>
          <p><strong>感谢：</strong></p>
          <div class="friends-list">
            <div class="friend-item">
              <span class="friend-name">青空莉想做舞台少女的狗（@airly99）</span>
              <span class="friend-message">多拉A莉真的很万能，帮了我好多，还重制了角色卡</span>
            </div>
            <div class="friend-item blue-friend">
              <span class="friend-name">柏柏（@baibai_ds）</span>
              <span class="friend-message">柏柏注意身体啊x</span>
            </div>
            <div class="friend-item">
              <span class="friend-name">方素琪（@allenade_35238）</span>
              <span class="friend-message">能不能改改你的社恐()</span>
            </div>
            <div class="friend-item blue-friend">
              <span class="friend-name">海海（@haihai2.0）</span>
              <span class="friend-message">这个世界怎么会有如此完美的女性简直是我的老婆</span>
            </div>
            <div class="friend-item">
              <span class="friend-name">Hakoyu(@hakoyukaya)</span>
              <span class="friend-message">大宇宙资源共享 恩情还不完！</span>
            </div>
            <div class="friend-item blue-friend">
              <span class="friend-name">yorino_233(@yorino_233)</span>
              <span class="friend-message">恩情还不完！另外yorino的戏剧之王预设也很好用哦</span>
            </div>
            <div class="friend-item">
              <span class="friend-name">落花殘(@xinfh)</span>
              <span class="friend-message">笨蛋O花x</span>
            </div>
            <div class="friend-item blue-friend">
              <span class="friend-name">ShoKill(@shokill0403)</span>
              <span class="friend-message">不许和我抢海海😈</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="expand-button"
        :class="{ expanded: expanded_sections.special_thanks }"
        @click="toggleExpanded('special_thanks')"
      >
        特别感谢与借物清单
      </button>
      <div class="expandable-section" :class="{ expanded: expanded_sections.special_thanks }">
        <div class="note-section">
          <p>
            <strong>感谢@zonde306的提示词模板</strong>，真的真的好用！比主播络络那种cot特殊词汇触发绿灯的效果好太多啦
          </p>
          <p><strong>感谢mag（@sfinnae）的mvu变量框架</strong>，比原来正则变量法设置和更新变量方便太多啦</p>
          <p><strong>感谢Kakka和青空莉开发的酒馆助手</strong></p>
          <p>
            这张卡大量用到了酒馆助手的脚本功能，有兴趣可以研究一下，希望大家多用用前端注入功能以外的功能!（什么时候能来个简单易懂的教程啊x⬅️青空莉：我现在算写了……吧）
          </p>
          <p>其中大部分脚本的使用方法可以在这个链接找到：</p>
          <p>
            <a href="https://sillytavern-stage-girls-dog.readthedocs.io/工具经验/杂项/" target="_blank"
              >https://sillytavern-stage-girls-dog.readthedocs.io/工具经验/杂项/</a
            >
          </p>
          <p>觉得好用也请去类脑和旅程为其点个赞</p>
        </div>
      </div>

      <button
        type="button"
        class="expand-button"
        :class="{ expanded: expanded_sections.tutorial_plan }"
        @click="toggleExpanded('tutorial_plan')"
      >
        教程计划
      </button>
      <div class="expandable-section" :class="{ expanded: expanded_sections.tutorial_plan }">
        <div class="note-section">
          <p>
            创作本卡让我获得了很多经验，我会编写教程分享经验，也许完整的包含如何编写这样的角色卡的每一步？欢迎来捧场。
          </p>
          <p><strong>宝宝教程计划：</strong></p>
          <p>✅用sd-forge来跑卡内所有图片素材，非常简单省力，包括立绘和CG等，已经写好教程啦</p>
          <p>✅提示词模板分阶段人设及衍生的变量用：目前已经有mag的MVU框架，还有我的教程w</p>
          <p>🟦好用的巧克力脚本推荐：目前已经有酒馆助手3.0脚本贴</p>
          <p>🟦运用TTS或RVC变声器来为角色添加语音：目前已有TTS论坛</p>
        </div>
      </div>

      <div class="section-divider"></div>

      <div class="poem-section">
        <p>墨迹攀屋檐，字句在方寸天地盘旋，为你折出夏天。</p>
        <p>蓝瞳映橱窗，雪色作心事信笺，旧时光在笔尖盘旋。</p>
        <p>雨珠串成透明星光，仍有未拆封的愿望。</p>
        <p>草莓蛋糕不要再多淋半勺疼痛。</p>
        <p>流言是透明茧房，别怕自己特殊啊。</p>
        <p>宇宙偏爱碎光生长，当破茧那秒，</p>
        <p>正落进那人怀抱，会发光。</p>
      </div>
    </div>

    <div class="content-container cover-image-container">
      <div class="note-title blue-note-title">卡面欣赏</div>
      <div class="cover-image-wrapper">
        <img
          src="https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/图片/卡面.png"
          alt="络络在天台上拿着粉色日记本"
          class="cover-image"
        />
        <div class="image-caption">天台上的约定，蓝色天空下的粉色心事</div>
        <a
          href="https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/图片/卡面.png"
          target="_blank"
          class="view-full-image"
          >查看原图
        </a>
      </div>
    </div>

    <div class="footer-wrapper">
      <nav class="navigation nav-bottom">
        <a href="https://stagedog.github.io/" class="nav-link" target="_blank">Guide:白化蓝染的酒馆</a>
        <a href="https://discord.gg/lolocosmos" class="nav-link" target="_blank">DISCORD:络络大宇宙</a>
      </nav>

      <div class="copyright">
        <p xmlns:cc="http://creativecommons.org/ns#">
          This work by <span property="cc:attributionName" class="author-name">络络@lolodesu_</span> is licensed under
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            style="display: inline-block"
          >
            CC BY-NC-SA 4.0
            <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="" />
            <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="" />
            <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="" />
            <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt="" />
          </a>
        </p>
      </div>
    </div>

    <div
      class="copy-success"
      :style="{
        opacity: copy_success_visible ? 1 : 0,
        transform: copy_success_visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
      }"
      aria-hidden="true"
    >
      链接已复制到剪贴板
    </div>
  </div>
</template>

<script setup lang="ts">
type ExpandedKey = 'friend_list' | 'special_thanks' | 'tutorial_plan';

const expanded_sections = reactive<Record<ExpandedKey, boolean>>({
  friend_list: true,
  special_thanks: false,
  tutorial_plan: false,
});

function toggleExpanded(key: ExpandedKey) {
  expanded_sections[key] = !expanded_sections[key];
}

function selectOpening(index: number) {
  setChatMessages([{ message_id: 0, swipe_id: index }]);
}

const copy_button_copied = ref(false);
const copy_success_visible = ref(false);

let copy_reset_timer: number | undefined;
let copy_toast_timer: number | undefined;

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    /* ignore */
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (error) {
    return false;
  }
}

async function handleCopy(text: string) {
  const ok = await copyToClipboard(text);
  if (!ok) {
    toastr.error('复制失败，请手动复制链接');
    return;
  }

  copy_button_copied.value = true;
  copy_success_visible.value = true;

  window.clearTimeout(copy_reset_timer);
  window.clearTimeout(copy_toast_timer);
  copy_reset_timer = window.setTimeout(() => {
    copy_button_copied.value = false;
  }, 2000);
  copy_toast_timer = window.setTimeout(() => {
    copy_success_visible.value = false;
  }, 2000);
}

onBeforeUnmount(() => {
  window.clearTimeout(copy_reset_timer);
  window.clearTimeout(copy_toast_timer);
});
</script>
