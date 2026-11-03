"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileSearch, Database, Clock, Users, GraduationCap, Layers, ShieldCheck, HelpCircle,
  Menu, X, LogOut, ArrowRight, PenTool, Sparkles, BookOpen, MessageSquare 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("veritas_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      setCurrentUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("veritas_user");
    localStorage.removeItem("veritas_token");
    setCurrentUser(null);
    router.push("/login");
  };

  // Internal application tools (shown inside the workspace)
  const appNavItems = [
    { name: "Research Studio", href: "/research", icon: BookOpen },
    { name: "PDF Assistant", href: "/chat-pdf", icon: MessageSquare },
    { name: "Originality Studio", href: "/dashboard", icon: FileSearch },
    { name: "Writing Studio", href: "/writing", icon: PenTool },
    { name: "Submissions Archive", href: "/repository", icon: Database },
    { name: "Audit Ledger", href: "/history", icon: Clock },
  ];

  // Public Landing Page navigation (using genuine academic integrity & workflow icons from page sections)
  const landingNavItems = [
    { name: "Capabilities", href: "/#capabilities", icon: ShieldCheck },
    { name: "Workflow", href: "/#workflow", icon: Layers },
    { name: "Audience", href: "/#audience", icon: GraduationCap },
    { name: "Q&A", href: "/#qa", icon: HelpCircle },
  ];

  const isLanding = pathname === "/";
  const activeNavList = isLanding ? landingNavItems : appNavItems;

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-3 left-0 right-0 z-50 w-full flex justify-center px-2 sm:px-4 pointer-events-none transition-all"
    >
      {/* Floating 95% width container with luxury glassmorphism, 1px crisp border and 61px height */}
      <div className="pointer-events-auto relative w-[95%] max-w-[1440px] rounded-2xl bg-[#171717]/80 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 hover:border-[#f2572b]/50 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <nav className="relative w-full h-[61px] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
        
        {/* Left: Brand Logo + Wordmark */}
        <div className="flex items-center gap-3 h-full">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 my-auto group h-full" 
            title="VERITAS Home"
            aria-label="VERITAS Home"
          >
            <div className="w-[36px] h-[36px] min-w-[36px] min-h-[36px] rounded-xl overflow-hidden border border-white/10 bg-[#1f1f1f] flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#f2572b] group-hover:scale-105 transition-all">
              <img
                src="/veritas_logo.jpg"
                alt="VERITAS"
                width={36}
                height={36}
                className="w-full h-full object-cover block"
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-wider text-white group-hover:text-[#f2572b] transition-colors">
              VERITAS
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-2 sm:gap-4 lg:gap-6">
          {activeNavList.map((item) => {
            const Icon = item.icon;
            const isActive = !isLanding && pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`h-[40px] flex items-center gap-2 px-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 shadow-sm"
                    : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#f2572b]" : "text-[#737373]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions & User Session */}
        <div className="hidden sm:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right">
                <div className="text-sm font-medium text-white leading-none">
                  {currentUser.name}
                </div>
                <div className="text-xs text-[#a3a3a3] font-mono leading-tight mt-0.5">
                  {currentUser.institution || "Auditor"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="h-[38px] px-3 text-[#a3a3a3] hover:text-[#f2572b] hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/10 flex items-center justify-center transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="h-[38px] px-5 rounded-full btn-3d-signin-gold text-xs font-semibold flex items-center justify-center transition-all"
              >
                Sign In
              </Link>
              
              <Link
                href="/signup"
                className="h-[38px] px-5 rounded-full btn-3d-gold text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#A88462] hover:text-[#F5EFE1] rounded-lg hover:bg-white/[0.06]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        </nav>

        {/* Mobile Drawer with Frosted Glassmorphism */}
        {mobileMenuOpen && (
          <div className="sm:hidden w-full px-4 py-3 border-t-2 border-[#53351F]/70 bg-[#1e130c]/90 backdrop-blur-2xl rounded-b-2xl space-y-2">
            <div className="space-y-1.5 pb-2 border-b border-[#4E3424]">
              {activeNavList.map((item) => {
                const Icon = item.icon;
                const isActive = !isLanding && pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-[#382419] text-[#F5EFE1] font-semibold" : "text-[#D9C7A3] hover:text-[#F5EFE1]"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#B08D57]" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-1 flex items-center justify-between">
              {currentUser ? (
                <div className="w-full flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#F5EFE1]">{currentUser.name}</div>
                    <div className="text-xs text-[#A88462] font-mono">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 rounded-md border border-rose-900/60"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-lg text-sm font-medium bg-[#382419] border border-[#4E3424] text-[#D9C7A3]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-lg text-sm font-semibold bg-[#B08D57] text-[#140E0A]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
