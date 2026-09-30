import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { useEffect, useState } from "react";
import { getValidSession } from "@/lib/supabase-auth";

// Pages — existing
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Lectures from "@/pages/lectures";
import LectureDetail from "@/pages/lecture-detail";
import Flashcards from "@/pages/flashcards";
import FlashcardStudy from "@/pages/flashcard-study";
import Quizzes from "@/pages/quizzes";
import QuizTake from "@/pages/quiz-take";
import Assistant from "@/pages/assistant";
import Search from "@/pages/search";
import Progress from "@/pages/progress";
import Achievements from "@/pages/achievements";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

// Pages — new AI tools
import AiInputCenter from "@/pages/ai-input-center";
import OcrStudio from "@/pages/ocr-studio";
import DocumentCenter from "@/pages/document-center";
import LanguageHub from "@/pages/language-hub";
import EquationLab from "@/pages/equation-lab";
import MindmapStudio from "@/pages/mindmap-studio";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getValidSession()
      .then((session) => {
        if (!active) return;
        if (!session && location !== "/login") setLocation("/login");
      })
      .catch(() => {
        if (active) setLocation("/login");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, [location, setLocation]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Checking your session…</div>;
  }
  return <>{children}</>;
}

