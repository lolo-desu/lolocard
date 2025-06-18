/**
 * 游戏状态生成服务
 * 负责根据玩家选择或记忆点生成新的游戏状态
 */
import { GameData } from '../scripts/models/gameData';

export class GameStateGenerationService {
  // 添加属性保存原始响应
  private lastRawResponse: string = '';

  constructor() {
    console.log('游戏状态生成服务已初始化');
  }

  /**
   * 获取最后一次LLM生成的原始响应
   * @returns 最后一次LLM的原始响应
   */
  public getLastRawResponse(): string {
    return this.lastRawResponse;
  }

  /**
   * 生成下一个游戏状态
   * @param choice 玩家选择
   */
  public async generateNextGameState(choice: string): Promise<GameData | null> {
    // 检查API是否可用
    if (typeof window.generate !== 'function') {
      console.warn('generate API不可用');
      return null;
    }

    try {
      // 使用简单标签替代复杂提示词
      const systemPrompt = `<选择>${choice}</选择>`;

      // 使用简单的inject参数指示AI返回游戏状态JSON
      const generateConfig = {
        user_input: choice,
        should_stream: false,
        injects: [
          {
            role: 'system',
            content: systemPrompt,
            position: 'before_prompt',
            depth: 0,
            should_scan: false,
          },
        ],
      };

      // 调用生成API
      const result = await window.generate(generateConfig);

      // 保存并打印完整的原始响应
      this.lastRawResponse = result;
      console.log('%c[LLM完整响应]', 'color: #ff5722; font-weight: bold;');
      console.log(result);

      // 解析结果
      const regex = /<gametext>([\s\S]*?)<\/gametext>/;
      const match = result.match(regex);

      if (match && match[1]) {
        try {
          const jsonData = match[1].trim();
          console.log('%c[找到游戏状态JSON]', 'color: #4caf50; font-weight: bold;');
          console.log(jsonData);
          const gameData = JSON.parse(jsonData);
          return gameData;
        } catch (parseError) {
          console.error('解析游戏数据JSON失败:', parseError);
          const jsonData = match[1].trim();
          console.log('%c[解析JSON失败]', 'color: #f44336; font-weight: bold;', jsonData);
          return null;
        }
      } else {
        console.error('未找到<gametext>标签或内容为空');
        return null;
      }
    } catch (error) {
      console.error('生成游戏状态失败:', error);
      return null;
    }
  }

  /**
   * 生成记忆点游戏状态
   * @param memory 记忆点对象
   */
  public async generateMemoryState(memory: { id: number; content: string; image?: string }): Promise<GameData | null> {
    // 检查API是否可用
    if (typeof window.generate !== 'function') {
      console.warn('generate API不可用');
      return null;
    }

    try {
      // 使用简单标签替代复杂提示词
      const systemPrompt = `<时间跳跃>${memory.content}</时间跳跃>`;

      // 使用简单的inject参数指示AI根据记忆点生成游戏状态
      const result = await window.generate({
        user_input: `穿越到记忆点"${memory.content}"`,
        should_stream: false,
        injects: [
          {
            role: 'system',
            content: systemPrompt,
            position: 'before_prompt',
            depth: 0,
            should_scan: false,
          },
        ],
      });

      // 保存并打印完整的原始响应
      this.lastRawResponse = result;
      console.log('%c[LLM记忆点响应]', 'color: #ff9800; font-weight: bold;');
      console.log(result);

      // 解析结果
      const regex = /<gametext>([\s\S]*?)<\/gametext>/;
      const match = result.match(regex);

      if (match && match[1]) {
        try {
          const jsonData = match[1].trim();
          console.log('%c[找到记忆点游戏状态JSON]', 'color: #4caf50; font-weight: bold;');
          console.log(jsonData);
          const gameData = JSON.parse(jsonData);
          return gameData;
        } catch (parseError) {
          console.error('解析记忆点游戏数据JSON失败:', parseError);
          const jsonData = match[1].trim();
          console.log('%c[解析记忆点JSON失败]', 'color: #f44336; font-weight: bold;', jsonData);
          return null;
        }
      }
    } catch (error) {
      console.error('生成记忆点游戏状态失败:', error);
    }

    return null;
  }

  /**
   * 处理自定义行动
   * @param action 玩家输入的自定义行动
   */
  public async handleCustomAction(action: string): Promise<GameData | null> {
    // 检查API是否可用
    if (typeof window.generate !== 'function') {
      console.warn('generate API不可用');
      return null;
    }

    try {
      // 使用简单标签替代复杂提示词
      const systemPrompt = `<自定义行动>${action}</自定义行动>`;

      // 使用inject参数指示AI处理自定义行动
      const result = await window.generate({
        user_input: action,
        should_stream: false,
        injects: [
          {
            role: 'system',
            content: systemPrompt,
            position: 'before_prompt',
            depth: 0,
            should_scan: false,
          },
        ],
      });

      // 保存并打印完整的原始响应
      this.lastRawResponse = result;
      console.log('%c[LLM自定义行动响应]', 'color: #2196f3; font-weight: bold;');
      console.log(result);

      // 解析结果
      const regex = /<gametext>([\s\S]*?)<\/gametext>/;
      const match = result.match(regex);

      if (match && match[1]) {
        try {
          const jsonData = match[1].trim();
          console.log('%c[找到自定义行动游戏状态JSON]', 'color: #4caf50; font-weight: bold;');
          console.log(jsonData);
          const gameData = JSON.parse(jsonData);
          return gameData;
        } catch (parseError) {
          console.error('解析自定义行动游戏数据JSON失败:', parseError);
          const jsonData = match[1].trim();
          console.log('%c[解析自定义行动JSON失败]', 'color: #f44336; font-weight: bold;', jsonData);
          return null;
        }
      }
    } catch (error) {
      console.error('处理自定义行动失败:', error);
    }

    return null;
  }

  /**
   * 添加一个辅助方法，可以通过控制台调用查看最后一次响应
   * 用法: window.debugLLMResponse()
   */
  public initDebugHelpers(): void {
    (window as any).debugLLMResponse = () => {
      console.log('%c[Debug] 最后一次LLM响应', 'background: #222; color: #bada55');
      console.log(this.lastRawResponse);

      // 尝试提取gametext部分
      const regex = /<gametext>([\s\S]*?)<\/gametext>/;
      const match = this.lastRawResponse.match(regex);

      if (match && match[1]) {
        console.log('%c[Debug] 提取的gametext内容', 'background: #222; color: #ffa500');
        console.log(match[1]);

        try {
          const parsed = JSON.parse(match[1]);
          console.log('%c[Debug] 解析后的JSON对象', 'background: #222; color: #4caf50');
          console.log(parsed);
        } catch (e) {
          console.log('%c[Debug] JSON解析失败', 'background: #222; color: #f44336');
          console.log(e);
        }
      } else {
        console.log('%c[Debug] 未找到gametext标签', 'background: #222; color: #f44336');
      }

      return '调试信息已输出到控制台';
    };
  }
}
