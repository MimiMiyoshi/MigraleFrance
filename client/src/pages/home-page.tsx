import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Building, Home, MapPin, Plane, BookOpen, FileCheck, ArrowRight } from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">フランスへの旅は</span>
                <span className="block text-primary">ここから始まります</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                パーソナライズされたビザ推奨とステップバイステップのガイダンスでフランスへの移住を計画しましょう。
              </p>
              <div className="mt-8 flex justify-center">
                <Button className="px-8 py-6 text-lg" onClick={() => navigate("/questionnaire")}>
                  アンケートを開始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                ご利用方法
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                シンプルなプロセスでフランス生活への最適な道をご案内します
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>質問に回答</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      フランス移住計画についての簡単な質問に答えてください。
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>おすすめのビザを取得</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      あなたの回答に基づいたパーソナライズされたビザの推奨を受け取りましょう。
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>移住の準備</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      フランスへの移住準備のためのパーソナライズされたタスクリストに従ってください。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">旅の準備はできましたか？</span>
              <span className="block text-indigo-100">今すぐアンケートを始めましょう。</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button variant="secondary" size="lg" onClick={() => navigate("/questionnaire")}>
                  始める
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
