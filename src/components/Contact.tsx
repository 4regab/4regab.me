import { Mail, MapPin, Phone, ExternalLink, Sparkles, Heart, Zap, MessageCircle, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section id="contact" className="section-padding relative overflow-hidden" role="main" aria-labelledby="contact-heading">
      {/* Enhanced background with advanced glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface-primary/50 to-surface-secondary"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-neon-purple-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-neon-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-neon-green-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="container relative z-10 mx-auto container-padding content-width">
        {/* Section header with enhanced typography */}
        <div className="text-center mb-24">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple-500/10 to-neon-blue-500/10 border border-white/10">
              <MessageCircle className="w-4 h-4 text-neon-purple-500" />
              <span className="text-sm font-medium text-foreground/80">Let's Connect</span>
            </div>
            <h2 id="contact-heading" className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple-500 via-neon-blue-500 to-neon-green-500">
                Get in Touch
              </span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-neon-purple-500 rounded-full"></div>
              <div className="w-8 h-1 bg-neon-blue-500 rounded-full"></div>
              <div className="w-16 h-1 bg-gradient-to-l from-transparent to-neon-green-500 rounded-full"></div>
            </div>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Ready to collaborate? Let's build something amazing together
            </p>
          </div>
        </div>        {/* Main contact content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info card */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="neo-card-advanced p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 h-full">
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-neon-purple-500/10 border border-neon-purple-500/20">
                    <MessageCircle className="w-5 h-5 text-neon-purple-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground/90">Contact Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300">
                    <div className="p-3 rounded-2xl bg-neon-blue-500/10 border border-neon-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="text-neon-blue-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground/60 mb-1">Email</p>
                      <a 
                        href="mailto:4regab@gmail.com" 
                        className="text-foreground group-hover:text-neon-blue-500 transition-colors duration-300 font-medium"
                      >
                        4regab@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300">
                    <div className="p-3 rounded-2xl bg-neon-purple-500/10 border border-neon-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="text-neon-purple-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground/60 mb-1">Phone</p>
                      <a 
                        href="tel:+639123456789" 
                        className="text-foreground group-hover:text-neon-purple-500 transition-colors duration-300 font-medium"
                      >
                        +63 912 345 6789
                      </a>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300">
                    <div className="p-3 rounded-2xl bg-neon-green-500/10 border border-neon-green-500/20 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="text-neon-green-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground/60 mb-1">Location</p>
                      <span className="text-foreground font-medium">Metro Manila, Philippines</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <Button 
                    className="w-full btn-neon-purple h-12 font-semibold rounded-xl group hover:scale-105 transition-all duration-300"
                    onClick={() => window.location.href = "mailto:4regab@gmail.com"}
                  >
                    <Mail className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Send Email
                    <Sparkles className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Additional info */}
          <div className="space-y-8">
            {/* Availability card */}
            <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-neon-green-500/10 border border-neon-green-500/20">
                    <Clock className="w-5 h-5 text-neon-green-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground/90">Availability</h3>
                </div>
                
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  I typically respond to all inquiries within 24-48 hours. For urgent matters, 
                  please indicate so in your message and I'll prioritize your request.
                </p>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-neon-green-500/10 to-neon-blue-500/10 border border-white/10">
                  <div>
                    <p className="font-semibold text-foreground">Working Hours</p>
                    <p className="text-sm text-foreground/70">Mon-Fri: 9AM - 6PM (PHT)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neon-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-neon-green-500">Available</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social links card */}
            <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-neon-blue-500/10 border border-neon-blue-500/20">
                    <Star className="w-5 h-5 text-neon-blue-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground/90">Connect Online</h3>
                </div>
                
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  Follow me on social media or check out my projects and contributions.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="https://github.com/4regab" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex items-center gap-3 p-4 rounded-2xl neo-card-glass border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-foreground group-hover:text-neon-purple-500 transition-colors">GitHub</span>
                      <p className="text-xs text-foreground/60">View code</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neon-purple-500 group-hover:rotate-12 transition-transform duration-300" />
                  </a>
                  
                  <a 
                    href="https://www.x.com/4regab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-4 rounded-2xl neo-card-glass border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-foreground group-hover:text-neon-blue-500 transition-colors">X (Twitter)</span>
                      <p className="text-xs text-foreground/60">Latest updates</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neon-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Call to action */}
            <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
              <div className="neo-card-advanced p-8 rounded-3xl border border-white/10 text-center bg-gradient-to-br from-neon-purple-500/5 to-neon-blue-500/5">
                <div className="p-3 rounded-2xl bg-neon-purple-500/10 border border-neon-purple-500/20 w-fit mx-auto mb-6">
                  <Heart className="text-neon-purple-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold mb-4 text-foreground/90">
                  Let's Create Together
                </h3>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  Always excited to discuss new projects, innovative ideas, or potential collaborations.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
                  <Zap className="w-4 h-4 text-neon-green-500" />
                  <span>Powered by passion for innovation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
