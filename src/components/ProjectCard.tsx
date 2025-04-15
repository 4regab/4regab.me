
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  index: number;
  link?: string;
}

const ProjectCard = ({
  title,
  description,
  image,
  tags,
  index,
  link = "#",
}: ProjectCardProps) => {
  // Cycle through neon colors based on index
  const getBorderClass = () => {
    const classes = ["neon-border", "neon-border-pink", "neon-border-purple", "neon-border-green"];
    return classes[index % classes.length];
  };

  const getTextClass = () => {
    const classes = ["neon-text", "neon-text-pink", "neon-text-purple", "neon-text-green"];
    return classes[index % classes.length];
  };

  return (
    <div 
      className={cn(
        "neo-card group relative transition-all duration-500 hover:translate-x-1 hover:-translate-y-1 animate-slide-up",
        getBorderClass()
      )}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      <div className="mb-3 overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const imgElement = e.currentTarget;
              console.error(`Failed to load image: ${imgElement.src}`);
              imgElement.src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
      </div>
      <div className="p-1 sm:p-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg sm:text-xl font-bold font-display">{title}</h3>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("p-1 transition-all duration-300", getTextClass())}
            aria-label={`View ${title} project`}
          >
            <ArrowUpRight size={18} className="sm:size-20" />
          </a>
        </div>
        <p className="text-foreground/70 mb-3 text-sm sm:text-base">{description}</p>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-white/5 rounded-sm border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
