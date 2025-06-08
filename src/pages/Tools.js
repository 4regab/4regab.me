import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolsList from "@/components/tools/ToolsList";
const Tools = () => {
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx(Navbar, {}), _jsx("main", { className: "pt-20", children: _jsxs("section", { className: "py-12 md:py-20", children: ["          ", _jsxs("div", { className: "container mx-auto px-4 max-w-6xl", children: ["            ", _jsx("div", { className: "mb-8 md:mb-12 text-center", children: _jsx("p", { className: "text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto animate-slide-up", style: { animationDelay: '0.2s' }, children: "Discover our collection of AI-powered tools designed to enhance your productivity. From translation to speech generation, explore cutting-edge AI capabilities." }) }), _jsx("div", { className: "animate-slide-up", style: { animationDelay: '0.4s' }, children: _jsx(ToolsList, {}) })] })] }) }), _jsx(Footer, {})] }));
};
export default Tools;
