import { useState } from "react";
import ProjectCard from "./ProjectCard";
import { Filter, Grid, List } from "lucide-react";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const projects = [
    {
      title: "DeepTerm",
      description: "Our AI study tools helps you learn efficiently, create custom quizzes, extract organized notes, track progress, and maintain focus with our Pomodoro timer — all completely free.",
      image: "/Screenshot 2025-05-29 164114.png",
      tags: ["Productivity", "Pomodoro", "Notes"],
      category: "productivity",
      link: "https://deepterm.tech"
    },
    {
      title: "QuillBro",
      description: "Helps you write better papers, QuillBro helps you write better papers, create study materials, and improve your academic performance with powerful AI tools.",
      image: "/quillbro.png",
      tags: ["Education", "Writing", "AI Tools"],
      category: "education",
      link: "https://quillbro.live"
    }
  ];

  const filters = [
    { label: "All Projects", value: "all", count: projects.length },
    { label: "Productivity", value: "productivity", count: projects.filter(p => p.category === "productivity").length },
    { label: "Education", value: "education", count: projects.filter(p => p.category === "education").length }
  ];

  const filteredProjects = activeFilter === "all" ? projects : projects.filter(project => project.category === activeFilter);

  return (
    <section id="projects" className="section-padding relative overflow-hidden">
      {/* Background enhancement */}
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

      <div className="container relative z-10 mx-auto container-padding content-width">
        {/* Enhanced header section */}
        <div className="text-center mb-16 space-y-6">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green">
                Featured Projects
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto rounded-full mb-6"></div>
            <p className="text-responsive-lg text-foreground/75 max-w-3xl mx-auto leading-relaxed">
              Explore my collection of AI-powered web applications that solve real-world problems 
              and showcase the potential of modern technology.
            </p>
          </div>
        </div>

        {/* Enhanced filter and view controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`
                  group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 border
                  ${activeFilter === filter.value 
                    ? "text-neon-blue bg-neon-blue/10 border-neon-blue/30 shadow-[0_0_20px_rgba(0,212,255,0.3)]" 
                    : "text-foreground/70 bg-surface-primary/50 border-white/10 hover:text-neon-purple hover:bg-neon-purple/5 hover:border-neon-purple/20"
                  }
                  focus-ring
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {filter.label}
                  <span className={`
                    text-xs px-2 py-1 rounded-full transition-colors
                    ${activeFilter === filter.value 
                      ? "bg-neon-blue/20 text-neon-blue" 
                      : "bg-foreground/10 text-foreground/50 group-hover:bg-neon-purple/20 group-hover:text-neon-purple"
                    }
                  `}>
                    {filter.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60 mr-2">View:</span>
            <div className="neo-card-glass rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`
                  p-2 rounded-md transition-all duration-200
                  ${viewMode === "grid" 
                    ? "text-neon-blue bg-neon-blue/10" 
                    : "text-foreground/60 hover:text-neon-blue hover:bg-white/5"
                  }
                `}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`
                  p-2 rounded-md transition-all duration-200
                  ${viewMode === "list" 
                    ? "text-neon-blue bg-neon-blue/10" 
                    : "text-foreground/60 hover:text-neon-blue hover:bg-white/5"
                  }
                `}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Projects grid */}
        <div className={`
          transition-all duration-500 animate-scale-in
          ${viewMode === "grid" 
            ? "grid grid-cols-1 lg:grid-cols-2 gap-8" 
            : "flex flex-col gap-6"
          }
        `} style={{ animationDelay: '0.6s' }}>
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              description={project.description}
              image={project.image}
              tags={project.tags}
              index={index}
              link={project.link}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="neo-card-glass p-12 rounded-2xl border border-white/10 max-w-md mx-auto">
              <Filter className="text-foreground/30 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-foreground/80">No projects found</h3>
              <p className="text-foreground/60">Try adjusting your filter selection.</p>
            </div>
          </div>
        )}

        {/* Call to action */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-16 animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <p className="text-foreground/70 mb-6">
              Interested in collaborating or learning more about these projects?
            </p>
            <a
              href="#contact"
              className="btn-neon-purple px-8 py-4 text-lg font-semibold rounded-xl inline-flex items-center group"
            >
              Get In Touch
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
