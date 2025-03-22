import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import QuestionnairePage from "@/pages/questionnaire-page";
import VisaResultPage from "@/pages/visa-result-page";
import TasksPage from "@/pages/tasks-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { NotificationProvider } from "./hooks/use-notifications";
import { OnboardingProvider } from "./hooks/use-onboarding";
import OnboardingTour from "./components/onboarding/tour";
import "./components/onboarding/tour-styles.css";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/questionnaire" component={QuestionnairePage} />
      <ProtectedRoute path="/visa-result/:id" component={VisaResultPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <OnboardingProvider>
            <Router />
            <OnboardingTour />
            <Toaster />
          </OnboardingProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
