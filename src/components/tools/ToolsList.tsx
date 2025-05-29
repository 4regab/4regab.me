import { ArrowRight, Languages, Volume2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to build URLs for tool subdomains
function buildToolUrl(subdomain: string) {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${window.location.port}?subdomain=${subdomain}`;
  }
  
  // For production - use dedicated subdomains
  const parts = hostname.split('.');
  let baseDomain;
  
  if (parts.length > 2) {
    // We're on a subdomain, get the base domain
    baseDomain = parts.slice(1).join('.');
  } else {
    // We're on the main domain
    baseDomain = hostname;
  }
  
  return `${protocol}//${subdomain}.${baseDomain}/`;
}

interface ToolItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: "available" | "coming-soon";
  features?: string[];
  internalRoute?: string;
}

const ToolItem = ({ title, description, icon, href, status, features, internalRoute }: ToolItemProps) => {
  const isAvailable = status === "available";
  
  const handleClick = () => {
    if (!isAvailable) return;
    
    // Always navigate to the tool's dedicated subdomain
    window.location.href = href;
  };
    return (
    <Card className={`neo-card neon-border transition-all duration-300 hover:scale-105 ${!isAvailable ? 'opacity-60' : 'hover:shadow-lg hover:shadow-neon-purple/20'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 font-display text-xl font-bold tracking-tight">
          <div className="text-neon-purple">
            {icon}
          </div>
          <span className="text-foreground">{title}</span>
          {!isAvailable && (
            <span className="text-xs bg-neon-blue/20 text-neon-blue px-3 py-1 rounded-full font-medium">
              Coming Soon
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-foreground/80 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>      <CardContent className="pt-2">
        {features && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-foreground">Features:</h4>
            <ul className="text-sm text-foreground/70 space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-purple rounded-full flex-shrink-0"></div>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
          {isAvailable ? (
          <Button 
            onClick={handleClick}
            className="w-full bg-neon-purple/20 neon-border hover:bg-neon-purple/30 transition-all duration-300 group h-12 font-semibold text-white"
          >
            Use Tool
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform text-white" />
          </Button>
        ) : (
          <Button disabled className="w-full h-12 font-semibold" variant="outline">
            Coming Soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const ToolsList = () => {  const tools: ToolItemProps[] = [
    {
      title: "AI Translator",
      description: "Translate English text to Tagalog using advanced AI powered by Gemini. Designed specifically for accurate and natural Filipino translations.",
      icon: <Languages size={24} />,
      href: buildToolUrl('translator'),
      internalRoute: "/translator",
      status: "available",
      features: [
        "English to Tagalog translation",
        "Context-aware translations",
        "Natural Filipino language output",
        "Powered by Gemini AI"
      ]
    },
    {
      title: "Text to Speech",
      description: "Convert text to natural-sounding speech using Gemini AI with multiple voice options and high-quality audio generation.",
      icon: <Volume2 size={24} />,
      href: buildToolUrl('tts'),
      internalRoute: "/text-to-speech",
      status: "available",
      features: [
        "30+ voice options",
        "High-quality audio generation",
        "Multiple output formats",
        "Download audio files",
        "Powered by Gemini TTS"
      ]
    },
    {
      title: "More Tools",
      description: "Additional AI-powered tools are in development. Stay tuned for more productivity-enhancing utilities.",
      icon: <Wrench size={24} />,
      href: "#",
      status: "coming-soon",
      features: [
        "Text summarization",
        "Image analysis",
        "Code generation", 
        "And much more..."
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {tools.map((tool, index) => (
        <div 
          key={tool.title} 
          className="animate-slide-up" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ToolItem {...tool} />
        </div>
      ))}
    </div>
  );
};

export default ToolsList;
