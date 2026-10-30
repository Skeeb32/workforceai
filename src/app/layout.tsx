import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkforceAI — Your AI team, in motion",
  description: "Assemble, manage, and guide a coordinated AI workforce.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
