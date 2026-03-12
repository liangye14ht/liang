import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyNotificationSignature, decryptNotification, payConfig } from '@/lib/wechat-pay';

// POST /api/payment/notify - 微信支付回调通知
export async function POST(request: NextRequest) {
  try {
    // 获取回调数据
    const body = await request.text();
    const signature = request.headers.get('Wechatpay-Signature') || '';
    const timestamp = request.headers.get('Wechatpay-Timestamp') || '';
    const nonce = request.headers.get('Wechatpay-Nonce') || '';
    const serial = request.headers.get('Wechatpay-Serial') || '';
    
    // 验证签名（生产环境必须）
    // const isValid = verifyNotificationSignature(timestamp, nonce, body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ code: 'FAIL', message: '签名验证失败' });
    // }
    
    // 解密数据
    let notifyData: any;
    try {
      const parsedBody = JSON.parse(body);
      if (parsedBody.resource) {
        // 解密微信支付通知数据
        notifyData = decryptNotification(
          parsedBody.resource.ciphertext,
          parsedBody.resource.associated_data,
          parsedBody.resource.nonce
        );
      } else {
        notifyData = parsedBody;
      }
    } catch (e) {
      notifyData = JSON.parse(body);
    }
    
    const {
      out_trade_no: orderId,
      transaction_id: transactionId,
      trade_state: tradeState,
      success_time: successTime,
      attach,
    } = notifyData;
    
    // 处理支付成功
    if (tradeState === 'SUCCESS') {
      // 更新订单状态
      const { error: updateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'paid',
          transaction_id: transactionId,
          paid_at: successTime || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
      
      if (updateError) {
        console.error('Failed to update payment status:', updateError);
        return NextResponse.json({ 
          code: 'FAIL', 
          message: '更新订单失败' 
        });
      }
      
      // 解析attach数据，更新用户套餐
      try {
        const attachData = JSON.parse(attach || '{}');
        const { userId, planId } = attachData;
        
        if (userId && userId !== 'anonymous') {
          // 更新用户订阅状态
          await supabaseAdmin
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan: planId,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            });
        }
      } catch (e) {
        console.error('Failed to update user subscription:', e);
      }
    }
    
    // 返回成功响应给微信
    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
    
  } catch (error) {
    console.error('Payment notify error:', error);
    return NextResponse.json({ 
      code: 'FAIL', 
      message: '处理失败' 
    });
  }
}

// GET /api/payment/notify - 测试用（验证接口可访问）
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    message: '微信支付回调接口正常',
    config: {
      mchid: payConfig.mchid ? '已配置' : '未配置',
      appid: payConfig.appid ? '已配置' : '未配置',
      notifyUrl: payConfig.notifyUrl,
    }
  });
}
