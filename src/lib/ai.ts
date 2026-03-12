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

// 生成文案的 Prompt 模板 - 优化版
const generatePrompt = (params: {
  contentType: string;
  topic: string;
  keywords?: string;
  productInfo?: string;
  style: string;
  length: string;
}) => {
  const lengthMap: Record<string, string> = {
    short: '100字以内，简短有力',
    medium: '200-300字，内容充实',
    long: '400字以上，详细丰富'
  };

  const styleGuide: Record<string, string> = {
    '亲切': '像闺蜜聊天一样自然亲切，多用"姐妹们""宝子们""家人们"等称呼，口语化表达，带有一点小激动和小情绪',
    '专业': '专业有干货，数据支撑，逻辑清晰，体现专业度和可信度，但也不失亲切感',
    '幽默': '幽默风趣，轻松调侃，带点小段子，让人会心一笑，增加记忆点',
    '高级': '高级有质感，用词精致，画面感强，营造精致生活方式的氛围'
  };

  const contentTypeGuide: Record<string, string> = {
    '种草': '突出产品卖点和使用感受，真实体验分享，激发购买欲望，但不过度营销',
    '教程': '步骤清晰，重点突出，实用性强，让读者能跟着操作',
    '生活': '真情实感，有共鸣点，分享生活态度和感悟',
    '测评': '客观公正，优缺点都讲，给出真实建议',
    '探店': '环境氛围+菜品/产品+服务体验，全方位分享'
  };

  return `你是一位拥有百万粉丝的小红书头部博主，擅长写出爆款笔记。请根据以下要求创作内容：

【内容类型】${params.contentType} - ${contentTypeGuide[params.contentType] || '综合分享'}
【主题】${params.topic}
${params.keywords ? `【关键词】${params.keywords}（请自然融入内容）` : ''}
${params.productInfo ? `【产品/品牌信息】${params.productInfo}（请巧妙植入）` : ''}
【风格】${styleGuide[params.style] || styleGuide['亲切']}
【篇幅】${lengthMap[params.length] || '200-300字'}

请生成：
1. 3个爆款标题（必须包含emoji，吸引人点击）
2. 1篇完整的正文内容（符合小红书爆款调性）

爆款笔记写作要求：
【标题技巧】
- 使用数字、对比、悬念等技巧
- 加入热门emoji增加视觉吸引力
- 突出痛点或利益点

【正文结构】
- 开头：抓人眼球的第一句话（痛点/惊喜/共鸣）
- 中间：内容主体，分段清晰，每段有重点
- 结尾：引导互动（提问/求赞/邀评论）

【语言风格】
- 真情实感，像真实用户分享体验
- 适当使用小红书流行语（绝绝子、yyds、挖到宝了、闭眼入等）
- 多用emoji增加氛围感（✨🌟💫💖💕🎀等）
- 短句为主，避免长段落
- 绝对不要出现"首先、其次、最后、综上所述"等机械连接词

【标签要求】
- 结尾添加5-8个相关话题标签
- 包含大流量标签+精准标签的组合

请严格按以下格式输出：

标题1: [emoji] 标题内容
标题2: [emoji] 标题内容  
标题3: [emoji] 标题内容

正文:
[正文内容，注意分段和emoji使用]

标签: #标签1 #标签2 #标签3 #标签4 #标签5 #标签6`;
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
