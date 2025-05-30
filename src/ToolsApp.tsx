import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tools from "./pages/Tools";
import TranslatorPage from "./pages/tools/TranslatorPage";
import TextToSpeechPage from "./pages/tools/TextToSpeechPage";
import HelperPage from "./pages/tools/HelperPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ToolsApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>        <Routes>
          <Route path="/" element={<Tools />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/text-to-speech" element={<TextToSpeechPage />} />
          <Route path="/helper" element={<HelperPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default ToolsApp;
