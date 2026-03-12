import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PenTool, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-bold text-lg">小红书AI写作助手</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button variant="ghost">开始创作</Button>
            </Link>
            <Button>登录</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 已帮助 1000+ 博主提升创作效率
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            让AI成为你的创作搭档
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            输入主题，AI帮你生成爆款标题和正文。专为小红书博主打造的AI写作助手，省时省力更省心。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/generate">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
                <Sparkles className="w-4 h-4 mr-2" />
                免费试用
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              查看演示
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <PenTool className="w-10 h-10 text-pink-500 mb-2" />
                <CardTitle>智能文案生成</CardTitle>
                <CardDescription>
                  输入主题，一键生成3个标题+正文，支持种草、教程、测评等多种内容类型
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-purple-500 mb-2" />
                <CardTitle>爆款选题推荐</CardTitle>
                <CardDescription>
                  基于热点数据，每日推荐热门选题，解决"不知道写什么"的创作瓶颈
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-500 mb-2" />
                <CardTitle>小红书风格优化</CardTitle>
                <CardDescription>
                  AI深度理解小红书调性，自动添加emoji、优化排版、推荐话题标签
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">简单定价</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>免费版</CardTitle>
                <CardDescription className="text-3xl font-bold">¥0</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 每日3次生成</li>
                  <li>✓ 基础文案功能</li>
                  <li>✓ 标准响应速度</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">开始使用</Button>
              </CardContent>
            </Card>
            <Card className="border-pink-500 ring-2 ring-pink-500/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>个人版</CardTitle>
                  <Badge className="bg-pink-500">推荐</Badge>
                </div>
                <CardDescription className="text-3xl font-bold">¥29/月</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 无限次生成</li>
                  <li>✓ 选题推荐</li>
                  <li>✓ 优先生成</li>
                  <li>✓ 历史记录保存</li>
                </ul>
                <Button className="w-full mt-4 bg-pink-500 hover:bg-pink-600">立即订阅</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>专业版</CardTitle>
                <CardDescription className="text-3xl font-bold">¥99/月</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 全部功能</li>
                  <li>✓ 爆款分析</li>
                  <li>✓ API接口</li>
                  <li>✓ 专属客服</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">联系购买</Button>
              </CardContent>
            </Card>
          </div>
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
