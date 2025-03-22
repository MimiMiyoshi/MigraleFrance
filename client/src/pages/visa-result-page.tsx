import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CheckCircle, AlertCircle, FileText, List, Home, Loader2 } from "lucide-react";

type VisaResponse = {
  id: number;
  userId: number;
  responses: Record<string, string>;
  result: string;
  createdAt: string;
};

type Task = {
  title: string;
  description: string;
  dueDate?: string;
};

const recommendedTasks: Record<string, Task[]> = {
  "Short-Stay Schengen Visa": [
    { title: "Prepare valid passport", description: "Ensure your passport is valid for at least 3 months beyond your planned departure date from France" },
    { title: "Complete visa application form", description: "Fill out the Schengen visa application form" },
    { title: "Book travel insurance", description: "Purchase travel insurance with minimum coverage of €30,000" },
    { title: "Gather supporting documents", description: "Prepare travel itinerary, accommodation reservations, and proof of financial means" }
  ],
  "Long-Stay Student Visa": [
    { title: "Get acceptance letter", description: "Obtain an acceptance letter from a French educational institution" },
    { title: "Prepare proof of financial resources", description: "Gather documents showing you have sufficient funds for your stay (approximately €615 per month)" },
    { title: "Register with Campus France", description: "Complete the preliminary registration process if applicable to your country" },
    { title: "Prepare accommodation proof", description: "Obtain proof of accommodation in France" }
  ],
  "Long-Stay Work Visa": [
    { title: "Obtain work contract", description: "Get a signed work contract from a French employer" },
    { title: "Apply for work authorization", description: "Your employer must apply for work authorization from the French labor authorities" },
    { title: "Prepare professional qualifications", description: "Gather certificates of your professional qualifications and experience" },
    { title: "Prepare financial documents", description: "Prepare bank statements showing financial stability" }
  ],
  "Family Reunification Visa": [
    { title: "Gather family documents", description: "Collect marriage certificate, birth certificates, and other family relationship documents" },
    { title: "Prepare sponsor's documents", description: "Gather the French resident's residence permit, proof of accommodation, and financial resources" },
    { title: "Translate official documents", description: "Have all documents translated into French by a certified translator" },
    { title: "Schedule medical examination", description: "Book a medical examination if required" }
  ],
  "Talent Passport or Business Investor Visa": [
    { title: "Prepare business plan", description: "Create a detailed business plan for your investment or project in France" },
    { title: "Gather financial evidence", description: "Compile documents showing financial capability to invest (minimum €30,000 for some categories)" },
    { title: "Obtain professional references", description: "Gather recommendation letters and professional references" },
    { title: "Prepare relevant diplomas/certificates", description: "Have your educational and professional certificates ready" }
  ],
  "Long-Stay Visa (Further consultation recommended)": [
    { title: "Schedule consultation", description: "Book an appointment with the French consulate for personalized guidance" },
    { title: "Prepare basic documents", description: "Gather passport, photos, and basic identification documents" },
    { title: "Research visa categories", description: "Research different visa categories that might apply to your situation" },
    { title: "Check financial requirements", description: "Understand the financial requirements for different visa types" }
  ],
  "EU Citizen - No Visa Required": [
    { title: "Prepare valid ID card or passport", description: "Ensure you have a valid national ID card or passport" },
    { title: "Register with local authorities", description: "For stays longer than 3 months, you may need to register with local authorities" },
    { title: "Obtain European Health Insurance Card", description: "Apply for EHIC for temporary stays or register with French healthcare for longer stays" },
    { title: "Research residency requirements", description: "Understand the requirements for establishing residency in France as an EU citizen" }
  ]
};

const VisaResultPage = () => {
  const { user } = useAuth();
  const params = useParams();
  const [, navigate] = useLocation();
  const responseId = params.id ? parseInt(params.id) : 0;
  
  const { data: response, isLoading: isResponseLoading, error: responseError } = useQuery<VisaResponse>({
    queryKey: [`/api/visa-responses/${responseId}`],
  });
  
  const [selectedTasks, setSelectedTasks] = useState<boolean[]>([]);
  
  useEffect(() => {
    if (response && response.result && recommendedTasks[response.result]) {
      setSelectedTasks(new Array(recommendedTasks[response.result].length).fill(false));
    }
  }, [response]);
  
  const addTasksMutation = useMutation({
    mutationFn: async (tasks: any[]) => {
      const promises = tasks.map(task => 
        apiRequest("POST", "/api/tasks", task)
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      navigate("/tasks");
    }
  });
  
  const handleAddSelectedTasks = () => {
    if (!response || !response.result) return;
    
    const tasks = recommendedTasks[response.result]
      .filter((_, index) => selectedTasks[index])
      .map(task => ({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
      }));
    
    if (tasks.length > 0) {
      addTasksMutation.mutate(tasks);
    }
  };
  
  if (isResponseLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (responseError || !response) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg bg-red-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <CardTitle>Error</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>Could not load visa recommendation. Please try again or return to the questionnaire.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/questionnaire")}>
                  Return to Questionnaire
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const tasksForVisaType = response.result ? recommendedTasks[response.result] || [] : [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg mb-8">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <CardTitle>Your Visa Recommendation</CardTitle>
              </div>
              <CardDescription className="text-primary-foreground">
                Based on your responses, here's our recommended visa type
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">{response.result}</h2>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">About this visa:</h3>
                <p className="text-blue-700">
                  {response.result === "Short-Stay Schengen Visa" && 
                    "The Schengen visa allows stays up to 90 days in any 180-day period. It's suitable for tourism, business trips, or visiting family."}
                  {response.result === "Long-Stay Student Visa" && 
                    "This visa allows you to study at a French institution for more than 90 days. You'll need to apply for a residence permit upon arrival."}
                  {response.result === "Long-Stay Work Visa" && 
                    "For employment in France lasting more than 90 days. Your employer must obtain work authorization before you apply."}
                  {response.result === "Family Reunification Visa" && 
                    "This visa allows family members to join relatives legally residing in France."}
                  {response.result === "Talent Passport or Business Investor Visa" && 
                    "For entrepreneurs, investors, or highly skilled professionals. Offers simplified access to multi-year residence permits."}
                  {response.result === "Long-Stay Visa (Further consultation recommended)" && 
                    "Your situation requires personalized guidance. We recommend consulting directly with French consular services."}
                  {response.result === "EU Citizen - No Visa Required" && 
                    "As an EU citizen, you don't need a visa to enter, live or work in France. For stays longer than 3 months, you may need to register with local authorities."}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Tasks</h2>
            <p className="text-gray-600 mb-4">
              Here are the key tasks you should complete to apply for this visa. Select the tasks you want to add to your task list.
            </p>
          </div>
          
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Required Documents & Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksForVisaType.map((task, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <Checkbox
                      id={`task-${index}`}
                      checked={selectedTasks[index]}
                      onCheckedChange={(checked) => {
                        const newSelectedTasks = [...selectedTasks];
                        newSelectedTasks[index] = checked as boolean;
                        setSelectedTasks(newSelectedTasks);
                      }}
                    />
                    <div>
                      <Label htmlFor={`task-${index}`} className="text-base font-medium">
                        {task.title}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button 
                onClick={handleAddSelectedTasks}
                disabled={selectedTasks.every(selected => !selected) || addTasksMutation.isPending}
              >
                {addTasksMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Tasks...
                  </>
                ) : (
                  <>
                    <List className="mr-2 h-4 w-4" />
                    Add to Task List
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Note: This recommendation is based on the information you provided and serves as a guide only. For official advice, please consult the French consulate or embassy in your country.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisaResultPage;
