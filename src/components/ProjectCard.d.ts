interface ProjectCardProps {
    title: string;
    description: string;
    image: string;
    tags: string[];
    index: number;
    link?: string;
    github?: string;
    demo?: string;
    viewMode?: "grid" | "list";
}
declare const ProjectCard: ({ title, description, image, tags, index, link, github, demo, viewMode, }: ProjectCardProps) => import("react/jsx-runtime").JSX.Element;
export default ProjectCard;
