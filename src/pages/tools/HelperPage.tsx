import React from 'react';
import Helper from '@/components/tools/Helper';
import { Button } from '@/components/ui/button';
import { Home, Trash2 } from 'lucide-react';
import { getBaseUrl } from '@/lib/subdomain-utils';

const HelperPage = () => {
  const handleToolsClick = () => {
    window.location.href = getBaseUrl() + '/tools';
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Simple Header with Logo and Tools Navigation */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToolsClick}
            className="font-bold text-xl font-display relative group"
          >
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              4REGAB
            </span>
            <span className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 blur-md bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg transition-opacity duration-500"></span>
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">AI Chat</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToolsClick}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Tools</span>
        </Button>
      </header>
      
      {/* Main Helper Component */}
      <main className="flex-1 min-h-0">
        <Helper />
      </main>
    </div>
  );
};

export default HelperPage;
