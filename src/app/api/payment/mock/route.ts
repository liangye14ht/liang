import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/payment/mock - 模拟支付成功页面
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
  }
  
  // 返回HTML页面，模拟扫码支付
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模拟支付 - 小红书AI写作助手</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 20px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 { font-size: 24px; margin-bottom: 10px; color: #333; }
    .order-id { 
      background: #f5f5f5; 
      padding: 10px; 
      border-radius: 8px; 
      font-family: monospace;
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
      word-break: break-all;
    }
    .amount { font-size: 48px; font-weight: bold; color: #f5576c; margin: 20px 0; }
    .amount span { font-size: 24px; }
    .btn {
      display: block;
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin: 10px 0;
    }
    .btn-success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
    }
    .btn-success:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(17,153,142,0.3); }
    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }
    .btn-cancel:hover { background: #e0e0e0; }
    .loading {
      display: none;
      margin-top: 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #f5576c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .success-msg {
      display: none;
      color: #11998e;
      font-size: 18px;
      margin-top: 20px;
    }
    .success-msg.show { display: block; }
    .note {
      margin-top: 20px;
      padding: 15px;
      background: #fff3cd;
      border-radius: 8px;
      font-size: 13px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">💎</div>
    <h1>模拟支付</h1>
    <p style="color: #999; margin-bottom: 20px;">小红书AI写作助手 - 测试环境</p>
    
    <div class="order-id">订单号: ${orderId}</div>
    
    <div class="amount"><span>¥</span>29.00</div>
    <p style="color: #666; margin-bottom: 30px;">个人版 - 月订阅</p>
    
    <button class="btn btn-success" onclick="paySuccess()">
      ✓ 模拟支付成功
    </button>
    <button class="btn btn-cancel" onclick="payCancel()">
      ✕ 取消支付
    </button>
    
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>正在处理...</p>
    </div>
    
    <div class="success-msg" id="successMsg">
      ✓ 支付成功！正在跳转...
    </div>
    
    <div class="note">
      <strong>提示：</strong>这是测试环境的模拟支付页面，不会真正扣款。
    </div>
  </div>
  
  <script>
    const orderId = '${orderId}';
    
    async function paySuccess() {
      document.getElementById('loading').style.display = 'block';
      
      try {
        const res = await fetch('/api/payment/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: 'paid' })
        });
        
        if (res.ok) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('successMsg').classList.add('show');
          
          // 3秒后跳转回定价页面
          setTimeout(() => {
            window.location.href = '/pricing?payment=success';
          }, 1500);
        } else {
          alert('更新订单状态失败，请重试');
          document.getElementById('loading').style.display = 'none';
        }
      } catch (e) {
        alert('网络错误，请重试');
        document.getElementById('loading').style.display = 'none';
      }
    }
    
    function payCancel() {
      window.location.href = '/pricing?payment=cancelled';
    }
  </script>
</body>
</html>
  `;
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
