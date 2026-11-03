"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, ShieldCheck, Code2, Sparkles, 
  Database, FileSearch, GraduationCap, Users, BookOpen,
  ChevronDown, HelpCircle
} from "lucide-react";
import LuxuryRibbonHero from "@/components/LuxuryRibbonHero";

export default function LandingPage() {
  // Q&A / FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Comprehensive Q&A Session Content
  const faqs = [
    {
      q: "How does VERITAS detect uncredited matches across scientific literature?",
      a: "VERITAS cross-references submissions against over 200M+ open-access papers, pre-prints (arXiv, Semantic Scholar), and online scholarly indexes. Rather than giving an ambiguous single percentage, VERITAS highlights exact matched sentences side-by-side with peer-reviewed literature source citations and direct publication links."
    },
    {
      q: "Does VERITAS store, leak, or train AI models on my manuscripts or source code?",
      a: "Never. VERITAS is engineered with strict zero-cloud-retention privacy principles. Your research manuscripts, student essays, and proprietary source code are audited locally in an isolated sandbox and never shared with third parties, LLM training datasets, or public search crawlers."
    },
    {
      q: "How does Smart Code Clone Spotter catch copied programming assignments?",
      a: "Simple text matching fails when students rename variables or swap loops. VERITAS constructs an Abstract Syntax Tree (AST) to evaluate code logic, token sequence fingerprints, and structural control flow—catching copied code even after variable renames, line reordering, and comment stripping across Python, Java, C++, JS, and Go."
    },
    {
      q: "How does the AI writing pattern detector avoid false positives?",
      a: "VERITAS evaluates multiple statistical signals including burstiness (variation in sentence lengths) and perplexity (cadence predictability). It pinpoints uniform, formulaic phrases without making baseless accusations, providing actionable feedback so authors can refine their authentic human voice."
    },
    {
      q: "Can academic institutions compare submissions across cohorts and past semesters?",
      a: "Yes. Instructors can securely index assignments into an encrypted local repository to detect cross-student collusion between current peers and previous semester cohorts without exposing drafts outside the institution."
    }
  ];

  return (
    <div className="w-full space-y-20 pb-20">
      
      {/* ========================================================
          1. HERO SECTION: FULL-VIEWPORT BESPOKE LUXURY GRADIENT HERO
          ======================================================== */}
      <LuxuryRibbonHero />

      {/* Main Content Container with standard max-w for content sections */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

      {/* ========================================================
          2. WHAT THE AUDIT DOSSIER REVEALS (CAPABILITIES) - GLASSMORPHISM
         ======================================================== */}
      <section id="capabilities" className="space-y-8 scroll-mt-24">
        <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="text-xs font-mono text-[#B08D57] uppercase tracking-wider flex items-center justify-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B08D57]"></span>
            <span>Comprehensive Verification</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#F5EFE1] tracking-tight">
            What the audit dossier reveals.
          </h2>
          <p className="text-xs sm:text-sm text-[#A88462] max-w-2xl mx-auto leading-relaxed">
            Instead of giving you a mysterious single score, VERITAS breaks down your submission sentence by sentence with clear visual evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <FileSearch className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                Sentence Match Highlights
              </h3>
              <p className="text-xs text-[#A88462] leading-relaxed">
                Highlights exactly which sentences match published papers or online sources with direct side-by-side comparison.
              </p>
            </div>
            <div className="p-3 px-4 bg-[#140E0A]/90 backdrop-blur-md border border-[#53351F]/70 hover:border-[#C49A58]/60 rounded-full text-xs text-rose-300 font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors">
              &ldquo;The dominant sequence models rely on complex recurrent networks...&rdquo;
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                Smart Code Clone Spotter
              </h3>
              <p className="text-xs text-[#A88462] leading-relaxed">
                Catches copied programming assignments even if students renamed variables, swapped function names, or rearranged lines.
              </p>
            </div>
            <div className="p-3 px-4 bg-[#140E0A]/90 backdrop-blur-md border border-[#53351F]/70 hover:border-[#C49A58]/60 rounded-full text-xs text-emerald-200 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors">
              arr &rarr; my_list (Structure matched)
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                AI Writing Pattern Flags
              </h3>
              <p className="text-xs text-[#A88462] leading-relaxed">
                Pinpoints repetitive, robotic sentence lengths and formulaic phrases so you can refine your authentic human voice.
              </p>
            </div>
            <div className="p-3 px-4 bg-[#140E0A]/90 backdrop-blur-md border border-[#53351F]/70 hover:border-[#C49A58]/60 rounded-full text-xs text-[#D9C7A3] font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors">
              Uniform sentence cadence detected
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                Cross-Student Collusion
              </h3>
              <p className="text-xs text-[#A88462] leading-relaxed">
                Compares submissions against previous semesters and peer assignments to detect unauthorized sharing within your school.
              </p>
            </div>
            <div className="p-3 px-4 bg-[#140E0A]/90 backdrop-blur-md border border-[#53351F]/70 hover:border-[#C49A58]/60 rounded-full text-xs text-teal-300 font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.35)] transition-colors">
              Cross-checked against past cohort
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. THREE-STEP REVIEW LIFECYCLE (WORKFLOW) - GLASS PANEL
         ======================================================== */}
      <section id="workflow" className="glass-panel rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl scroll-mt-24">
        <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="text-xs font-mono text-[#B08D57] uppercase tracking-wider font-semibold">
            Review Lifecycle
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5EFE1]">
            From raw draft to verified report in three steps.
          </h2>
          <p className="text-xs sm:text-sm text-[#A88462] max-w-xl mx-auto leading-relaxed">
            Simple, transparent, and private workflow designed for busy instructors and researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#120b07]/75 backdrop-blur-md border border-[#4E3424]/70 hover:border-[#B08D57]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
            <span className="text-xs font-mono font-bold text-[#B08D57]">STEP 01</span>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Import or Paste</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Upload PDF manuscripts, Word docs, essays, or paste raw code in Python, Java, C++, JS, and Go.
            </p>
          </div>

          <div className="p-6 bg-[#120b07]/75 backdrop-blur-md border border-[#4E3424]/70 hover:border-[#B08D57]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
            <span className="text-xs font-mono font-bold text-[#B08D57]">STEP 02</span>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Instant Verification</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Cross-references scientific literature, past cohort assignments, and evaluates writing cadence.
            </p>
          </div>

          <div className="p-6 bg-[#120b07]/75 backdrop-blur-md border border-[#4E3424]/70 hover:border-[#B08D57]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
            <span className="text-xs font-mono font-bold text-[#B08D57]">STEP 03</span>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Inspect &amp; Export</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Inspect interactive highlights, click matched literature sources, and export a printable audit dossier.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. TARGET AUDIENCE PILLARS (SOLUTIONS) - GLASSMORPHIC CARDS
         ======================================================== */}
      <section id="audience" className="space-y-8 scroll-mt-24">
        <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="text-xs font-mono text-[#B08D57] uppercase tracking-wider font-semibold">
            Built for Academic Integrity
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5EFE1]">
            Who benefits from VERITAS?
          </h2>
          <p className="text-xs sm:text-sm text-[#A88462] max-w-xl mx-auto leading-relaxed">
            Tailored verification workflows designed for educators, researchers, authors, and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-7 glass-card glass-card-hover rounded-2xl space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Professors &amp; Instructors</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Grade assignments with confidence backed by clear sentence-level evidence. Catch unauthorized code sharing between students effortlessly.
            </p>
          </div>

          <div className="p-7 glass-card glass-card-hover rounded-2xl space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Researchers &amp; Authors</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Self-audit papers before journal turn-in. Fix accidental citation oversights and safeguard academic standing prior to peer review.
            </p>
          </div>

          <div className="p-7 glass-card glass-card-hover rounded-2xl space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#140E0A]/80 backdrop-blur-md border border-[#4E3424] flex items-center justify-center text-[#B08D57] shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">Students &amp; Writers</h3>
            <p className="text-xs text-[#A88462] leading-relaxed">
              Check thesis and essays before submission. Ensure proper quoting and original voice without risking drafts to public cloud repositories.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================
          5. FREQUENTLY ASKED QUESTIONS (Q&A SESSION) - FROSTED ACCORDION
         ======================================================== */}
      <section id="qa" className="space-y-8 scroll-mt-24 max-w-4xl mx-auto w-full">
        <div className="space-y-3 text-center flex flex-col items-center">
          <div className="text-xs font-mono text-[#B08D57] uppercase tracking-wider flex items-center justify-center gap-2 font-semibold">
            <HelpCircle className="w-4 h-4 text-[#B08D57]" />
            <span>Questions &amp; Answers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F5EFE1] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#A88462] max-w-xl mx-auto leading-relaxed">
            Everything you need to know about VERITAS originality auditing, privacy protocols, and code clone verification.
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl transition-all overflow-hidden ${
                  isOpen
                    ? "glass-panel border-[#B08D57]/70 shadow-2xl"
                    : "glass-card hover:border-[#B08D57]/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none group"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F5EFE1] group-hover:text-[#D9C7A3] transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-[#4E3424] flex items-center justify-center shrink-0 transition-all ${
                      isOpen
                        ? "bg-[#B08D57] text-[#140E0A] rotate-180"
                        : "bg-[#140E0A]/80 text-[#B08D57] group-hover:border-[#B08D57]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#D9C7A3]/90 leading-relaxed font-sans border-t border-[#4E3424]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          6. DIRECT CALLOUT BANNER - LUXURY FROSTED GLASS PANEL
         ======================================================== */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl border border-[#53351F]/70 hover:border-[#B08D57]/50 transition-all">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5EFE1]">
            Ready to audit your work?
          </h3>
          <p className="text-xs sm:text-sm text-[#A88462] leading-relaxed">
            Verify academic manuscripts, essays, and programming code in seconds. No cloud upload, 100% confidential.
          </p>
        </div>

        <div className="flex items-center gap-3.5 shrink-0">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-full btn-3d-gold text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Open Verification Studio</span>
            <ArrowRight className="w-4 h-4 text-[#120B07]" />
          </Link>
          <Link
            href="/login"
            className="px-7 py-3.5 rounded-full btn-3d-signin-gold text-xs sm:text-sm font-semibold flex items-center justify-center cursor-pointer"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </section>

      </div>

    </div>
  );
}
