import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight, Languages, Volume2, Wrench, Brain, Sparkles, Star, Zap, Clock, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Helper function to build URLs for tool subdomains
function buildToolUrl(subdomain) {
    if (typeof window === 'undefined')
        return '';
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
    }
    else {
        // We're on the main domain
        baseDomain = hostname;
    }
    return `${protocol}//${subdomain}.${baseDomain}/`;
}
const ToolItem = ({ title, description, icon, href, status, features, internalRoute }) => {
    const isAvailable = status === "available";
    const handleClick = () => {
        if (!isAvailable)
            return;
        // Always navigate to the tool's dedicated subdomain
        window.location.href = href;
    };
    return (_jsxs(Card, { className: `
      neo-card-advanced group transition-all duration-500 hover:scale-105 border border-white/10 
      ${!isAvailable ? 'opacity-60' : 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'}
      rounded-2xl overflow-hidden
    `, children: [_jsxs(CardHeader, { className: "pb-4 relative", children: [!isAvailable && (_jsx("div", { className: "absolute top-4 right-4", children: _jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue-500/20 border border-neon-blue-500/30", children: [_jsx(Clock, { className: "w-3 h-3 text-neon-blue-500" }), _jsx("span", { className: "text-xs text-neon-blue-500 font-medium", children: "Coming Soon" })] }) })), _jsxs(CardTitle, { className: "flex items-start gap-4 font-display text-xl font-bold tracking-tight mb-3", children: [_jsx("div", { className: `
            p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 flex-shrink-0
            ${isAvailable ? 'bg-neon-purple-500/10 border border-neon-purple-500/20' : 'bg-surface-secondary border border-white/10'}
          `, children: _jsx("div", { className: `
              transition-colors duration-300
              ${isAvailable ? 'text-neon-purple-500' : 'text-foreground/50'}
            `, children: icon }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-foreground group-hover:text-foreground/90 transition-colors mb-1", children: title }), isAvailable && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-xs text-green-500 font-medium uppercase tracking-wider", children: "Live" })] }))] })] }), _jsx(CardDescription, { className: "text-foreground/80 text-base leading-relaxed", children: description })] }), _jsxs(CardContent, { className: "pt-2 space-y-6", children: [features && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-semibold mb-4 text-foreground flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-neon-purple-500" }), "Key Features"] }), _jsx("ul", { className: "space-y-3", children: features.map((feature, index) => (_jsxs("li", { className: "flex items-start gap-3 group/feature", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-neon-purple-500 rounded-full mt-2 flex-shrink-0 group-hover/feature:scale-125 transition-transform duration-300" }), _jsx("span", { className: "text-sm text-foreground/70 leading-relaxed group-hover/feature:text-foreground/90 transition-colors duration-300", children: feature })] }, index))) })] })), isAvailable ? (_jsx(Button, { onClick: handleClick, className: "w-full bg-gradient-to-r from-neon-purple-500/20 to-neon-blue-500/20 border border-neon-purple-500/30 hover:from-neon-purple-500/30 hover:to-neon-blue-500/30 hover:border-neon-purple-500/50 transition-all duration-300 group/btn h-12 font-semibold text-white rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" }), _jsx("span", { children: "Launch Tool" }), _jsx(ArrowRight, { size: 18, className: "group-hover/btn:translate-x-1 transition-transform duration-300" })] }) })) : (_jsx(Button, { disabled: true, className: "w-full h-12 font-semibold rounded-xl bg-surface-secondary border border-white/10 text-foreground/50", variant: "outline", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "Coming Soon" })] }) }))] })] }));
};
const ToolsList = () => {
    const tools = [
        {
            title: "AI Chat Assistant",
            description: "Advanced AI-powered chat with 8 specialized agents for academic, professional, and creative tasks. Upload files and export results to PDF/DOCX.",
            icon: _jsx(Brain, { size: 24 }),
            href: buildToolUrl('chat'),
            internalRoute: "/chat",
            status: "available",
            features: [
                "8 specialized AI agents (Academic, Creative, Technical, etc.)",
                "File upload support (PDF, DOCX, TXT, images)",
                "Export conversations to PDF/DOCX",
                "Real-time thinking mode for complex problems",
                "Context-aware responses with memory"
            ]
        },
        {
            title: "AI Translator",
            description: "Intelligent English to Tagalog translation powered by Gemini AI. Designed for natural, context-aware Filipino translations.",
            icon: _jsx(Languages, { size: 24 }),
            href: buildToolUrl('translator'),
            internalRoute: "/translator",
            status: "available",
            features: [
                "English to Tagalog translation",
                "Context-aware and culturally appropriate",
                "Natural Filipino language output",
                "Batch translation support",
                "Powered by Google Gemini AI"
            ]
        },
        {
            title: "Text to Speech",
            description: "Convert text to natural-sounding speech using advanced Gemini TTS with multiple voice options and high-quality audio generation.",
            icon: _jsx(Volume2, { size: 24 }),
            href: buildToolUrl('tts'),
            internalRoute: "/text-to-speech",
            status: "available",
            features: [
                "30+ high-quality voice options",
                "Multiple languages and accents",
                "Adjustable speed and pitch",
                "Download audio in various formats",
                "Real-time preview and editing"
            ]
        },
        {
            title: "More AI Tools",
            description: "Exciting new AI-powered productivity tools in development. Stay tuned for image generation, code analysis, and more innovative utilities.",
            icon: _jsx(Wrench, { size: 24 }),
            href: "#",
            status: "coming-soon",
            features: [
                "AI Image Generator",
                "Code Analysis & Review",
                "Document Summarizer",
                "Voice Cloning",
                "And much more..."
            ]
        }
    ];
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple-500/10 to-neon-blue-500/10 border border-white/10", children: [_jsx(Zap, { className: "w-4 h-4 text-neon-purple-500" }), _jsx("span", { className: "text-sm font-medium text-foreground/80", children: "AI-Powered Tools" })] }), _jsxs("h2", { className: "text-3xl md:text-4xl font-display font-bold mb-4 text-foreground", children: ["Explore Our", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-neon-purple-500 to-neon-blue-500 ml-2", children: "AI Tools" })] }), _jsx("p", { className: "text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed", children: "Discover powerful AI-driven utilities designed to enhance your productivity and creativity" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8", children: tools.map((tool, index) => (_jsx("div", { className: "animate-slide-up", style: { animationDelay: `${index * 0.15}s` }, children: _jsx(ToolItem, { ...tool }) }, tool.title))) }), _jsx("div", { className: "text-center mt-16 animate-fade-in", style: { animationDelay: '0.8s' }, children: _jsxs("div", { className: "neo-card-advanced p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-neon-purple-500/5 to-neon-blue-500/5 max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [_jsx(Star, { className: "w-6 h-6 text-neon-purple-500" }), _jsx(Sparkles, { className: "w-6 h-6 text-neon-blue-500" })] }), _jsx("h3", { className: "text-2xl font-display font-bold mb-4 text-foreground", children: "More Tools Coming Soon" }), _jsx("p", { className: "text-foreground/70 mb-6 leading-relaxed", children: "We're constantly developing new AI-powered tools to help you work smarter and more efficiently. Follow us for updates on the latest releases!" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs(Button, { className: "bg-gradient-to-r from-neon-purple-500/20 to-neon-blue-500/20 border border-neon-purple-500/30 hover:from-neon-purple-500/30 hover:to-neon-blue-500/30 text-white hover:scale-105 transition-all duration-300", onClick: () => window.open('https://github.com/4regab', '_blank'), children: [_jsx(Github, { className: "w-4 h-4 mr-2" }), "Follow on GitHub"] }), _jsxs(Button, { variant: "outline", className: "border-white/20 hover:border-white/30 hover:bg-white/5 transition-all duration-300", onClick: () => window.location.href = '#contact', children: ["Request a Tool", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })] })] }) })] }));
};
export default ToolsList;
