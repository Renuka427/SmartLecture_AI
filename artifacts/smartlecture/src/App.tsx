import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import * as React from "react";
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

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("SmartLecture page render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-bold mb-2">This page hit an error</h1>
            <p className="text-sm text-muted-foreground mb-4">
              SmartLecture could not render this module. Please share the error below so it can be fixed.
            </p>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-xs">{this.state.error.message}</pre>
            <button className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        if (active && location !== "/login") setLocation("/login");
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      {/* ── Core pages ── */}
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/lectures">
        <ProtectedRoute><Lectures /></ProtectedRoute>
      </Route>
      <Route path="/lectures/:id">
        <ProtectedRoute><LectureDetail /></ProtectedRoute>
      </Route>
      <Route path="/flashcards">
        <ProtectedRoute><Flashcards /></ProtectedRoute>
      </Route>
      <Route path="/flashcards/:id">
        <ProtectedRoute><FlashcardStudy /></ProtectedRoute>
      </Route>
      <Route path="/quizzes">
        <ProtectedRoute><Quizzes /></ProtectedRoute>
      </Route>
      <Route path="/quizzes/:id">
        <ProtectedRoute><QuizTake /></ProtectedRoute>
      </Route>
      <Route path="/assistant">
        <ProtectedRoute><Assistant /></ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute><Search /></ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute><Progress /></ProtectedRoute>
      </Route>
      <Route path="/achievements">
        <ProtectedRoute><Achievements /></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><Profile /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>

      {/* ── AI Tools ── */}
      <Route path="/input-center">
        <ProtectedRoute><AiInputCenter /></ProtectedRoute>
      </Route>
      <Route path="/ocr-studio">
        <ProtectedRoute><OcrStudio /></ProtectedRoute>
      </Route>
      <Route path="/documents">
        <ProtectedRoute><DocumentCenter /></ProtectedRoute>
      </Route>
      <Route path="/language-hub">
        <ProtectedRoute><LanguageHub /></ProtectedRoute>
      </Route>
      <Route path="/equation-lab">
        <ProtectedRoute><EquationLab /></ProtectedRoute>
      </Route>
      <Route path="/mindmap-studio">
        <ProtectedRoute><MindmapStudio /></ProtectedRoute>
      </Route>

      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="smartlecture-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
