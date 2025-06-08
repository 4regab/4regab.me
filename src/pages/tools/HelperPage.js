import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Helper from '@/components/tools/Helper';
const HelperPage = () => {
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx(Navbar, {}), _jsx("main", { className: "pt-20", children: _jsxs("div", { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-blue/10 pointer-events-none" }), _jsx("div", { className: "absolute top-0 right-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-0 left-1/4 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl" }), _jsx("div", { className: "relative z-10", children: _jsx(Helper, {}) })] }) }), _jsx(Footer, {})] }));
};
export default HelperPage;
