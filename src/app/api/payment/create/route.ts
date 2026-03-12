import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNativeOrder, plans, generateOrderId, payConfig } from '@/lib/wechat-pay';

// POST /api/payment/create - 创建支付订单（Native支付）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId = 'anonymous' } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: '缺少套餐ID' },
        { status: 400 }
      );
    }
    
    // 验证套餐
    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json(
        { error: '无效的套餐' },
        { status: 400 }
      );
    }
    
    // 检查配置
    if (!payConfig.mchid || !payConfig.appid) {
      return NextResponse.json(
        { error: '支付配置未完成，请联系管理员' },
        { status: 500 }
      );
    }
    
    // 生成订单号
    const orderId = generateOrderId();
    
    // 保存订单到数据库
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        user_id: userId,
        plan: planId,
        amount: plan.price,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    
    if (insertError) {
      console.error('Failed to create order:', insertError);
      return NextResponse.json(
        { error: '创建订单失败' },
        { status: 500 }
      );
    }
    
    // 调用微信支付接口创建Native支付订单
    try {
      const result = await createNativeOrder({
        description: plan.description,
        outTradeNo: orderId,
        amount: plan.price,
        attach: JSON.stringify({ planId, userId }),
      });
      
      // 返回支付二维码链接
      return NextResponse.json({
        orderId,
        planId,
        amount: plan.price,
        planName: plan.name,
        qrCode: result.code_url, // 微信支付二维码链接
        // 也可以返回转换为二维码图片的URL
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.code_url)}`,
      });
      
    } catch (payError: any) {
      console.error('WeChat Pay error:', payError);
      
      // 如果微信支付调用失败，返回模拟数据（开发/测试模式）
      return NextResponse.json({
        orderId,
        planId,
        amount: plan.price,
        planName: plan.name,
        // 模拟二维码（指向支付状态查询页面）
        qrCode: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/mock?orderId=${orderId}`,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/mock?orderId=${orderId}`)}`,
        mockMode: true,
        message: '微信支付配置中，当前为演示模式',
      });
    }
    
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
