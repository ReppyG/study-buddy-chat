/*
  APP.TSX - THE ROOT OF OUR APPLICATION
  =====================================
  This file sets up all the providers and routing for our app.
  
  Providers are like "wrappers" that give features to all components:
  - QueryClientProvider: For data fetching (react-query)
  - TooltipProvider: For tooltip components
  - HelmetProvider: For SEO meta tags
  - BrowserRouter: For page navigation
*/

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a query client for data fetching
const queryClient = new QueryClient();

const App = () => (
  // Wrap everything in providers
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Toast notifications */}
        <Toaster />
        <Sonner />
        
        {/* Router for page navigation */}
        <BrowserRouter>
          <Routes>
            {/* Main chat page */}
            <Route path="/" element={<Index />} />
            
            {/* 404 page for unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
