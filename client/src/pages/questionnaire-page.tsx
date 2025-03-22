import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

// Define the questions and possible answers
const questions = [
  {
    id: "stayDuration",
    question: "フランスにはどのくらいの期間滞在する予定ですか？",
    options: [
      { value: "short", label: "90日未満" },
      { value: "medium", label: "90日から1年" },
      { value: "long", label: "1年以上" },
      { value: "permanent", label: "永住希望" }
    ]
  },
  {
    id: "purpose",
    question: "滞在の主な目的は何ですか？",
    options: [
      { value: "tourism", label: "観光 / 訪問" },
      { value: "study", label: "教育 / 留学" },
      { value: "work", label: "就労 / 雇用" },
      { value: "family", label: "家族の呼び寄せ" },
      { value: "business", label: "ビジネス / 投資" }
    ]
  },
  {
    id: "nationality",
    question: "あなたの国籍は？",
    options: [
      { value: "eu", label: "欧州連合加盟国" },
      { value: "nonEu", label: "EU以外の国" }
    ]
  },
  {
    id: "financialStatus",
    question: "あなたの経済状況は？",
    options: [
      { value: "sufficient", label: "自分の滞在費用を賄うのに十分な資金がある" },
      { value: "scholarship", label: "奨学金を受給している" },
      { value: "employment", label: "フランスでの仕事のオファーがある" },
      { value: "limited", label: "経済的リソースが限られている" }
    ]
  },
  {
    id: "language",
    question: "フランス語の習熟度はどのくらいですか？",
    options: [
      { value: "none", label: "知識なし" },
      { value: "basic", label: "基礎レベル (A1-A2)" },
      { value: "intermediate", label: "中級レベル (B1-B2)" },
      { value: "advanced", label: "上級レベル (C1-C2)" }
    ]
  }
];

interface Answers {
  [key: string]: string;
}

const QuestionnairePage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  const submitResponseMutation = useMutation({
    mutationFn: async (data: { responses: Answers, result: string }) => {
      const res = await apiRequest("POST", "/api/visa-responses", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/visa-responses"] });
      navigate(`/visa-result/${data.id}`);
    }
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(updatedAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
    } else {
      // Determine recommended visa type based on answers
      const visaResult = determineVisaType(updatedAnswers);
      
      // Submit the responses and result
      submitResponseMutation.mutate({
        responses: updatedAnswers,
        result: visaResult
      });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex - 1].id] || "");
    }
  };

  // Function to determine visa type based on answers
  const determineVisaType = (responses: Answers): string => {
    const { stayDuration, purpose, nationality, financialStatus } = responses;
    
    // EU citizens don't need a visa
    if (nationality === "eu") {
      return "EU市民 - ビザ不要";
    }
    
    // Short stay tourism
    if (stayDuration === "short" && purpose === "tourism") {
      return "短期滞在シェンゲンビザ";
    }
    
    // Students
    if (purpose === "study") {
      if (stayDuration === "medium") {
        return "長期学生ビザ";
      } else if (stayDuration === "long") {
        return "長期学生ビザ（滞在許可証付き）";
      }
    }
    
    // Workers
    if (purpose === "work") {
      if (financialStatus === "employment") {
        return "長期就労ビザ";
      }
    }
    
    // Family reunification
    if (purpose === "family") {
      return "家族呼び寄せビザ";
    }
    
    // Business/Investor
    if (purpose === "business") {
      return "高度人材パスポートまたは投資家ビザ";
    }
    
    // Default fallback
    return "長期滞在ビザ（詳細な相談を推奨）";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">フランスビザ診断</h1>
            <p className="mt-2 text-gray-600">
              以下の質問に答えて、あなたに合ったビザの提案を受け取りましょう。
            </p>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">
                質問 {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentAnswer}
                onValueChange={setCurrentAnswer}
                className="space-y-4"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-base">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!currentAnswer}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    次へ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    送信
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuestionnairePage;
