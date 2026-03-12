-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  plan VARCHAR(20) DEFAULT 'free',
  daily_quota INTEGER DEFAULT 3,
  monthly_quota INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生成记录表
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50),
  topic VARCHAR(255),
  keywords TEXT,
  style VARCHAR(50),
  length VARCHAR(20),
  result_titles JSONB,
  result_content TEXT,
  result_tags JSONB,
  tokens_used INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);

-- 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 用户表的 RLS 策略
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 生成记录表的 RLS 策略
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);

-- 选题表的 RLS 策略 (所有用户可读)
CREATE POLICY "Topics are viewable by all" ON topics
  FOR SELECT USING (true);

-- 插入示例选题数据
INSERT INTO topics (title, description, category, heat_level, tags) VALUES
('早春穿搭趋势', '2024年最流行的春季穿搭风格盘点', '穿搭', 'high', '["#早春穿搭", "#时尚", "#ootd"]'),
('减脂餐分享', '一周不重样的健康减脂餐食谱', '美食', 'high', '["#减脂", "#健康饮食", "#食谱"]'),
('护肤routine', '早晚护肤步骤详解', '美妆', 'medium', '["#护肤", "#美妆", "#routine"]'),
('读书笔记', '近期读过的好书推荐', '知识', 'medium', '["#读书", "#书单", "#成长"]'),
('家居好物', '提升生活品质的平价好物', '生活', 'high', '["#家居", "#好物推荐", "#生活"]')
ON CONFLICT DO NOTHING;
