import React from 'react';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dots' | 'pulse' | 'brain';
  text?: string;
}

const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ 
  className, 
  size = 'md', 
  variant = 'dots',
  text = 'Thinking...'
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  if (variant === 'brain') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Brain className={cn(
          sizeClasses[size], 
          "text-primary animate-pulse duration-1000"
        )} />
        {text && <span className={cn(textSizeClasses[size], "text-muted-foreground font-medium")}>{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "rounded-full bg-primary animate-pulse duration-1000",
          sizeClasses[size]
        )} />
        {text && <span className={cn(textSizeClasses[size], "text-muted-foreground font-medium")}>{text}</span>}
      </div>
    );
  }
  // Default dots animation (similar to Claude/ChatGPT)
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'
        )} 
        style={{ 
          animationDelay: '0ms',
          animationDuration: '1.4s'
        }} />
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'
        )} 
        style={{ 
          animationDelay: '200ms',
          animationDuration: '1.4s'
        }} />
        <div className={cn(
          "rounded-full bg-primary animate-bounce",
          size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'
        )} 
        style={{ 
          animationDelay: '400ms',
          animationDuration: '1.4s'
        }} />
      </div>
      {text && <span className={cn(textSizeClasses[size], "text-muted-foreground font-medium")}>{text}</span>}
    </div>
  );
};

export default ThinkingAnimation;
