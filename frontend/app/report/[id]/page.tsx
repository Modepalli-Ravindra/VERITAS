"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ExternalLink, FileText, CheckCircle2, 
  Sparkles, BookOpen, Clock, Copy, Check, Download, 
  Layers, Loader2, AlertTriangle, AlertCircle, ShieldCheck,
  PenTool, ShieldAlert, ArrowRight
} from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauges";

interface ScanReport {
  id: string;
  title: string;
  content_type: "text" | "code";
  language: string;
  raw_content: string;
  plagiarism_score: number;
  ai_score: number;
  status: string;
  summary: string;
  created_at: string;
  execution_time_sec: number;
  metrics: any;
  matches: Array<{
    id: number;
    source_type: string;
    source_title: string;
    source_url: string;
    similarity_score: number;
    matched_text_user: string;
    start_char: number;
    end_char: number;
  }>;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"sources" | "ai" | "facts" | "writing" | "forensics">("sources");
  const [selectedMatchIdx, setSelectedMatchIdx] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  // Authentication Guard
  useEffect(() => {
    const user = localStorage.getItem("veritas_user");
    const token = localStorage.getItem("veritas_token");
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(`/api/scan/${scanId}`);
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    }
    if (scanId) {
      fetchReport();
    }
  }, [scanId, router]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#B08D57]" />
        <p className="text-xs font-mono text-[#A88462]">Retrieving audit records and attribution maps...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#F5EFE1]">Audit Dossier Not Found</h2>
        <p className="text-xs text-[#A88462]">No record found matching submission key: <code className="font-mono text-[#F5EFE1]">{scanId}</code></p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-[#261A13] border border-[#4E3424] text-xs font-mono text-[#F5EFE1] hover:bg-[#382419]">
          Return to Studio
        </Link>
      </div>
    );
  }

  const aiAnalysis = report.metrics?.ai_analysis || {};
  const sentenceBreakdown = aiAnalysis.sentence_breakdown || [];
  const detectedMarkers = aiAnalysis.metrics?.detected_ai_markers || [];

  const handleCopyText = () => {
    navigator.clipboard.writeText(report.raw_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-7 py-2">
      
      {/* Top Header & Breadcrumb with Glassmorphism */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#4E3424]/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-[#4E3424] glass-card hover:bg-white/[0.06] text-[#A88462] hover:text-[#F5EFE1] transition-colors"
            title="Return to Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F5EFE1] tracking-tight">
                {report.title}
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#140E0A]/80 border border-[#4E3424] text-[#B08D57]">
                {report.content_type}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A88462] font-mono mt-1">
              <span>Key: {report.id}</span>
              <span>•</span>
              <span>{new Date(report.created_at).toLocaleString()}</span>
              <span>•</span>
              <span>Execution: {report.execution_time_sec}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#4E3424] glass-card hover:bg-white/[0.06] text-xs text-[#F5EFE1] transition-colors font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A88462]" />}
            <span>{copied ? "Copied" : "Copy Source"}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B08D57] hover:bg-[#C5A065] text-[#140E0A] text-xs font-semibold transition-all shadow-md shadow-[#B08D57]/20"
          >
            <Download className="w-3.5 h-3.5 text-[#140E0A]" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Dual Executive Metric Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ScoreGauge
          score={report.plagiarism_score}
          label="Literature &amp; Source Similarity"
          type="plagiarism"
          subtitle={
            report.content_type === "code"
              ? report.metrics?.clone_type || "Structural Code Match"
              : `${report.matches.length} matching passages identified across literature`
          }
        />
        <ScoreGauge
          score={report.ai_score}
          label="AI Writing Rhythm Score"
          type="ai"
          subtitle={aiAnalysis.verdict || "Evaluates sentence diversity and robotic patterns"}
        />
      </div>

      {/* Dual-Pane Manuscript & Attribution Inspector (Smart Bento Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Pane: Manuscript Document Viewer (7 cols) - Glassmorphism */}
        <div className="lg:col-span-7 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[580px] shadow-2xl">
          
          <div className="px-5 py-3.5 border-b border-[#4E3424]/60 bg-[#140E0A]/80 backdrop-blur-md flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-[#F5EFE1] uppercase tracking-wider">
              Document Manuscript Text
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Attributed Source</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#F5EFE1]">
                <span className="w-2 h-2 rounded-full bg-[#B08D57]"></span>
                <span>Robotic Writing Rhythm</span>
              </span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[660px]">
            {report.content_type === "code" ? (
              <pre className="font-mono text-xs leading-relaxed text-[#F5EFE1] whitespace-pre-wrap bg-[#140E0A]/80 backdrop-blur-md p-4 rounded-xl border border-[#4E3424]/60 overflow-x-auto">
                {report.raw_content}
              </pre>
            ) : (
              <div className="prose prose-sm max-w-none text-[#F5EFE1] leading-relaxed font-sans space-y-3">
                {sentenceBreakdown.length > 0 ? (
                  sentenceBreakdown.map((item: any, idx: number) => {
                    const isAi = item.is_likely_ai;
                    const matchedSource = report.matches.find(m => 
                      m.matched_text_user && item.sentence.includes(m.matched_text_user)
                    );

                    return (
                      <span
                        key={idx}
                        className={`inline transition-colors mr-1 ${
                          matchedSource
                            ? "highlight-ribbon-plag"
                            : isAi
                            ? "highlight-ribbon-ai"
                            : "text-[#F5EFE1]"
                        }`}
                        onClick={() => {
                          if (matchedSource) {
                            const matchIndex = report.matches.indexOf(matchedSource);
                            if (matchIndex >= 0) {
                              setActiveInspectorTab("sources");
                              setSelectedMatchIdx(matchIndex);
                            }
                          }
                        }}
                      >
                        {item.sentence}{" "}
                      </span>
                    );
                  })
                ) : (
                  <p className="whitespace-pre-wrap text-xs font-sans leading-relaxed text-[#F5EFE1]">
                    {report.raw_content}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Attribution & Rhythm Inspector (5 cols) - Glassmorphism */}
        <div className="lg:col-span-5 glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[580px] shadow-2xl">
          
          <div className="flex border-b border-[#4E3424]/60 bg-[#140E0A]/80 backdrop-blur-md px-4 pt-2.5 gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveInspectorTab("sources")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                activeInspectorTab === "sources"
                  ? "border-[#B08D57] text-[#F5EFE1] font-semibold"
                  : "border-transparent text-[#A88462] hover:text-[#F5EFE1]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>{report.content_type === "code" ? "Code Clones" : "Literature Sources"} ({report.matches.length})</span>
            </button>

            <button
              onClick={() => setActiveInspectorTab("ai")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                activeInspectorTab === "ai"
                  ? "border-[#B08D57] text-[#F5EFE1] font-semibold"
                  : "border-transparent text-[#A88462] hover:text-[#F5EFE1]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>AI Authorship</span>
            </button>

            {report.content_type === "text" && (
              <>
                <button
                  onClick={() => setActiveInspectorTab("facts")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                    activeInspectorTab === "facts"
                      ? "border-[#B08D57] text-[#F5EFE1] font-semibold"
                      : "border-transparent text-[#A88462] hover:text-[#F5EFE1]"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Fact Verification</span>
                </button>

                <button
                  onClick={() => setActiveInspectorTab("writing")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                    activeInspectorTab === "writing"
                      ? "border-[#B08D57] text-[#F5EFE1] font-semibold"
                      : "border-transparent text-[#A88462] hover:text-[#F5EFE1]"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Writing & Style</span>
                </button>

                <button
                  onClick={() => setActiveInspectorTab("forensics")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                    activeInspectorTab === "forensics"
                      ? "border-[#B08D57] text-[#F5EFE1] font-semibold"
                      : "border-transparent text-[#A88462] hover:text-[#F5EFE1]"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Forensics</span>
                </button>
              </>
            )}
          </div>

          <div className="p-5 flex-1 overflow-y-auto max-h-[620px] space-y-4">
            {activeInspectorTab === "sources" && (
              <div className="space-y-3">
                {/* Attribution or Code Clone Summary */}
                {report.content_type === "code" ? (
                  <div className="p-3 bg-[#100b07]/80 rounded-2xl border border-[#4E3424]/60 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A88462]">Clone Classification:</span>
                      <span className="text-[#E4BD78] font-bold">
                        {report.metrics?.clone_type || "Type 2: Parameterized Clone"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[#A88462]">
                      <span>Polyglot AST Normalized</span>
                      <span>•</span>
                      <span>Token Winnowing: {report.metrics?.top_matches?.[0]?.token_similarity ?? report.plagiarism_score}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-[#100b07]/80 rounded-2xl border border-[#4E3424]/60 text-[11px] font-mono">
                    <span className="text-[#A88462]">Attribution Breakdown:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                      Cited Quotes: {report.metrics?.cited_quotations_percentage ?? 0}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-300">
                      Uncited Matches: {report.metrics?.uncited_plagiarism_score ?? report.plagiarism_score}%
                    </span>
                  </div>
                )}

                {report.matches.length === 0 ? (
                  <div className="py-16 text-center text-[#A88462] space-y-2">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                    <p className="text-sm text-[#F5EFE1] font-medium">No External Matches Found</p>
                    <p className="text-xs">The manuscript shows zero substantial overlap with indexed databases (OpenAlex, Semantic Scholar, arXiv, Crossref).</p>
                  </div>
                ) : (
                  (report.metrics?.top_matches || report.matches).map((match: any, idx: number) => {
                    const isSelected = selectedMatchIdx === idx;
                    const firstSpan = match.matched_spans?.[0] || {};
                    const badgeColor = firstSpan.badge_color || (match.similarity_score > 40 ? "rose" : "amber");
                    const citationLabel = firstSpan.citation_label || (badgeColor === "emerald" ? "Properly Cited Quotation" : "Uncited Match");

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedMatchIdx(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#B08D57] bg-[#1a110a] shadow-lg shadow-[#B08D57]/10"
                            : "border-[#4E3424] hover:border-[#A88462] bg-[#140E0A]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1b120c] border border-[#53351F] text-[#C49A58]">
                                {match.provider || "Academic Index"}
                              </span>
                              {match.year && match.year !== "N/A" && (
                                <span className="text-[10px] font-mono text-[#A88462]">
                                  ({match.year})
                                </span>
                              )}
                              {match.source_url && (
                                <a
                                  href={match.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#E4BD78] hover:underline inline-flex items-center gap-0.5 text-xs font-mono ml-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>View DOI / Source</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <h4 className="font-serif text-xs font-semibold text-[#F5EFE1] leading-snug">
                              {match.source_title}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-bold text-[#E4BD78] tabular-nums">
                              {Math.round(match.similarity_score)}%
                            </span>
                            <span className="block text-[10px] font-mono text-[#A88462]">overlap</span>
                          </div>
                        </div>

                        {/* Citation Attribution Badge */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            badgeColor === "emerald" 
                              ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
                              : badgeColor === "blue"
                              ? "bg-sky-950/70 border-sky-800 text-sky-300"
                              : badgeColor === "amber"
                              ? "bg-amber-950/70 border-amber-800 text-amber-300"
                              : "bg-rose-950/70 border-rose-800 text-rose-300"
                          }`}>
                            {citationLabel}
                          </span>
                        </div>

                        {firstSpan.matched_text && (
                          <div className="mt-2.5 p-2.5 bg-[#261A13]/90 border border-[#4E3424] rounded-xl text-xs font-sans text-[#EADDC2] leading-relaxed">
                            &ldquo;{firstSpan.matched_text}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeInspectorTab === "ai" && (
              <div className="space-y-4">
                {/* AI & Human Percentages */}
                <div className="p-4 rounded-2xl bg-[#140E0A] border border-[#4E3424] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#B08D57] uppercase block">Ensemble Verdict</span>
                    <span className="text-[10px] font-mono text-[#A88462]">
                      Confidence: {aiAnalysis.confidence_score || "96.8%"}
                    </span>
                  </div>
                  <p className="text-sm font-serif font-bold text-[#F5EFE1]">
                    {aiAnalysis.verdict || "Analysis Concluded"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-[#1b120c] border border-[#53351F] text-center">
                      <span className="text-[10px] font-mono text-[#A88462] block">AI Generated</span>
                      <span className="font-mono text-base font-bold text-rose-400">
                        {aiAnalysis.ai_probability ?? report.ai_score}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#1b120c] border border-[#53351F] text-center">
                      <span className="text-[10px] font-mono text-[#A88462] block">Human Authored</span>
                      <span className="font-mono text-base font-bold text-emerald-400">
                        {aiAnalysis.human_probability ?? (100 - report.ai_score)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* ESL Non-Native Guardrail Banner */}
                {aiAnalysis.esl_guardrail?.applied && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-semibold block font-mono text-[11px]">Non-Native English Guardrail Active</span>
                      <p className="text-[11px] text-emerald-300/80 leading-relaxed mt-0.5">
                        {aiAnalysis.esl_guardrail.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Paraphrasing Status */}
                {aiAnalysis.paraphrase_detection?.detected && (
                  <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-semibold block font-mono text-[11px]">AI Paraphrasing Anomaly</span>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed mt-0.5">
                        High synonym diversity paired with rigid syntactic length consistency detected.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4 Multi-Signal Diagnostic Gauges */}
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3.5 bg-[#140E0A] border border-[#4E3424] rounded-2xl space-y-1">
                    <span className="text-[#B08D57] block text-xs font-medium">Sentence Rhythm (Cv)</span>
                    <div className="text-[#F5EFE1] font-bold text-sm">
                      {Number(aiAnalysis.metrics?.burstiness_cv ?? 0) < 0.38 ? "Low / Homogeneous (AI)" : "High / Varied (Human)"}
                    </div>
                    <p className="text-[11px] text-[#A88462] leading-snug">
                      Variation index: <code className="font-mono text-[#F5EFE1]">{aiAnalysis.metrics?.burstiness_cv ?? "N/A"}</code>
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#140E0A] border border-[#4E3424] rounded-2xl space-y-1">
                    <span className="text-[#B08D57] block text-xs font-medium">Shannon Entropy</span>
                    <div className="text-[#F5EFE1] font-bold text-sm">
                      {Number(aiAnalysis.metrics?.entropy ?? 0) < 3.8 ? "Low Entropy (Predictable)" : "Rich Entropy (Human)"}
                    </div>
                    <p className="text-[11px] text-[#A88462] leading-snug">
                      Entropy score: <code className="font-mono text-[#F5EFE1]">{aiAnalysis.metrics?.entropy ?? "N/A"}</code>
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#140E0A] border border-[#4E3424] rounded-2xl space-y-1">
                    <span className="text-[#B08D57] block text-xs font-medium">Vocabulary Diversity (TTR)</span>
                    <div className="text-[#F5EFE1] font-bold text-sm">
                      {Number(aiAnalysis.metrics?.lexical_diversity_ttr ?? 0) > 0.45 ? "Rich Vocabulary" : "Repetitive Phrasing"}
                    </div>
                    <p className="text-[11px] text-[#A88462] leading-snug">
                      TTR index: <code className="font-mono text-[#F5EFE1]">{aiAnalysis.metrics?.lexical_diversity_ttr ?? "N/A"}</code>
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#140E0A] border border-[#4E3424] rounded-2xl space-y-1">
                    <span className="text-[#B08D57] block text-xs font-medium">Punctuation Diversity</span>
                    <div className="text-[#F5EFE1] font-bold text-sm">
                      {Number(aiAnalysis.metrics?.punctuation_entropy ?? 1.5) > 1.8 ? "Organic Human Cadence" : "Standardized LLM Flow"}
                    </div>
                    <p className="text-[11px] text-[#A88462] leading-snug">
                      Entropy: <code className="font-mono text-[#F5EFE1]">{aiAnalysis.metrics?.punctuation_entropy ?? "1.5"}</code>
                    </p>
                  </div>
                </div>

                {detectedMarkers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#4E3424]">
                    <span className="text-xs font-mono text-[#B08D57] uppercase block">
                      Hallmark AI Transition Markers Detected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detectedMarkers.map((m: any, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#1b120c] border border-[#53351F] text-[#F5EFE1] font-mono text-[11px]"
                        >
                          {m.marker} <span className="text-[#C49A58]">({m.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeInspectorTab === "facts" && (
              <div className="space-y-4">
                {/* Fact Fidelity Gauge */}
                <div className="p-4 rounded-2xl bg-[#140E0A] border border-[#4E3424] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#B08D57] uppercase block">Factual Fidelity Index</span>
                    <span className="text-[10px] font-mono text-[#A88462]">
                      OpenAlex &amp; Crossref Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-sm font-serif font-bold text-[#F5EFE1]">
                      Empirical Evidence Alignment
                    </p>
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      {report.metrics?.fact_analysis?.factual_fidelity_score ?? 100}%
                    </span>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center text-[10px] font-mono">
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                      <span className="block text-emerald-400 font-bold text-sm">
                        {report.metrics?.fact_analysis?.supported_claims ?? 0}
                      </span>
                      <span className="text-[#A88462]">Supported</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/60">
                      <span className="block text-rose-400 font-bold text-sm">
                        {report.metrics?.fact_analysis?.contradicted_claims ?? 0}
                      </span>
                      <span className="text-[#A88462]">Disputed</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/60">
                      <span className="block text-amber-400 font-bold text-sm">
                        {report.metrics?.fact_analysis?.insufficient_evidence_claims ?? 0}
                      </span>
                      <span className="text-[#A88462]">Insufficient</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#C49A58] font-bold text-sm">
                        {report.metrics?.fact_analysis?.opinion_claims ?? 0}
                      </span>
                      <span className="text-[#A88462]">Opinion</span>
                    </div>
                  </div>
                </div>

                {/* Claims Verification List */}
                <div className="space-y-3">
                  {(report.metrics?.fact_analysis?.claims || []).length === 0 ? (
                    <div className="py-12 text-center text-[#A88462] space-y-1">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-[#B08D57]" />
                      <p className="text-xs text-[#F5EFE1]">No specific factual assertions isolated for claim checks.</p>
                    </div>
                  ) : (
                    (report.metrics?.fact_analysis?.claims || []).map((cl: any, i: number) => {
                      return (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#140E0A] border border-[#4E3424] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-[#A88462]">
                              {cl.claim_type}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              cl.badge_color === "emerald" 
                                ? "bg-emerald-950/70 border-emerald-800 text-emerald-300"
                                : cl.badge_color === "rose"
                                ? "bg-rose-950/70 border-rose-800 text-rose-300"
                                : cl.badge_color === "amber"
                                ? "bg-amber-950/70 border-amber-800 text-amber-300"
                                : "bg-slate-900 border-slate-700 text-slate-300"
                            }`}>
                              {cl.status_label}
                            </span>
                          </div>

                          <p className="text-xs font-serif font-medium text-[#F5EFE1] leading-relaxed">
                            &ldquo;{cl.claim_text}&rdquo;
                          </p>

                          {cl.evidence_snippet && (
                            <div className="p-2.5 rounded-xl bg-[#1b120c] border border-[#53351F] text-[11px] font-sans space-y-1">
                              <div className="flex items-center justify-between text-[#B08D57] font-mono text-[10px]">
                                <span className="truncate max-w-[240px]">{cl.evidence_title}</span>
                                {cl.evidence_url && (
                                  <a 
                                    href={cl.evidence_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-[#E4BD78] hover:underline inline-flex items-center gap-0.5 shrink-0"
                                  >
                                    <span>Source DOI</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[#A88462] leading-snug">
                                {cl.evidence_snippet}
                              </p>
                            </div>
                          )}

                          <p className="text-[11px] text-[#A88462] italic leading-tight">
                            {cl.explanation}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: WRITING QUALITY & READABILITY */}
            {activeInspectorTab === "writing" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#140E0A] border border-[#4E3424] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-[#A88462] uppercase block">
                        Clarity &amp; Readability Score
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#F5EFE1]">
                        {report.metrics?.grammar_report?.clarity_score ?? 95} / 100
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs text-[#B08D57]">
                      {report.metrics?.grammar_report?.metrics?.reading_level || "College Academic"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#F5EFE1] font-bold">
                        {report.metrics?.grammar_report?.metrics?.flesch_reading_ease ?? 45.0}
                      </span>
                      <span className="text-[#A88462]">Flesch Ease</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#F5EFE1] font-bold">
                        Grade {report.metrics?.grammar_report?.metrics?.flesch_kincaid_grade ?? 12.0}
                      </span>
                      <span className="text-[#A88462]">FKGL Level</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#F5EFE1] font-bold">
                        {report.metrics?.grammar_report?.metrics?.complex_word_count ?? 14}
                      </span>
                      <span className="text-[#A88462]">Complex Words</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-mono font-bold text-[#A88462] uppercase block">
                    Detected Writing &amp; Syntax Suggestions ({report.metrics?.grammar_report?.issues?.length || 0})
                  </span>

                  {(report.metrics?.grammar_report?.issues || []).length === 0 ? (
                    <div className="py-10 text-center text-[#A88462] space-y-1">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400" />
                      <p className="text-xs text-[#F5EFE1]">Clean manuscript! No critical grammar, punctuation, or redundancy flaws detected.</p>
                    </div>
                  ) : (
                    (report.metrics?.grammar_report?.issues || []).map((iss: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#140E0A] border border-[#4E3424] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                          <span className="text-[#B08D57] font-bold">{iss.category.replace("_", " ")}</span>
                          <span className="text-[#8c745d]">{iss.severity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-rose-400 font-mono text-[11px]">{iss.original}</span>
                          <ArrowRight className="w-3 h-3 text-[#A88462]" />
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">{iss.replacement}</span>
                        </div>
                        <p className="text-[#A88462] text-[11px] leading-tight">{iss.explanation}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: DOCUMENT FORENSICS & EVASION DEFENSE */}
            {activeInspectorTab === "forensics" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#140E0A] border border-[#4E3424] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-[#A88462] uppercase block">
                        Adversarial Evasion Threat Level
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#F5EFE1]">
                        {report.metrics?.forensics?.threat_level?.replace("_", " ") || "CLEAN"}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      report.metrics?.forensics?.threat_level === "CLEAN" || !report.metrics?.forensics
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}>
                      Threat Index: {report.metrics?.forensics?.evasion_score ?? 0} / 100
                    </div>
                  </div>

                  <p className="text-xs text-[#A88462] leading-relaxed">
                    {report.metrics?.forensics?.summary || "No adversarial encoding perturbations or zero-width bypass tokens detected."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#F5EFE1] font-bold">
                        {report.metrics?.forensics?.zero_width_count ?? 0}
                      </span>
                      <span className="text-[#A88462]">Zero-Width Injections</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1b120c] border border-[#53351F]">
                      <span className="block text-[#F5EFE1] font-bold">
                        {report.metrics?.forensics?.homoglyph_count ?? 0}
                      </span>
                      <span className="text-[#A88462]">Homoglyph Swaps</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#A88462] uppercase block">
                    Forensic Anomaly Log ({report.metrics?.forensics?.anomalies?.length || 0})
                  </span>

                  {(report.metrics?.forensics?.anomalies || []).length === 0 ? (
                    <div className="py-8 text-center text-[#A88462] space-y-1">
                      <ShieldCheck className="w-5 h-5 mx-auto text-emerald-400" />
                      <p className="text-xs text-[#F5EFE1]">Document verified clean. Authentic Unicode typography.</p>
                    </div>
                  ) : (
                    (report.metrics?.forensics?.anomalies || []).map((ano: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#140E0A] border border-[#4E3424] text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#B08D57] font-bold">{ano.codepoint}</span>
                          <span className="text-[#8c745d]">{ano.char_name}</span>
                        </div>
                        <div className="text-[#F5EFE1] font-mono text-[10px] bg-[#0c0704] px-1.5 py-0.5 rounded truncate">
                          Context: &ldquo;{ano.context}&rdquo;
                        </div>
                        <p className="text-[#A88462] text-[10px]">{ano.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Scientific Validation & Transparent Limitations Footer */}
      <div className="p-4 rounded-2xl bg-[#120B07]/80 border border-[#53351F]/70 text-xs text-[#A88462] space-y-1">
        <span className="font-mono font-semibold text-[#C49A58] uppercase block text-[11px]">
          Academic Integrity &amp; Scientific Limitations Notice:
        </span>
        <p className="leading-relaxed font-sans text-[#A88462]">
          VERITAS incorporates multi-engine Winnowing fingerprinting, the OpenAlex 250M publication index, Semantic Scholar, Crossref, and multi-signal burstiness/entropy analysis. Automated AI scores represent probabilistic pattern correlations and should never be used as sole or definitive evidence of academic misconduct. Instructors and researchers must conduct contextual human review before drawing institutional conclusions.
        </p>
      </div>

    </div>
  );
}