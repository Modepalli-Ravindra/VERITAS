"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  PencilSquareIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";

const APP_NAV_ITEMS = [
  { name: "Research Studio", href: "/research", icon: BookOpenIcon, desc: "IEEE Papers & Literature" },
  { name: "PDF Assistant", href: "/chat-pdf", icon: ChatBubbleLeftRightIcon, desc: "SciSpace Multi-Paper RAG" },
  { name: "Originality Studio", href: "/dashboard", icon: DocumentMagnifyingGlassIcon, desc: "Plagiarism & AI Detection" },
  { name: "Writing Studio", href: "/writing", icon: PencilSquareIcon, desc: "Humanizer & Paraphraser" },
  { name: "Submissions Archive", href: "/repository", icon: CircleStackIcon, desc: "Indexed Manuscripts" },
  { name: "Audit Ledger", href: "/history", icon: ClockIcon, desc: "Verification Log" },
];

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isApp = !isLanding && !isAuthPage;

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("veritas_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    // Default sidebar closed on small screens
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("veritas_user");
    localStorage.removeItem("veritas_token");
    setCurrentUser(null);
    router.push("/login");
  };

  const activeNavItem = APP_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  // If on landing page: keep traditional vertical scroll & landing navbar
  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-[#171717] text-white w-full overflow-x-hidden selection:bg-[#f2572b]/30 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full p-0 m-0">{children}</main>
        <footer className="border-t border-white/[0.08] bg-[#141414] py-8 text-xs text-[#a3a3a3]">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-white">VERITAS</span>
                <span className="text-[11px] font-mono text-[#f2572b]">Originality &amp; Research Intelligence</span>
              </div>
              <p className="text-[11px] text-[#737373] max-w-xl">
                100% confidential local verification. Zero cloud uploads, zero per-page fees. Built for researchers, educators, and students.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#a3a3a3]">
              <span className="hover:text-[#f2572b] transition-colors">Academic Integrity</span>
              <span>•</span>
              <span className="hover:text-[#f2572b] transition-colors">IEEE Standards</span>
              <span>•</span>
              <span className="hover:text-[#f2572b] transition-colors">100% Privacy</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // If on login/signup page: pure clean full screen viewport locked (no scroll)
  if (isAuthPage) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#171717] text-white flex items-center justify-center selection:bg-[#f2572b]/30 selection:text-white relative">
        {children}
      </div>
    );
  }

  // ========================================================
  // INSIDE THE APPLICATION: Clean Top Bar + Toggle Sidebar + Viewport-Locked (No Scroll)
  // ========================================================
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#171717] text-white selection:bg-[#f2572b]/30 selection:text-white font-sans antialiased">
      {/* 1. TOP BAR: Only Name & Logo + Sidebar Toggle (Zero duplicate signup buttons) */}
      <header className="h-[60px] shrink-0 w-full bg-[#171717]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-[#a3a3a3] hover:text-[#f2572b] hover:bg-white/[0.05] border border-white/[0.08] transition-all flex items-center justify-center"
            title={sidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
            aria-label="Toggle Navigation Sidebar"
          >
            <Bars3BottomLeftIcon className="w-5 h-5 text-[#e5e5e5]" />
          </button>

          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-[32px] h-[32px] rounded-xl overflow-hidden border border-white/10 bg-[#1f1f1f] flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#f2572b] transition-all">
              <img
                src="/veritas_logo.jpg"
                alt="VERITAS"
                width={32}
                height={32}
                className="w-full h-full object-cover block"
              />
            </div>
            <span className="font-serif text-lg font-bold tracking-wider text-white group-hover:text-[#f2572b] transition-colors">
              VERITAS
            </span>
          </Link>
        </div>

        {/* Center: Clean Tool Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f2572b] animate-pulse" />
          <span className="text-xs font-mono font-medium text-[#e5e5e5]">
            {activeNavItem ? activeNavItem.name : "Academic Studio"}
          </span>
        </div>

        {/* Right: User Profile or Sign In Link (No session/engine badges) */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none">
                  {currentUser.name || currentUser.email}
                </div>
                {currentUser.institution && (
                  <div className="text-[10px] text-[#a3a3a3] font-mono leading-tight mt-0.5">
                    {currentUser.institution}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-[#a3a3a3] hover:text-[#f2572b] hover:bg-white/[0.05] rounded-xl border border-white/[0.08] transition-all text-xs"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* 2. MAIN BODY: Sidebar + Viewport-Locked Stretched Workspace */}
      <div className="flex-1 h-[calc(100vh-60px)] w-full flex flex-row overflow-hidden relative">
        {/* Collapsible Glassmorphic Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out border-r border-white/[0.08] bg-[#1a1a1a]/95 backdrop-blur-2xl flex flex-col justify-between z-20`}
        >
          {/* Nav List */}
          <div className="p-3 space-y-1.5 overflow-y-auto w-64 flex-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[#737373]">
              Workspace Navigation
            </div>
            {APP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 shadow-sm"
                      : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#f2572b]" : "text-[#737373]"
                    }`}
                  />
                  <div className="truncate">
                    <span className="block leading-none">{item.name}</span>
                    <span className="text-[10px] font-normal text-[#737373] block mt-0.5 truncate">
                      {item.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Clean Minimalist Sidebar Footer */}
          <div className="p-3 border-t border-white/[0.08] w-64">
            <div className="flex items-center justify-between px-2 text-[11px] font-mono text-[#737373]">
              <span>VERITAS</span>
              <span>v3.0</span>
            </div>
          </div>
        </aside>

        {/* 3. Main Workspace Area: Stretched Wide, Geometrically Equal, Viewport Locked */}
        <main className="flex-1 h-full overflow-hidden flex flex-col w-full bg-[#171717]">
          {children}
        </main>
      </div>
    </div>
  );
}
