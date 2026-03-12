import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let query = supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('heat_level', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: topics, error } = await query.limit(20)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      topics: topics || []
    })
    
  } catch (error) {
    console.error('Topics error:', error)
    return NextResponse.json(
      { error: '获取选题失败' },
      { status: 500 }
    )
  }
}
