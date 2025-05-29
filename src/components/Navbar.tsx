
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("hero");
  const location = useLocation();
  const navigate = useNavigate();

  const handleProjectsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home page, just scroll to projects
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
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

  useEffect(() => {
    const handleScroll = () => {
      // Add background after scrolling down
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Only update active menu item based on scroll position if we're on the home page
      if (location.pathname === '/') {
        const sections = document.querySelectorAll("section[id]");
        let currentSection = "hero";

        sections.forEach((section) => {
          // Type cast section to HTMLElement to access offsetTop and offsetHeight
          const htmlSection = section as HTMLElement;
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
    { name: "Home", href: "/" },
    { name: "Projects", href: "/#projects" },
    { name: "Tools", href: "/tools" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-md py-2 shadow-md" : "py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl font-display relative group">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            4REGAB
          </span>
          <span className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 blur-md bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg transition-opacity duration-500"></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => {
            let isActive = false;
            
            if (item.href.startsWith('/') && !item.href.includes('#')) {
              // Route-based navigation (Tools, Home)
              isActive = location.pathname === item.href;
            } else if (item.name === 'Projects') {
              // Projects section (special handling)
              isActive = location.pathname === '/' && activeItem === 'projects';
            } else if (item.href.startsWith('#')) {
              // Hash-based navigation (only on home page)
              isActive = location.pathname === '/' && activeItem === item.href.slice(1);
            }
            
            if (item.name === 'Projects') {
              return (
                <button
                  key={item.name}
                  onClick={handleProjectsClick}
                  className={cn(
                    "relative transition-all duration-300 px-2 py-1 text-sm font-medium",
                    isActive 
                      ? "neon-text font-medium" 
                      : "hover:neon-text",
                    "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-neon-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-blue animate-pulse"></span>
                  )}
                </button>
              );
            }
            
            return item.href.startsWith('/') ? (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative transition-all duration-300 px-2 py-1 text-sm font-medium",
                  isActive 
                    ? "neon-text font-medium" 
                    : "hover:neon-text",
                  "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-neon-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-blue animate-pulse"></span>
                )}
              </Link>
            ) : (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "relative transition-all duration-300 px-2 py-1 text-sm font-medium",
                  isActive 
                    ? "neon-text font-medium" 
                    : "hover:neon-text",
                  "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-neon-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-blue animate-pulse"></span>
                )}
              </a>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-white/5 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X size={24} className="neon-text transition-all duration-300 rotate-90" />
          ) : (
            <Menu size={24} className="neon-text transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-white/10 py-4 px-4 transform transition-all duration-500 ease-in-out",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-[-10px] opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col space-y-4">
          {menuItems.map((item) => {
            let isActive = false;
            
            if (item.href.startsWith('/') && !item.href.includes('#')) {
              // Route-based navigation (Tools, Home)
              isActive = location.pathname === item.href;
            } else if (item.name === 'Projects') {
              // Projects section (special handling)
              isActive = location.pathname === '/' && activeItem === 'projects';
            } else if (item.href.startsWith('#')) {
              // Hash-based navigation (only on home page)
              isActive = location.pathname === '/' && activeItem === item.href.slice(1);
            }
            
            if (item.name === 'Projects') {
              return (
                <button
                  key={item.name}
                  onClick={handleProjectsClick}
                  className={cn(
                    "p-2 rounded-sm transition-all duration-300 transform text-left",
                    isActive 
                      ? "neon-text bg-white/5 font-medium translate-x-2" 
                      : "hover:neon-text hover:bg-white/5 hover:translate-x-2"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-blue"></span>
                  )}
                </button>
              );
            }
            
            return item.href.startsWith('/') ? (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "p-2 rounded-sm transition-all duration-300 transform",
                  isActive 
                    ? "neon-text bg-white/5 font-medium translate-x-2" 
                    : "hover:neon-text hover:bg-white/5 hover:translate-x-2"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
                {isActive && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-blue"></span>
                )}
              </Link>
            ) : (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "p-2 rounded-sm transition-all duration-300 transform",
                  isActive 
                    ? "neon-text bg-white/5 font-medium translate-x-2" 
                    : "hover:neon-text hover:bg-white/5 hover:translate-x-2"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
                {isActive && (
                  <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-blue"></span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
