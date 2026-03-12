import crypto from 'crypto';

// 微信支付配置
const mchid = process.env.WECHAT_MCHID || '';
const appid = process.env.WECHAT_APPID || '';
const apiKey = process.env.WECHAT_API_KEY || '';
const notifyUrl = process.env.WECHAT_NOTIFY_URL || '';

export const payConfig = {
  mchid,
  appid,
  notifyUrl,
  apiKey,
};

// 套餐价格配置（单位：分）
export const plans: Record<string, { price: number; name: string; description: string }> = {
  basic: { 
    price: 2900, 
    name: '个人版',
    description: '小红书AI写作助手 - 个人版月订阅'
  },
  pro: { 
    price: 9900, 
    name: '专业版',
    description: '小红书AI写作助手 - 专业版月订阅'
  },
};

// 生成订单号
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `ORDER_${timestamp}_${random}`;
}

// 生成请求签名
export function generateSignature(method: string, url: string, timestamp: string, nonceStr: string, body: string): string {
  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
  return crypto
    .createHmac('sha256', apiKey)
    .update(message)
    .digest('hex');
}

// 生成随机字符串
export function generateNonceStr(): string {
  return Math.random().toString(36).substring(2, 15);
}

// 生成时间戳
export function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

// 创建Native支付订单
export async function createNativeOrder(params: {
  description: string;
  outTradeNo: string;
  amount: number;
  attach?: string;
}) {
  const { description, outTradeNo, amount, attach } = params;
  const timestamp = generateTimestamp();
  const nonceStr = generateNonceStr();
  
  const body = JSON.stringify({
    appid,
    mchid,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: amount,
      currency: 'CNY',
    },
    attach,
  });
  
  const url = '/v3/pay/transactions/native';
  const signature = generateSignature('POST', url, timestamp, nonceStr, body);
  
  try {
    const response = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no=""`,
      },
      body,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`微信支付请求失败: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('WeChat Pay API error:', error);
    throw error;
  }
}

// 查询订单状态
export async function queryOrder(outTradeNo: string) {
  const timestamp = generateTimestamp();
  const nonceStr = generateNonceStr();
  const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchid}`;
  const signature = generateSignature('GET', url, timestamp, nonceStr, '');
  
  try {
    const response = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no=""`,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`查询订单失败: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('WeChat Pay query error:', error);
    throw error;
  }
}

// 验证微信支付通知签名
export function verifyNotificationSignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string
): boolean {
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  // 实际生产环境需要使用微信支付的公钥验证签名
  // 这里简化处理
  return true;
}

// 解密通知数据
export function decryptNotification(encryptedData: string, associatedData: string, nonce: string): any {
  // 实际生产环境需要使用APIv3密钥解密
  // 这里简化处理，直接返回解析后的数据
  try {
    return JSON.parse(Buffer.from(encryptedData, 'base64').toString());
  } catch {
    return {};
  }
}
