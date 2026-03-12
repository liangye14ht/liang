import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/history - 获取历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Failed to fetch history:', error);
      return NextResponse.json(
        { error: '获取历史记录失败' },
        { status: 500 }
      );
    }
    
    // 格式化返回数据
    const history = data?.map(item => ({
      id: item.id,
      content_type: item.content_type,
      topic: item.topic,
      titles: item.result_titles || [],
      content: item.result_content || '',
      tags: item.result_tags || [],
      created_at: item.created_at,
    })) || [];
    
    return NextResponse.json({ history });
    
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// DELETE /api/history - 删除历史记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少记录ID' },
        { status: 400 }
      );
    }
    
    const { error } = await supabaseAdmin
      .from('generations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete history:', error);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
