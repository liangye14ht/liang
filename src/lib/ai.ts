const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_MODEL = 'moonshot-v1-8k';

interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

// 生成文案的 Prompt 模板
const generatePrompt = (params: {
  contentType: string;
  topic: string;
  keywords?: string;
  productInfo?: string;
  style: string;
  length: string;
}) => {
  const lengthMap: Record<string, string> = {
    short: '100字以内',
    medium: '200-300字',
    long: '400字以上'
  };

  return `你是一个专业的小红书内容创作专家。请根据以下要求生成小红书笔记：

【内容类型】${params.contentType}
【主题】${params.topic}
${params.keywords ? `【关键词】${params.keywords}` : ''}
${params.productInfo ? `【产品/品牌信息】${params.productInfo}` : ''}
【风格】${params.style}
【篇幅】${lengthMap[params.length] || '200-300字'}

请生成：
1. 3个吸引人的标题（包含emoji）
2. 1篇完整的正文内容（符合小红书调性，包含emoji、分段、话题标签）

要求：
- 标题要抓人眼球，使用emoji增加视觉吸引力
- 正文要有真情实感，像真实用户分享
- 内容结构清晰，有开头、正文、结尾
- 适当使用小红书流行语和emoji
- 结尾添加相关话题标签（5-8个）
- 不要出现"首先、其次、最后"这种机械连接词
- 语气要${params.style === '亲切' ? '亲切自然像闺蜜聊天' : params.style === '专业' ? '专业有干货' : params.style === '幽默' ? '幽默风趣' : '高级有质感'}

请严格按以下格式输出：

标题1: [emoji] 标题内容
标题2: [emoji] 标题内容
标题3: [emoji] 标题内容

正文:
[正文内容]

标签: #标签1 #标签2 #标签3 #标签4 #标签5`;
};

// 调用 Kimi API
export async function generateWithKimi(params: {
  contentType: string;
  topic: string;
  keywords?: string;
  productInfo?: string;
  style: string;
  length: string;
}): Promise<{
  titles: string[];
  content: string;
  tags: string[];
  tokensUsed: number;
}> {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const prompt = generatePrompt(params);

  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是小红书内容创作专家，擅长写出爆款笔记。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data: KimiResponse = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  // 解析 AI 输出
  const result = parseAIResponse(content);
  
  return {
    ...result,
    tokensUsed: (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0),
  };
}

// 解析 AI 输出
function parseAIResponse(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  
  const titles: string[] = [];
  let content = '';
  let tags: string[] = [];
  
  let inContent = false;
  let inTags = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('标题') && trimmedLine.includes(':')) {
      const title = trimmedLine.split(':').slice(1).join(':').trim();
      if (title) titles.push(title);
      inContent = false;
      inTags = false;
    } else if (trimmedLine.startsWith('正文:') || trimmedLine === '正文') {
      inContent = true;
      inTags = false;
    } else if (trimmedLine.startsWith('标签:')) {
      inContent = false;
      inTags = true;
      const tagStr = trimmedLine.replace('标签:', '').trim();
      tags = tagStr.split(/\s+/).filter(t => t.startsWith('#'));
    } else if (inContent && !trimmedLine.startsWith('标题')) {
      content += line + '\n';
    } else if (inTags && trimmedLine.startsWith('#')) {
      tags = trimmedLine.split(/\s+/).filter(t => t.startsWith('#'));
    }
  }
  
  // 如果标签为空，从内容中提取或生成默认标签
  if (tags.length === 0) {
    tags = ['#小红书', '#分享', '#日常'];
  }
  
  return { titles, content: content.trim(), tags };
}

// 模拟生成 (备用方案)
export function mockGenerate(params: {
  contentType: string;
  topic: string;
  style: string;
}) {
  const titles = [
    `✨ ${params.topic}｜这也太好用了吧！`,
    `🌟 被问爆的${params.topic}，终于整理好了`,
    `💡 ${params.topic}攻略｜新手必看`
  ];
  
  const content = `姐妹们！今天必须分享这个${params.topic}！

最近一直在研究这个，试了很多方法，终于找到最好的方案～

🌟 为什么要分享：
• 真的太实用了
• 解决了我很久的困扰
• 性价比超高

💡 使用心得：
用了大概两周，效果超出预期！${params.style === '专业' ? '从专业角度分析，确实是目前最优解。' : '真的超级推荐给大家！'}

有任何问题评论区问我呀～

#${params.topic.replace(/\s/g, '')} #分享 #好物推荐 #日常`;

  return {
    titles,
    content,
    tags: [`#${params.topic.replace(/\s/g, '')}`, '#分享', '#好物推荐'],
    tokensUsed: 0
  };
}
