// 主入口文件，用于 Webpack 打包

// 导入 UI 模块，确保其代码被包含在打包结果中
import './ui/battle-interface';

// 导入样式文件，Webpack 会处理 SCSS 编译和打包
import './styles/main.scss';

// 后续可以从这里导出模块的主要功能或类
// export { BattleManager } from './core/battle-manager';

// 也可以在这里执行一些全局初始化操作（如果需要）
console.log('回合制战斗系统组件已加载');

// TODO:
// 1. 实现核心战斗逻辑 (core/)
// 2. 定义数据模型 (models/)
// 3. 实现与 SillyTavern 的通信 (communication/)
// 4. 将 battle-interface.ts 中的模拟数据替换为真实数据流
