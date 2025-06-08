import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
const ThinkingAnimation = ({ className, size = 'md', variant = 'dots', text = 'Thinking...' }) => {
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
        return (_jsxs("div", { className: cn("flex items-center gap-2", className), children: [_jsx(Brain, { className: cn(sizeClasses[size], "text-primary animate-pulse duration-1000") }), text && _jsx("span", { className: cn(textSizeClasses[size], "text-muted-foreground font-medium"), children: text })] }));
    }
    if (variant === 'pulse') {
        return (_jsxs("div", { className: cn("flex items-center gap-2", className), children: [_jsx("div", { className: cn("rounded-full bg-primary animate-pulse duration-1000", sizeClasses[size]) }), text && _jsx("span", { className: cn(textSizeClasses[size], "text-muted-foreground font-medium"), children: text })] }));
    }
    // Default dots animation (similar to Claude/ChatGPT)
    return (_jsxs("div", { className: cn("flex items-center gap-2", className), children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: cn("rounded-full bg-primary animate-bounce", size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'), style: {
                            animationDelay: '0ms',
                            animationDuration: '1.4s'
                        } }), _jsx("div", { className: cn("rounded-full bg-primary animate-bounce", size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'), style: {
                            animationDelay: '200ms',
                            animationDuration: '1.4s'
                        } }), _jsx("div", { className: cn("rounded-full bg-primary animate-bounce", size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-2.5 w-2.5'), style: {
                            animationDelay: '400ms',
                            animationDuration: '1.4s'
                        } })] }), text && _jsx("span", { className: cn(textSizeClasses[size], "text-muted-foreground font-medium"), children: text })] }));
};
export default ThinkingAnimation;
