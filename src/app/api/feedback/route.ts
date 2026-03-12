import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/feedback - 提交反馈
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, type, comment } = body;
    
    if (!generationId || !type) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const { error } = await supabaseAdmin
      .from('feedback')
      .insert({
        generation_id: generationId,
        type,
        comment,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Failed to save feedback:', error);
      return NextResponse.json(
        { error: '提交反馈失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
