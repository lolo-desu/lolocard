// debug-data.ts
// 此文件包含用于测试和调试的数据
// 在发布前应删除或注释掉对此文件的引用

import { LogEntry } from './script';

// 获取当前日期和时间
const getCurrentDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now
    .getDate()
    .toString()
    .padStart(2, '0')}`;
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// 生成随机ID
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// 测试数据
export const debugData: LogEntry[] = [
  // 系统时间条目
  {
    type: 'time',
    content: {
      date: getCurrentDate(),
      time: getCurrentTime(),
    },
  },

  // 系统事件条目
  {
    type: 'event',
    content: {
      date: getCurrentDate(),
      time: getCurrentTime(),
      description: '调试模式已启用',
    },
  },

  // 文本消息 - 用户
  {
    id: generateId('msg'),
    type: 'message',
    sender: 'me',
    content: '你好，这是一条测试消息',
  },

  // 文本消息 - AI
  {
    id: generateId('msg'),
    type: 'message',
    sender: 'them',
    content: '你好！很高兴见到你，这是一条AI回复的测试消息。',
  },

  // 表情消息 - 用户
  {
    id: generateId('sticker'),
    type: 'sticker',
    sender: 'me',
    content: '好的',
  },

  // 表情消息 - AI
  {
    id: generateId('sticker'),
    type: 'sticker',
    sender: 'them',
    content: '好的',
  },

  // 图片消息 - 用户
  {
    id: generateId('img'),
    type: 'image',
    sender: 'me',
    content: {
      type: 'url',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_1.jpg',
    },
  },

  // 图片消息 - AI
  {
    id: generateId('img'),
    type: 'image',
    sender: 'them',
    content: {
      type: 'url',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色星星_1.jpg',
    },
  },

  // 图片消息 - 描述类型
  {
    id: generateId('img'),
    type: 'image',
    sender: 'them',
    content: {
      type: 'desc',
      value: '这是一张描述类型的图片，实际上不会显示图片内容',
    },
  },

  // 语音消息 - 用户
  {
    id: generateId('voice'),
    type: 'voice',
    sender: 'me',
    content: {
      text: '这是一条测试语音消息的文本内容',
      duration: 5,
    },
  },

  // 语音消息 - AI
  {
    id: generateId('voice'),
    type: 'voice',
    sender: 'them',
    content: {
      text: '这是AI回复的语音消息文本内容',
      duration: 8,
    },
  },

  // 位置消息 - 用户
  {
    id: generateId('loc'),
    type: 'location',
    sender: 'me',
    content: '北京市朝阳区三里屯',
  },

  // 位置消息 - AI
  {
    id: generateId('loc'),
    type: 'location',
    sender: 'them',
    content: '上海市浦东新区陆家嘴',
  },

  // 转账消息 - 用户发送
  {
    id: generateId('transfer'),
    type: 'transfer',
    sender: 'me',
    content: JSON.stringify({
      amount: '88.88',
      note: '测试转账',
      status: 'sent',
    }),
    data: {
      amount: '88.88',
      note: '测试转账',
      status: 'sent',
    },
  },

  // 转账消息 - AI接受
  {
    id: generateId('transfer'),
    type: 'transfer',
    sender: 'them',
    content: JSON.stringify({
      amount: '88.88',
      note: '测试转账',
      status: 'accepted',
    }),
    data: {
      amount: '88.88',
      note: '测试转账',
      status: 'accepted',
    },
  },

  // 转账消息 - AI发送
  {
    id: generateId('transfer'),
    type: 'transfer',
    sender: 'them',
    content: JSON.stringify({
      amount: '66.66',
      note: 'AI测试转账',
      status: 'sent',
    }),
    data: {
      amount: '66.66',
      note: 'AI测试转账',
      status: 'sent',
    },
  },

  // 转账消息 - 用户接受
  {
    id: generateId('transfer'),
    type: 'transfer',
    sender: 'me',
    content: JSON.stringify({
      amount: '66.66',
      note: 'AI测试转账',
      status: 'accepted',
    }),
    data: {
      amount: '66.66',
      note: 'AI测试转账',
      status: 'accepted',
    },
  },

  // 礼物消息 - 用户发送
  {
    id: generateId('gift'),
    type: 'gift',
    sender: 'me',
    content: JSON.stringify({
      name: '生日蛋糕',
      price: '99.99',
      status: 'sent',
    }),
    data: {
      name: '生日蛋糕',
      price: '99.99',
      status: 'sent',
    },
  },

  // 礼物消息 - AI接受
  {
    id: generateId('gift'),
    type: 'gift',
    sender: 'them',
    content: JSON.stringify({
      name: '生日蛋糕',
      status: 'accepted',
    }),
    data: {
      name: '生日蛋糕',
      status: 'accepted',
    },
  },

  // 礼物消息 - AI发送
  {
    id: generateId('gift'),
    type: 'gift',
    sender: 'them',
    content: JSON.stringify({
      name: '巧克力',
      price: '39.99',
      status: 'sent',
    }),
    data: {
      name: '巧克力',
      price: '39.99',
      status: 'sent',
    },
  },

  // 礼物消息 - 用户接受
  {
    id: generateId('gift'),
    type: 'gift',
    sender: 'me',
    content: JSON.stringify({
      name: '巧克力',
      status: 'accepted',
    }),
    data: {
      name: '巧克力',
      status: 'accepted',
    },
  },

  // 文件消息 - 用户
  {
    id: generateId('file'),
    type: 'file',
    sender: 'me',
    content: '测试文档.docx',
  },

  // 文件消息 - AI
  {
    id: generateId('file'),
    type: 'file',
    sender: 'them',
    content: '重要资料.pdf',
  },

  // 朋友圈 - 用户发布
  {
    key: 'USER_MOMENT',
    data: {
      text: '这是用户发布的朋友圈测试内容',
      image: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_2.jpg',
      image_type: 'url',
      date: getCurrentDate(),
      time: getCurrentTime(),
    },
  },

  // 朋友圈 - AI发布
  {
    key: 'CHAR_MOMENT',
    data: {
      text: '这是AI发布的朋友圈测试内容',
      image: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色小猫_1.jpg',
      image_type: 'url',
      date: getCurrentDate(),
      time: getCurrentTime(),
    },
  },

  // 朋友圈 - 纯文本
  {
    key: 'CHAR_MOMENT',
    data: {
      text: '这是一条没有图片的朋友圈',
      image: '',
      image_type: 'none',
      date: getCurrentDate(),
      time: getCurrentTime(),
    },
  },

  // 朋友圈 - 图片描述
  {
    key: 'USER_MOMENT',
    data: {
      text: '这是带有图片描述的朋友圈',
      image: '一张美丽的风景照片',
      image_type: 'desc',
      image_desc: '一张美丽的风景照片',
      date: getCurrentDate(),
      time: getCurrentTime(),
    },
  },

  // 朋友圈评论 - 用户评论
  {
    key: 'USER_COMMENT',
    data: {
      text: '这是用户的评论',
      target_post_id: 1,
    },
  },

  // 朋友圈评论 - AI评论
  {
    key: 'CHAR_COMMENT',
    data: {
      text: '这是AI的评论',
      target_post_id: 0,
    },
  },

  // 朋友圈点赞 - 用户点赞
  {
    key: 'USER_LIKE',
    data: {
      target_post_id: 1,
    },
  },

  // 朋友圈点赞 - AI点赞
  {
    key: 'CHAR_LIKE',
    data: {
      target_post_id: 0,
    },
  },

  // 撤回消息示例
  {
    id: generateId('msg'),
    type: 'message',
    sender: 'them',
    content: '这条消息将被撤回',
    recalled: true,
    recalled_content: '这条消息将被撤回',
    recalled_timestamp: getCurrentTime(),
  },
];

// 加载调试数据的函数 - 优化版本，减少性能消耗
export function loadDebugData(blmxManager: any): void {
  // 检查是否在开发模式
  const isDevelopment = window.location.hostname === 'localhost' || window.location.search.includes('debug=true');

  if (!isDevelopment) {
    console.log('[DEBUG] 生产模式，跳过调试数据加载');
    return;
  }

  console.log('[DEBUG] 正在加载调试数据...');

  // 批量添加，减少单次操作
  const batchSize = 10;
  let index = 0;

  const addBatch = () => {
    const batch = debugData.slice(index, index + batchSize);
    batch.forEach(entry => {
      blmxManager.addEntry(entry);
    });

    index += batchSize;

    if (index < debugData.length) {
      // 使用requestAnimationFrame避免阻塞UI
      requestAnimationFrame(addBatch);
    } else {
      console.log('[DEBUG] 调试数据加载完成，共加载', debugData.length, '条数据');
    }
  };

  addBatch();
}

// 清除调试数据的函数
export function clearDebugData(blmxManager: any): void {
  console.log('[DEBUG] 正在清除调试数据...');
  blmxManager.logEntries = [];
  console.log('[DEBUG] 调试数据已清除');
}

// 添加单个测试数据的函数，方便在控制台中使用
export function addTestEntry(blmxManager: any, entryType: string): void {
  let entry: any = null;

  switch (entryType) {
    case 'text-user':
      entry = {
        id: generateId('msg'),
        type: 'message',
        sender: 'me',
        content: '这是一条测试文本消息',
      };
      break;
    case 'text-char':
      entry = {
        id: generateId('msg'),
        type: 'message',
        sender: 'them',
        content: '这是一条AI回复的测试消息',
      };
      break;
    case 'sticker-user':
      entry = {
        id: generateId('sticker'),
        type: 'sticker',
        sender: 'me',
        content: '好的',
      };
      break;
    case 'sticker-char':
      entry = {
        id: generateId('sticker'),
        type: 'sticker',
        sender: 'them',
        content: '好的',
      };
      break;
    case 'image-user':
      entry = {
        id: generateId('img'),
        type: 'image',
        sender: 'me',
        content: {
          type: 'url',
          value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_1.jpg',
        },
      };
      break;
    case 'image-char':
      entry = {
        id: generateId('img'),
        type: 'image',
        sender: 'them',
        content: {
          type: 'url',
          value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色星星_1.jpg',
        },
      };
      break;
    case 'voice-user':
      entry = {
        id: generateId('voice'),
        type: 'voice',
        sender: 'me',
        content: {
          text: '这是一条测试语音消息',
          duration: 3,
        },
      };
      break;
    case 'voice-char':
      entry = {
        id: generateId('voice'),
        type: 'voice',
        sender: 'them',
        content: {
          text: '这是AI的测试语音消息',
          duration: 4,
        },
      };
      break;
    case 'transfer-user':
      entry = {
        id: generateId('transfer'),
        type: 'transfer',
        sender: 'me',
        content: JSON.stringify({
          amount: '88.88',
          note: '测试转账',
          status: 'sent',
        }),
        data: {
          amount: '88.88',
          note: '测试转账',
          status: 'sent',
        },
      };
      break;
    case 'transfer-char':
      entry = {
        id: generateId('transfer'),
        type: 'transfer',
        sender: 'them',
        content: JSON.stringify({
          amount: '66.66',
          note: 'AI测试转账',
          status: 'sent',
        }),
        data: {
          amount: '66.66',
          note: 'AI测试转账',
          status: 'sent',
        },
      };
      break;
    case 'gift-user':
      entry = {
        id: generateId('gift'),
        type: 'gift',
        sender: 'me',
        content: JSON.stringify({
          name: '生日蛋糕',
          price: '99.99',
          status: 'sent',
        }),
        data: {
          name: '生日蛋糕',
          price: '99.99',
          status: 'sent',
        },
      };
      break;
    case 'gift-char':
      entry = {
        id: generateId('gift'),
        type: 'gift',
        sender: 'them',
        content: JSON.stringify({
          name: '巧克力',
          price: '39.99',
          status: 'sent',
        }),
        data: {
          name: '巧克力',
          price: '39.99',
          status: 'sent',
        },
      };
      break;
    case 'moment-user':
      entry = {
        key: 'USER_MOMENT',
        data: {
          text: '用户朋友圈测试',
          image: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_2.jpg',
          image_type: 'url',
          date: getCurrentDate(),
          time: getCurrentTime(),
        },
      };
      break;
    case 'moment-char':
      entry = {
        key: 'CHAR_MOMENT',
        data: {
          text: 'AI朋友圈测试',
          image: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色小猫_1.jpg',
          image_type: 'url',
          date: getCurrentDate(),
          time: getCurrentTime(),
        },
      };
      break;
    case 'event-short':
      entry = {
        type: 'event',
        content: {
          date: getCurrentDate(),
          time: getCurrentTime(),
          description: '这是一个简短的事件日志测试',
        },
      };
      break;
    case 'event-long':
      entry = {
        type: 'event',
        content: {
          date: getCurrentDate(),
          time: getCurrentTime(),
          description:
            '这是一个非常长的事件日志测试，用来验证长文本的显示效果。在物语世界的深处，隐藏着无数的秘密和传说。每当夜幕降临，星光洒向大地，那些古老的故事便会在风中轻声诉说。主角踏上了寻找真相的旅程，穿越了森林、山川和海洋，遇到了各种各样的人物和挑战。这段旅程不仅是对外在世界的探索，更是对内心深处的自我发现。',
        },
      };
      break;
    case 'time':
      entry = {
        type: 'time',
        content: {
          date: getCurrentDate(),
          time: getCurrentTime(),
        },
      };
      break;
    default:
      console.error('[DEBUG] 未知的测试数据类型:', entryType);
      return;
  }

  if (entry) {
    blmxManager.addEntry(entry);
    blmxManager.persistLogToStorage();
    console.log(`[DEBUG] 已添加测试数据: ${entryType}`, entry);
  }
}

// 显示测试条目类型
export function showTestEntryTypes(): void {
  console.log('[BLMX Debug] 可用的测试条目类型:');
  console.log('- text-user: 用户文本消息');
  console.log('- text-char: AI文本消息');
  console.log('- sticker-user: 用户表情消息');
  console.log('- sticker-char: AI表情消息');
  console.log('- image-user: 用户图片消息');
  console.log('- image-char: AI图片消息');
  console.log('- voice-user: 用户语音消息');
  console.log('- voice-char: AI语音消息');
  console.log('- transfer-user: 用户转账消息');
  console.log('- gift-user: 用户礼物消息');
  console.log('- moment-user: 用户朋友圈动态');
  console.log('- moment-char: AI朋友圈动态');
  console.log('- event-short: 短事件日志');
  console.log('- event-long: 长事件日志（测试长文本显示）');
  console.log('- time: 时间戳');
}

// 显示调试信息
export function showDebugInfo(appController: any): void {
  console.log('[BLMX Debug] 调试信息:');

  try {
    // 确保能够获取到这些方法
    const rawAiResponse = appController.getRawAiResponse ? appController.getRawAiResponse() : '无法获取';
    const fullPrompt = appController.getFullPrompt ? appController.getFullPrompt() : '无法获取';
    const latestAiRawResponse = appController.getLatestAiRawResponse
      ? appController.getLatestAiRawResponse()
      : '无法获取';
    const latestSentPrompt = appController.getLatestSentPrompt ? appController.getLatestSentPrompt() : '无法获取';

    console.log('- 原始AI响应:', rawAiResponse);
    console.log('- 完整提示词:', fullPrompt);
    console.log('- 最新处理后的AI响应:', latestAiRawResponse);
    console.log('- 最新发送给AI的提示:', latestSentPrompt);
  } catch (error) {
    console.error('[BLMX Debug] 获取调试信息时出错:', error);
  }
}
