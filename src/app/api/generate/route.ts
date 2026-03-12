import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { generateWithKimi, mockGenerate } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, topic, keywords, productInfo, style, length } = body;
    
    if (!contentType || !topic) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 获取用户 (如果有的话)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    // 检查使用配额
    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      const { count, error: countError } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', today);
      
      // TODO: 根据用户计划检查配额
      console.log('今日使用量:', count);
    }
    
    // 生成内容
    let result;
    try {
      // 尝试使用 Kimi API
      result = await generateWithKimi({
        contentType,
        topic,
        keywords,
        productInfo,
        style,
        length
      });
    } catch (aiError) {
      console.error('AI generation failed, using mock:', aiError);
      // 如果 AI 失败，使用模拟数据
      result = mockGenerate({ contentType, topic, style });
    }
    
    // 保存到数据库
    if (userId) {
      await supabaseAdmin.from('generations').insert({
        user_id: userId,
        content_type: contentType,
        topic,
        keywords,
        style,
        length,
        result_titles: result.titles,
        result_content: result.content,
        result_tags: result.tags,
        tokens_used: result.tokensUsed
      });
    }
    
    return NextResponse.json({
      success: true,
      titles: result.titles,
      content: result.content,
      tags: result.tags,
      usage: {
        remaining: userId ? 3 : 1
      }
    });
    
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}
