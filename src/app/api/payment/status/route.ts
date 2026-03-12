import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { queryOrder } from '@/lib/wechat-pay';

// GET /api/payment/status - 查询订单状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      );
    }
    
    // 查询本地数据库
    const { data: localOrder, error: dbError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (dbError || !localOrder) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }
    
    // 如果订单还在pending状态，尝试从微信支付查询最新状态
    if (localOrder.status === 'pending') {
      try {
        // 查询微信支付订单状态
        const wxResult = await queryOrder(orderId);
        
        if (wxResult.trade_state === 'SUCCESS') {
          // 更新本地订单状态
          await supabaseAdmin
            .from('payments')
            .update({
              status: 'paid',
              transaction_id: wxResult.transaction_id,
              paid_at: wxResult.success_time || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('order_id', orderId);
          
          localOrder.status = 'paid';
          localOrder.transaction_id = wxResult.transaction_id;
          localOrder.paid_at = wxResult.success_time;
        }
      } catch (e) {
        // 微信支付查询失败，使用本地状态
        console.log('WeChat query failed, using local status:', e);
      }
    }
    
    return NextResponse.json({
      orderId: localOrder.order_id,
      status: localOrder.status, // pending, paid, failed, refunded
      plan: localOrder.plan,
      amount: localOrder.amount,
      transactionId: localOrder.transaction_id,
      paidAt: localOrder.paid_at,
      expiresAt: localOrder.expires_at,
      createdAt: localOrder.created_at,
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST /api/payment/status - 手动更新订单状态（用于测试/模拟支付）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status = 'paid' } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      );
    }
    
    // 更新订单状态
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);
    
    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return NextResponse.json(
        { error: '更新订单失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      orderId,
      status,
      message: '订单状态已更新',
    });
    
  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
