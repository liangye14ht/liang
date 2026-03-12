"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";

const contentTypes = [
  { value: "种草", label: "🛍️ 种草推荐" },
  { value: "教程", label: "📚 教程攻略" },
  { value: "生活", label: "🌟 生活分享" },
  { value: "测评", label: "🔍 产品测评" },
  { value: "探店", label: "🏪 探店打卡" },
];

const styles = [
  { value: "亲切", label: "亲切自然" },
  { value: "专业", label: "专业干货" },
  { value: "幽默", label: "幽默风趣" },
  { value: "高级", label: "高级质感" },
];

const lengths = [
  { value: "short", label: "短篇 (100字以内)" },
  { value: "medium", label: "中篇 (200-300字)" },
  { value: "long", label: "长篇 (400字以上)" },
];

interface GenerationResult {
  titles: string[];
  content: string;
  tags: string[];
}

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    contentType: "种草",
    topic: "",
    keywords: "",
    productInfo: "",
    style: "亲切",
    length: "medium",
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [remainingQuota, setRemainingQuota] = useState(3);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError("请输入主题");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }
      
      setResult({
        titles: data.titles,
        content: data.content,
        tags: data.tags,
      });
      
      if (data.usage?.remaining !== undefined) {
        setRemainingQuota(data.usage.remaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <span className="font-bold">小红书AI写作助手</span>
          </a>
          <Badge variant="secondary">今日剩余 {remainingQuota} 次</Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                创作设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">内容类型 *</label>
                <Select
                  value={formData.contentType}
                  onValueChange={(v) => setFormData({ ...formData, contentType: v || "种草" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择内容类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm font-medium">主题 *</label>
                <Input
                  placeholder="例如：早春通勤穿搭"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="text-sm font-medium">关键词</label>
                <Input
                  placeholder="法式、温柔、上班族、平价 (选填)"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">产品/品牌信息</label>
                <Textarea
                  placeholder="如果是推广内容，可以填入产品特点、卖点等 (选填)"
                  rows={3}
                  value={formData.productInfo}
                  onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                />
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">风格偏好</label>
                <Select
                  value={formData.style}
                  onValueChange={(v) => setFormData({ ...formData, style: v || "亲切" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Length */}
              <div className="space-y-2">
                <label className="text-sm font-medium">篇幅长度</label>
                <Select
                  value={formData.length}
                  onValueChange={(v) => setFormData({ ...formData, length: v || "medium" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择篇幅" />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((len) => (
                      <SelectItem key={len.value} value={len.value}>
                        {len.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-pink-500 hover:bg-pink-600"
                size="lg"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Display */}
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-20 text-gray-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>左侧填写信息后点击生成</p>
                </div>
              ) : (
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="content" className="flex-1">正文</TabsTrigger>
                    <TabsTrigger value="titles" className="flex-1">标题选项</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={result.content}
                        rows={20}
                        className="font-mono text-sm resize-none"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(result.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="titles" className="space-y-3">
                    {result.titles.map((title, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm">
                          {title}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(title)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}

              {result && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
