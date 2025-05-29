import { ArrowRight, Languages, Volume2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSubdomainUrl } from "@/lib/subdomain-utils";

interface ToolItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: "available" | "coming-soon";
  features?: string[];
  isExternal?: boolean;
}

const ToolItem = ({ title, description, icon, href, status, features, isExternal }: ToolItemProps) => {
  const isAvailable = status === "available";
  
  const handleClick = () => {
    if (isAvailable && isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Card className={`neo-card neon-border transition-all duration-300 hover:scale-105 ${!isAvailable ? 'opacity-60' : 'hover:shadow-lg hover:shadow-neon-purple/20'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-display">
          <div className="text-neon-purple">
            {icon}
          </div>
          {title}
          {!isAvailable && (
            <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-1 rounded-full">
              Coming Soon
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-foreground/70">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {features && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Features:</h4>
            <ul className="text-sm text-foreground/60 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-neon-purple rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isAvailable ? (
          <Button 
            onClick={handleClick}
            className="w-full bg-neon-purple/20 neon-border hover:bg-neon-purple/30 transition-all duration-300 group"
          >
            Use Tool
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button disabled className="w-full" variant="outline">
            Coming Soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const ToolsList = () => {
  const tools: ToolItemProps[] = [
    {
      title: "AI Translator",
      description: "Translate English text to Tagalog using advanced AI powered by Gemini. Designed specifically for accurate and natural Filipino translations.",
      icon: <Languages size={24} />,
      href: buildSubdomainUrl('translator'),
      status: "available",
      isExternal: true,
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
      href: buildSubdomainUrl('tts'),
      status: "available",
      isExternal: true,
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
