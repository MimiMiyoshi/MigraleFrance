import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the context type
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

// Create context with default values
export const OnboardingContext = createContext<OnboardingContextType>({
  showTour: false,
  setShowTour: () => {},
  completedTours: {},
  markTourComplete: () => {},
  shouldShowTourForPage: () => false,
  currentStep: 0,
  setCurrentStep: () => {},
  resetTour: () => {},
});

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  // State to track tour visibility
  const [showTour, setShowTour] = useState(false);
  
  // State to track which tours have been completed
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  
  // Current step in the tour
  const [currentStep, setCurrentStep] = useState(0);

  // Check for first-time users on mount
  useEffect(() => {
    const tourState = localStorage.getItem('migrale_completed_tours');
    if (tourState) {
      setCompletedTours(JSON.parse(tourState));
    } else {
      // First-time user, show tour automatically
      setShowTour(true);
    }
  }, []);

  // Save completed tours to localStorage
  useEffect(() => {
    localStorage.setItem('migrale_completed_tours', JSON.stringify(completedTours));
  }, [completedTours]);

  // Mark a tour as complete
  const markTourComplete = (tourName: string) => {
    setCompletedTours(prev => ({
      ...prev,
      [tourName]: true
    }));
  };

  // Check if a tour should be shown for a page
  const shouldShowTourForPage = (pageName: string) => {
    // If the user has already completed the tour for this page, don't show it again
    return !completedTours[pageName];
  };

  // Reset the current tour
  const resetTour = () => {
    setCurrentStep(0);
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

// Custom hook for accessing the context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}