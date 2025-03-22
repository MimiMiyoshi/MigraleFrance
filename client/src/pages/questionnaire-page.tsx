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
    question: "How long do you plan to stay in France?",
    options: [
      { value: "short", label: "Less than 90 days" },
      { value: "medium", label: "90 days to 1 year" },
      { value: "long", label: "More than 1 year" },
      { value: "permanent", label: "Permanently" }
    ]
  },
  {
    id: "purpose",
    question: "What is the primary purpose of your stay?",
    options: [
      { value: "tourism", label: "Tourism / Visiting" },
      { value: "study", label: "Education / Study" },
      { value: "work", label: "Work / Employment" },
      { value: "family", label: "Family Reunification" },
      { value: "business", label: "Business / Investment" }
    ]
  },
  {
    id: "nationality",
    question: "What is your nationality?",
    options: [
      { value: "eu", label: "European Union Member State" },
      { value: "nonEu", label: "Non-EU Country" }
    ]
  },
  {
    id: "financialStatus",
    question: "What is your financial situation?",
    options: [
      { value: "sufficient", label: "I have sufficient funds to support myself" },
      { value: "scholarship", label: "I have a scholarship" },
      { value: "employment", label: "I have a job offer in France" },
      { value: "limited", label: "I have limited financial resources" }
    ]
  },
  {
    id: "language",
    question: "What is your French language proficiency?",
    options: [
      { value: "none", label: "No knowledge" },
      { value: "basic", label: "Basic (A1-A2)" },
      { value: "intermediate", label: "Intermediate (B1-B2)" },
      { value: "advanced", label: "Advanced (C1-C2)" }
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
      return "EU Citizen - No Visa Required";
    }
    
    // Short stay tourism
    if (stayDuration === "short" && purpose === "tourism") {
      return "Short-Stay Schengen Visa";
    }
    
    // Students
    if (purpose === "study") {
      if (stayDuration === "medium") {
        return "Long-Stay Student Visa";
      } else if (stayDuration === "long") {
        return "Long-Stay Student Visa with Residence Permit";
      }
    }
    
    // Workers
    if (purpose === "work") {
      if (financialStatus === "employment") {
        return "Long-Stay Work Visa";
      }
    }
    
    // Family reunification
    if (purpose === "family") {
      return "Family Reunification Visa";
    }
    
    // Business/Investor
    if (purpose === "business") {
      return "Talent Passport or Business Investor Visa";
    }
    
    // Default fallback
    return "Long-Stay Visa (Further consultation recommended)";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">France Visa Questionnaire</h1>
            <p className="mt-2 text-gray-600">
              Answer the following questions to get personalized visa recommendations.
            </p>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
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
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!currentAnswer}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Submit
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
