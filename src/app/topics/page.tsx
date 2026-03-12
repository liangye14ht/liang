"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  heat_level: string;
  tags: string[];
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/topics");
      const data = await response.json();
      if (data.success) {
        setTopics(data.topics);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      穿搭: "👗",
      美食: "🍜",
      美妆: "💄",
      生活: "🏠",
      知识: "📚",
    };
    return icons[category] || "✨";
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
          <div className="flex gap-4">
            <Link href="/generate">
              <Button variant="ghost">开始创作</Button>
            </Link>
            <Link href="/topics">
              <Button variant="ghost">选题灵感</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-pink-500" />
            热门选题推荐
          </h1>
          <p className="text-gray-600">基于小红书热点数据，为你推荐近期热门创作选题</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-lg">
                      {getCategoryIcon(topic.category)} {topic.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getHeatColor(topic.heat_level)}`}></div>
                      <span className="text-xs text-gray-500">
                        {topic.heat_level === "high" ? "高热" : topic.heat_level === "medium" ? "中热" : "低热"}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {topic.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/generate?topic=${encodeURIComponent(topic.title)}`}>
                    <Button className="w-full" variant="outline">
                      用这个选题创作
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
