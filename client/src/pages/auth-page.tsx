import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AuthTabs from "@/components/auth/auth-tabs";
import { useEffect, useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";

const AuthPage = () => {
  const { user, isLoading } = useAuth();
  const { setShowTour } = useOnboarding();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full" id="auth-form">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Migrale</h1>
            <Button variant="ghost" size="sm" onClick={() => setShowTour(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              ツアーを見る
            </Button>
          </div>
          <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
