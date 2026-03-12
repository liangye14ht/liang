import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/payment/create - 创建支付订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: '缺少套餐ID' },
        { status: 400 }
      );
    }
    
    // 验证套餐
    const plans: Record<string, { price: number; name: string }> = {
      basic: { price: 2900, name: '个人版' }, // 单位：分
      pro: { price: 9900, name: '专业版' },
    };
    
    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json(
        { error: '无效的套餐' },
        { status: 400 }
      );
    }
    
    // 生成订单号
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 保存订单到数据库
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: 'anonymous', // TODO: 替换为实际用户ID
        plan: planId,
        amount: plan.price,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      });
    
    if (insertError) {
      console.error('Failed to create order:', insertError);
      return NextResponse.json(
        { error: '创建订单失败' },
        { status: 500 }
      );
    }
    
    // TODO: 接入实际支付网关（微信支付/支付宝）
    // 目前返回模拟数据
    
    return NextResponse.json({
      orderId,
      planId,
      amount: plan.price,
      planName: plan.name,
      // 支付链接（实际接入时返回）
      // paymentUrl: `https://pay.example.com/${orderId}`,
      // 或返回二维码URL
      // qrCode: `https://api.example.com/qr/${orderId}`,
      
      // 模拟数据
      message: '支付系统接入中，即将上线',
      mockMode: true,
    });
    
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// GET /api/payment/status - 查询支付状态
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
    
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      orderId: data.order_id,
      status: data.status,
      plan: data.plan,
      amount: data.amount,
      paidAt: data.paid_at,
      expiresAt: data.expires_at,
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
