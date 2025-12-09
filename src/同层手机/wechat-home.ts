import { AppController } from './app-controller';
import { DialogManager } from './dialog-manager';

type ConversationType = 'single' | 'group';

interface ConversationItem {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ContactItem {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string;
  desc?: string;
}

function setupTabs(appController: AppController) {
  const sectionMap: Record<string, string> = {
    conv: '#wechat-tab-conv',
    contacts: '#wechat-tab-contacts',
    discover: '#wechat-tab-discover',
    me: '#wechat-tab-me',
  };

  const activate = (key: keyof typeof sectionMap) => {
    $('.wechat-home-section').removeClass('active');
    $(sectionMap[key]).addClass('active');
    $('.wechat-tab-btn').removeClass('active');
    $(`.wechat-tab-btn[data-target="${key}"]`).addClass('active');
  };

  $('.wechat-tab-btn')
    .off('click')
    .on('click', function () {
      const target = ($(this).data('target') as keyof typeof sectionMap) || 'conv';
      activate(target);
    });

  activate('conv');
}

function fillProfile(appController: AppController) {
  const configManager = (appController as any).configManager;
  const config = configManager?.getConfig?.();
  if (config) {
    const avatarUrl = config.avatars?.user || config.avatars?.char || '';
    if (avatarUrl) {
      $('#profile-avatar').css({
        'background-image': `url(${avatarUrl})`,
        'background-size': 'cover',
        'background-position': 'center',
      });
    }
    $('#profile-name').text(appController.getDisplayName('user'));
    const signature =
      configManager?.getSavedSignature?.() ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('blmx_user_signature') : '') ||
      '';
    if (signature) {
      $('#profile-signature').text(signature);
    }
  }
}

function renderConversations(appController: AppController) {
  const configManager = (appController as any).configManager;
  const config = configManager?.getConfig?.();
  const defaultAvatar =
    config?.avatars?.char ||
    'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/头像/默认头像.jpg';

  const conversations: ConversationItem[] = [
    {
      id: 'c1',
      type: 'single',
      name: appController.getDisplayName('char'),
      avatar: defaultAvatar,
      lastMessage: '这里显示最近一条消息摘要...',
      time: '08:39',
      unread: 2,
    },
    {
      id: 'g1',
      type: 'group',
      name: '群聊示例',
      avatar: 'https://files.catbox.moe/3j0tpc.jpeg',
      lastMessage: '群聊最近消息摘要...',
      time: '昨晚',
      unread: 0,
    },
  ];

  const $list = $('#conversation-list');
  $list.empty();

  if (!conversations.length) {
    $list.append('<li class="conv-item placeholder">暂无会话，后续展示单聊/群聊</li>');
    return;
  }

  ((window as any)._?.each || ((arr: ConversationItem[], fn: any) => arr.forEach(fn)))(conversations, renderItem);

  function renderItem(conv: ConversationItem) {
    const $li = $(`
      <li class="conv-item" data-conv-id="${conv.id}">
        <div class="conv-avatar" style="background-image: url('${conv.avatar}')"></div>
        <div class="conv-main">
          <div class="conv-row">
            <span class="conv-name">${conv.name}</span>
            <span class="conv-time">${conv.time}</span>
          </div>
          <div class="conv-row">
            <span class="conv-desc">${conv.lastMessage}</span>
            ${conv.unread > 0 ? `<span class="conv-unread">${conv.unread}</span>` : ''}
          </div>
        </div>
      </li>
    `);

    $li.on('click', () => {
      // 进入聊天界面，清零未读
      $li.find('.conv-unread').remove();
      conv.unread = 0;
      appController.navigateTo('wechat');
    });

    $list.append($li);
  }
}

function renderContacts(appController: AppController) {
  const configManager = (appController as any).configManager;
  const config = configManager?.getConfig?.();
  const defaultAvatar =
    config?.avatars?.user ||
    'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/头像/默认头像.jpg';

  const contacts: ContactItem[] = [
    { id: 'u1', type: 'single', name: appController.getDisplayName('char'), avatar: defaultAvatar, desc: '好友' },
    { id: 'g1', type: 'group', name: '群聊示例', avatar: 'https://files.catbox.moe/3j0tpc.jpeg', desc: '群聊' },
    { id: 'u2', type: 'single', name: '新联系人', avatar: defaultAvatar, desc: '好友占位' },
  ];

  const $list = $('#contacts-list');
  $list.empty();

  if (!contacts.length) {
    $list.append('<li class="contact-item placeholder">联系人列表占位</li>');
    return;
  }

  ((window as any)._?.each || ((arr: ContactItem[], fn: any) => arr.forEach(fn)))(contacts, renderItem);

  function renderItem(contact: ContactItem) {
    const $li = $(`
      <li class="contact-item" data-contact-id="${contact.id}">
        <div class="conv-avatar" style="background-image: url('${contact.avatar}')"></div>
        <div class="conv-main">
          <div class="conv-row">
            <span class="conv-name">${contact.name}</span>
            <span class="conv-time">${contact.type === 'group' ? '群聊' : '好友'}</span>
          </div>
          <div class="conv-row">
            <span class="conv-desc">${contact.desc || ''}</span>
          </div>
        </div>
      </li>
    `);

    $li.on('click', () => {
      appController.navigateTo('wechat');
    });

    $list.append($li);
  }

  $('#add-friend-entry')
    .off('click')
    .on('click', async () => {
      await DialogManager.getInstance().alert('添加朋友功能占位，后续接入。', '提示');
    });

  $('#group-list-entry')
    .off('click')
    .on('click', async () => {
      await DialogManager.getInstance().alert('群聊列表入口占位，后续接入。', '提示');
    });
}

export function initWechatHome(appController: AppController) {
  setupTabs(appController);
  fillProfile(appController);
  renderConversations(appController);
  renderContacts(appController);
}
