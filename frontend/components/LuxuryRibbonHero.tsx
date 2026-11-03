"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function LuxuryRibbonHero() {
  // Auto-Text Typewriter phrases representing all tools in the platform
  const phrases = [
    "draft IEEE research papers.",
    "convert college projects to papers.",
    "detect uncredited matches.",
    "conduct deep literature review.",
    "spot hidden code clones.",
    "chat with scientific PDFs.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = phrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < targetPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length + 1));
        }, 65);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2400);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden isolate bg-[#090604] m-0 p-0 border-0 pt-24 sm:pt-28 pb-16">
      
      {/* ========================================================
          LAYER 1: PURE LUXURY AMBIENT GRADIENT LIGHTS (ZERO LINES, ZERO 3D)
          - Deep Espresso Base (#090604) with central warm espresso bloom
          - Symmetrical 4-corner radial studio gradient lights
          - Broad bottom horizon ambient light wash
          - Pure, diffuse, velvety light fields with gentle breathing motion
         ======================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#090604]">
        
        {/* Center warm espresso depth radial base */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 85% 70% at 50% 48%, #1a0f0a 0%, #0d0705 50%, #090604 100%)",
          }}
        />

        {/* TOP-LEFT: Warm Bronze & Gold Studio Gradient Light */}
        <motion.div 
          animate={{ opacity: [0.38, 0.56, 0.38], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-36 -left-36 w-[680px] h-[680px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(196, 154, 88, 0.40) 0%, rgba(83, 53, 31, 0.28) 45%, transparent 72%)",
            filter: "blur(65px)",
          }}
        />

        {/* TOP-LEFT: Soft Ruby Red Under-Glow Light */}
        <motion.div 
          animate={{ opacity: [0.28, 0.44, 0.28], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-16 -left-20 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(214, 41, 32, 0.26) 0%, rgba(139, 17, 17, 0.15) 50%, transparent 75%)",
            filter: "blur(55px)",
          }}
        />

        {/* TOP-RIGHT: Symmetrical Warm Bronze & Gold Studio Gradient Light (Equal Ratio) */}
        <motion.div 
          animate={{ opacity: [0.38, 0.56, 0.38], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -top-36 -right-36 w-[680px] h-[680px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(196, 154, 88, 0.40) 0%, rgba(83, 53, 31, 0.28) 45%, transparent 72%)",
            filter: "blur(65px)",
          }}
        />

        {/* TOP-RIGHT: Soft Ruby Red Under-Glow Light */}
        <motion.div 
          animate={{ opacity: [0.28, 0.44, 0.28], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-16 -right-20 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(214, 41, 32, 0.26) 0%, rgba(139, 17, 17, 0.15) 50%, transparent 75%)",
            filter: "blur(55px)",
          }}
        />

        {/* BOTTOM-LEFT: Radiant Liquid Gold Ambient Light */}
        <motion.div 
          animate={{ opacity: [0.40, 0.60, 0.40], scale: [1, 1.06, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute -bottom-40 -left-32 w-[760px] h-[640px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(228, 189, 120, 0.38) 0%, rgba(196, 154, 88, 0.28) 42%, rgba(83, 53, 31, 0.18) 62%, transparent 78%)",
            filter: "blur(75px)",
          }}
        />

        {/* BOTTOM-RIGHT: Radiant Ruby Flame Ambient Light */}
        <motion.div 
          animate={{ opacity: [0.44, 0.64, 0.44], scale: [1, 1.06, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
          className="absolute -bottom-40 -right-32 w-[760px] h-[640px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 59, 48, 0.38) 0%, rgba(214, 41, 32, 0.28) 42%, rgba(139, 17, 17, 0.18) 62%, transparent 78%)",
            filter: "blur(75px)",
          }}
        />

        {/* BOTTOM HORIZON: Broad Ambient Gradient Light Wash (NO lines, pure diffuse light bloom) */}
        <motion.div 
          animate={{ opacity: [0.38, 0.58, 0.38], scale: [1, 1.03, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[120%] max-w-[1800px] h-[360px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(228, 189, 120, 0.30) 0%, rgba(196, 154, 88, 0.20) 35%, rgba(214, 41, 32, 0.12) 65%, transparent 85%)",
            filter: "blur(65px)",
          }}
        />

        {/* BOTTOM CENTER: Soft Golden Floor Light Accent */}
        <div 
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[750px] h-[190px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255, 240, 208, 0.22) 0%, rgba(228, 189, 120, 0.14) 45%, transparent 80%)",
            filter: "blur(45px)",
          }}
        />

        {/* CENTER CONTRAST VIGNETTE: Pure dark focus so typography is diamond-crisp */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(9,6,4,0) 35%, rgba(9,6,4,0.45) 100%)",
          }}
        />
      </div>

      {/* ========================================================
          LAYER 2: HERO CONTENT (PREMIUM TYPOGRAPHY & BUTTONS)
          - Rock-solid 2 lines with typewriter animation
          - High-contrast, clean editorial hierarchy
          - Zero layout shift, 100% responsive
         ======================================================== */}
      <div className="relative z-10 max-w-5xl w-full mx-auto space-y-6 sm:space-y-7 flex flex-col items-center px-4 sm:px-6 lg:px-8">
        
        {/* Brand Insignia Highlight Badge (Subtle Luxury Emblem) */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-card border border-[#f2572b]/35 shadow-lg shadow-[#f2572b]/10 hover:border-[#f2572b]/70 transition-all select-none group cursor-default"
        >
          <div className="w-5 h-5 rounded-md overflow-hidden border border-[#f2572b]/40 shadow-sm shrink-0">
            <img 
              src="/veritas_emblem.jpg" 
              alt="VERITAS Insignia" 
              className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-300" 
            />
          </div>
          <span className="font-mono text-xs font-bold tracking-wider text-[#f2572b] uppercase">
            VERITAS
          </span>
          <span className="w-[1px] h-3.5 bg-[#f2572b]/60 inline-block" />
          <span className="font-mono text-[11px] font-medium tracking-wider text-[#EADDC2] uppercase">
            Academic Intelligence Platform
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f2572b] animate-pulse" />
        </motion.div>

        {/* Headline: Editorial serif typography, strictly 2 lines */}
        <motion.h1 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[80px] font-bold tracking-tight text-[#F5EFE3] leading-[1.12] max-w-5xl mx-auto flex flex-col items-center select-none text-center min-h-[2.3em]"
        >
          <span className="block whitespace-nowrap">Verify originality and</span>
          <span className="text-[#f2572b] block h-[1.3em] min-h-[1.3em] whitespace-nowrap overflow-visible">
            {currentText}
            <span className="inline-block w-1.5 h-8 sm:h-12 lg:h-14 bg-[#f2572b] ml-2 align-middle animate-cursor" />
          </span>
        </motion.h1>

        {/* Supporting description: Crisp, elegant contrast */}
        <motion.p 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg lg:text-xl text-[#F5EFE3]/80 leading-relaxed max-w-3xl mx-auto font-sans font-normal"
        >
          VERITAS is the autonomous academic workspace: convert college projects into IEEE research papers, synthesize literature matrices, audit uncredited matches and code clones, humanize drafts, and chat with scientific PDFs with 100% confidential local execution.
        </motion.p>

        {/* Call to Actions (Studio & Sign In): Round pill buttons with white text */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 pt-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/research"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#f2572b] hover:brightness-110 border border-[#ff7247] text-white text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-[#f2572b]/30 cursor-pointer"
            >
              <span className="text-white">Explore Research Studio</span>
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/dashboard"
              className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white text-sm sm:text-base font-semibold flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <span className="text-white">Originality Studio</span>
            </Link>
          </motion.div>
        </motion.div>

      </div>

    </section>
  );
}
