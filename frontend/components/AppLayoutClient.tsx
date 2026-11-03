"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  PencilSquareIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";

const APP_NAV_ITEMS = [
  { name: "Originality Studio", href: "/dashboard", icon: DocumentMagnifyingGlassIcon, desc: "Step 1: Plagiarism & AI Scanner" },
  { name: "Writing Studio", href: "/writing", icon: PencilSquareIcon, desc: "Step 2: AI Humanizer, Paraphrase & Grammar" },
  { name: "Research Studio", href: "/research", icon: BookOpenIcon, desc: "Step 3: 9-Stage IEEE Paper Builder" },
  { name: "PDF Assistant", href: "/chat-pdf", icon: ChatBubbleLeftRightIcon, desc: "Step 4: Multi-Paper Literature RAG" },
  { name: "Archive", href: "/repository", icon: CircleStackIcon, desc: "Institutional Submissions Vault" },
  { name: "Ledger", href: "/history", icon: ClockIcon, desc: "Verification Audit History" },
];

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("veritas_user");
    localStorage.removeItem("veritas_token");
    setCurrentUser(null);
    router.push("/login");
  };

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
  // INSIDE THE APPLICATION: Navigation in Top Bar (No Sidebar, Stretched Wide, Viewport Locked)
  // ========================================================
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#171717] text-white selection:bg-[#f2572b]/30 selection:text-white font-sans antialiased">
      {/* 1. TOP BAR: Logo on Left + Navigation in Center + User Profile on Right */}
      <header className="h-[60px] shrink-0 w-full bg-[#171717]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-30 shadow-sm relative">
        
        {/* Left: Brand Logo & Wordmark (No sidebar toggle button) */}
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Center: In-Top-Bar Navigation Links (No sidebar, no fill, border on hover) */}
        <div className="hidden lg:flex items-center justify-center gap-1 sm:gap-1.5">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.desc}
                className={`h-[36px] flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                  isActive
                    ? "bg-[#f2572b]/15 text-[#f2572b] border-[#f2572b] shadow-sm shadow-[#f2572b]/20"
                    : "bg-transparent text-[#e5e5e5] hover:text-[#f2572b] border-transparent hover:border-[#f2572b] hover:bg-[#f2572b]/10"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-[#f2572b]" : "text-[#a3a3a3]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: User Profile or Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
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
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white border border-white/10 bg-white/[0.05] hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle for < lg screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#f2572b] rounded-lg hover:bg-white/[0.06] lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-5 h-5 text-white" /> : <Bars3Icon className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu for Top Bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[60px] left-0 right-0 p-4 border-b border-white/10 bg-[#171717]/95 backdrop-blur-2xl z-40 space-y-2 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              {APP_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-[#f2572b]/15 text-[#f2572b] border-[#f2572b]"
                        : "bg-[#1f1f1f] text-[#e5e5e5] border-white/10 hover:border-[#f2572b]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#f2572b]" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE: 100% Full Screen Width, No Sidebar, Geometrically Equal & Viewport Locked */}
      <main className="flex-1 h-[calc(100vh-60px)] w-full overflow-hidden flex flex-col bg-[#171717]">
        {children}
      </main>
    </div>
  );
}
