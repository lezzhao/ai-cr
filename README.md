# 🔍 AI Code Review

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

AI驱动的智能代码审查工具，支持Git hooks集成，提供多维度代码质量分析和友好的Web界面展示。

## ✨ 功能特性

- 🔍 **智能代码分析**: 使用AI模型分析代码变更，识别潜在问题
- 🚀 **Git Hooks集成**: 支持pre-commit、commit-msg、post-commit自动化分析
- 🌟 **多AI服务支持**: 支持DeepSeek、OpenAI、Moonshot等主流AI服务
- 📋 **详细反馈报告**: 提供代码质量、安全性、性能等多维度分析
- 📄 **多种输出格式**: 支持Markdown、HTML、JSON、控制台输出
- 🛠️ **高度可配置**: 支持自定义分析规则和反馈格式
- 💬 **中文友好**: 完整的中文界面和反馈
- 🌐 **Web界面**: 现代化的Web界面，实时查看分析结果

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/ai-cr.git
cd ai-cr

# 安装依赖
npm install

# 构建项目
npm run build
```

### 配置

1. 复制环境配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置AI服务API密钥：
```env
# DeepSeek (推荐，性价比高)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Moonshot
MOONSHOT_API_KEY=your_moonshot_api_key_here
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1

# 默认AI服务提供商
DEFAULT_AI_PROVIDER=deepseek
```

### 基本使用

```bash
# 分析暂存区文件
npx ai-cr analyze --staged

# 分析工作区文件
npx ai-cr analyze --working

# 分析指定提交
npx ai-cr analyze --commit HEAD

# 指定输出格式
npx ai-cr analyze --staged --format markdown --output ./reports/report.md

# 使用指定AI服务
npx ai-cr analyze --staged --provider openai
```

## 🔧 Git Hooks 集成

### 安装Git Hooks

```bash
# 安装所有Git hooks
npx ai-cr install-hooks

# 检查hooks状态
npx ai-cr hooks-status

# 卸载Git hooks
npx ai-cr uninstall-hooks
```

安装后，Git hooks将自动在以下时机运行：

- **pre-commit**: 提交前分析暂存区文件，如有问题将阻止提交
- **commit-msg**: 分析提交信息质量
- **post-commit**: 提交后生成详细分析报告

## 🌐 Web界面

启动Web服务：

```bash
# 启动Web服务
npx ai-cr web

# 指定端口和主机
npx ai-cr web --port 3000 --host 0.0.0.0
```

访问 `http://localhost:8000` 查看Web界面。

## 📊 分析报告

### 支持的分析维度

- **🐛 Bug检测**: 识别潜在的代码错误和逻辑问题
- **🔒 安全分析**: 检测安全漏洞和风险点
- **⚡ 性能优化**: 提供性能改进建议
- **🎨 代码风格**: 检查代码规范和风格一致性
- **🔧 可维护性**: 评估代码的可维护性和可读性
- **♿ 可访问性**: 检查可访问性相关问题
- **✅ 最佳实践**: 验证是否符合编程最佳实践

### 输出格式

- **Markdown**: 适合文档和报告
- **HTML**: 适合在浏览器中查看
- **JSON**: 适合程序化处理
- **控制台**: 适合命令行查看

## ⚙️ 配置选项

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `DEFAULT_AI_PROVIDER` | 默认AI服务提供商 | `deepseek` |
| `MAX_FILE_SIZE` | 最大文件大小(字节) | `100000` |
| `MAX_FILES_PER_ANALYSIS` | 单次分析最大文件数 | `50` |
| `ANALYSIS_TIMEOUT` | 分析超时时间(秒) | `300` |
| `OUTPUT_FORMAT` | 默认输出格式 | `markdown` |
| `OUTPUT_DIR` | 输出目录 | `./reports` |

### 配置文件

创建 `ai-cr.config.yaml` 文件进行高级配置：

```yaml
ai:
  provider: deepseek
  model: deepseek-coder
  temperature: 0.1
  maxTokens: 4000
  timeout: 30000

analysis:
  maxFileSize: 100000
  maxFilesPerAnalysis: 50
  timeout: 300
  includePatterns:
    - "**/*.{js,ts,jsx,tsx,py,java,go,rs}"
  excludePatterns:
    - "node_modules/**"
    - "dist/**"
    - "build/**"

output:
  format: markdown
  directory: ./reports
  includeSummary: true
  includeDetails: true
  groupByFile: true

web:
  host: 127.0.0.1
  port: 8000
  debug: false
  cors: true
```

## 🛠️ 开发

### 项目结构

```
ai-cr/
├── src/
│   ├── cli.ts              # 命令行接口
│   ├── config/             # 配置管理
│   ├── core/               # 核心分析引擎
│   ├── services/           # AI服务提供商
│   ├── integrations/       # Git集成
│   ├── web/                # Web服务
│   ├── utils/              # 工具函数
│   └── types/              # 类型定义
├── tests/                  # 测试文件
├── docs/                   # 文档
└── hooks/                  # Git hooks模板
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format

# Web开发
npm run web:dev
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供优秀的AI代码分析服务
- [OpenAI](https://openai.com/) - 提供强大的GPT模型
- [Moonshot](https://www.moonshot.cn/) - 提供高质量的中文AI服务

## 📞 支持

如果你遇到问题或有建议，请：

- 提交 [Issue](https://github.com/your-username/ai-cr/issues)
- 查看 [文档](https://github.com/your-username/ai-cr/wiki)
- 联系维护者

---

⭐ 如果这个项目对你有帮助，请给它一个星标！