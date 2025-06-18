# 技术背景

## 技术栈

### 前端
- **TypeScript** - 主要编程语言
- **HTML/SCSS** - 结构和样式
- **Webpack** - 模块打包和构建流程

### 构建与开发
- **Node.js** - JavaScript运行环境
- **pnpm** - 包管理工具
- **ESLint/Prettier** - 代码格式化和检查

## 项目结构
- `/src` - 主要源代码目录
  - `/圣约与静默` ("Covenant and Silence") - 带有视觉小说组件的游戏模块
    - `/游戏界面` ("Game Interface") - 核心游戏UI组件
  - `/示例` ("Examples") - 模板代码和示例
    - `/脚本模板` ("Script Templates")
    - `/脚本示例` ("Script Examples") 
    - `/界面模板` ("Interface Templates")
    - `/界面示例` ("Interface Examples")
- `/tavern_helper` - 外部系统集成模块

## 关键依赖
- 游戏元素的自定义组件系统
- 用于快速开发的界面模板系统
- 用于游戏逻辑和叙事流程的脚本系统

## 开发环境
- VSCode作为主要编辑器
- Git用于版本控制
- 使用Prettier进行代码格式化
- 通过tsconfig.json配置TypeScript
- Webpack用于打包和开发服务器

## 技术约束
- 浏览器兼容性要求
- 动画和过渡效果的性能考虑
- 本地化支持（以中文为主的多语言支持）
- 与Tavern Helper系统的集成要求

## 部署流程
- 使用Webpack构建
- 可能从静态文件托管服务
- 可能嵌入其他应用程序中

## 技术债务和考虑事项
- 需要记录与tavern_helper的确切关系
- 文件结构使用混合语言命名（中文和英文）
- 构建过程复杂性
