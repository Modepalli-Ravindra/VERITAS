"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  Squares2X2Icon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  PencilSquareIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/solid";

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
    router.push("/");
  };

  // Internal application tools (shown inside the workspace)
  const appNavItems = [
    { name: "Research Studio", href: "/research", icon: BookOpenIcon },
    { name: "PDF Assistant", href: "/chat-pdf", icon: ChatBubbleLeftRightIcon },
    { name: "Originality Studio", href: "/dashboard", icon: DocumentMagnifyingGlassIcon },
    { name: "Writing Studio", href: "/writing", icon: PencilSquareIcon },
    { name: "Submissions Archive", href: "/repository", icon: CircleStackIcon },
    { name: "Audit Ledger", href: "/history", icon: ClockIcon },
  ];

  // Public Landing Page navigation (using genuine academic integrity & workflow icons from page sections)
  const landingNavItems = [
    { name: "Capabilities", href: "/#capabilities", icon: ShieldCheckIcon },
    { name: "Workflow", href: "/#workflow", icon: Squares2X2Icon },
    { name: "Audience", href: "/#audience", icon: AcademicCapIcon },
    { name: "Q&A", href: "/#qa", icon: QuestionMarkCircleIcon },
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
      <div className="pointer-events-auto relative w-[95%] max-w-[1440px] rounded-2xl bg-[#171717]/85 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 hover:border-[#f2572b]/50 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
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

        {/* Center: Navigation Buttons (#f2572b color, no fill, border on hover) */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-2 sm:gap-2.5 lg:gap-3">
          {activeNavList.map((item) => {
            const Icon = item.icon;
            const isActive = !isLanding && pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`h-[36px] flex items-center gap-1.5 px-3.5 rounded-full text-xs lg:text-sm font-semibold tracking-wide transition-all border ${
                  isActive
                    ? "bg-[#f2572b]/15 text-[#f2572b] border-[#f2572b] shadow-sm shadow-[#f2572b]/20"
                    : "bg-transparent text-[#f2572b] border-transparent hover:border-[#f2572b] hover:bg-[#f2572b]/10 hover:shadow-sm hover:shadow-[#f2572b]/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#f2572b]" />
                <span className="text-[#f2572b]">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions & User Session (Buttons with White Text & f2572b Round Action) */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="h-[38px] px-5 rounded-full bg-[#f2572b] hover:brightness-110 border border-[#ff7247] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#f2572b]/30"
              >
                <span>Enter Studio</span>
                <ArrowRightIcon className="w-4 h-4 text-white" />
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="h-[38px] px-3.5 text-[#a3a3a3] hover:text-[#f2572b] hover:bg-white/[0.05] rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center gap-1.5 transition-all text-xs font-mono"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4 text-[#a3a3a3] hover:text-[#f2572b]" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="h-[38px] px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-xs font-semibold flex items-center justify-center transition-all shadow-sm"
              >
                <span className="text-white">Sign In</span>
              </Link>
              
              <Link
                href="/signup"
                className="h-[38px] px-5 rounded-full bg-[#f2572b] hover:brightness-110 border border-[#ff7247] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#f2572b]/30"
              >
                <span className="text-white">Register</span>
                <ArrowRightIcon className="w-4 h-4 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#f2572b] rounded-lg hover:bg-white/[0.06]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-5 h-5 text-white" /> : <Bars3Icon className="w-5 h-5 text-white" />}
          </button>
        </div>

        </nav>

        {/* Mobile Dropdown Menu with white text & f2572b styling */}
        {mobileMenuOpen && (
          <div className="md:hidden p-4 pt-2 border-t border-white/10 bg-[#171717] rounded-b-2xl space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {activeNavList.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-full bg-transparent text-[#f2572b] border border-transparent hover:border-[#f2572b] hover:bg-[#f2572b]/10 flex items-center justify-center gap-2 text-xs font-semibold transition-all"
                  >
                    <Icon className="w-4 h-4 text-[#f2572b]" />
                    <span className="text-[#f2572b]">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            {!currentUser && (
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-full bg-white/[0.08] text-white text-xs font-semibold border border-white/15"
                >
                  <span className="text-white">Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-full bg-[#f2572b] text-white text-xs font-bold border border-[#ff7247]"
                >
                  <span className="text-white">Register</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.header>
  );
}
