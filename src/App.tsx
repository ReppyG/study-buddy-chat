import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import NotFound from "./pages/NotFound";
const HelpCenter = lazy(() => import("@/components/help/HelpCenter").then(m => ({ default: m.HelpCenter })));

// Lazy load routes for code splitting
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const PomodoroTimer = lazy(() => import("@/components/pomodoro/PomodoroTimer").then(m => ({ default: m.PomodoroTimer })));
const AssignmentTracker = lazy(() => import("@/components/assignments/AssignmentTracker").then(m => ({ default: m.AssignmentTracker })));
const CanvasDashboard = lazy(() => import("@/components/canvas/CanvasDashboard").then(m => ({ default: m.CanvasDashboard })));
const AIStudyHub = lazy(() => import("@/components/ai-study/AIStudyHub").then(m => ({ default: m.AIStudyHub })));
const NotesApp = lazy(() => import("@/components/notes/NotesApp").then(m => ({ default: m.NotesApp })));
const DatabaseApp = lazy(() => import("@/components/database/DatabaseApp").then(m => ({ default: m.DatabaseApp })));
const ChatContainer = lazy(() => import("@/components/chat/ChatContainer").then(m => ({ default: m.ChatContainer })));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AppProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/canvas/*" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CanvasDashboard />
                    </Suspense>
                  } />
                  <Route path="/tasks/*" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <AssignmentTracker />
                    </Suspense>
                  } />
                  <Route path="/notes/*" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <NotesApp />
                    </Suspense>
                  } />
                  <Route path="/databases/*" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <DatabaseApp />
                    </Suspense>
                  } />
                  <Route path="/timer" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <div className="p-6 max-w-lg mx-auto"><PomodoroTimer /></div>
                    </Suspense>
                  } />
                  <Route path="/ai" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <div className="p-6 max-w-5xl mx-auto"><AIStudyHub /></div>
                    </Suspense>
                  } />
                  <Route path="/chat" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ChatContainer />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                  <Route path="/help" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <HelpCenter />
                    </Suspense>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </AppProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
