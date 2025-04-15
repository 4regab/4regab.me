import { useState } from "react";
import ProjectCard from "./ProjectCard";
const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const projects = [{
    title: "DeepTerm",
    description: "Boost your productivity with our Pomodoro and Notes tool. Focus better and organize your thoughts in one place.",
    image: "/3d5f8cb1-4735-4bf4-b71b-9166a7f2ff49.png",
    tags: ["Productivity", "Pomodoro", "Notes"],
    category: "productivity",
    link: "https://deepterm.tech"
  }, {
    title: "QuillBro",
    description: "Helps you write better papers, create study materials, and improve your academic performance with powerful AI tools.",
    image: "/62447950-f802-40ac-baef-c66cf9625ebe.png",
    tags: ["Education", "Writing", "AI Tools"],
    category: "education",
    link: "https://quillbro.live"
  }];
  const filters = [{
    label: "All",
    value: "all"
  }, {
    label: "Productivity",
    value: "productivity"
  }, {
    label: "Education",
    value: "education"
  }];
  const filteredProjects = activeFilter === "all" ? projects : projects.filter(project => project.category === activeFilter);
  return <section id="projects" className="py-8 md:py-16">  
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 font-display">AI Projects</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-sm md:text-base">Explore my AI web app projects.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-10">
          {filters.map(filter => <button key={filter.value} onClick={() => setActiveFilter(filter.value)} className={`px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm border rounded-sm transition-all duration-300 ${activeFilter === filter.value ? "border-neon-blue bg-neon-blue/10 text-neon-blue" : "border-white/10 hover:border-white/30"}`}>
              {filter.label}
            </button>)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {filteredProjects.map((project, index) => <ProjectCard key={project.title} title={project.title} description={project.description} image={project.image} tags={project.tags} index={index} link={project.link} />)}
        </div>
      </div>
    </section>;
};
export default Projects;
