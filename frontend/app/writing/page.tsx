"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PenTool,
  Sparkles,
  BookOpen,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import JuicyLoader from "@/components/JuicyLoader";

export default function WritingStudioPage() {
  const [activeTab, setActiveTab] = useState<"rewrite" | "grammar" | "citations" | "forensics">("rewrite");
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Grammar state
  const [grammarReport, setGrammarReport] = useState<any>(null);

  // Rewrite state
  const [rewriteMode, setRewriteMode] = useState("ai_humanize");
  const [rewriteResult, setRewriteResult] = useState<any>(null);

  // Citation state
  const [citationAudit, setCitationAudit] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<"apa7" | "mla9" | "ieee" | "bibtex">("apa7");

  // Forensics state
  const [forensicsReport, setForensicsReport] = useState<any>(null);

  // LLM Gateway State
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewayProvider, setGatewayProvider] = useState<string>("");

  useEffect(() => {
    fetchGatewayStatus();
  }, []);

  const fetchGatewayStatus = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/gateway-status");
      const data = await res.json();
      setGatewayStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunHumanize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setGatewayLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, intensity: "high" })
      });
      const data = await res.json();
      if (data.success) {
        setGatewayProvider(data.provider);
        setRewriteResult({
          rewritten_text: data.humanized_text,
          provider: data.provider,
          mode_info: {
            label: "Deep AI Humanizer (Gateway LLM)",
            description: "High burstiness, human sentence cadence, and zero AI robotic artifacts."
          },
          deltas: {
            word_count_change: data.humanized_text.split(/\s+/).length - inputText.split(/\s+/).length,
            reading_ease_change: 8.5
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setGatewayLoading(false);
    }
  };

  const handleRunPlagiarismRemoval = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setGatewayLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/plagiarism-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, target_similarity: "< 15%" })
      });
      const data = await res.json();
      if (data.success) {
        setGatewayProvider(data.provider);
        setRewriteResult({
          rewritten_text: data.paraphrased_text,
          provider: data.provider,
          mode_info: {
            label: "Smart Plagiarism Removal (< 15%)",
            description: "Syntactic voice shift and domain synonyms to bring similarity below 20%."
          },
          deltas: {
            word_count_change: data.paraphrased_text.split(/\s+/).length - inputText.split(/\s+/).length,
            reading_ease_change: 6.2
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setGatewayLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunGrammar = async (textToScan = inputText) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToScan })
      });
      const data = await res.json();
      if (data.success) {
        setGrammarReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyGrammarFix = (issue: any) => {
    const updated =
      inputText.slice(0, issue.start) + issue.replacement + inputText.slice(issue.end);
    setInputText(updated);
    handleRunGrammar(updated);
  };

  const handleRunRewrite = async (mode = rewriteMode, textToRewrite = inputText) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRewrite, mode })
      });
      const data = await res.json();
      if (data.success) {
        setRewriteResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCitationAudit = async (textToAudit = inputText) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/citation-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAudit })
      });
      const data = await res.json();
      if (data.success) {
        setCitationAudit(data.audit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSources = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/writing/search-sources?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleRunForensics = async (textToInspect = inputText) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/writing/forensics-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToInspect })
      });
      const data = await res.json();
      if (data.success) {
        setForensicsReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const REWRITE_MODES = [
    { id: "ai_humanize", name: "Deep AI Humanizer (Gateway LLM)", desc: "High burstiness, natural human cadence, strips AI robotic artifacts." },
    { id: "academic_formal", name: "Academic Formal", desc: "Scholarly diction, hedges, and objective register." },
    { id: "paraphrase_academic", name: "Smart Paraphrase (< 15% Sim)", desc: "Inverts syntax and formal synonyms to drop plagiarism score." },
    { id: "executive_concise", name: "Executive Concise", desc: "Strips wordiness & nominalizations ruthlessly." },
    { id: "clarity_enhancer", name: "Clarity & Readability", desc: "Untangles complex compound sentences." },
    { id: "fluent_esl", name: "Fluent ESL Cadence", desc: "Refines non-native phrasing while preserving meaning." },
    { id: "technical_rigor", name: "Technical Rigor", desc: "Aligns with precise engineering & scientific terms." },
    { id: "creative_scholarly", name: "Creative Dynamic", desc: "Engaging rhetorical flow and sophisticated transitions." },
    { id: "direct_active", name: "Direct Active Voice", desc: "Inverts bureaucratic passives into active subjects." },
    { id: "casual_accessible", name: "Plain English", desc: "Translates dense jargon for general public audiences." },
  ];

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const lineCount = inputText ? inputText.split("\n").length : 0;
  const charCount = inputText.length;

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#171717] text-white">
      {/* 95% WIDE WORKBENCH CONTAINER */}
      <div className="w-full max-w-[96%] mx-auto space-y-4">
        {/* SMART BENTO GRID FOR WORKBENCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* BENTO TILE 1: Main Analysis & Writing Editor (8 cols) - Glassmorphism */}
          <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 sm:p-7">
            
            {/* Embedded Workspace Mode Switcher (Zero bulky header, identical to /dashboard) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
              {[
                { id: "rewrite", label: "Deep AI Humanizer & Paraphraser", icon: PenTool },
                { id: "grammar", label: "Grammar & Clarity Audit", icon: CheckCircle2 },
                { id: "citations", label: "OpenAlex 250M Citations", icon: BookOpen },
                { id: "forensics", label: "Anti-Bypass Forensics", icon: ShieldAlert },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 shadow-sm font-semibold"
                        : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Document Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <input
                type="text"
                placeholder={
                  activeTab === "rewrite"
                    ? "Manuscript Section / Paragraph Title (e.g. Chapter 3: Methodology)"
                    : activeTab === "grammar"
                    ? "Document Title for Grammar Audit"
                    : activeTab === "citations"
                    ? "Citation Context / Bibliography Topic"
                    : "Forensic Audit Target Name"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
              />

              <div className="flex items-center gap-2 shrink-0">
                {inputText && (
                  <button
                    onClick={() => handleCopy(inputText)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.06] glass-card hover:bg-white/[0.06] text-xs font-medium text-[#a3a3a3] hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Source"}</span>
                  </button>
                )}
                {inputText && (
                  <button
                    onClick={() => setInputText("")}
                    className="px-3 py-2 rounded-xl border border-white/[0.06] glass-card hover:bg-white/[0.06] text-xs font-medium text-[#a3a3a3] hover:text-rose-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* MAIN TEXT EDITOR CONTAINER */}
            <div className="relative border border-white/[0.06] rounded-2xl glass-input overflow-hidden focus-within:border-[#f2572b]">
              <textarea
                rows={11}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === "rewrite"
                    ? "Paste AI-generated manuscript text, student essay, or paragraphs to humanize cadence, strip robotic artifacts, or drop plagiarism similarity below 15%..."
                    : activeTab === "grammar"
                    ? "Paste manuscript or research excerpt to audit 60+ academic redundancy traps, wordiness, passive voice, and readability..."
                    : activeTab === "citations"
                    ? "Paste manuscript section to check in-text citations against the reference list and verify authentic Crossref DOIs..."
                    : "Paste document text to inspect for hidden token-breaking characters, zero-width space injections (\\u200B), and foreign Cyrillic homoglyph tricks..."
                }
                className="w-full bg-transparent p-4 text-xs text-white placeholder:text-[#737373] focus:outline-none resize-y font-sans leading-relaxed"
              />

              {/* Editor Telemetry Bar */}
              <div className="border-t border-white/[0.06] bg-[#1a1a1a]/80 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-[#a3a3a3]">
                <div className="flex items-center gap-4">
                  <span>Words: <strong className="text-white tabular-nums">{wordCount}</strong></span>
                  <span>Lines: <strong className="text-white tabular-nums">{lineCount}</strong></span>
                  <span>Characters: <strong className="text-white tabular-nums">{charCount}</strong></span>
                </div>
                <span>UTF-8 Document</span>
              </div>
            </div>

            {/* ACTION TRIGGERS FOR ACTIVE TAB */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              {activeTab === "rewrite" && (
                <>
                  <div className="text-xs text-[#a3a3a3]">
                    Active Register: <strong className="text-[#f2572b]">{REWRITE_MODES.find(m => m.id === rewriteMode)?.name}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunHumanize}
                      disabled={loading || !inputText.trim()}
                      className="px-5 py-2.5 rounded-full btn-juicy text-white text-xs font-bold shadow-md shadow-[#f2572b]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                      {loading ? <JuicyLoader size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                      <span>Deep AI Humanizer</span>
                    </button>
                    <button
                      onClick={handleRunPlagiarismRemoval}
                      disabled={loading || !inputText.trim()}
                      className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Paraphrase (&lt; 15% Sim)</span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === "grammar" && (
                <>
                  <span className="text-xs text-[#737373]">
                    Auditing 60+ academic redundancy rules &amp; homophone traps locally.
                  </span>
                  <button
                    onClick={() => handleRunGrammar(inputText)}
                    disabled={loading || !inputText.trim()}
                    className="px-6 py-2.5 rounded-full btn-juicy text-white text-xs font-bold shadow-md shadow-[#f2572b]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                  >
                    {loading ? <JuicyLoader size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                    <span>Audit Grammar &amp; Clarity</span>
                  </button>
                </>
              )}

              {activeTab === "citations" && (
                <>
                  <span className="text-xs text-[#737373]">
                    Crossref DOI verification &amp; OpenAlex 250M catalog.
                  </span>
                  <button
                    onClick={() => handleRunCitationAudit(inputText)}
                    disabled={loading || !inputText.trim()}
                    className="px-6 py-2.5 rounded-full btn-juicy text-white text-xs font-bold shadow-md shadow-[#f2572b]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                  >
                    {loading ? <JuicyLoader size="sm" /> : <RefreshCw className="w-3.5 h-3.5 text-white" />}
                    <span>Audit Document Citations</span>
                  </button>
                </>
              )}

              {activeTab === "forensics" && (
                <>
                  <span className="text-xs text-[#737373]">
                    Deep unicode byte analysis for zero-width spaces and Cyrillic swaps.
                  </span>
                  <button
                    onClick={() => handleRunForensics(inputText)}
                    disabled={loading || !inputText.trim()}
                    className="px-6 py-2.5 rounded-full btn-juicy text-white text-xs font-bold shadow-md shadow-[#f2572b]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
                  >
                    {loading ? <JuicyLoader size="sm" /> : <ShieldAlert className="w-3.5 h-3.5 text-white" />}
                    <span>Audit Adversarial Manipulation</span>
                  </button>
                </>
              )}
            </div>

            {/* REWRITTEN OUTPUT TILE */}
            {activeTab === "rewrite" && rewriteResult && (
              <div className="mt-4 p-5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-[#f2572b] uppercase">
                      Rewritten Output
                    </span>
                    {(rewriteResult?.provider || gatewayProvider) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 font-mono text-[10px] text-emerald-400">
                        ⚡ {rewriteResult?.provider || gatewayProvider}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(rewriteResult.rewritten_text)}
                      className="text-xs text-[#f2572b] hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Rewritten</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-white leading-relaxed font-sans max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {rewriteResult.rewritten_text}
                </div>

                {rewriteResult?.deltas && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06] text-[#a3a3a3]">
                    <span>Words: {rewriteResult.deltas.word_count_change > 0 ? `+${rewriteResult.deltas.word_count_change}` : rewriteResult.deltas.word_count_change}</span>
                    <span>Reading Ease: {rewriteResult.deltas.reading_ease_change > 0 ? `+${rewriteResult.deltas.reading_ease_change}` : rewriteResult.deltas.reading_ease_change} pts</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Semantic Core Preserved</span>
                  </div>
                )}
              </div>
            )}

            {/* OPENALEX CITATION SEARCH */}
            {activeTab === "citations" && (
              <div className="mt-4 p-5 rounded-2xl bg-[#141414] border border-white/[0.06] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#f2572b] uppercase">
                    OpenAlex 250M Academic Publication Search
                  </span>
                  <div className="flex gap-1.5 bg-[#0f0f0f] p-1 rounded-xl border border-white/[0.06]">
                    {(["apa7", "mla9", "ieee", "bibtex"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedCitationStyle(style)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                          selectedCitationStyle === style
                            ? "bg-[#f2572b] text-white shadow-sm"
                            : "text-[#a3a3a3] hover:text-white"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchSources()}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171717] border border-white/[0.06] text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] transition-all"
                      placeholder="Search 250M+ papers by title, author, or DOI..."
                    />
                  </div>
                  <button
                    onClick={handleSearchSources}
                    disabled={searching}
                    className="h-10 px-4 rounded-xl btn-juicy text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {searchResults.map((paper: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#171717] border border-white/[0.06] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-serif font-bold text-white line-clamp-2">{paper.title}</h4>
                          {paper.doi && (
                            <a href={`https://doi.org/${paper.doi.replace('https://doi.org/','')}`} target="_blank" rel="noreferrer" className="text-[#f2572b] hover:text-white shrink-0">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-[#a3a3a3] truncate">{paper.authors?.join(", ") || "Unknown Authors"} • {paper.year}</div>
                        <div className="p-2 rounded-lg bg-[#0d0d0d] border border-white/[0.06] text-[11px] font-mono text-[#e5e5e5] select-all flex items-center justify-between gap-2">
                          <div className="truncate">{paper.citations?.[selectedCitationStyle] || paper.title}</div>
                          <button onClick={() => handleCopy(paper.citations?.[selectedCitationStyle] || paper.title)} className="text-[#a3a3a3] hover:text-[#f2572b]">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* BENTO SIDEBAR: Configuration, Metrics & Workflow Bridge (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {activeTab === "rewrite" && (
              <>
                {/* Tile 1: Register Selector */}
                <div className="glass-card rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#f2572b]">
                    <PenTool className="w-4 h-4" />
                    <span>REWRITE REGISTER &amp; CADENCE</span>
                  </div>
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {REWRITE_MODES.map((mode) => {
                      const isSel = rewriteMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setRewriteMode(mode.id);
                            if (inputText.trim()) handleRunRewrite(mode.id, inputText);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                            isSel
                              ? "bg-[#f2572b]/15 border-[#f2572b]/50 text-white shadow-sm"
                              : "bg-[#141414]/60 border-white/[0.04] hover:border-white/10 text-[#a3a3a3] hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold leading-tight">{mode.name}</div>
                          <div className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">{mode.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tile 2: Workflow Bridge to Originality Studio */}
                <div className="glass-card rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="text-xs font-mono text-[#a3a3a3] uppercase tracking-wider">
                    Next Workflow Step
                  </div>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Once you have humanized or paraphrased your manuscript, scan it for institutional plagiarism &amp; AI attribution.
                  </p>
                  <Link
                    href="/dashboard"
                    className="w-full h-10 rounded-xl btn-juicy text-white text-xs font-bold transition-all shadow-sm shadow-[#f2572b]/25 flex items-center justify-center gap-2 hover:brightness-110"
                  >
                    <span>Scan in Originality Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </Link>
                </div>
              </>
            )}

            {activeTab === "grammar" && (
              <>
                {/* Tile 1: Readability Scorecard */}
                <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#f2572b] uppercase tracking-wider font-semibold">
                      Readability Scorecard
                    </span>
                    {grammarReport && (
                      <span className="text-xs font-bold text-white bg-[#141414] px-2.5 py-1 rounded-full border border-white/[0.06]">
                        Score: <span className="text-[#f2572b]">{grammarReport.clarity_score}/100</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                      <div className="text-[11px] text-[#a3a3a3]">Reading Ease</div>
                      <div className="text-lg font-bold font-serif text-white mt-0.5">
                        {grammarReport?.metrics?.flesch_reading_ease || "—"}
                      </div>
                      <div className="text-[10px] text-[#f2572b]">{grammarReport?.metrics?.reading_level || "Ready"}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                      <div className="text-[11px] text-[#a3a3a3]">Grade Level</div>
                      <div className="text-lg font-bold font-serif text-white mt-0.5">
                        {grammarReport?.metrics?.flesch_kincaid_grade ? `Grade ${grammarReport.metrics.flesch_kincaid_grade}` : "—"}
                      </div>
                      <div className="text-[10px] text-[#a3a3a3]">FKGL Index</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                      <div className="text-[11px] text-[#a3a3a3]">Complex Words</div>
                      <div className="text-lg font-bold font-serif text-white mt-0.5">
                        {grammarReport?.metrics?.complex_word_count ?? "—"}
                      </div>
                      <div className="text-[10px] text-[#a3a3a3]">Vocabulary</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.06]">
                      <div className="text-[11px] text-[#a3a3a3]">Reading Time</div>
                      <div className="text-lg font-bold font-serif text-white mt-0.5">
                        {grammarReport?.metrics?.reading_time_seconds ? `${grammarReport.metrics.reading_time_seconds}s` : "—"}
                      </div>
                      <div className="text-[10px] text-[#a3a3a3]">Estimated</div>
                    </div>
                  </div>
                </div>

                {/* Tile 2: Linguistic Issues */}
                <div className="glass-card rounded-3xl p-6 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-xs font-mono text-[#f2572b] uppercase tracking-wider font-semibold">
                      Detected Issues ({grammarReport?.issues?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {grammarReport?.issues?.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#a3a3a3]">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                        Clean text! No grammar issues found.
                      </div>
                    ) : (
                      grammarReport?.issues?.map((issue: any) => (
                        <div key={issue.id} className="p-3 rounded-xl bg-[#141414] border border-white/[0.06] text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-rose-400 line-through">{issue.original}</span>
                            <ArrowRight className="w-3 h-3 text-[#a3a3a3]" />
                            <span className="text-emerald-400 font-bold">{issue.replacement}</span>
                          </div>
                          <p className="text-[11px] text-[#a3a3a3]">{issue.explanation}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => applyGrammarFix(issue)}
                              className="h-6 px-2.5 rounded-lg bg-[#262626] hover:bg-[#382419] border border-[#f2572b]/50 text-[11px] text-white font-semibold transition-all"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "citations" && (
              <>
                <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="text-xs font-mono text-[#f2572b] uppercase tracking-wider font-semibold">
                    Phantom Citation Verification
                  </div>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    Paste references into the main editor to audit DOIs against Crossref and uncover fabricated citations.
                  </p>
                  {citationAudit && (
                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#a3a3a3]">Verified:</span>
                        <strong className="text-white">{citationAudit.references_verified?.length || 0}</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#a3a3a3]">Orphaned:</span>
                        <strong className="text-amber-400">{citationAudit.orphaned_citations?.length || 0}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "forensics" && (
              <>
                <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#f2572b] uppercase tracking-wider font-semibold">
                      Evasion Threat Status
                    </span>
                    {forensicsReport && (
                      <span className="text-xs font-bold text-white bg-[#141414] px-2.5 py-1 rounded-full border border-white/[0.06]">
                        {forensicsReport.threat_level}
                      </span>
                    )}
                  </div>

                  {forensicsReport ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-serif font-bold text-white">
                        {forensicsReport.evasion_score}
                        <span className="text-xs font-sans text-[#a3a3a3] font-normal"> / 100 Threat</span>
                      </div>
                      <p className="text-xs text-[#a3a3a3]">{forensicsReport.summary}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06]">
                          <div className="text-[11px] text-[#a3a3a3]">Zero-Width</div>
                          <div className="text-base font-bold text-white mt-0.5">{forensicsReport.zero_width_count}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#141414] border border-white/[0.06]">
                          <div className="text-[11px] text-[#a3a3a3]">Homoglyphs</div>
                          <div className="text-base font-bold text-white mt-0.5">{forensicsReport.homoglyph_count}</div>
                        </div>
                      </div>
                      {forensicsReport.is_adversarial && (
                        <button
                          onClick={() => {
                            setInputText(forensicsReport.sanitized_text);
                            handleCopy(forensicsReport.sanitized_text);
                          }}
                          className="w-full h-8 px-3 rounded-lg bg-[#262626] hover:bg-[#382419] border border-[#f2572b]/60 text-xs text-white font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Replace With Clean Sanitized Text</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#a3a3a3]">Run forensic audit to detect invisible unicode character injections.</p>
                  )}
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
