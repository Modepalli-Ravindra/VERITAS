"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  DocumentMagnifyingGlassIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  FolderPlusIcon,
  BoltIcon
} from "@heroicons/react/24/solid";
import LuxuryRibbonHero from "@/components/LuxuryRibbonHero";

export default function LandingPage() {
  const router = useRouter();

  // If user is already authenticated, redirect directly into the Dashboard workspace
  useEffect(() => {
    const user = localStorage.getItem("veritas_user");
    const token = localStorage.getItem("veritas_token");
    if (user && token) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Q&A / FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Comprehensive Q&A Session Content reflecting all tools
  const faqs = [
    {
      q: "Can I convert an existing college or client project into an IEEE research paper?",
      a: "Yes. VERITAS features a dedicated College Project Analyzer. You can provide your GitHub repository URL or project architecture. VERITAS automatically analyzes your codebase, separates your completed implementation modules from theoretical proposed enhancements, formulates research questions, and drafts a 17-section IEEE-compliant manuscript with mathematical modeling and benchmark figures."
    },
    {
      q: "Can paper proposals include ideas beyond what our team actually built?",
      a: "Absolutely. In IEEE research paper methodology, a paper is often a proposal or architectural extension. You can report your actual college prototype in the Implementation and Results section with verified screenshots, while introducing theoretical enhancements (such as Layer-2 Blockchain security or Vision Transformer detection) in the Proposed Architecture and Future Works sections."
    },
    {
      q: "How does the Smart AST Code Clone Spotter catch copied assignments?",
      a: "Simple character matching fails when students rename variables or swap loops. VERITAS constructs an Abstract Syntax Tree (AST) to evaluate tokenized code grammar, control flow invariants, and structural sequence distance across Python, Java, C++, JavaScript, and Go—catching clones even after variable renames, line reordering, and comment stripping."
    },
    {
      q: "Does VERITAS store, leak, or train AI models on my code or manuscripts?",
      a: "Never. VERITAS runs on strict zero-cloud-retention and 100% confidential local execution principles. Your research manuscripts, student essays, and proprietary code repositories are audited locally in an isolated sandbox and never shared with third parties, LLM training datasets, or external crawlers."
    },
    {
      q: "Can I run VERITAS completely offline without cloud API keys?",
      a: "Yes. VERITAS is built with a dual LLM Gateway. It connects directly to local Ollama models (such as deepseek-r1 or llama3) for 100% free offline CPU execution, or optionally connects to high-throughput cloud providers (Groq, Gemini, Anthropic) if you provide API keys."
    },
    {
      q: "How does the Citation & Bibliography Auditor verify references?",
      a: "VERITAS cross-references citations against over 200M+ open-access scholarly papers via Semantic Scholar and CrossRef. It checks for fictitious or hallucinated citations, formats references into standard APA 7, MLA 9, IEEE, or BibTeX styles, and validates that every citation has a matching bibliography entry."
    }
  ];

  // 6 Flagship Platform Capabilities
  const capabilities = [
    {
      badge: "Autonomous Manuscript Pipeline",
      title: "19-Stage Research Paper Workspace",
      desc: "Transform ideas into publication-ready IEEE manuscripts. Automated topic conceptualization, problem formulation, RQs, hypotheses, SciSpace literature matrix, gap discovery, and 17-section drafting.",
      pill: "17-Section IEEE Blueprint Compliant",
      icon: BookOpenIcon,
      href: "/research"
    },
    {
      badge: "GitHub Capstone Ingestion",
      title: "College Project to IEEE Converter",
      desc: "Convert college final-year projects and client prototypes into publishable papers. Automatically isolates implemented modules from proposed enhancements, generating benchmark comparisons and figures.",
      pill: "GitHub Repo & Architecture Ingestion",
      icon: FolderPlusIcon,
      href: "/research"
    },
    {
      badge: "Multi-Engine Originality",
      title: "Plagiarism & AI Cadence Auditor",
      desc: "Cross-check submissions against 200M+ academic papers. Evaluates burstiness variance and perplexity predictability to highlight exact sentence matches with peer-reviewed literature citations.",
      pill: "Winnowing & Bloom Filter Fingerprints",
      icon: DocumentMagnifyingGlassIcon,
      href: "/dashboard"
    },
    {
      badge: "Syntax Tree Tokenizer",
      title: "Smart AST Code Clone Spotter",
      desc: "Uncover copied programming assignments across Python, Java, C++, JS, and Go. Normalized AST analysis detects clones even after identifier renaming, control structure modifications, and line swaps.",
      pill: "Cross-Language AST Token Distance",
      icon: CodeBracketIcon,
      href: "/dashboard"
    },
    {
      badge: "Style & Adversarial Forensics",
      title: "Writing Studio & Deep Humanizer",
      desc: "Academic grammar auditor and AI humanizer (< 15% similarity). Features live citation audits in APA, MLA, IEEE, and BibTeX, plus adversarial forensics detecting zero-width spaces and homoglyphs.",
      pill: "Zero-Width Space & Homoglyph Defense",
      icon: PencilSquareIcon,
      href: "/writing"
    },
    {
      badge: "Multi-Paper Verification",
      title: "SciSpace PDF Assistant & RAG",
      desc: "Interactive multi-paper research assistant. Query complex scientific PDFs, extract key findings, audit mathematical formulas, and trace empirical claims directly to verified source paragraphs.",
      pill: "Page-Level Evidence Tracing",
      icon: ChatBubbleLeftRightIcon,
      href: "/chat-pdf"
    }
  ];

  return (
    <div className="w-full space-y-20 pb-20 bg-[#171717] text-white selection:bg-[#f2572b]/30 selection:text-white">
      
      {/* ========================================================
          1. HERO SECTION: BESPOKE LUXURY RIBBON HERO
          ======================================================== */}
      <LuxuryRibbonHero />

      {/* Main Content Container with standard max-w for content sections */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* ========================================================
            2. CAPABILITIES: THE 6 FLAGSHIP ACADEMIC SUITES
           ======================================================== */}
        <section id="capabilities" className="space-y-10 scroll-mt-24">
          <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2572b]/10 border border-[#f2572b]/30 shadow-sm text-xs font-mono font-bold uppercase tracking-wider text-[#f2572b]">
              <SparklesIcon className="w-4 h-4 text-[#f2572b]" />
              <span>Full-Stack Academic Platform</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Everything you need to research, write, and verify.
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed">
              VERITAS unifies 19-stage autonomous IEEE manuscript development, GitHub capstone conversion, multi-engine plagiarism detection, AST code clone auditing, and PDF scientific RAG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-[#1f1f1f]/85 border border-white/[0.08] hover:border-[#f2572b]/50 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center text-[#f2572b] group-hover:bg-[#f2572b] group-hover:text-white transition-all shadow-md">
                        <Icon className="w-6 h-6 transition-colors" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#a3a3a3] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                        {item.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#f2572b] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#a3a3a3] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    <div className="p-2.5 px-3 bg-[#171717] rounded-xl text-[11px] font-mono text-[#e5e5e5] border border-white/[0.06] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f2572b] shrink-0" />
                      <span className="truncate">{item.pill}</span>
                    </div>

                    <Link
                      href={item.href}
                      className="w-full py-2.5 px-4 rounded-full bg-[#f2572b] hover:brightness-110 border border-[#ff7247] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#f2572b]/25"
                    >
                      <span className="text-white">Launch Tool</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            3. TWO-COLUMN SPOTLIGHT: PRIVACY & IEEE COMPLIANCE
           ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl p-8 sm:p-10 bg-[#1f1f1f]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#f2572b]/15 border border-[#f2572b]/30 flex items-center justify-center text-[#f2572b]">
              <LockClosedIcon className="w-6 h-6 text-[#f2572b]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">
                100% Confidential Local Sandbox
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
                Academic institutions and researchers should never be forced to leak unpublished manuscripts or student intellectual property to third-party cloud trackers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.06] space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  Zero Cloud Uploads
                </span>
                <p className="text-[11px] text-[#737373]">Manuscripts remain entirely on your local machine.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.06] space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  Local CPU LLM Gateway
                </span>
                <p className="text-[11px] text-[#737373]">Run DeepSeek-R1 or Llama3 via Ollama for free offline drafting.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 sm:p-10 bg-[#1f1f1f]/85 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#f2572b]/15 border border-[#f2572b]/30 flex items-center justify-center text-[#f2572b]">
              <ShieldCheckIcon className="w-6 h-6 text-[#f2572b]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">
                IEEE Standard Academic Blueprint
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
                Automated enforcement of IEEE conference guidelines, double-blind review formatting, mathematical modeling requirements, and citation depth.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.06] space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  3,500 – 6,500 Word Bounds
                </span>
                <p className="text-[11px] text-[#737373]">Exact two-column paper boundaries with section allocations.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.06] space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
                  LaTeX &amp; BibTeX Export
                </span>
                <p className="text-[11px] text-[#737373]">Instant download of compiling .tex files and verified bibliographies.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. WORKFLOW: 3-STEP ACADEMIC LIFECYCLE
           ======================================================== */}
        <section id="workflow" className="rounded-3xl p-8 sm:p-12 bg-[#1f1f1f]/85 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-8 scroll-mt-24">
          <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#f2572b] uppercase tracking-wider font-bold">
              <BoltIcon className="w-4 h-4 text-[#f2572b]" />
              <span>Streamlined Lifecycle</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              From college project to published IEEE paper in three steps.
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto leading-relaxed">
              Autonomous, transparent, and private workflow designed for busy instructors, researchers, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#171717] border border-white/[0.08] hover:border-[#f2572b]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
              <span className="text-xs font-mono font-bold text-[#f2572b]">STEP 01</span>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4 text-[#f2572b]" />
                Ingest Code or Draft
              </h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Connect your GitHub repository URL, paste prototype architecture notes, upload PDF research drafts, or input raw programming code.
              </p>
            </div>

            <div className="p-6 bg-[#171717] border border-white/[0.08] hover:border-[#f2572b]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
              <span className="text-xs font-mono font-bold text-[#f2572b]">STEP 02</span>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <DocumentMagnifyingGlassIcon className="w-4 h-4 text-[#f2572b]" />
                Synthesize &amp; Verify
              </h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Synthesizes a SciSpace literature matrix, uncovers research gaps, separates completed modules from proposals, and runs AST code clone spotters.
              </p>
            </div>

            <div className="p-6 bg-[#171717] border border-white/[0.08] hover:border-[#f2572b]/50 rounded-2xl space-y-3 shadow-lg transition-colors">
              <span className="text-xs font-mono font-bold text-[#f2572b]">STEP 03</span>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <DocumentCheckIcon className="w-4 h-4 text-[#f2572b]" />
                Draft &amp; IEEE Export
              </h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Drafts 17 IEEE manuscript sections with mathematical equations, benchmark figures, and exports publication-ready LaTeX (.tex) and BibTeX files.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. TARGET AUDIENCE: SOLUTIONS FOR RESEARCHERS, FACULTY & STUDENTS
           ======================================================== */}
        <section id="audience" className="space-y-8 scroll-mt-24">
          <div className="space-y-3 max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="text-xs font-mono text-[#f2572b] uppercase tracking-wider font-bold">
              Institutional &amp; Academic Pillars
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              Who benefits from VERITAS?
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto leading-relaxed">
              Tailored academic intelligence designed for university faculty, researchers, authors, and engineering students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#1f1f1f]/85 border border-white/[0.08] hover:border-[#f2572b]/50 backdrop-blur-xl space-y-4 shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center text-[#f2572b] shadow-sm">
                <AcademicCapIcon className="w-6 h-6 text-[#f2572b]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Professors &amp; Faculty</h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Grade student programming assignments with AST code clone detection that catches renamed variables. Evaluate thesis manuscripts with sentence-level citations and 100% private local auditing.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#1f1f1f]/85 border border-white/[0.08] hover:border-[#f2572b]/50 backdrop-blur-xl space-y-4 shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center text-[#f2572b] shadow-sm">
                <DocumentTextIcon className="w-6 h-6 text-[#f2572b]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Researchers &amp; Authors</h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Self-audit research papers before submission to IEEE, ACM, or Springer. Eliminate accidental plagiarism, fix citation discrepancies, and verify burstiness variance prior to peer review.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#1f1f1f]/85 border border-white/[0.08] hover:border-[#f2572b]/50 backdrop-blur-xl space-y-4 shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center text-[#f2572b] shadow-sm">
                <UserGroupIcon className="w-6 h-6 text-[#f2572b]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Engineering &amp; CS Students</h3>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Convert final year capstones or GitHub projects into peer-reviewed IEEE conference papers. Learn proper academic proposal structure, literature survey matrices, and LaTeX formatting effortlessly.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. FREQUENTLY ASKED QUESTIONS (Q&A)
           ======================================================== */}
        <section id="qa" className="space-y-8 scroll-mt-24 max-w-4xl mx-auto w-full">
          <div className="space-y-3 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#f2572b] uppercase tracking-wider font-bold">
              <QuestionMarkCircleIcon className="w-4 h-4 text-[#f2572b]" />
              <span>Questions &amp; Answers</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto leading-relaxed">
              Everything you need to know about college project conversion, IEEE rules, AST code clone detection, and local CPU privacy.
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
                      ? "bg-[#1f1f1f] border border-[#f2572b]/70 shadow-2xl"
                      : "bg-[#1f1f1f]/70 border border-white/[0.08] hover:border-[#f2572b]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none group"
                  >
                    <span className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#f2572b] transition-colors">
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-all ${
                        isOpen
                          ? "bg-[#f2572b] text-white rotate-180"
                          : "bg-[#262626] text-[#a3a3a3] group-hover:border-[#f2572b] group-hover:text-white"
                      }`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#e5e5e5] leading-relaxed font-sans border-t border-white/[0.06]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            7. DIRECT CALLOUT BANNER - LUXURY FROSTED GLASS PANEL
           ======================================================== */}
        <section className="rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl border border-white/[0.08] bg-[#1f1f1f]/85 backdrop-blur-xl hover:border-[#f2572b]/50 transition-all">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Ready to research, draft, or verify?
            </h3>
            <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
              Convert your college project into an IEEE paper, spot code clones, or audit manuscripts in seconds with 100% confidential local execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <Link
              href="/research"
              className="px-7 py-3.5 rounded-full bg-[#f2572b] hover:brightness-110 border border-[#ff7247] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-[#f2572b]/30 cursor-pointer"
            >
              <span className="text-white">Open Research Studio</span>
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </Link>
            <Link
              href="/dashboard"
              className="px-7 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white text-xs sm:text-sm font-semibold flex items-center justify-center transition-all shadow-lg cursor-pointer"
            >
              <span className="text-white">Originality Studio</span>
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}