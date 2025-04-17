import { User, School, MapPin, Code, Laptop } from "lucide-react";
const About = () => {
  const skills = ["Web Development", "AI Integration", "React", "Machine Learning", "Python", "TypeScript", "Next.js", "Full Stack Development", "AI Tools"];
  return <section id="about" className="py-20 gradient-bg">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">About 4regab</h2>
            <p className="text-foreground/80 mb-6">Hey! I'm Gab, I'm really passionate about building awesome web applications that use artificial intelligence. I love tackling complex tech challenges and making them into user-friendly solutions.</p>
            <p className="text-foreground/80 mb-8">With a strong interest in both AI and web technologies, I'm committed to creating tools that address real-world problems and expand what's possible with modern web development.</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {skills.map((skill, index) => <span key={index} className="text-sm px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                  {skill}
                </span>)}
            </div>
          </div>

          <div className="space-y-6">
            <div className="neo-card neon-border animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-blue/10 rounded-sm neon-border animate-float">
                  <User className="text-neon-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">Solo Developer</h3>
                  <p className="text-foreground/70">
                    Independent developer creating impactful AI-driven web applications from concept to deployment.
                  </p>
                </div>
              </div>
            </div>

            <div className="neo-card neon-border-pink animate-slide-up" style={{
            animationDelay: '0.4s'
          }}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-pink/10 rounded-sm neon-border-pink animate-float">
                  <School className="text-neon-pink" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">BSIT Student</h3>
                  <p className="text-foreground/70">
                    Continuously learning and applying cutting-edge technologies.
                  </p>
                </div>
              </div>
            </div>

            <div className="neo-card neon-border-purple animate-slide-up" style={{
            animationDelay: '0.6s'
          }}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-purple/10 rounded-sm neon-border-purple animate-float">
                  <MapPin className="text-neon-purple" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-display">Location</h3>
                  <p className="text-foreground/70">
                    Based in Metro Manila, Philippines. Bridging local talent with global technological innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default About;
