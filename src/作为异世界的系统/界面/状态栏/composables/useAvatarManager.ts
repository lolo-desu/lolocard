import { ref } from 'vue';

const AVATAR_WORLDBOOK_NAME = '转生系统的头像文件！';
const MAX_IMAGE_SIZE = 500; // 压缩后的最大尺寸

/**
 * 压缩图片并转换为 base64
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 计算压缩后的尺寸，保持宽高比
        if (width > height && width > MAX_IMAGE_SIZE) {
          height = (height * MAX_IMAGE_SIZE) / width;
          width = MAX_IMAGE_SIZE;
        } else if (height >= width && height > MAX_IMAGE_SIZE) {
          width = (width * MAX_IMAGE_SIZE) / height;
          height = MAX_IMAGE_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取 canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 base64，使用 JPEG 格式压缩
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 获取或创建头像世界书
 */
async function ensureAvatarWorldbook(): Promise<void> {
  const worldbooks = getWorldbookNames();
  if (!worldbooks.includes(AVATAR_WORLDBOOK_NAME)) {
    await createWorldbook(AVATAR_WORLDBOOK_NAME, []);
    // 绑定到当前聊天
    await rebindChatWorldbook('current', AVATAR_WORLDBOOK_NAME);
  }
}

/**
 * 保存头像到聊天知识书
 */
async function saveAvatar(characterName: string, base64: string): Promise<void> {
  await ensureAvatarWorldbook();
  
  const worldbook = await getWorldbook(AVATAR_WORLDBOOK_NAME);
  
  // 查找是否已存在该角色的头像条目
  const existingEntryIndex = worldbook.findIndex(
    entry => entry.strategy.keys.includes(characterName)
  );
  
  const entryData = {
    name: `${characterName}的头像`,
    enabled: true,
    strategy: {
      type: 'selective' as const,
      keys: [characterName],
      keys_secondary: { logic: 'and_any' as const, keys: [] },
      scan_depth: 1,
    },
    position: {
      type: 'after_character_definition' as const,
      role: 'system' as const,
      depth: 0,
      order: 999,
    },
    content: JSON.stringify({
      角色名称: characterName,
      头像数据: base64,
      更新时间: new Date().toISOString(),
    }),
    probability: 100,
    recursion: {
      prevent_incoming: true,
      prevent_outgoing: true,
      delay_until: null,
    },
    effect: {
      sticky: null,
      cooldown: null,
      delay: null,
    },
  };
  
  if (existingEntryIndex >= 0) {
    // 更新现有条目
    worldbook[existingEntryIndex] = {
      ...worldbook[existingEntryIndex],
      ...entryData,
    };
    await replaceWorldbook(AVATAR_WORLDBOOK_NAME, worldbook);
  } else {
    // 创建新条目
    await createWorldbookEntries(AVATAR_WORLDBOOK_NAME, [entryData]);
  }
}

/**
 * 读取角色头像
 */
async function loadAvatar(characterName: string): Promise<string | null> {
  try {
    const worldbooks = getWorldbookNames();
    if (!worldbooks.includes(AVATAR_WORLDBOOK_NAME)) {
      return null;
    }
    
    const worldbook = await getWorldbook(AVATAR_WORLDBOOK_NAME);
    const entry = worldbook.find(
      e => e.strategy.keys.includes(characterName)
    );
    
    if (!entry) {
      return null;
    }
    
    const data = JSON.parse(entry.content);
    return data.头像数据 || null;
  } catch (err) {
    console.error('[头像管理] 读取头像失败', err);
    return null;
  }
}

export function useAvatarManager() {
  const uploading = ref(false);
  const avatarUrl = ref<string | null>(null);
  
  /**
   * 上传头像
   */
  const uploadAvatar = async (characterName: string): Promise<void> => {
    if (!characterName || characterName === '角色名称') {
      toastr?.warning?.('请先设置角色名称', '头像上传');
      return;
    }
    
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toastr?.error?.('请选择图片文件', '头像上传');
        return;
      }
      
      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        toastr?.error?.('图片文件过大，请选择小于 5MB 的图片', '头像上传');
        return;
      }
      
      uploading.value = true;
      
      try {
        // 压缩并转换为 base64
        const base64 = await compressImage(file);
        
        // 保存到聊天知识书
        await saveAvatar(characterName, base64);
        
        // 更新显示
        avatarUrl.value = base64;
        
        toastr?.success?.('头像上传成功', '头像上传');
      } catch (err) {
        console.error('[头像上传] 失败', err);
        toastr?.error?.('头像上传失败：' + (err as Error).message, '头像上传');
      } finally {
        uploading.value = false;
      }
    };
    
    input.click();
  };
  
  /**
   * 加载头像
   */
  const loadAvatarForCharacter = async (characterName: string): Promise<void> => {
    if (!characterName || characterName === '角色名称') {
      avatarUrl.value = null;
      return;
    }
    
    try {
      const url = await loadAvatar(characterName);
      avatarUrl.value = url;
    } catch (err) {
      console.error('[头像加载] 失败', err);
      avatarUrl.value = null;
    }
  };
  
  return {
    uploading,
    avatarUrl,
    uploadAvatar,
    loadAvatarForCharacter,
  };
}