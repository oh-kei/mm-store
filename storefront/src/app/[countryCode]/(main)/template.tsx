import { PageTransition } from "@modules/layout/components/page-transition"

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
