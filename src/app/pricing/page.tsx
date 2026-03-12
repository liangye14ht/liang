"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const plans = [
  {
    id: "free",
    name: "免费版",
    price: 0,
    period: "永久",
    description: "适合体验用户",
    features: [
      "每日3次生成",
      "基础文案功能",
      "标准响应速度",
      "7天历史记录",
    ],
    cta: "免费开始",
    popular: false,
  },
  {
    id: "basic",
    name: "个人版",
    price: 29,
    period: "月",
    description: "适合个人博主",
    features: [
      "每日50次生成",
      "全部内容类型",
      "优先响应速度",
      "无限历史记录",
      "爆款选题推荐",
      "专属客服支持",
    ],
    cta: "立即订阅",
    popular: true,
  },
  {
    id: "pro",
    name: "专业版",
    price: 99,
    period: "月",
    description: "适合专业创作者",
    features: [
      "无限次生成",
      "全部高级功能",
      "最快响应速度",
      "无限历史记录",
      "爆款分析工具",
      "API接口访问",
      "1对1专属服务",
      "优先功能更新",
    ],
    cta: "升级专业版",
    popular: false,
  },
];

// 支付弹窗组件
function PaymentModal({
  isOpen,
  onClose,
  orderData,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    qrCode: string;
    qrCodeImage: string;
    amount: number;
    planName: string;
    mockMode?: boolean;
  } | null;
}) {
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [isChecking, setIsChecking] = useState(false);

  // 轮询检查支付状态
  useEffect(() => {
    if (!isOpen || !orderData?.orderId) return;

    const checkStatus = async () => {
      if (isChecking || paymentStatus !== "pending") return;
      
      setIsChecking(true);
      try {
        const res = await fetch(`/api/payment/status?orderId=${orderData.orderId}`);
        const data = await res.json();
        
        if (data.status === "paid") {
          setPaymentStatus("success");
        }
      } catch (e) {
        console.error("Check payment status failed:", e);
      } finally {
        setIsChecking(false);
      }
    };

    // 立即检查一次
    checkStatus();
    
    // 每3秒检查一次
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen, orderData?.orderId, paymentStatus]);

  // 支付成功后自动关闭
  useEffect(() => {
    if (paymentStatus === "success") {
      setTimeout(() => {
        onClose();
        window.location.reload(); // 刷新页面以显示新套餐
      }, 2000);
    }
  }, [paymentStatus, onClose]);

  if (!isOpen || !orderData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {paymentStatus === "success" ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">支付成功！</h3>
            <p className="text-gray-600">感谢您的订阅，功能已立即解锁</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">微信支付</h3>
              <p className="text-gray-600">
                订购 {orderData.planName} - ¥{(orderData.amount / 100).toFixed(2)}
              </p>
              {orderData.mockMode && (
                <Badge variant="secondary" className="mt-2">
                  演示模式
                </Badge>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                {orderData.qrCodeImage ? (
                  <img
                    src={orderData.qrCodeImage}
                    alt="支付二维码"
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    二维码加载中...
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">
                请使用微信扫描二维码完成支付
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "正在检查支付状态..." : "等待支付..."}
              </div>
            </div>

            {orderData.mockMode && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                <p className="font-medium mb-1">💡 演示模式说明</p>
                <p>实际部署后，这里将显示真实的微信支付二维码。</p>
                <p className="mt-1">订单号: {orderData.orderId}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    qrCode: string;
    qrCodeImage: string;
    amount: number;
    planName: string;
    mockMode?: boolean;
  } | null>(null);

  // 检查URL参数（支付回调）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    
    if (payment === "success") {
      toast({
        title: "支付成功！",
        description: "感谢您的订阅，功能已解锁",
      });
      // 清除URL参数
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      toast({
        title: "支付已取消",
        description: "您可以随时重新发起支付",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: "已经是该套餐",
        description: "您当前已经是这个套餐了",
      });
      return;
    }

    if (planId === "free") {
      toast({
        title: "已经是免费版",
        description: "免费版无需订阅",
      });
      return;
    }

    setLoading(planId);

    try {
      // 调用支付API
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "创建订单失败");
      }

      // 保存订单数据并显示支付弹窗
      setOrderData({
        orderId: data.orderId,
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        amount: data.amount,
        planName: data.planName,
        mockMode: data.mockMode,
      });
      setShowPaymentModal(true);

      if (data.mockMode) {
        toast({
          title: "演示模式",
          description: "当前为测试环境，模拟支付流程",
        });
      }
    } catch (error: any) {
      toast({
        title: "支付初始化失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Toaster />
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={orderData}
      />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-bold text-lg">小红书AI写作助手</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/generate">
              <Button variant="ghost">开始创作</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <Badge variant="secondary" className="mb-4">
          💰 简单透明的定价
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          选择适合你的方案
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          从免费开始，随时升级。无隐藏费用，随时取消。
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-pink-500 ring-2 ring-pink-500/20 scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-pink-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      最受欢迎
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.id === "pro" && <Zap className="w-5 h-5 text-yellow-500" />}
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">¥{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-pink-500 hover:bg-pink-600"
                        : plan.id === currentPlan
                        ? "bg-gray-100 text-gray-500"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || plan.id === currentPlan}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : plan.id === currentPlan ? (
                      "当前套餐"
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "可以随时取消订阅吗？",
                a: "是的，您可以随时取消订阅。取消后，您仍可使用付费功能直到当前计费周期结束。",
              },
              {
                q: "免费版有什么限制？",
                a: "免费版每日可生成3次，支持基础文案功能。适合体验和轻度使用。",
              },
              {
                q: "如何升级或降级套餐？",
                a: "您可以随时在定价页面选择新套餐。升级立即生效，降级在当前周期结束后生效。",
              },
              {
                q: "支持哪些支付方式？",
                a: "我们支持微信支付、支付宝等主流支付方式。",
              },
            ].map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">还有疑问？</h2>
          <p className="text-gray-600 mb-6">
            联系我们的客服团队，我们会在24小时内回复您
          </p>
          <Button size="lg" variant="outline">
            联系客服
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>© 2026 小红书AI写作助手. Built with ❤️ by Zero Labs</p>
        </div>
      </footer>
    </div>
  );
}
