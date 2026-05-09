import { AppShell } from "@/components/layout/AppShell";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
