"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Send,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  GitCompare,
  CheckSquare,
  Square,
  Split,
  ListChecks,
  Sliders,
  Scale
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Explain the core methodology and algorithmic workflow.",
  "What datasets and benchmark corpora were utilized?",
  "Extract the quantitative experimental results and accuracy scores.",
  "What limitations and threats to validity are explicitly stated?",
  "Summarize the primary contributions and future research directions."
];

const COMPARATIVE_PROMPTS = [
  "Compare the core methodologies and algorithmic formulations.",
  "Contrast evaluation datasets, benchmark corpora, and sample sizes.",
  "What are the primary conflicting findings or disagreements between these papers?",
  "Synthesize complementary research strengths and identify remaining gaps."
];

export default function ChatPdfPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // SciSpace Multi-Paper Comparison State
  const [chatMode, setChatMode] = useState<"single" | "compare">("single");
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/library");
      const data = await res.json();
      if (data.papers && data.papers.length > 0) {
        setPapers(data.papers);
        setSelectedPaper(data.papers[0]);
        // Default select first two for comparison if available
        if (data.papers.length >= 2) {
          setSelectedPaperIds([data.papers[0].id, data.papers[1].id]);
        } else {
          setSelectedPaperIds([data.papers[0].id]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/pdf/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const newPaper = {
          id: data.paper_id,
          title: data.title,
          pdf_filename: file.name
        };
        const updated = [newPaper, ...papers];
        setPapers(updated);
        setSelectedPaper(newPaper);
        setSelectedPaperIds(prev => Array.from(new Set([data.paper_id, ...prev])));
        setMessages([
          {
            role: "assistant",
            content: `Indexed "${data.title}" across ${data.total_pages} pages (${data.total_chunks} passages). Ask any question grounded directly in the PDF contents.`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSelectPaper = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPaperIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSendMessage = async (msgText = query) => {
    if (!msgText.trim()) return;

    if (chatMode === "compare") {
      handleRunComparison(msgText);
      return;
    }

    if (!selectedPaper) return;

    const userMsg = { role: "user", content: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setChatLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/pdf/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_id: selectedPaper.id,
          query: msgText
        })
      });
      const data = await res.json();

      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        grounded: data.grounded
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunComparison = async (compQuery = query) => {
    if (selectedPaperIds.length < 2) {
      alert("Please select at least 2 papers to perform SciSpace comparative analysis.");
      return;
    }
    const q = compQuery.trim() || "Compare the key methodology, findings, datasets, and limitations";
    setCompareLoading(true);
    setQuery("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/pdf/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_ids: selectedPaperIds,
          query: q
        })
      });
      const data = await res.json();
      if (data.success && data.comparison) {
        setComparisons((prev) => [data.comparison, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-[#F5EFE1] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#B08D57]/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#53351F]/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24150c] border border-[#B08D57]/40 text-xs font-semibold text-[#D9C7A3] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
              SciSpace-Grade Grounded Research Intelligence
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#F5EFE1]">
              Chat &amp; Compare Research Papers (Local RAG)
            </h1>
            <p className="text-xs text-[#A89279]">
              Ask complex questions across uploaded PDF manuscripts or perform cross-paper synthesis with verifiable page-level evidence. Zero external API cost.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center bg-[#150c07] p-1 rounded-[60px] border border-[#3b2314]">
              <button
                onClick={() => setChatMode("single")}
                className={`px-3.5 py-1.5 rounded-[60px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chatMode === "single"
                    ? "bg-[#B08D57] text-[#120A05] shadow-sm"
                    : "text-[#A89279] hover:text-[#F5EFE1]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Single Paper
              </button>
              <button
                onClick={() => setChatMode("compare")}
                className={`px-3.5 py-1.5 rounded-[60px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chatMode === "compare"
                    ? "bg-[#B08D57] text-[#120A05] shadow-sm"
                    : "text-[#A89279] hover:text-[#F5EFE1]"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Comparative Chat
              </button>
            </div>

            <label className="cursor-pointer px-4 py-2 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-[#E6C687]/40">
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? "Indexing PDF..." : "Upload PDF"}</span>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Paper Library (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2314]">
              <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase">
                Indexed Papers ({papers.length})
              </span>
              {chatMode === "compare" && (
                <span className="text-[11px] font-mono font-bold text-[#B08D57]">
                  {selectedPaperIds.length} Selected
                </span>
              )}
            </div>

            {chatMode === "compare" && (
              <div className="p-2.5 rounded-xl bg-[#120904] border border-[#B08D57]/40 text-xs text-[#D9C7A3] flex items-center justify-between">
                <span>Select 2+ papers to compare:</span>
                <button
                  onClick={() => handleRunComparison()}
                  disabled={selectedPaperIds.length < 2 || compareLoading}
                  className="px-3 py-1 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 disabled:opacity-40 flex items-center gap-1"
                >
                  {compareLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Scale className="w-3 h-3" />}
                  Compare
                </button>
              </div>
            )}

            {papers.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#A89279] space-y-2">
                <FileText className="w-8 h-8 text-[#53351F] mx-auto" />
                <p>Upload a PDF above to begin local vector indexing.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {papers.map((p) => {
                  const isSelSingle = selectedPaper?.id === p.id;
                  const isChecked = selectedPaperIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (chatMode === "compare") {
                          handleToggleSelectPaper(p.id);
                        } else {
                          setSelectedPaper(p);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        chatMode === "compare"
                          ? isChecked
                            ? "bg-[#2b180d] border-[#B08D57] shadow-lg shadow-black/30"
                            : "bg-[#100905] border-[#3b2314] hover:border-[#53351F] text-[#A89279]"
                          : isSelSingle
                          ? "bg-[#2b180d] border-[#B08D57] shadow-lg shadow-black/30"
                          : "bg-[#100905] border-[#3b2314] hover:border-[#53351F] text-[#A89279]"
                      }`}
                    >
                      {chatMode === "compare" && (
                        <div
                          onClick={(e) => handleToggleSelectPaper(p.id, e)}
                          className="pt-0.5 text-[#B08D57]"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#B08D57]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#53351F]" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h4 className={`text-xs font-serif font-bold line-clamp-2 ${
                          (chatMode === "compare" ? isChecked : isSelSingle)
                            ? "text-[#F5EFE1]"
                            : "text-[#D9C7A3]"
                        }`}>
                          {p.title}
                        </h4>
                        <div className="text-[10px] font-mono text-[#8c745d] truncate">
                          {p.pdf_filename}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Interactive Chat / Comparison Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[580px]">
            {/* Top Bar */}
            <div className="p-4 border-b border-[#3b2314] bg-[#120a06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {chatMode === "compare" ? (
                  <>
                    <GitCompare className="w-4 h-4 text-[#B08D57]" />
                    <span className="font-serif font-bold text-[#F5EFE1]">
                      Comparative Analysis ({selectedPaperIds.length} Papers Selected)
                    </span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-[#B08D57]" />
                    <span className="font-serif font-bold text-[#F5EFE1] truncate max-w-[320px]">
                      {selectedPaper?.title || "Select or Upload a Research Paper"}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Local BM25 / TF-IDF Vector RAG
              </span>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[480px]">
              {chatMode === "compare" ? (
                /* Comparative View */
                comparisons.length === 0 ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#24150c] border border-[#B08D57]/50 mx-auto flex items-center justify-center">
                      <Scale className="w-5 h-5 text-[#B08D57]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-bold text-[#F5EFE1]">
                        Cross-Manuscript Comparative Synthesis
                      </h3>
                      <p className="text-xs text-[#A89279] max-w-md mx-auto">
                        Interrogate multiple research papers simultaneously. Compare methodologies, benchmark metrics, agreements, and divergences with exact page references.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto pt-2">
                      {COMPARATIVE_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRunComparison(prompt)}
                          disabled={selectedPaperIds.length < 2 || compareLoading}
                          className="px-3 py-1.5 rounded-full bg-[#100905] hover:bg-[#2b180d] border border-[#3b2314] hover:border-[#B08D57]/60 text-xs text-[#D9C7A3] hover:text-[#F5EFE1] transition-all text-left disabled:opacity-40"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  comparisons.map((cData, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#120a06] border border-[#3b2314] space-y-4">
                      {/* Query Header */}
                      <div className="pb-3 border-b border-[#29170e]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#B08D57] block">
                          Comparative Inquiry:
                        </span>
                        <h4 className="text-sm font-serif font-bold text-[#F5EFE1] mt-0.5">
                          "{cData.query}"
                        </h4>
                      </div>

                      {/* Side-by-Side Paper Evidence Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cData.paper_results?.map((pr: any, pIdx: number) => (
                          <div key={pIdx} className="p-3.5 rounded-xl bg-[#0a0503] border border-[#3b2314] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-serif font-bold text-[#F5EFE1] truncate max-w-[200px]">
                                {pr.title}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#24150c] border border-[#B08D57]/50 font-mono text-[10px] text-[#D9C7A3]">
                                {pr.page_reference}
                              </span>
                            </div>
                            <p className="text-xs text-[#A89279] italic leading-relaxed">
                              "{pr.evidence_snippet}"
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Agreements & Divergences */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Agreements */}
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Corroborated Agreements</span>
                          </div>
                          <ul className="space-y-1 text-xs text-[#D9C7A3]">
                            {cData.agreements?.map((ag: string, aIdx: number) => (
                              <li key={aIdx} className="list-disc list-inside leading-relaxed">{ag}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Divergences */}
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Key Divergences &amp; Gaps</span>
                          </div>
                          <ul className="space-y-1 text-xs text-[#D9C7A3]">
                            {cData.divergences?.map((div: string, dIdx: number) => (
                              <li key={dIdx} className="list-disc list-inside leading-relaxed">{div}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Single Paper Chat View */
                messages.length === 0 ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#24150c] border border-[#B08D57]/50 mx-auto flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#B08D57]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-bold text-[#F5EFE1]">
                        Ask Anything About This Manuscript
                      </h3>
                      <p className="text-xs text-[#A89279] max-w-md mx-auto">
                        Click any suggested research inquiry below or type custom queries regarding methodology, datasets, or mathematical equations.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto pt-2">
                      {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-3 py-1.5 rounded-full bg-[#100905] hover:bg-[#2b180d] border border-[#3b2314] hover:border-[#B08D57]/60 text-xs text-[#D9C7A3] hover:text-[#F5EFE1] transition-all text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                            isUser
                              ? "bg-[#29170e] text-[#F5EFE1] border border-[#B08D57]/40 shadow-md font-sans"
                              : "bg-[#100905] text-[#D9C7A3] border border-[#3b2314] space-y-2 font-sans"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>

                          {/* Page-level Citation Badges */}
                          {m.citations && m.citations.length > 0 && (
                            <div className="pt-2 border-t border-[#29170e] space-y-1">
                              <span className="text-[10px] font-mono text-[#8c745d] uppercase block">
                                Source-Grounded Citations:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {m.citations.map((c: any, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    className="px-2 py-0.5 rounded-md bg-[#1d1009] border border-[#B08D57]/50 text-[10px] font-mono text-[#F5EFE1]"
                                    title={c.passage_snippet}
                                  >
                                    Page {c.page_num}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-[#120a06] border-t border-[#3b2314] flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  chatMode === "compare"
                    ? "Ask a comparative question across selected papers (e.g., contrast methodologies)..."
                    : "Ask about methodology, datasets, tables, or limitations..."
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#080402] border border-[#3b2314] text-xs text-[#F5EFE1] focus:outline-none focus:border-[#B08D57]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={chatMode === "compare" ? (compareLoading || selectedPaperIds.length < 2) : (chatLoading || !query.trim())}
                className="px-5 py-2.5 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {(chatLoading || compareLoading) ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : chatMode === "compare" ? (
                  <Scale className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{chatMode === "compare" ? "Compare" : "Send"}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
