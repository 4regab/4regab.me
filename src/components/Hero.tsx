import { ArrowRight, Code, Sparkles, Zap, ChevronDown, Github, Linkedin, Twitter, Brain } from "lucide-react";
import { useEffect, useState } from "react";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    setIsVisible(true);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
      {/* Advanced background system */}
      <div className="absolute inset-0 gradient-mesh"></div>
      
      {/* Particle grid system */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,15,23,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(15,15,23,0.9)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_100%_60%_at_50%_50%,#000_40%,transparent_100%)] opacity-40"></div>
      </div>

      {/* Interactive cursor glow */}
      <div 
        className="absolute pointer-events-none opacity-20 mix-blend-soft-light transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(139,92,246,0.2) 35%, transparent 70%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      
      {/* Enhanced floating elements with better performance */}
      <div className="absolute top-[20%] left-[15%] w-80 h-80 bg-gradient-radial from-neon-blue-500/20 via-neon-blue-500/10 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[25%] right-[10%] w-96 h-96 bg-gradient-radial from-neon-purple-500/15 via-neon-purple-500/8 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-[60%] left-[5%] w-64 h-64 bg-gradient-radial from-neon-green-500/20 via-neon-green-500/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Central aurora effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-conic from-neon-blue-500/10 via-neon-purple-500/5 via-neon-pink-500/8 to-neon-blue-500/10 rounded-full blur-3xl animate-glow-pulse opacity-60"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Enhanced main heading with modern typography */}
          <div className={`space-y-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              {/* Animated background text for depth */}
              <h1 className="absolute inset-0 text-5xl md:text-7xl lg:text-9xl font-display font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue-500/20 via-neon-purple-500/20 to-neon-pink-500/20 blur-sm scale-105">
                4regab.me
              </h1>
                {/* Main text with enhanced styling */}
              <h1 className="relative text-5xl md:text-7xl lg:text-9xl font-display font-black leading-[0.85] tracking-tighter">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neon-blue-400 via-neon-purple-400 to-neon-pink-400">
                  4regab.me
                </span>
              </h1>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-3 h-3 bg-neon-blue-500 rounded-full animate-bounce-subtle opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-neon-pink-500 rounded-full animate-bounce-subtle opacity-80" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-neon-blue-500 to-transparent"></div>
                <Brain className="text-neon-purple-400 animate-pulse" size={28} />
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-neon-purple-500 to-transparent"></div>
              </div>
              
              <h2 className="text-xl md:text-3xl lg:text-4xl font-medium text-foreground/90 font-display">
                <span className="bg-gradient-to-r from-foreground/90 via-neon-blue-300/80 to-foreground/90 bg-clip-text text-transparent">
                  Developer & AI Innovator
                </span>
              </h2>
              
              {/* Social proof indicators */}
              <div className="flex justify-center space-x-6 pt-4">
                <a 
                  href="https://github.com/4regab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 glass-light px-4 py-2 rounded-full hover:glass-medium transition-all duration-300"
                >
                  <Github size={18} className="text-foreground/70 group-hover:text-neon-blue-400 transition-colors" />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">GitHub</span>
                </a>
                <a 
                  href="https://linkedin.com/in/4regab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-2 glass-light px-4 py-2 rounded-full hover:glass-medium transition-all duration-300"
                >
                  <Linkedin size={18} className="text-foreground/70 group-hover:text-neon-purple-400 transition-colors" />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>          {/* Enhanced mission statement */}
          <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-lg md:text-xl lg:text-2xl text-foreground/75 max-w-4xl mx-auto leading-relaxed font-light">
              Crafting innovative web applications and AI-powered solutions with a focus on 
              <span className="relative mx-1">
                <span className="text-neon-blue-400 font-medium">clean architecture</span>
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-neon-blue-500/50 to-transparent rounded-full"></div>
              </span>, 
              <span className="relative mx-1">
                <span className="text-neon-purple-400 font-medium">exceptional UX</span>
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-neon-purple-500/50 to-transparent rounded-full"></div>
              </span>, and 
              <span className="relative mx-1">
                <span className="text-neon-green-400 font-medium">cutting-edge technology</span>
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-neon-green-500/50 to-transparent rounded-full"></div>
              </span>.
            </p>
          </div>

          {/* Advanced feature showcase with improved cards */}
          <div className={`transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              
              {/* Full Stack Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue-500/20 via-neon-blue-500/10 to-transparent rounded-2xl blur-xl group-hover:from-neon-blue-500/30 group-hover:via-neon-blue-500/15 transition-all duration-500"></div>
                <div className="relative neo-card-glass p-8 group-hover:scale-105 transition-all duration-500 border border-neon-blue-500/20 group-hover:border-neon-blue-500/40">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neon-blue-500/20 rounded-2xl blur-md"></div>
                      <div className="relative p-4 bg-neon-blue-500/10 border border-neon-blue-500/30 rounded-2xl group-hover:bg-neon-blue-500/20 transition-all duration-300">
                        <Code className="text-neon-blue-400" size={32} />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <h3 className="font-display font-bold text-xl text-neon-blue-400">Full Stack Development</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">Modern web development with React, TypeScript, Node.js, and cutting-edge frameworks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Powered Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple-500/20 via-neon-purple-500/10 to-transparent rounded-2xl blur-xl group-hover:from-neon-purple-500/30 group-hover:via-neon-purple-500/15 transition-all duration-500"></div>
                <div className="relative neo-card-glass p-8 group-hover:scale-105 transition-all duration-500 border border-neon-purple-500/20 group-hover:border-neon-purple-500/40">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neon-purple-500/20 rounded-2xl blur-md"></div>
                      <div className="relative p-4 bg-neon-purple-500/10 border border-neon-purple-500/30 rounded-2xl group-hover:bg-neon-purple-500/20 transition-all duration-300">
                        <Sparkles className="text-neon-purple-400" size={32} />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <h3 className="font-display font-bold text-xl text-neon-purple-400">AI Integration</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">Leveraging machine learning and AI to create intelligent, adaptive user experiences</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modern Tech Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/20 via-neon-green-500/10 to-transparent rounded-2xl blur-xl group-hover:from-neon-green-500/30 group-hover:via-neon-green-500/15 transition-all duration-500"></div>
                <div className="relative neo-card-glass p-8 group-hover:scale-105 transition-all duration-500 border border-neon-green-500/20 group-hover:border-neon-green-500/40">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neon-green-500/20 rounded-2xl blur-md"></div>
                      <div className="relative p-4 bg-neon-green-500/10 border border-neon-green-500/30 rounded-2xl group-hover:bg-neon-green-500/20 transition-all duration-300">
                        <Zap className="text-neon-green-400" size={32} />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <h3 className="font-display font-bold text-xl text-neon-green-400">Modern Technology</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">Utilizing the latest frameworks, tools, and best practices for optimal performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Premium CTA section with enhanced interactivity */}
          <div className={`transition-all duration-1000 ease-out delay-700 space-y-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">              <a 
                href="#projects" 
                className="group relative overflow-hidden bg-gradient-to-r from-neon-blue-500/20 via-neon-blue-500/10 to-neon-blue-500/20 border border-neon-blue-500/30 text-neon-blue-400 hover:text-white px-12 py-5 text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] backdrop-blur-sm"
              >
                <span className="relative flex items-center justify-center">
                  View My Portfolio
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </a>
                <a 
                href="/tools" 
                className="group relative overflow-hidden bg-gradient-to-r from-neon-purple-500/20 via-neon-purple-500/10 to-neon-purple-500/20 border border-neon-purple-500/30 text-neon-purple-400 hover:text-white px-12 py-5 text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] backdrop-blur-sm"
              >
                <span className="relative flex items-center justify-center">
                  Explore AI Tools
                  <Sparkles size={20} className="ml-3 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </a>
            </div>
            
            {/* Enhanced scroll indicator */}
            <div className="flex justify-center pt-12">
              <a 
                href="#about"
                className="group flex flex-col items-center text-foreground/50 hover:text-neon-blue-400 transition-all duration-500"
                aria-label="Scroll to discover more content"
              >
                <span className="text-sm font-medium mb-3 group-hover:text-neon-blue-400 transition-colors">Discover More</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-blue-500/20 rounded-full blur-sm group-hover:bg-neon-blue-500/40 transition-all duration-300"></div>
                  <ChevronDown size={28} className="relative animate-bounce-subtle group-hover:text-neon-blue-400 transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;