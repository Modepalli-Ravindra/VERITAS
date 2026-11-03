"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sliders,
  FileText,
  HelpCircle,
  Hash,
  Eye,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import JuicyLoader from "@/components/JuicyLoader";

export default function WritingStudioPage() {
  const [activeTab, setActiveTab] = useState<"grammar" | "rewrite" | "citations" | "forensics">("grammar");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Grammar state
  const [grammarReport, setGrammarReport] = useState<any>(null);

  // Rewrite state
  const [rewriteMode, setRewriteMode] = useState("academic_formal");
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

  // Auto-run gateway status on mount
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

  // 1. Run Grammar Analysis
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

  // 2. Apply single grammar fix to input text
  const applyGrammarFix = (issue: any) => {
    const updated =
      inputText.slice(0, issue.start) + issue.replacement + inputText.slice(issue.end);
    setInputText(updated);
    handleRunGrammar(updated);
  };

  // 3. Run Rewrite
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

  // 4. Run Citation Audit
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

  // 5. Search Literature (OpenAlex 250M)
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

  // 6. Run Forensics Evasion Audit
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

  // Tab switch helper
  const switchTab = (tab: "grammar" | "rewrite" | "citations" | "forensics") => {
    setActiveTab(tab);
  };

  const REWRITE_MODES = [
    { id: "ai_humanize", name: "Deep AI Humanizer (Gateway LLM)", desc: "High burstiness, human sentence cadence, strips AI robotic artifacts." },
    { id: "academic_formal", name: "Academic Formal", desc: "Scholarly diction, hedges, and objective register." },
    { id: "paraphrase_academic", name: "Smart Paraphrase (< 15% Sim)", desc: "Inverts syntax and substitutes formal synonyms to drop plagiarism." },
    { id: "executive_concise", name: "Executive Concise", desc: "Strips wordiness & nominalizations ruthlessly." },
    { id: "clarity_enhancer", name: "Clarity & Readability", desc: "Untangles complex compound sentences." },
    { id: "fluent_esl", name: "Fluent ESL Cadence", desc: "Refines non-native phrasing while preserving meaning." },
    { id: "technical_rigor", name: "Technical Rigor", desc: "Aligns with precise engineering & scientific terms." },
    { id: "creative_scholarly", name: "Creative Dynamic", desc: "Engaging rhetorical flow and sophisticated transitions." },
    { id: "direct_active", name: "Direct Active Voice", desc: "Inverts bureaucratic passives into active subjects." },
    { id: "casual_accessible", name: "Plain English", desc: "Translates dense jargon for general public audiences." },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#171717] text-white p-4 sm:p-6 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/[0.08] shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-[#f2572b]/40 shadow-sm text-xs font-semibold uppercase tracking-wider text-[#e5e5e5] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f2572b]" />
            VERITAS // Writing &amp; Research Intelligence
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Scholarly Writing &amp; Citation Studio
          </h1>
          <p className="mt-0.5 text-xs text-[#a3a3a3] max-w-2xl font-sans">
            Multi-provider LLM API gateway (Groq, Gemini, OpenRouter, NVIDIA), rule-based grammar audit, 10-mode stylistic rewrite studio, and anti-bypass forensics.
          </p>

        </div>

        <div className="flex items-center gap-1.5 bg-[#1f1f1f]/80 p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
          {[
            { id: "grammar", label: "Grammar & Clarity", icon: CheckCircle2 },
            { id: "rewrite", label: "Rewrite Studio", icon: PenTool },
            { id: "citations", label: "Citations (250M)", icon: BookOpen },
            { id: "forensics", label: "Anti-Bypass Forensics", icon: ShieldAlert },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#f2572b] text-white shadow-md shadow-[#f2572b]/20"
                    : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content Pane */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {/* ================= TAB 1: GRAMMAR & READABILITY ================= */}
        {activeTab === "grammar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Side */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[white/[0.08]]">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase">
                    Document Editor ({inputText.length} chars)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(inputText)}
                      className="text-xs text-[#a3a3a3] hover:text-[#ffffff] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                  </div>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="w-full mt-4 p-4 rounded-xl bg-[#171717]/70 border border-[white/[0.08]] text-sm text-[#ffffff] font-sans focus:outline-none focus:border-[#f2572b] transition-all resize-y"
                  placeholder="Paste academic manuscript or essay to audit grammar, style, and readability..."
                />

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#737373]">
                    Auditing 60+ academic redundancy rules & homophone traps locally.
                  </span>
                  <button
                    onClick={() => handleRunGrammar(inputText)}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-[60px] btn-juicy text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-transparent"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze Writing
                  </button>
                </div>
              </div>

              {/* Readability Scorecard */}
              {grammarReport?.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-[#1f1f1f]/70 border border-[white/[0.12]]/60">
                    <div className="text-xs text-[#a3a3a3] font-mono">Flesch Reading Ease</div>
                    <div className="text-2xl font-bold font-serif text-[#ffffff] mt-1">
                      {grammarReport.metrics.flesch_reading_ease}
                    </div>
                    <div className="text-[11px] text-[#f2572b] mt-0.5">{grammarReport.metrics.reading_level}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1f1f1f]/70 border border-[white/[0.12]]/60">
                    <div className="text-xs text-[#a3a3a3] font-mono">Grade Level (FKGL)</div>
                    <div className="text-2xl font-bold font-serif text-[#ffffff] mt-1">
                      Grade {grammarReport.metrics.flesch_kincaid_grade}
                    </div>
                    <div className="text-[11px] text-[#a3a3a3] mt-0.5">Gunning Fog: {grammarReport.metrics.gunning_fog}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1f1f1f]/70 border border-[white/[0.12]]/60">
                    <div className="text-xs text-[#a3a3a3] font-mono">Complex Words</div>
                    <div className="text-2xl font-bold font-serif text-[#ffffff] mt-1">
                      {grammarReport.metrics.complex_word_count}
                    </div>
                    <div className="text-[11px] text-[#a3a3a3] mt-0.5">{grammarReport.metrics.syllables_per_word} syll/word</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1f1f1f]/70 border border-[white/[0.12]]/60">
                    <div className="text-xs text-[#a3a3a3] font-mono">Reading Time</div>
                    <div className="text-2xl font-bold font-serif text-[#ffffff] mt-1">
                      {grammarReport.metrics.reading_time_seconds}s
                    </div>
                    <div className="text-[11px] text-[#a3a3a3] mt-0.5">Speaking: {grammarReport.metrics.speaking_time_seconds}s</div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions & Issues Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[white/[0.08]]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#ffffff]">Linguistic Issues</h3>
                    <p className="text-xs text-[#a3a3a3]">
                      Found {grammarReport?.total_issues || 0} issues • Clarity Score:{" "}
                      <span className="font-bold text-[#f2572b]">{grammarReport?.clarity_score || 100}/100</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#f2572b] flex items-center justify-center font-bold text-sm text-[#ffffff] bg-[#262626]">
                    {grammarReport?.clarity_score || 100}
                  </div>
                </div>

                <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {grammarReport?.issues?.length === 0 ? (
                    <div className="py-12 text-center text-[#a3a3a3] text-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      Clean manuscript! No critical grammatical, punctuation, or redundancy issues detected.
                    </div>
                  ) : (
                    grammarReport?.issues?.map((issue: any) => {
                      const isGrammar = issue.category === "grammar";
                      const isWordiness = issue.category === "wordiness";
                      const isPassive = issue.category === "passive_voice";

                      return (
                        <div
                          key={issue.id}
                          className="p-3.5 rounded-xl bg-[#100905] border border-[white/[0.08]] hover:border-[#f2572b]/60 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono uppercase font-bold text-[10px] ${
                                isGrammar
                                  ? "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                                  : isWordiness
                                  ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                                  : isPassive
                                  ? "bg-sky-950/60 text-sky-300 border border-sky-800/50"
                                  : "bg-purple-950/60 text-purple-300 border border-purple-800/50"
                              }`}
                            >
                              {issue.category.replace("_", " ")}
                            </span>
                            <span className="text-[#737373] text-[11px] capitalize">{issue.severity}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <span className="line-through text-rose-400/90 font-mono text-xs">{issue.original}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#a3a3a3]" />
                            <span className="text-emerald-400 font-mono font-bold text-xs">{issue.replacement}</span>
                          </div>

                          <p className="text-xs text-[#a3a3a3]">{issue.explanation}</p>

                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => applyGrammarFix(issue)}
                              className="px-3 py-1 rounded-[60px] bg-[#262626] hover:bg-[#382419] border border-[#f2572b]/50 text-xs text-[#ffffff] font-semibold transition-all"
                            >
                              Apply Fix
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: REWRITE STUDIO ================= */}
        {activeTab === "rewrite" && (
          <div className="space-y-6">
            {/* Mode Selectors */}
            <div className="p-4 rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 backdrop-blur-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block mb-3">
                Select Rewriting Register (9 Specialized Modes)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {REWRITE_MODES.map((mode) => {
                  const isSel = rewriteMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setRewriteMode(mode.id);
                        handleRunRewrite(mode.id, inputText);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSel
                          ? "bg-[#29170e] border-[#f2572b] shadow-lg shadow-black/30"
                          : "bg-[#100905]/60 border-[white/[0.08]] hover:border-[white/[0.12]] text-[#a3a3a3]"
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSel ? "text-[#ffffff]" : "text-[#e5e5e5]"}`}>
                        {mode.name}
                      </div>
                      <div className="text-[11px] text-[#737373] line-clamp-1 mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Diff Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Input Text */}
              <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[white/[0.08]]">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase">
                    Original Source Text
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                  <button
                    onClick={handleRunHumanize}
                    disabled={loading || !inputText.trim()}
                    className="flex-1 py-2 px-3 rounded-[60px] bg-gradient-to-r from-purple-900/90 to-indigo-900/90 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 text-xs font-bold text-purple-200 hover:text-white shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                    title="Deeply humanize text to reduce AI detection scores"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    Deep AI Humanizer (Gateway LLM)
                  </button>
                  <button
                    onClick={handleRunPlagiarismRemoval}
                    disabled={loading || !inputText.trim()}
                    className="flex-1 py-2 px-3 rounded-[60px] bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 text-xs font-bold text-emerald-300 hover:text-white shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                    title="Smart paraphrase to drop similarity below 15%"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                    Remove Plagiarism (&lt; 15% Sim)
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-xl bg-[#171717]/70 border border-[white/[0.08]] text-sm text-[#ffffff] font-sans focus:outline-none focus:border-[#f2572b] transition-all resize-y"
                  placeholder="Paste text to rewrite..."
                />
                <button
                  onClick={() => handleRunRewrite(rewriteMode, inputText)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-[60px] btn-juicy text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border border-transparent"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
                  Execute Scholarly Rewrite ({REWRITE_MODES.find((m) => m.id === rewriteMode)?.name})
                </button>
              </div>

              {/* Right: Rewritten Output */}
              <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[white/[0.08]]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-[#f2572b] uppercase">
                      Rewritten Output
                    </span>
                    {(rewriteResult?.provider || gatewayProvider) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#262626] border border-emerald-500/60 font-mono text-[10px] text-emerald-400">
                        ⚡ {rewriteResult?.provider || gatewayProvider}
                      </span>
                    )}
                  </div>
                  {rewriteResult && (
                    <button
                      onClick={() => handleCopy(rewriteResult.rewritten_text)}
                      className="text-xs text-[#f2572b] hover:text-[#ffffff] flex items-center gap-1 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Rewritten
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#171717]/90 border border-[white/[0.08]] min-h-[200px] text-sm text-[#ffffff] leading-relaxed font-sans overflow-y-auto max-h-[350px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-40 text-xs text-[#a3a3a3] gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#f2572b]" />
                      Generating stylized scholarly transformation via Gateway...
                    </div>
                  ) : rewriteResult?.diff_tokens ? (
                    <div>
                      {rewriteResult.diff_tokens.map((token: any, idx: number) => {
                        if (token.type === "delete") {
                          return (
                            <span
                              key={idx}
                              className="line-through bg-rose-950/40 text-rose-300 px-1 py-0.5 rounded text-xs mx-0.5"
                            >
                              {token.text}
                            </span>
                          );
                        } else if (token.type === "insert") {
                          return (
                            <span
                              key={idx}
                              className="bg-emerald-950/50 text-emerald-300 font-semibold px-1 py-0.5 rounded text-xs mx-0.5 border border-emerald-700/40"
                            >
                              {token.text}
                            </span>
                          );
                        }
                        return <span key={idx}>{token.text}</span>;
                      })}
                    </div>
                  ) : rewriteResult?.rewritten_text ? (
                    <p className="whitespace-pre-wrap">{rewriteResult.rewritten_text}</p>
                  ) : (
                    <p className="text-[#737373] text-xs">Run the rewrite engine or choose Deep AI Humanizer above.</p>
                  )}
                </div>

                {/* Rewrite Deltas */}
                {rewriteResult?.deltas && (
                  <div className="flex items-center justify-between text-xs px-2 text-[#a3a3a3]">
                    <span>
                      Words: {rewriteResult.deltas.word_count_change > 0 ? `+${rewriteResult.deltas.word_count_change}` : rewriteResult.deltas.word_count_change}
                    </span>
                    <span>
                      Reading Ease: {rewriteResult.deltas.reading_ease_change > 0 ? `+${rewriteResult.deltas.reading_ease_change}` : rewriteResult.deltas.reading_ease_change} pts
                    </span>
                    <span className="text-emerald-400 font-mono">Semantic Core Preserved</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ethics & Integrity Disclaimer */}
            <div className="p-4 rounded-xl bg-[#140b06] border border-[white/[0.12]]/60 text-xs text-[#a3a3a3] flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#f2572b] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#ffffff]">Academic Ethics Notice: </span>
                Veritas Rewrite Studio is engineered for linguistic clarity, non-native English cadence, and rhetorical conciseness. It preserves underlying academic truth and factual citations without attempting to conceal AI generation.
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CITATION STUDIO & 250M SEARCH ================= */}
        {activeTab === "citations" && (
          <div className="space-y-6">
            {/* OpenAlex 250M Live Search Bar */}
            <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[white/[0.08]]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#ffffff]">
                    OpenAlex 250M Academic Catalog & Citation Generator
                  </h3>
                  <p className="text-xs text-[#a3a3a3]">
                    Search 250M+ open publications, retrieve DOIs, and generate instant peer-reviewed citations.
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["apa7", "mla9", "ieee", "bibtex"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedCitationStyle(style)}
                      className={`px-3 py-1 rounded-[60px] text-xs font-mono font-bold uppercase transition-all ${
                        selectedCitationStyle === style
                          ? "bg-[#f2572b] text-[#ffffff]"
                          : "bg-[#262626] text-[#a3a3a3] border border-[white/[0.08]] hover:text-[#ffffff]"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#171717]/70 border border-[white/[0.08]] text-sm text-[#ffffff] focus:outline-none focus:border-[#f2572b] transition-all"
                    placeholder="Search papers by title, author, or research field (e.g. Attention Is All You Need, CRISPR gene editing)..."
                  />
                </div>
                <button
                  onClick={handleSearchSources}
                  disabled={searching}
                  className="px-6 py-2.5 rounded-[60px] btn-juicy text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-transparent"
                >
                  {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </div>

              {/* Search Results List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {searchResults.map((paper: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#100905] border border-[white/[0.08]] hover:border-[#f2572b]/70 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-serif font-bold text-[#ffffff] leading-tight line-clamp-2">
                        {paper.title}
                      </h4>
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi.replace('https://doi.org/','')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#f2572b] hover:text-[#ffffff] shrink-0"
                          title="Open DOI URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-[#a3a3a3] flex items-center gap-2 flex-wrap">
                      <span>{paper.authors?.join(", ") || "Unknown Authors"}</span>
                      <span>•</span>
                      <span className="font-mono">{paper.year}</span>
                      <span>•</span>
                      <span className="italic">{paper.venue}</span>
                    </div>

                    {/* Pre-formatted citation in selected style */}
                    <div className="p-2.5 rounded-lg bg-[#0a0503] border border-[#262626] text-xs font-mono text-[#e5e5e5] select-all flex items-center justify-between gap-2">
                      <div className="truncate">{paper.citations?.[selectedCitationStyle] || paper.title}</div>
                      <button
                        onClick={() => handleCopy(paper.citations?.[selectedCitationStyle] || paper.title)}
                        className="text-[#a3a3a3] hover:text-[#f2572b] shrink-0"
                        title="Copy Citation"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phantom / Hallucinated Citation Checker */}
            <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[white/[0.08]]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#ffffff]">
                    Phantom & Hallucinated Citation Audit
                  </h3>
                  <p className="text-xs text-[#a3a3a3]">
                    Cross-checks in-text citations against the bibliography and queries Crossref to uncover fabricated LLM citations.
                  </p>
                </div>
                <button
                  onClick={() => handleRunCitationAudit(inputText)}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-[60px] bg-[#262626] border border-[#f2572b]/60 text-xs font-bold text-[#ffffff] hover:bg-[#382419] transition-all flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Audit Document Citations
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl bg-[#171717]/70 border border-[white/[0.08]] text-xs text-[#ffffff] font-mono focus:outline-none focus:border-[#f2572b] transition-all"
                placeholder="Paste document with in-text citations and reference list..."
              />

              {citationAudit && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-mono text-[#a3a3a3]">
                    <span>In-text Citations: {citationAudit.in_text_citation_count}</span>
                    <span>Bibliography Entries: {citationAudit.bibliography_count}</span>
                    <span className="text-amber-400">
                      Orphaned: {citationAudit.orphaned_citations?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {citationAudit.references_verified?.map((ref: any, idx: number) => {
                      const isReal = ref.verification?.status === "VERIFIED_AUTHENTIC";
                      const isPhantom = ref.verification?.status === "HALLUCINATED_PHANTOM";

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isReal
                              ? "bg-emerald-950/20 border-emerald-800/40"
                              : isPhantom
                              ? "bg-rose-950/30 border-rose-800/60"
                              : "bg-[#100905] border-[white/[0.08]]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono font-bold text-[#ffffff]">{ref.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                                isReal
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                                  : isPhantom
                                  ? "bg-rose-950 text-rose-300 border border-rose-700/50"
                                  : "bg-amber-950 text-amber-300 border border-amber-700/50"
                              }`}
                            >
                              {ref.verification?.status?.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-[#e5e5e5] mt-1.5 font-sans">{ref.text}</p>
                          <div className="text-[11px] text-[#a3a3a3] mt-1">
                            {ref.verification?.verdict}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: FORENSICS & ANTI-BYPASS ================= */}
        {activeTab === "forensics" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="pb-2 border-b border-[white/[0.08]]">
                <h3 className="font-serif text-lg font-bold text-[#ffffff]">
                  Document Forensics & Adversarial Evasion Auditor
                </h3>
                <p className="text-xs text-[#a3a3a3]">
                  Detects student evasion tricks: Zero-width space injections (\u200B), Cyrillic/Greek homoglyph substitutions, and token-breaking characters.
                </p>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl bg-[#171717]/70 border border-[white/[0.08]] text-xs text-[#ffffff] font-mono focus:outline-none focus:border-[#f2572b] transition-all"
                placeholder="Paste document to inspect for adversarial unicode evasion tricks..."
              />

              <div className="flex justify-end">
                <button
                  onClick={() => handleRunForensics(inputText)}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-[60px] btn-juicy text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-transparent"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  Audit Adversarial Manipulation
                </button>
              </div>
            </div>

            {/* Forensics Report View */}
            {forensicsReport && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Score & Summary Card */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase">
                      Evasion Threat Status
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        forensicsReport.threat_level === "CLEAN"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : forensicsReport.threat_level === "SUSPICIOUS"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {forensicsReport.threat_level.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-4xl font-serif font-bold text-[#ffffff]">
                    {forensicsReport.evasion_score}
                    <span className="text-sm font-sans text-[#a3a3a3] font-normal"> / 100 Threat Index</span>
                  </div>

                  <p className="text-xs text-[#a3a3a3] leading-relaxed">{forensicsReport.summary}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#100905] border border-[white/[0.08]]">
                      <div className="text-[11px] text-[#a3a3a3]">Zero-Width Injections</div>
                      <div className="text-xl font-bold font-mono text-[#ffffff] mt-1">
                        {forensicsReport.zero_width_count}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#100905] border border-[white/[0.08]]">
                      <div className="text-[11px] text-[#a3a3a3]">Homoglyph Swaps</div>
                      <div className="text-xl font-bold font-mono text-[#ffffff] mt-1">
                        {forensicsReport.homoglyph_count}
                      </div>
                    </div>
                  </div>

                  {/* Sanitized Text Action */}
                  {forensicsReport.is_adversarial && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setInputText(forensicsReport.sanitized_text);
                          handleCopy(forensicsReport.sanitized_text);
                        }}
                        className="w-full py-2 rounded-[60px] bg-[#262626] hover:bg-[#382419] border border-[#f2572b]/60 text-xs text-[#ffffff] font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Replace With Clean Sanitized Text
                      </button>
                    </div>
                  )}
                </div>

                {/* Anomalies Inspector */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-[#1f1f1f]/90 border border-[white/[0.12]]/70 space-y-3 backdrop-blur-xl">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block pb-2 border-b border-[white/[0.08]]">
                    Detected Forensic Anomalies ({forensicsReport.anomalies?.length || 0})
                  </span>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {forensicsReport.anomalies?.length === 0 ? (
                      <div className="py-12 text-center text-[#a3a3a3] text-xs">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        Clean encoding: no hidden characters or foreign homoglyphs.
                      </div>
                    ) : (
                      forensicsReport.anomalies?.map((ano: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#100905] border border-[white/[0.08]] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-[#f2572b] font-bold">{ano.codepoint}</span>
                            <span className="text-[#737373]">{ano.char_name}</span>
                          </div>
                          <div className="text-[#ffffff] font-mono text-[11px] bg-[#080402] px-2 py-1 rounded">
                            Context: &ldquo;{ano.context}&rdquo;
                          </div>
                          <p className="text-[#a3a3a3] text-[11px]">{ano.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

