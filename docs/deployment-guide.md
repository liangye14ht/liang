# 小红书AI写作助手 - 部署方案

## 📊 部署状态总结

### ✅ 已完成
- [x] 本地开发服务器测试
- [x] 项目构建成功
- [x] 代码提交到 Git

### ⚠️ 需要注意
- API路由需要服务端支持，不能纯静态部署
- 数据库表需要在 Supabase 中创建

---

## 🚀 推荐部署方案

### 方案一：Netlify（推荐，已配置）

项目已配置 `netlify.toml`，支持 Next.js 服务端渲染。

**部署步骤：**

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 创建新仓库 xiaohongshu-ai-writer
   git remote add origin https://github.com/YOUR_USERNAME/xiaohongshu-ai-writer.git
   git push -u origin master
   ```

2. **连接 Netlify**
   - 登录 [Netlify](https://app.netlify.com)
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub 仓库
   - 构建设置会自动读取 `netlify.toml`

3. **配置环境变量**
   在 Netlify Dashboard → Site settings → Environment variables 添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://heqrqvmvacpczngdxjzo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DOjgadiPTCgOyNigwcCUKQ_djxtTupQ
   KIMI_API_KEY=sk-kimi-ocOdgcWuKbbw3hWUFBjjMJYJ4cBjVwlBE0KPuK7ula8zp3vqIFey1Whv0qzc7XB6
   ```

4. **部署**
   - 点击 "Deploy site"
   - 等待构建完成（约2-3分钟）

---

### 方案二：Vercel（Next.js 原生支持）

**部署步骤：**

1. **创建 GitHub 仓库**（同上）

2. **导入到 Vercel**
   - 登录 [Vercel](https://vercel.com)
   - 点击 "Add New Project"
   - 导入 GitHub 仓库
   - 框架预设选择 "Next.js"

3. **配置环境变量**（同上）

4. **部署**
   - 点击 "Deploy"

---

### 方案三：Cloudflare Pages

**限制：** API 路由需要 Cloudflare Workers 适配。

如需使用，需要修改代码为纯静态导出 + Cloudflare Functions。

---

## 🗄️ 数据库设置

在 Supabase SQL 编辑器中运行：

```sql
-- 选题表
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  heat_level VARCHAR(20),
  tags JSONB,
  reference_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 所有用户可读
CREATE POLICY "Topics are viewable by all" ON topics
  FOR SELECT USING (true);

-- 插入示例数据
INSERT INTO topics (title, description, category, heat_level, tags) VALUES
('早春穿搭趋势', '2024年最流行的春季穿搭风格盘点', '穿搭', 'high', '["#早春穿搭", "#时尚", "#ootd"]'),
('减脂餐分享', '一周不重样的健康减脂餐食谱', '美食', 'high', '["#减脂", "#健康饮食", "#食谱"]'),
('护肤routine', '早晚护肤步骤详解', '美妆', 'medium', '["#护肤", "#美妆", "#routine"]'),
('读书笔记', '近期读过的好书推荐', '知识', 'medium', '["#读书", "#书单", "#成长"]'),
('家居好物', '提升生活品质的平价好物', '生活', 'high', '["#家居", "#好物推荐", "#生活"]')
ON CONFLICT DO NOTHING;
```

---

## 📁 项目文件结构

```
xiaohongshu-ai-writer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/     # AI文案生成API
│   │   │   └── topics/       # 热门选题API
│   │   ├── generate/         # 生成页面
│   │   ├── topics/           # 选题页面
│   │   ├── page.tsx          # 首页
│   │   └── layout.tsx
│   ├── components/ui/        # UI组件
│   └── lib/
│       ├── ai.ts            # Kimi AI 集成
│       └── supabase.ts      # 数据库客户端
├── supabase/
│   └── schema.sql           # 数据库结构
├── netlify.toml             # Netlify配置
└── next.config.ts
```

---

## 🔧 技术栈

- **框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + shadcn/ui
- **AI**: Kimi API (Moonshot)
- **数据库**: Supabase (PostgreSQL)
- **部署**: Netlify / Vercel

---

## 📝 构建输出

构建成功路径：`D:\projects\xiaohongshu-ai-writer\.next`

路由配置：
- `/` - 首页
- `/generate` - 文案生成
- `/topics` - 热门选题
- `/api/generate` - 生成API (服务端)
- `/api/topics` - 选题API (服务端)

---

## 🎯 下一步操作

1. **创建 GitHub 仓库并推送代码**
2. **在 Netlify/Vercel 导入项目**
3. **配置环境变量**
4. **在 Supabase 执行 SQL 创建表**
5. **部署并测试**

预计上线时间：10-15 分钟
