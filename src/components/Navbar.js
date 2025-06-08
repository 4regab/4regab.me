import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Menu, X, Home, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { navigateToSubdomain } from "@/lib/subdomain-utils";
// Helper function to get current subdomain
function getCurrentSubdomain() {
    if (typeof window === 'undefined')
        return '';
    const hostname = window.location.hostname;
    // For local development, check URL parameters to simulate subdomains
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const params = new URLSearchParams(window.location.search);
        const subdomain = params.get('subdomain');
        return subdomain || '';
    }
    // For production with custom domain
    const parts = hostname.split('.');
    if (parts.length > 2) {
        return parts[0];
    }
    return '';
}
// Helper function to navigate to main domain
function navigateToMainDomain(path = '/') {
    if (typeof window === 'undefined')
        return;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        window.location.href = `${protocol}//${hostname}:${window.location.port}${path}`;
        return;
    }
    // For production
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
    window.location.href = `${protocol}//${baseDomain}${path}`;
}
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeItem, setActiveItem] = useState("hero");
    const location = useLocation();
    const navigate = useNavigate();
    const handleProjectsClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            // Already on home page, just scroll to projects
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        else {
            // Navigate to home page with projects hash
            navigate('/#projects');
            // Small delay to ensure navigation completes before scrolling
            setTimeout(() => {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
        setIsOpen(false); // Close mobile menu if open
    };
    const handleToolsClick = (e) => {
        e.preventDefault();
        // Always navigate to the tools subdomain
        navigateToSubdomain('tools');
        setIsOpen(false); // Close mobile menu if open
    };
    const handleHomeClick = (e) => {
        e.preventDefault();
        const currentSubdomain = getCurrentSubdomain();
        // If we're already on the main domain, use regular navigation
        if (!currentSubdomain) {
            navigate('/');
        }
        else {
            // Navigate to main domain
            navigateToMainDomain('/');
        }
        setIsOpen(false); // Close mobile menu if open
    };
    useEffect(() => {
        const handleScroll = () => {
            // Add background after scrolling down
            if (window.scrollY > 20) {
                setScrolled(true);
            }
            else {
                setScrolled(false);
            }
            // Only update active menu item based on scroll position if we're on the home page
            if (location.pathname === '/') {
                const sections = document.querySelectorAll("section[id]");
                let currentSection = "hero";
                sections.forEach((section) => {
                    // Type cast section to HTMLElement to access offsetTop and offsetHeight
                    const htmlSection = section;
                    const sectionTop = htmlSection.offsetTop - 100;
                    const sectionHeight = htmlSection.offsetHeight;
                    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute("id") || "hero";
                    }
                });
                setActiveItem(currentSection);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);
    // Handle hash navigation when component mounts or location changes
    useEffect(() => {
        if (location.hash && location.pathname === '/') {
            const targetId = location.hash.slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash, location.pathname]);
    const menuItems = [
        { name: "Home", href: "/", handler: handleHomeClick, icon: Home },
        { name: "Tools", href: "/tools", handler: handleToolsClick, icon: Wrench },
    ];
    return (_jsxs("nav", { className: cn("fixed top-0 left-0 w-full z-50 transition-all duration-500", scrolled
            ? "neo-card-glass py-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-b border-white/10"
            : "py-4 bg-transparent"), children: [_jsxs("div", { className: "container mx-auto px-4 flex justify-between items-center", children: ["        ", _jsxs(Link, { to: "/", onClick: handleHomeClick, className: "relative group", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue-500/20 via-neon-purple-500/20 to-neon-pink-500/20 border border-neon-blue-500/30 flex items-center justify-center backdrop-blur-sm group-hover:border-neon-blue-500/50 transition-all duration-300", children: _jsx("span", { className: "text-neon-blue-400 font-bold text-lg", children: "4" }) }), _jsx("div", { className: "font-bold text-xl font-display", children: _jsx("span", { className: "bg-gradient-to-r from-neon-blue-400 via-neon-purple-400 to-neon-pink-400 bg-clip-text text-transparent", children: "REGAB" }) })] }), _jsx("div", { className: "absolute -inset-2 -z-10 opacity-0 group-hover:opacity-20 blur-lg bg-gradient-to-r from-neon-blue-500 via-neon-purple-500 to-neon-pink-500 rounded-xl transition-all duration-500" })] }), _jsx("div", { className: "hidden md:flex items-center space-x-6", children: menuItems.map((item) => {
                            let isActive = false;
                            const currentSubdomain = getCurrentSubdomain();
                            if (item.name === 'Home') {
                                isActive = !currentSubdomain && location.pathname === '/';
                            }
                            else if (item.name === 'Tools') {
                                isActive = currentSubdomain === 'tools' || location.pathname.startsWith('/tools');
                            }
                            return (_jsxs("button", { onClick: item.handler, className: cn("relative transition-all duration-300 px-6 py-3 text-sm font-medium rounded-xl group flex items-center space-x-3", isActive
                                    ? "text-neon-blue-400 bg-neon-blue-500/10 border border-neon-blue-500/30 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                                    : "text-foreground/80 hover:text-neon-blue-400 hover:bg-white/5 border border-transparent hover:border-white/10", "focus-ring"), children: [_jsx(item.icon, { size: 18, className: cn("transition-all duration-300", isActive ? "text-neon-blue-400" : "text-foreground/60 group-hover:text-neon-blue-400") }), _jsx("span", { className: "relative z-10 font-display", children: item.name }), !isActive && (_jsx("span", { className: "absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue-500/0 via-neon-purple-500/0 to-neon-pink-500/0 group-hover:from-neon-blue-500/5 group-hover:via-neon-purple-500/5 group-hover:to-neon-pink-500/5 transition-all duration-300" })), isActive && (_jsx("div", { className: "absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-neon-blue-500 to-neon-purple-500 rounded-full" }))] }, item.name));
                        }) }), _jsx("button", { className: "md:hidden p-3 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300 group focus-ring", onClick: () => setIsOpen(!isOpen), "aria-label": isOpen ? "Close menu" : "Open menu", children: isOpen ? (_jsx(X, { size: 20, className: "text-neon-pink transition-all duration-300 rotate-90 group-hover:scale-110" })) : (_jsx(Menu, { size: 20, className: "text-neon-blue transition-all duration-300 group-hover:scale-110" })) })] }), _jsx("div", { className: cn("md:hidden absolute top-full left-0 right-0 transition-all duration-500 ease-out", isOpen ? "translate-y-0 opacity-100" : "translate-y-[-20px] opacity-0 pointer-events-none"), children: _jsx("div", { className: "neo-card-glass m-4 rounded-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]", children: _jsx("div", { className: "p-6 space-y-1", children: menuItems.map((item, index) => {
                            let isActive = false;
                            const currentSubdomain = getCurrentSubdomain();
                            if (item.name === 'Home') {
                                isActive = !currentSubdomain && location.pathname === '/';
                            }
                            else if (item.name === 'Tools') {
                                isActive = currentSubdomain === 'tools' || location.pathname.startsWith('/tools');
                            }
                            return (_jsxs("button", { onClick: item.handler, className: cn("w-full p-5 rounded-xl transition-all duration-300 text-left group flex items-center space-x-4", "animate-slide-up", isActive
                                    ? "text-neon-blue-400 bg-neon-blue-500/10 border border-neon-blue-500/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                                    : "text-foreground/80 hover:text-neon-purple-400 hover:bg-white/5 border border-transparent hover:border-white/10", "focus-ring"), style: { animationDelay: `${index * 0.1}s` }, children: [_jsx(item.icon, { size: 20, className: cn("transition-all duration-300", isActive ? "text-neon-blue-400" : "text-foreground/60 group-hover:text-neon-purple-400") }), _jsx("span", { className: "font-medium font-display flex-1", children: item.name }), isActive && (_jsx("div", { className: "w-2 h-2 rounded-full bg-neon-blue-500 animate-glow-pulse" }))] }, item.name));
                        }) }) }) })] }));
};
export default Navbar;
