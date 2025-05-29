import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TextToSpeechPage from "./pages/tools/TextToSpeechPage";

const queryClient = new QueryClient();

const TTSApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TextToSpeechPage />
    </TooltipProvider>
  </QueryClientProvider>
);

export default TTSApp;
