import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — JP Code",
  description: "Your saved code projects",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
