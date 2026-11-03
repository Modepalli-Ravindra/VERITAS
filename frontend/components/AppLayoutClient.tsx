"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAppInside = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/repository") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/report");
  const isLanding = pathname === "/";

  useEffect(() => {
    setMounted(true);

    // Route Protection: Redirect unauthenticated users trying to enter the internal app
    if (isAppInside) {
      const user = localStorage.getItem("veritas_user");
      const token = localStorage.getItem("veritas_token");
      if (!user || !token) {
        router.replace("/login");
      }
    }
  }, [pathname, isAppInside, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090604] text-[#F5EFE3] w-full overflow-x-hidden">
      {/* Navbar: Hidden on login & register pages */}
      {!isAuthPage && <Navbar />}

      {/* Main Content Area: Landing page starts at margin 0 top 0; Internal pages get pt-24 for fixed floating navbar */}
      <main className={`flex-1 w-full ${isLanding ? "w-full p-0 m-0" : isAuthPage ? "w-full p-0 m-0" : "max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10"}`}>
        {children}
      </main>

      {/* Footer: ONLY shown on the public landing page (NO footer on login/signup and NO footer inside application) */}
      {isLanding && (
        <footer className="border-t border-[#4E3424] bg-[#140E0A] py-8 text-xs text-[#A88462]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#F5EFE1]">VERITAS</span>
                <span className="text-[11px] font-mono text-[#B08D57]">Originality &amp; Code Attributor</span>
              </div>
              <p className="text-[11px] text-[#A88462] max-w-xl">
                100% confidential local verification. Zero cloud uploads, zero per-page fees. Built for educators, researchers, and students.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#B08D57]">
              <span>Academic Integrity</span>
              <span>•</span>
              <span>Code Clone Detection</span>
              <span>•</span>
              <span>Writing Cadence Analysis</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
