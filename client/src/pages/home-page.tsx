import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Building, Home, MapPin, Plane, BookOpen, FileCheck, ArrowRight, 
  CheckCircle, Circle, List, Star, Calendar, ChevronRight, BrainCircuit,
  MessageCircle, Sparkles, LightbulbIcon, Clock, Award, Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VisaTask } from "@shared/schema";

// AIエージェントからのメッセージリスト
const aiMessages = [
  "フランス移住の第一歩を踏み出しましたね！少しずつ計画を進めていきましょう。",
  "ビザ申請は大変かもしれませんが、一つずつタスクをこなしていけば必ず達成できます！",
  "フランス語の勉強も並行して始めると、現地での生活がよりスムーズになりますよ。",
  "今日も一歩前進！あなたの夢への道のりを応援しています。",
  "パスポートや証明書類の準備は早めに済ませておくと安心です。",
  "日々の小さな進歩が大きな成果につながります。頑張っていますね！",
  "フランスでの新生活を想像すると、ワクワクしますね。その夢を現実にしましょう！",
  "ビザ申請プロセスは複雑ですが、このアプリがしっかりサポートします。一緒に頑張りましょう！"
];

// モックのタスクデータ
const mockTasks: VisaTask[] = [
  {
    id: 1,
    userId: 1,
    title: "パスポートの有効期限確認",
    description: "フランス出国予定日から6ヶ月以上の有効期限があることを確認",
    completed: false,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 2,
    userId: 1,
    title: "ビザ申請書の記入",
    description: "公式ウェブサイトから長期学生ビザ申請書をダウンロードして記入",
    completed: false,
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 3,
    userId: 1,
    title: "証明写真の準備",
    description: "ビザ申請用の写真撮影（35mm x 45mm、背景白）",
    completed: true,
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  },
  {
    id: 4,
    userId: 1,
    title: "戸籍抄本の取得",
    description: "出身地の市区町村役場で取得（フランス語訳必要）",
    completed: false,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  }
];

const HomePage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tasks, setTasks] = useState<VisaTask[]>(mockTasks);
  const [aiMessage, setAiMessage] = useState<string>("");

  // AIエージェントからのランダムメッセージを取得
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * aiMessages.length);
    setAiMessage(aiMessages[randomIndex]);
  }, []);

  // タスクの進捗率を計算
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  // 今日の日付を取得
  const today = new Date().toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });
  
  // 未完了のタスクを締め切り日でソート
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  
  // 直近のタスク5件を表示
  const upcomingTasks = pendingTasks.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        {/* ダッシュボードセクション */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* メインコンテンツエリア (2/3幅) */}
            <div className="lg:col-span-2 space-y-6">
              {/* ユーザーウェルカム */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                  <h1 className="text-2xl font-bold">ようこそ、{user?.username || 'ゲスト'}さん</h1>
                  <p className="mt-2 text-primary-foreground/90">{today}</p>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium mb-2">ビザ申請進捗状況</h2>
                      <div className="flex items-center gap-4">
                        <Progress value={progressPercentage} className="w-60 h-2.5" />
                        <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}% 完了</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => navigate("/questionnaire")}>
                        診断を始める
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/tasks")}>
                        タスク管理
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AIエージェントのアドバイス */}
              <Card className="overflow-hidden border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">ミグラルAIアシスタント</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-700">{aiMessage}</p>
                      <div className="mt-3 flex items-center text-sm text-blue-600">
                        <LightbulbIcon className="h-4 w-4 mr-1" />
                        <span>今日のアドバイスでした</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 直近のタスク */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">直近のタスク</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
                      すべて見る
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="mt-0.5">
                            <Circle className="h-5 w-5 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{task.title}</h3>
                              {task.dueDate && (
                                <Badge variant={new Date(task.dueDate) < new Date() ? "destructive" : "outline"} className="text-xs">
                                  {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>現在のタスクはありません</p>
                      <Button variant="link" onClick={() => navigate("/questionnaire")}>
                        ビザ診断を始めて、タスクを追加しましょう
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/tasks")}>
                    <List className="mr-2 h-4 w-4" />
                    タスク管理ページへ
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* サイドバー (1/3幅) */}
            <div className="space-y-6">
              {/* クイックアクション */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">クイックアクション</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => navigate("/questionnaire")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      新しいビザ診断
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => navigate("/tasks")}>
                      <List className="mr-2 h-4 w-4" />
                      タスク管理
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                      <Settings className="mr-2 h-4 w-4" />
                      設定
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ビザ情報 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">ビザ情報</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">推奨ビザタイプ</h3>
                      <p className="font-medium">長期学生ビザ</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-1">ビザ申請進捗状況</h3>
                      <div className="flex items-center gap-3">
                        <Progress value={progressPercentage} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button variant="link" className="text-primary w-full px-0" onClick={() => navigate("/questionnaire")}>
                      新しいビザ診断を行う
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* お知らせ */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">お知らせ</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="border-l-2 border-primary pl-3 py-1">
                      <p className="text-sm font-medium">フランス留学フェア開催</p>
                      <p className="text-xs text-gray-500">5月15日・16日 東京国際フォーラム</p>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-3 py-1">
                      <p className="text-sm font-medium">学生ビザの申請要件が変更されました</p>
                      <p className="text-xs text-gray-500">2025年1月15日更新</p>
                    </div>
                    <Button variant="link" className="text-primary w-full px-0" disabled>
                      すべてのお知らせを見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>



        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">フランス移住の旅を始めましょう</span>
              <span className="block text-indigo-100">今すぐ診断を開始して、最適なビザを見つけましょう</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button variant="secondary" size="lg" onClick={() => navigate("/questionnaire")}>
                  診断を始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
