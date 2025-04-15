
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("hero");
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide navbar on scroll direction
      if (currentScrollY > 100) {
        setVisible(prevScrollY > currentScrollY || currentScrollY < 100);
      } else {
        setVisible(true);
      }
      
      setPrevScrollY(currentScrollY);
      
      // Add background after scrolling down
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Update active menu item based on scroll position
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
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  const menuItems = [
    { name: "Home", href: "#hero" },
    { name: "Projects", href: "#projects" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-md py-2 shadow-md" : "py-4",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="#" className="font-bold text-xl font-display relative group">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            4regab
          </span>
          <span className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 blur-md bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-lg transition-opacity duration-500"></span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "relative transition-all duration-300 px-2 py-1 text-sm font-medium",
                activeItem === item.href.slice(1) 
                  ? "neon-text font-medium" 
                  : "hover:neon-text",
                "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-neon-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              )}
            >
              {item.name}
              {activeItem === item.href.slice(1) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-neon-blue animate-pulse"></span>
              )}
            </a>
          ))}
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
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "p-2 rounded-sm transition-all duration-300 transform",
                activeItem === item.href.slice(1) 
                  ? "neon-text bg-white/5 font-medium translate-x-2" 
                  : "hover:neon-text hover:bg-white/5 hover:translate-x-2"
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
              {activeItem === item.href.slice(1) && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-blue"></span>
              )}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
