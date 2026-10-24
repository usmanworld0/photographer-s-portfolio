import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { Navbar } from "@/components/layout/Navbar";
import { projectsData } from "@/data/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);
  if (!project) return { title: "Farline" };

  return {
    title: `${project.title} — Farline`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Farline`,
      description: project.description,
      images: [{ url: project.heroImage }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <ProjectDetail project={project} />
    </main>
  );
}
