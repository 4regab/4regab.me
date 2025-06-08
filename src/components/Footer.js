import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Github, Linkedin, Twitter, Mail, Heart, ExternalLink, Code, Sparkles, ArrowUp, Star, Zap } from "lucide-react";
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const socialLinks = [
        {
            name: "GitHub",
            icon: Github,
            href: "https://github.com/4regab",
            color: "text-neon-blue-500",
            hoverColor: "hover:text-neon-blue-500",
            description: "Open source projects"
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            href: "https://linkedin.com/in/4regab",
            color: "text-neon-purple-500",
            hoverColor: "hover:text-neon-purple-500",
            description: "Professional network"
        },
        {
            name: "Twitter",
            icon: Twitter,
            href: "https://twitter.com/4regab",
            color: "text-neon-pink-500",
            hoverColor: "hover:text-neon-pink-500",
            description: "Latest updates"
        },
        {
            name: "Email",
            icon: Mail,
            href: "mailto:hello@4regab.me",
            color: "text-neon-green-500",
            hoverColor: "hover:text-neon-green-500",
            description: "Get in touch"
        }
    ];
    const quickLinks = [
        { name: "Home", href: "#hero", description: "Back to top" },
        { name: "About", href: "#about", description: "Learn more" },
        { name: "Projects", href: "#projects", description: "My work" },
        { name: "AI Tools", href: "/tools", description: "Explore tools" }
    ];
    const projects = [
        {
            name: "DeepTerm",
            href: "https://deepterm.tech",
            status: "live",
            description: "AI Terminal Assistant"
        },
        {
            name: "QuillBro",
            href: "https://quillbro.live",
            status: "live",
            description: "AI Writing Companion"
        }
    ];
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (_jsxs("footer", { className: "relative bg-gradient-to-t from-surface-secondary via-surface-primary to-background border-t border-white/10 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(18,18,23,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,23,0.8)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05),transparent_50%)]" }), _jsx("div", { className: "absolute top-0 left-1/4 w-96 h-96 bg-neon-blue-500/3 rounded-full blur-3xl animate-float" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-80 h-80 bg-neon-purple-500/3 rounded-full blur-3xl animate-float", style: { animationDelay: '2s' } }), _jsxs("div", { className: "container relative z-10 mx-auto container-padding", children: [_jsx("div", { className: "py-20", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "group", children: [_jsx("h3", { className: "text-3xl font-display font-bold mb-2", children: _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-neon-blue-500 via-neon-purple-500 to-neon-pink-500", children: "4regab.me" }) }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground/60", children: [_jsx(Zap, { className: "w-4 h-4 text-neon-green-500" }), _jsx("span", { children: "Powered by Innovation" })] })] }), _jsx("p", { className: "text-lg text-foreground/70 leading-relaxed max-w-lg", children: "Building innovative AI-powered web applications that solve real-world problems. Passionate about clean code, exceptional user experiences, and cutting-edge technology." }), _jsxs("div", { className: "flex items-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-neon-purple-500/10 to-neon-blue-500/10 border border-white/10", children: [_jsx(Star, { className: "w-5 h-5 text-neon-purple-500" }), _jsxs("span", { className: "text-sm text-foreground/80", children: [_jsx("strong", { children: "Featured:" }), " AI Chat Helper with 8 specialized agents"] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("h4", { className: "text-lg font-display font-semibold text-foreground/90 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-neon-purple-500" }), "Connect & Follow"] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: socialLinks.map((link) => {
                                                        const IconComponent = link.icon;
                                                        return (_jsx("a", { href: link.href, target: "_blank", rel: "noopener noreferrer", className: `
                          group p-4 rounded-2xl transition-all duration-300 
                          neo-card-glass border border-white/10 hover:border-white/20
                          ${link.hoverColor} hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]
                        `, "aria-label": `${link.name} - ${link.description}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(IconComponent, { size: 20, className: "group-hover:rotate-12 transition-transform duration-300" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-foreground/90 group-hover:text-foreground transition-colors", children: link.name }), _jsx("div", { className: "text-xs text-foreground/60", children: link.description })] })] }) }, link.name));
                                                    }) })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("h4", { className: "text-lg font-display font-semibold text-foreground/90 flex items-center gap-2", children: [_jsx(Code, { className: "w-5 h-5 text-neon-blue-500" }), "Navigation"] }), _jsx("ul", { className: "space-y-4", children: quickLinks.map((link) => (_jsx("li", { children: _jsxs("a", { href: link.href, className: "group p-3 rounded-xl transition-all duration-300 flex items-center justify-between hover:bg-white/5 border border-transparent hover:border-white/10", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-foreground/80 group-hover:text-neon-blue-500 transition-colors duration-300", children: link.name }), _jsx("div", { className: "text-xs text-foreground/60", children: link.description })] }), _jsx(ExternalLink, { size: 14, className: "opacity-0 group-hover:opacity-100 text-neon-blue-500 transition-opacity duration-300" })] }) }, link.name))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("h4", { className: "text-lg font-display font-semibold text-foreground/90 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-neon-green-500" }), "Featured Projects"] }), _jsx("ul", { className: "space-y-4", children: projects.map((project) => (_jsx("li", { children: _jsxs("a", { href: project.href, target: "_blank", rel: "noopener noreferrer", className: "group p-4 rounded-xl transition-all duration-300 block hover:bg-white/5 border border-transparent hover:border-white/10", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium text-foreground/80 group-hover:text-neon-green-500 transition-colors duration-300", children: project.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-xs text-green-500 font-medium uppercase tracking-wider", children: project.status })] })] }), _jsx("div", { className: "text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300", children: project.description })] }) }, project.name))) })] })] }) }), _jsx("div", { className: "py-8 border-t border-white/10", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2 text-foreground/60", children: [_jsxs("span", { children: ["\u00A9 ", currentYear, " 4regab.me. Crafted with"] }), _jsx(Heart, { size: 16, className: "text-red-500 animate-pulse" }), _jsx("span", { children: "and" }), _jsx(Code, { size: 16, className: "text-neon-blue-500" }), _jsx("span", { children: "in Metro Manila" })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground/60", children: [_jsx(Sparkles, { size: 14, className: "text-neon-green-500 animate-pulse" }), _jsx("span", { children: "Powered by AI Innovation" })] }), _jsx("button", { onClick: scrollToTop, className: "group p-3 rounded-xl bg-gradient-to-r from-neon-purple-500/10 to-neon-blue-500/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105", "aria-label": "Scroll to top", children: _jsx(ArrowUp, { size: 16, className: "text-neon-purple-500 group-hover:-translate-y-1 transition-transform duration-300" }) })] })] }) })] })] }));
};
export default Footer;
