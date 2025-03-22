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
                <span className="block">Your Journey to</span>
                <span className="block text-primary">France Starts Here</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Plan your move to France with personalized visa recommendations and step-by-step guidance.
              </p>
              <div className="mt-8 flex justify-center">
                <Button className="px-8 py-6 text-lg" onClick={() => navigate("/questionnaire")}>
                  Start Questionnaire
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
                How It Works
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Our simple process helps you find the right path to living in France
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Answer Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Respond to simple questions about your plans to move to France.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Get Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Receive personalized visa recommendations based on your responses.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Prepare Your Move</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Follow your personalized task list to prepare for your move to France.
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
              <span className="block">Ready to start your journey?</span>
              <span className="block text-indigo-100">Begin the questionnaire now.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button variant="secondary" size="lg" onClick={() => navigate("/questionnaire")}>
                  Get Started
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
