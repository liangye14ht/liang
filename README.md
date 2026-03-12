# 小红书AI写作助手

AI-powered content creation tool for Xiaohongshu (Little Red Book) creators.

**在线演示**: [待部署]

## 功能特性

- ✅ **智能文案生成** - 输入主题，一键生成标题+正文
- ✅ **热门选题推荐** - 基于热点数据的选题灵感
- 🚧 **爆款分析** - 分析爆款笔记成功要素 (开发中)
- 🚧 **标签优化** - 智能推荐话题标签 (开发中)

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes + Supabase
- **AI**: Claude API / Kimi API (待接入)
- **部署**: Vercel (待配置)

## 本地开发

```bash
# 1. 克隆项目
git clone [repo-url]
cd xiaohongshu-ai-writer

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 数据库设置

1. 在 Supabase Dashboard 打开 SQL Editor
2. 执行 `supabase/schema.sql` 中的 SQL 语句

## 部署

```bash
# 构建
npm run build

# 部署到 Vercel (需要配置环境变量)
vercel --prod
```

## 项目结构

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── generate/     # 文案生成页面
│   │   ├── topics/       # 选题推荐页面
│   │   ├── page.tsx      # 首页
│   │   └── layout.tsx    # 根布局
│   ├── components/       # UI 组件
│   └── lib/              # 工具函数
├── supabase/
│   └── schema.sql        # 数据库表结构
└── docs/                 # 项目文档
```

## 开发计划

### MVP (Week 3-4) ✅
- [x] 首页 + 文案生成页
- [x] 选题推荐页
- [x] 后端 API
- [x] Supabase 集成
- [ ] AI 接入 (Claude/Kimi)
- [ ] 用户认证
- [ ] 部署上线

### V1.1 (Month 2)
- [ ] 爆款分析功能
- [ ] 标签优化
- [ ] 历史记录
- [ ] 支付集成

### V1.2 (Month 3)
- [ ] 用户系统完善
- [ ] 数据分析
- [ ] 团队协作

## 文档

- [产品需求文档 (PRD)](../../product/xiaohongshu-ai-writer-prd.md)
- [技术架构文档](./docs/architecture.md)
- [种子用户招募方案](./docs/seed-user-recruitment.md)

## 团队

- **CEO**: Zero (@zero-ai-ceo)
- **产品**: Zero
- **开发**: Zero  
- **运营**: Zero

---
*Built with ❤️ by Zero Labs*
