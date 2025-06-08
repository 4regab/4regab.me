import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
const Index = () => {
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [_jsx(Navbar, {}), _jsx(Hero, {}), _jsx(Projects, {}), _jsx(Footer, {})] }));
};
export default Index;
