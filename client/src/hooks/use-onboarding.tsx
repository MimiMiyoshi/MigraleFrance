import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './use-auth';

type OnboardingContextType = {
  showTour: boolean;
  setShowTour: (show: boolean) => void;
  completedTours: Record<string, boolean>;
  markTourComplete: (tourName: string) => void;
  shouldShowTourForPage: (pageName: string) => boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const TOUR_STORAGE_KEY = 'migrale_completed_tours';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showTour, setShowTour] = useState(false);
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [location] = useLocation();

  // Load completed tours from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOUR_STORAGE_KEY);
      if (saved) {
        setCompletedTours(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading tour completion data', e);
    }
  }, []);

  // Check if we should show a tour for the current page when the user logs in or navigates
  useEffect(() => {
    if (user) {
      const pageName = getPageNameFromLocation(location);
      if (shouldShowTourForPage(pageName)) {
        // Slight delay to ensure components are rendered
        setTimeout(() => setShowTour(true), 1000);
      }
    }
  }, [user, location]);

  const getPageNameFromLocation = (path: string): string => {
    if (path === '/') return 'home';
    // Remove leading slash and any parameters
    return path.replace(/^\//, '').split('/')[0];
  };

  const markTourComplete = (tourName: string) => {
    const updated = { ...completedTours, [tourName]: true };
    setCompletedTours(updated);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving tour completion data', e);
    }
    setShowTour(false);
  };

  const shouldShowTourForPage = (pageName: string): boolean => {
    return !completedTours[pageName];
  };

  const resetTour = () => {
    setCurrentStep(0);
    setShowTour(true);
  };

  return (
    <OnboardingContext.Provider
      value={{
        showTour,
        setShowTour,
        completedTours,
        markTourComplete,
        shouldShowTourForPage,
        currentStep,
        setCurrentStep,
        resetTour
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}