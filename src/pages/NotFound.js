import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
const NotFound = () => {
    const location = useLocation();
    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);
    return (_jsxs("div", { className: "min-h-screen flex items-center justify-center bg-background gradient-bg", children: [_jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(18,18,23,1)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,23,1)_2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" }), _jsxs("div", { className: "text-center relative z-10 neo-card neon-border-pink p-12 animate-blur-in", children: [_jsx("h1", { className: "text-8xl font-bold mb-4 neon-text-pink", children: "404" }), _jsx("p", { className: "text-xl text-foreground/80 mb-8", children: "Oops! This page has disappeared into the digital void." }), _jsxs("a", { href: "/", className: "inline-flex items-center px-6 py-3 bg-neon-pink/20 neon-border-pink rounded-sm hover:bg-neon-pink/30 transition-all duration-300 gap-2", children: [_jsx(ArrowLeft, { size: 16 }), _jsx("span", { children: "Return to Home" })] })] })] }));
};
export default NotFound;
