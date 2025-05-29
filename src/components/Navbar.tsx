
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, Link, useNavigate } from "react-router-dom";

// Helper function to get current subdomain
function getCurrentSubdomain() {
  if (typeof window === 'undefined') return '';
  
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
function navigateToMainDomain(path: string = '/') {
  if (typeof window === 'undefined') return;
  
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
  } else {
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
  const handleToolsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentSubdomain = getCurrentSubdomain();
    
    // If we're already on the main domain, use regular navigation
    if (!currentSubdomain) {
      navigate('/tools');
    } else {
      // Navigate to main domain tools page
      navigateToMainDomain('/tools');
    }
    setIsOpen(false); // Close mobile menu if open
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentSubdomain = getCurrentSubdomain();
    
    // If we're already on the main domain, use regular navigation
    if (!currentSubdomain) {
      navigate('/');
    } else {
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
    { name: "Home", href: "/", handler: handleHomeClick },
    { name: "Projects", href: "/#projects", handler: handleProjectsClick },
    { name: "Tools", href: "/tools", handler: handleToolsClick },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-md py-2 shadow-md" : "py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" onClick={handleHomeClick} className="font-bold text-xl font-display relative group">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            4REGAB
          </span>
          <span className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 blur-md bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg transition-opacity duration-500"></span>
        </Link>        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => {
            let isActive = false;
            const currentSubdomain = getCurrentSubdomain();
            
            if (item.name === 'Home') {
              isActive = !currentSubdomain && location.pathname === '/';
            } else if (item.name === 'Tools') {
              isActive = location.pathname === '/tools';
            } else if (item.name === 'Projects') {
              isActive = !currentSubdomain && location.pathname === '/' && activeItem === 'projects';
            }
            
            return (
              <button
                key={item.name}
                onClick={item.handler}
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
      )}>        <div className="flex flex-col space-y-4">
          {menuItems.map((item) => {
            let isActive = false;
            const currentSubdomain = getCurrentSubdomain();
            
            if (item.name === 'Home') {
              isActive = !currentSubdomain && location.pathname === '/';
            } else if (item.name === 'Tools') {
              isActive = location.pathname === '/tools';
            } else if (item.name === 'Projects') {
              isActive = !currentSubdomain && location.pathname === '/' && activeItem === 'projects';
            }
            
            return (
              <button
                key={item.name}
                onClick={item.handler}
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
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
