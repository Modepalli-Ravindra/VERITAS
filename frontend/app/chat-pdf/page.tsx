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
  Database
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Explain the core methodology and algorithmic workflow.",
  "What datasets and benchmark corpora were utilized?",
  "Extract the quantitative experimental results and accuracy scores.",
  "What limitations and threats to validity are explicitly stated?",
  "Summarize the primary contributions and future research directions."
];

export default function ChatPdfPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

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
        setPapers([newPaper, ...papers]);
        setSelectedPaper(newPaper);
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

  const handleSendMessage = async (msgText = query) => {
    if (!msgText.trim() || !selectedPaper) return;

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-[#F5EFE1] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#B08D57]/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#53351F]/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24150c] border border-[#B08D57]/40 text-xs font-semibold text-[#D9C7A3] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
              SciSpace-Style Grounded Assistant
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#F5EFE1]">
              Chat With Research Papers (Local RAG)
            </h1>
            <p className="text-xs text-[#A89279]">
              Ask complex questions across uploaded PDF manuscripts with verifiable page-level evidence and zero external API dependencies.
            </p>
          </div>

          <label className="cursor-pointer px-5 py-2.5 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-[#E6C687]/40">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? "Indexing PDF..." : "Upload Research PDF"}</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Paper Library (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase block pb-2 border-b border-[#3b2314]">
              Indexed Research Papers ({papers.length})
            </span>

            {papers.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#A89279] space-y-2">
                <FileText className="w-8 h-8 text-[#53351F] mx-auto" />
                <p>Upload a PDF above to begin local vector indexing.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {papers.map((p) => {
                  const isSel = selectedPaper?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPaper(p)}
                      className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 ${
                        isSel
                          ? "bg-[#2b180d] border-[#B08D57] shadow-lg shadow-black/30"
                          : "bg-[#100905] border-[#3b2314] hover:border-[#53351F] text-[#A89279]"
                      }`}
                    >
                      <h4 className={`text-xs font-serif font-bold line-clamp-2 ${isSel ? "text-[#F5EFE1]" : "text-[#D9C7A3]"}`}>
                        {p.title}
                      </h4>
                      <div className="text-[10px] font-mono text-[#8c745d] truncate">
                        {p.pdf_filename}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Interactive Chat Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[560px]">
            {/* Top Bar */}
            <div className="p-4 border-b border-[#3b2314] bg-[#120a06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="w-4 h-4 text-[#B08D57]" />
                <span className="font-serif font-bold text-[#F5EFE1] truncate max-w-[320px]">
                  {selectedPaper?.title || "Select or Upload a Research Paper"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Local TF-IDF Vector RAG
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[460px]">
              {messages.length === 0 ? (
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
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-[#120a06] border-t border-[#3b2314] flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about methodology, datasets, tables, or limitations..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#080402] border border-[#3b2314] text-xs text-[#F5EFE1] focus:outline-none focus:border-[#B08D57]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !query.trim()}
                className="px-5 py-2.5 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {chatLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
