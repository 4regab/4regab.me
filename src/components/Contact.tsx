import { Mail, MapPin, Phone, ExternalLink, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section id="contact" className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 font-display">Get in Touch</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Feel free to reach out for collaborations, projects or just to say hello.
            I'm always open to new opportunities and connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          <div className="neo-card neon-border p-6 md:p-8 flex flex-col space-y-6">
            <h3 className="text-xl md:text-2xl font-bold font-display">Contact Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-neon-blue/10 neon-border">
                  <Mail className="text-neon-blue" size={20} />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Email</p>
                  <a href="mailto:4regab@gmail.com" className="hover:neon-text transition-colors duration-300">
                    4regab@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-neon-purple/10 neon-border-purple">
                  <Phone className="text-neon-purple" size={20} />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Phone</p>
                  <a href="tel:+639123456789" className="hover:neon-text-purple transition-colors duration-300">
                    +63 912 345 6789
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-neon-green/10 neon-border-green">
                  <MapPin className="text-neon-green" size={20} />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Location</p>
                  <span className="block">Metro Manila, PH</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-neon-blue/20 neon-border hover:bg-neon-blue/30 transition-all duration-300"
                onClick={() => window.location.href = "mailto:4regab@gmail.com"}
              >
                Send Email
                <Mail size={16} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div className="neo-card neon-border-purple p-6 md:p-8">
              <h3 className="text-xl font-bold mb-4 font-display">Availability</h3>
              <p className="text-foreground/70 mb-6">
                I typically respond to all inquiries within 24-48 hours. For urgent matters, 
                please indicate so in your message and I'll prioritize your request.
              </p>
              
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-sm">
                <div>
                  <p className="font-medium">Working Hours</p>
                  <p className="text-sm text-foreground/70">Mon-Fri: 9AM - 6PM (PHT)</p>
                </div>
                <div className="h-4 w-4 rounded-full bg-neon-green animate-pulse"></div>
              </div>
            </div>
            
            <div className="neo-card neon-border-green p-6 md:p-8">
              <h3 className="text-xl font-bold mb-4 font-display">Connect Online</h3>
              <p className="text-foreground/70 mb-6">
                Follow me on social media or check out my other work online.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://github.com/4regab" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-sm hover:bg-white/10 transition-all duration-300"
                >
                  <span>GitHub</span>
                  <ExternalLink size={14} />
                </a>
                <a 
                  href="https://www.x.com/4regab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-sm hover:bg-white/10 transition-all duration-300"
                >
                  <span>X</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
