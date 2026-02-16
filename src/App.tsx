import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import EventsPage from "./pages/EventsPage";
import SOPPage from "./pages/SOPPage";
import CoronaSOPPage from "./pages/CoronaSOPPage";
import TasksPage from "./pages/TasksPage";
import RoadmapPage from "./pages/RoadmapPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper to conditionally show navigation
const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && <Navigation />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/expenses" element={<Index />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/sop" element={<SOPPage />} />
        <Route path="/corona-sop" element={<CoronaSOPPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
