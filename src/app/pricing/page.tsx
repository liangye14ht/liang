"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
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

export default function PricingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");

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

      if (data.paymentUrl) {
        // 跳转到支付页面
        window.location.href = data.paymentUrl;
      } else if (data.qrCode) {
        // 显示二维码
        toast({
          title: "请扫码支付",
          description: "支付完成后将自动升级",
        });
      } else {
        toast({
          title: "支付准备中",
          description: "我们正在接入支付系统，即将上线",
        });
      }
    } catch (error) {
      toast({
        title: "支付暂不可用",
        description: "支付系统即将上线，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
                a: "我们支持微信支付、支付宝等主流支付方式，即将接入信用卡支付。",
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
