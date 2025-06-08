import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TextToSpeech from "@/components/tools/TextToSpeech";
const TextToSpeechPage = () => {
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx(Navbar, {}), _jsx("main", { className: "pt-20", children: _jsxs("div", { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10 pointer-events-none" }), _jsx("div", { className: "absolute top-0 left-1/3 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-0 right-1/3 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" }), _jsx("div", { className: "relative z-10", children: _jsx(TextToSpeech, {}) })] }) }), _jsx(Footer, {})] }));
};
export default TextToSpeechPage;
