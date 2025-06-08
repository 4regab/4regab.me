import { User, School, MapPin, Code, Laptop, Brain, Rocket, Star, Sparkles, Trophy, Target, Coffee } from "lucide-react";

const About = () => {
  const skills = [
    "Web Development", "AI Integration", "React", "Machine Learning", 
    "Python", "TypeScript", "Next.js", "Full Stack Development", "AI Tools",
    "Node.js", "PostgreSQL", "Docker"
  ];

  const highlights = [
    {
      icon: User,
      title: "Solo Developer",
      description: "Independent developer creating impactful AI-driven web applications from concept to deployment.",
      color: "blue",
      delay: "0.2s"
    },
    {
      icon: School,
      title: "BSIT Student",
      description: "Continuously learning and applying cutting-edge technologies in information technology.",
      color: "pink",
      delay: "0.4s"
    },
    {
      icon: MapPin,
      title: "Metro Manila, Philippines",
      description: "Based locally, thinking globally. Bridging Filipino talent with worldwide technological innovation.",
      color: "purple",
      delay: "0.6s"
    },
    {
      icon: Brain,
      title: "AI Enthusiast",
      description: "Passionate about integrating artificial intelligence into practical, user-friendly solutions.",
      color: "green",
      delay: "0.8s"
    }
  ];

  const achievements = [
    {
      icon: Trophy,
      metric: "10+",
      label: "Projects Delivered",
      description: "End-to-end solutions"
    },
    {
      icon: Target,
      metric: "100%",
      label: "Client Satisfaction",
      description: "Quality-focused approach"
    },
    {
      icon: Coffee,
      metric: "24/7",
      label: "Passionate Coding",
      description: "Always learning"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { 
        text: "text-neon-blue-500", 
        bg: "bg-neon-blue-500/10", 
        border: "border-neon-blue-500/20",
        shadow: "shadow-[0_0_30px_rgba(0,212,255,0.15)]",
        glow: "shadow-[0_0_50px_rgba(0,212,255,0.3)]"
      },
      pink: { 
        text: "text-neon-pink-500", 
        bg: "bg-neon-pink-500/10", 
        border: "border-neon-pink-500/20",
        shadow: "shadow-[0_0_30px_rgba(255,0,128,0.15)]",
        glow: "shadow-[0_0_50px_rgba(255,0,128,0.3)]"
      },
      purple: { 
        text: "text-neon-purple-500", 
        bg: "bg-neon-purple-500/10", 
        border: "border-neon-purple-500/20",
        shadow: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
        glow: "shadow-[0_0_50px_rgba(139,92,246,0.3)]"
      },
      green: { 
        text: "text-neon-green-500", 
        bg: "bg-neon-green-500/10", 
        border: "border-neon-green-500/20",
        shadow: "shadow-[0_0_30px_rgba(0,255,136,0.15)]",
        glow: "shadow-[0_0_50px_rgba(0,255,136,0.3)]"
      }
    };
    return colors[color as keyof typeof colors];
  };
  return (
    <section id="about" className="section-padding relative overflow-hidden" role="main" aria-labelledby="about-heading">
      {/* Enhanced background with advanced glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface-primary/50 to-surface-secondary"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-neon-blue-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-neon-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-neon-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="container relative z-10 mx-auto container-padding content-width">
        {/* Section header with enhanced typography */}
        <div className="text-center mb-24">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-neon-blue-500/10 to-neon-purple-500/10 border border-white/10">
              <Sparkles className="w-4 h-4 text-neon-purple-500" />
              <span className="text-sm font-medium text-foreground/80">About Me</span>
            </div>
            <h2 id="about-heading" className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue-500 via-neon-purple-500 to-neon-pink-500">
                Meet 4regab
              </span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-neon-blue-500 rounded-full"></div>
              <div className="w-8 h-1 bg-neon-purple-500 rounded-full"></div>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-neon-pink-500 rounded-full"></div>
            </div>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Passionate developer crafting the future of web applications with AI
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 lg:gap-16">
          {/* Left column - Story & Skills */}
          <div className="xl:col-span-2 space-y-12">
            {/* Story section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="neo-card-advanced group p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-neon-blue-500/10 border border-neon-blue-500/20">
                      <User className="w-5 h-5 text-neon-blue-500" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground/90">My Story</h3>
                  </div>
                  
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    Hey! I'm <span className="text-neon-blue-500 font-semibold">Gab</span>, and I'm really passionate about building awesome web applications that use artificial intelligence. I love tackling complex tech challenges and transforming them into user-friendly solutions that actually make a difference.
                  </p>
                  <p className="text-base text-foreground/75 leading-relaxed">
                    With a strong interest in both AI and web technologies, I'm committed to creating tools that address real-world problems and expand what's possible with modern web development. Every project is an opportunity to learn something new and push the boundaries of what's possible.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills section with enhanced design */}
            <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-neon-green-500/10 border border-neon-green-500/20">
                    <Code className="w-5 h-5 text-neon-green-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground/90">Technical Expertise</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="neo-card-glass group p-4 text-center hover:scale-105 transition-all duration-300 border border-white/5 hover:border-white/20 rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                      style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                    >
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-neon-pink-500/10 border border-neon-pink-500/20">
                    <Trophy className="w-5 h-5 text-neon-pink-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground/90">Achievements</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="text-center group">
                        <div className="neo-card-glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105">
                          <IconComponent className="w-8 h-8 text-neon-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                          <div className="text-3xl font-display font-bold text-neon-blue-500 mb-1">{achievement.metric}</div>
                          <div className="font-semibold text-foreground/90 mb-1">{achievement.label}</div>
                          <div className="text-sm text-foreground/70">{achievement.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10 text-center bg-gradient-to-br from-neon-purple-500/5 to-neon-blue-500/5">
                <div className="p-3 rounded-2xl bg-neon-purple-500/10 border border-neon-purple-500/20 w-fit mx-auto mb-6">
                  <Rocket className="text-neon-purple-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-foreground/90">
                  Let's Build Something Amazing
                </h3>
                <p className="text-foreground/70 mb-8 max-w-md mx-auto leading-relaxed">
                  Always excited to collaborate on innovative projects that push the boundaries of web technology.
                </p>
                <a
                  href="#contact"
                  className="btn-neon-purple px-8 py-4 rounded-2xl font-semibold inline-flex items-center group hover:scale-105 transition-all duration-300"
                  aria-label="Start a conversation with Gab"
                >
                  Start a Conversation
                  <Star size={18} className="ml-2 group-hover:rotate-12 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Right column - Highlights */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <h3 className="text-xl font-display font-bold mb-6 text-foreground/90 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-purple-500" />
                Highlights
              </h3>
              
              {highlights.map((item, index) => {
                const colors = getColorClasses(item.color);
                const IconComponent = item.icon;
                
                return (
                  <div
                    key={index}
                    className={`
                      neo-card-advanced group relative transition-all duration-500 hover:scale-105 animate-slide-up
                      border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden mb-6
                      hover:${colors.shadow}
                    `}
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`
                          p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 flex-shrink-0
                          ${colors.bg} border ${colors.border}
                        `}>
                          <IconComponent className={`${colors.text} group-hover:rotate-12 transition-transform duration-300`} size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-display font-bold mb-2 text-foreground/90 group-hover:text-foreground transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-foreground/70 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle gradient overlay on hover */}
                    <div className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-br ${colors.bg} pointer-events-none
                    `}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
