import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRight, ExternalLink, Github, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";
const ProjectCard = ({ title, description, image, tags, index, link = "#", github, demo, viewMode = "grid", }) => {
    const [isHovered, setIsHovered] = useState(false); // Enhanced color cycling system
    const getAccentColor = () => {
        const colors = [
            {
                border: "border-neon-blue-500/30 hover:border-neon-blue-500/60",
                text: "text-neon-blue-400",
                bg: "bg-neon-blue-500/10 hover:bg-neon-blue-500/20",
                shadow: "shadow-[0_0_20px_rgba(0,212,255,0.3)]",
                glow: "group-hover:shadow-[0_0_40px_rgba(0,212,255,0.4)]"
            },
            {
                border: "border-neon-pink-500/30 hover:border-neon-pink-500/60",
                text: "text-neon-pink-400",
                bg: "bg-neon-pink-500/10 hover:bg-neon-pink-500/20",
                shadow: "shadow-[0_0_20px_rgba(255,0,128,0.3)]",
                glow: "group-hover:shadow-[0_0_40px_rgba(255,0,128,0.4)]"
            },
            {
                border: "border-neon-purple-500/30 hover:border-neon-purple-500/60",
                text: "text-neon-purple-400",
                bg: "bg-neon-purple-500/10 hover:bg-neon-purple-500/20",
                shadow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                glow: "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
            },
            {
                border: "border-neon-green-500/30 hover:border-neon-green-500/60",
                text: "text-neon-green-400",
                bg: "bg-neon-green-500/10 hover:bg-neon-green-500/20",
                shadow: "shadow-[0_0_20px_rgba(0,255,136,0.3)]",
                glow: "group-hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
            }
        ];
        return colors[index % colors.length];
    };
    const accentColor = getAccentColor();
    if (viewMode === "list") {
        return (_jsx("div", { className: cn("neo-card-glass group relative transition-all duration-500 hover:scale-[1.01] animate-slide-up border border-white/10 rounded-2xl overflow-hidden", "hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"), style: { animationDelay: `${0.1 + index * 0.1}s` }, children: _jsxs("div", { className: "flex flex-col md:flex-row", children: [_jsx("div", { className: "md:w-1/3 relative overflow-hidden", children: _jsxs(AspectRatio, { ratio: 16 / 9, className: "md:aspect-auto md:h-full", children: [_jsx("img", { src: image, alt: title, className: "object-cover w-full h-full transition-transform duration-700 group-hover:scale-110", loading: "lazy", onError: (e) => {
                                        const imgElement = e.currentTarget;
                                        console.error(`Failed to load image: ${imgElement.src}`);
                                        imgElement.src = "/placeholder.svg";
                                    } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" })] }) }), _jsxs("div", { className: "md:w-2/3 p-8 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: ["                ", _jsx("h3", { className: cn("text-2xl font-display font-bold tracking-tight transition-all duration-300", accentColor.text), children: title }), _jsxs("div", { className: "flex items-center space-x-2", children: [github && (_jsx("a", { href: github, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300 border", accentColor.border, accentColor.bg, "hover:scale-110"), "aria-label": `View ${title} source code`, children: _jsx(Github, { size: 18 }) })), demo && (_jsx("a", { href: demo, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300 border", accentColor.border, accentColor.bg, "hover:scale-110"), "aria-label": `View ${title} demo`, children: _jsx(Eye, { size: 18 }) })), _jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300 border", accentColor.border, accentColor.bg, "hover:scale-110 group/link"), "aria-label": `View ${title} project`, children: _jsx(ExternalLink, { size: 18, className: "group-hover/link:rotate-12 transition-transform duration-300" }) })] })] }), _jsx("p", { className: "text-foreground/75 mb-6 leading-relaxed text-lg", children: description })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, i) => (_jsx("span", { className: "text-sm px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors duration-300 font-medium", children: tag }, i))) })] })] }) }));
    }
    return (_jsxs("div", { className: cn("neo-card-glass group relative transition-all duration-500 hover:scale-105 hover:rotate-1 animate-slide-up", "border border-white/10 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]", "hover:border-white/20"), style: { animationDelay: `${0.1 + index * 0.1}s` }, children: [_jsxs("div", { className: "relative overflow-hidden", children: [_jsxs(AspectRatio, { ratio: 16 / 9, children: [_jsx("img", { src: image, alt: title, className: "object-cover w-full h-full transition-transform duration-700 group-hover:scale-110", loading: "lazy", onError: (e) => {
                                    const imgElement = e.currentTarget;
                                    console.error(`Failed to load image: ${imgElement.src}`);
                                    imgElement.src = "/placeholder.svg";
                                } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" })] }), _jsxs("div", { className: "absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500", children: [github && (_jsx("a", { href: github, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300", "neo-card-glass border", accentColor.border, accentColor.bg, "hover:scale-110 group/btn"), "aria-label": `View ${title} source code`, children: _jsx(Github, { size: 16 }) })), demo && (_jsx("a", { href: demo, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300", "neo-card-glass border", accentColor.border, accentColor.bg, "hover:scale-110 group/btn"), "aria-label": `View ${title} demo`, children: _jsx(Eye, { size: 16 }) })), _jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", className: cn("p-2 rounded-xl transition-all duration-300", "neo-card-glass border", accentColor.border, accentColor.bg, "hover:scale-110 group/btn"), "aria-label": `View ${title} project`, children: _jsx(ArrowUpRight, { size: 16, className: "group-hover/btn:rotate-12 transition-transform duration-300" }) })] })] }), _jsxs("div", { className: "p-6 space-y-4", children: ["        ", _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: cn("text-xl font-display font-bold tracking-tight transition-all duration-300", accentColor.text), children: title }), _jsx("p", { className: "text-foreground/75 leading-relaxed", children: description })] }), _jsx("div", { className: "flex flex-wrap gap-2 pt-2", children: tags.map((tag, i) => (_jsx("span", { className: "text-xs px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors duration-300 font-medium", children: tag }, i))) })] })] }));
};
export default ProjectCard;
