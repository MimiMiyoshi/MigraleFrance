import React, { useEffect, useState } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useLocation } from 'wouter';
import 'intro.js/themes/introjs-modern.css';

// Define the tour step structure
interface TourStep {
  element: string;
  intro: string;
  position?: 'top' | 'left' | 'right' | 'bottom' | 'auto';
  title?: string;
}

// Tour configuration for different pages
const tourConfig: Record<string, TourStep[]> = {
  home: [
    {
      element: '#welcome-banner',
      intro: 'ミグラルへようこそ！フランス移住をサポートするアプリケーションです。',
      title: 'Welcome to Migrale',
      position: 'bottom'
    },
    {
      element: '#user-info',
      intro: 'こちらにあなたの情報が表示されます。',
      position: 'right'
    },
    {
      element: '#task-progress',
      intro: 'ここではあなたのビザ申請タスクの進捗状況が確認できます。',
      position: 'top'
    },
    {
      element: '#ai-agent',
      intro: '私たちのAIエージェントがあなたの移住プロセスをサポートします。',
      position: 'left'
    }
  ],
  questionnaire: [
    {
      element: '#questionnaire-form',
      intro: 'この質問票に回答して、最適なビザの種類をご案内します。',
      title: 'ビザタイプ診断',
      position: 'top'
    },
    {
      element: '#questionnaire-submit',
      intro: '全ての質問に回答したら、ここをクリックして結果を確認しましょう。',
      position: 'bottom'
    }
  ],
  tasks: [
    {
      element: '#task-list',
      intro: 'ここにはあなたのビザ申請に必要なタスクリストが表示されます。',
      title: 'タスク管理',
      position: 'top'
    },
    {
      element: '#add-task',
      intro: '新しいタスクを追加することもできます。',
      position: 'bottom'
    },
    {
      element: '#task-filters',
      intro: 'タスクをフィルタリングして、完了したタスクや期限の近いタスクを確認できます。',
      position: 'right'
    }
  ],
  auth: [
    {
      element: '#auth-form',
      intro: 'アカウントを作成するか、既存のアカウントでログインしてください。',
      title: 'アカウント管理',
      position: 'right'
    }
  ]
};

// Japanese translations for UI elements
const jaTranslations = {
  nextLabel: '次へ',
  prevLabel: '戻る',
  doneLabel: '完了',
  skipLabel: 'スキップ',
};

export default function OnboardingTour() {
  const { showTour, setShowTour, markTourComplete, currentStep, setCurrentStep } = useOnboarding();
  const [location] = useLocation();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [pageName, setPageName] = useState('');

  // Determine current page from location
  useEffect(() => {
    let page = 'home';
    if (location === '/') {
      page = 'home';
    } else {
      // Remove leading slash and any parameters
      page = location.replace(/^\//, '').split('/')[0];
    }
    
    setPageName(page);
    // Set steps based on current page
    setSteps(tourConfig[page] || []);
  }, [location]);

  // Handle tour completion
  const handleExit = () => {
    setShowTour(false);
    if (currentStep === steps.length) {
      markTourComplete(pageName);
    }
  };

  const options = {
    nextLabel: jaTranslations.nextLabel,
    prevLabel: jaTranslations.prevLabel,
    doneLabel: jaTranslations.doneLabel,
    skipLabel: jaTranslations.skipLabel,
    hidePrev: true,
    hideNext: false,
    showProgress: true,
    showBullets: true,
    showStepNumbers: false,
    keyboardNavigation: true,
    exitOnEsc: true,
    exitOnOverlayClick: false,
    disableInteraction: false,
    dontShowAgain: false,
    dontShowAgainLabel: '次回から表示しない',
    tooltipClass: 'customTooltip',
    highlightClass: 'customHighlight',
    overlayOpacity: 0.7
  };

  return (
    <Steps
      enabled={showTour && steps.length > 0}
      steps={steps}
      initialStep={currentStep}
      onExit={handleExit}
      onComplete={() => markTourComplete(pageName)}
      onChange={(newStep) => setCurrentStep(newStep)}
      options={options}
    />
  );
}