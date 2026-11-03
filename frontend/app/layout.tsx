import type { Metadata } from "next";
import AppLayoutClient from "@/components/AppLayoutClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "VERITAS | Autonomous Originality Engine",
  description: "Comprehensive originality verification, code plagiarism detection, and writing pattern analysis for educators, researchers, and students.",
  icons: {
    icon: [
      { url: "/veritas_emblem.jpg" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/veritas_emblem.jpg",
    apple: "/veritas_emblem.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090604] text-[#F5EFE3] font-sans antialiased w-full overflow-x-hidden selection:bg-[#C49A58]/30 selection:text-[#F5EFE3]">
        <AppLayoutClient>{children}</AppLayoutClient>
      </body>
    </html>
  );
}