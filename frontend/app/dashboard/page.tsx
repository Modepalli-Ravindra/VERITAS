"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FileText, Code2, Upload, ArrowRight, Loader2, 
  LogOut, ShieldCheck, Database, Check, Clock, User 
} from "lucide-react";
import JuicyLoader from "@/components/JuicyLoader";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"text" | "code">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState("");

  const [searchAcademic, setSearchAcademic] = useState(true);
  const [searchWeb, setSearchWeb] = useState(true);
  const [searchRepository, setSearchRepository] = useState(true);
  const [searchGithub, setSearchGithub] = useState(true);

  // DrillBit-Inspired Configurable Exclusions
  const [excludeBibliography, setExcludeBibliography] = useState(true);
  const [excludeQuotes, setExcludeQuotes] = useState(true);
  const [excludeSmallMatches, setExcludeSmallMatches] = useState(true);

  // Protected Route Check
  useEffect(() => {
    const stored = localStorage.getItem("veritas_user");
    const token = localStorage.getItem("veritas_token");
    if (!stored || !token) {
      router.replace("/login");
      return;
    }
    try {
      setCurrentUser(JSON.parse(stored));
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("veritas_user");
    localStorage.removeItem("veritas_token");
    router.push("/login");
  };

  const loadSample = (type: "academic" | "ai_essay" | "code_clone") => {
    if (type === "academic") {
      setActiveTab("text");
      setTitle("Attention Is All You Need (Vaswani et al.)");
      setContent(`The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.`);
    } else if (type === "ai_essay") {
      setActiveTab("text");
      setTitle("Healthcare AI Transformation (Essay)");
      setContent(`Artificial intelligence is undeniably revolutionizing modern healthcare. To delve deeper into this multifaceted paradigm, one must recognize how machine learning models facilitate seamless diagnostic precision. Furthermore, the tapestry of healthcare operations is enriched by predictive analytics, which serves as a testament to human ingenuity. Moreover, it is crucial to understand that AI does not replace clinicians, but rather fosters an environment of heightened efficiency and patient care.`);
    } else if (type === "code_clone") {
      setActiveTab("code");
      setCodeLanguage("python");
      setTitle("quicksort_parameterized.py");
      setContent(`def quicksort_custom(my_list):
    if len(my_list) <= 1:
        return my_list
    center_element = my_list[len(my_list) // 2]
    smaller_elements = [item for item in my_list if item < center_element]
    equal_elements = [item for item in my_list if item == center_element]
    greater_elements = [item for item in my_list if item > center_element]
    return quicksort_custom(smaller_elements) + equal_elements + quicksort_custom(greater_elements)`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    setIsScanning(true);
    setStatusText(`Reading ${file.name} and processing text...`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);

    try {
      const res = await fetch("/api/scan/file", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Scan execution failed");
      const data = await res.json();
      router.push(`/report/${data.id}`);
    } catch (err: any) {
      alert("Error scanning file: " + err.message);
      setIsScanning(false);
    }
  };

  const handleStartScan = async () => {
    if (!content.trim()) {
      alert("Please provide manuscript text or source code to audit.");
      return;
    }

    setIsScanning(true);
    setStatusText(
      activeTab === "text"
        ? "Auditing manuscript across literature databases and analyzing writing rhythm..."
        : "Auditing source code structure and checking repository assignment records..."
    );

    try {
      const endpoint = activeTab === "text" ? "/api/scan/text" : "/api/scan/code";
      const payload = activeTab === "text"
        ? {
            title: title || "Untitled Manuscript",
            content: content,
            search_academic: searchAcademic,
            search_web: searchWeb,
            search_repository: searchRepository,
            exclude_bibliography: excludeBibliography,
            exclude_quotes: excludeQuotes,
            exclude_small_matches: excludeSmallMatches,
          }
        : {
            title: title || "Untitled Source File",
            code: content,
            language: codeLanguage,
            search_github: searchGithub,
            search_repository: searchRepository,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Scan request rejected by local engine");
      }

      const data = await res.json();
      router.push(`/report/${data.id}`);
    } catch (err: any) {
      alert("Scan failed: " + err.message);
      setIsScanning(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split("\n").length;
  const charCount = content.length;

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#171717] text-white">
      
      {/* Session Metadata Toolbar - Glassmorphic Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-center justify-center text-[#f2572b] font-serif font-bold text-sm shadow-sm">
            {currentUser?.name ? currentUser.name.charAt(0) : "V"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">
                {currentUser?.name || "Auditor"}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[#f2572b]">
                {currentUser?.role || "Researcher"}
              </span>
            </div>
            <span className="text-[11px] text-[#a3a3a3]">
              {currentUser?.institution || "Institutional Seat"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#a3a3a3]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span>Local Vault: Ready</span>
          </div>
          <span>•</span>
          <button
            onClick={handleLogout}
            className="text-[#a3a3a3] hover:text-[#f2572b] transition-colors flex items-center gap-1.5 font-sans"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* SMART BENTO GRID FOR WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* BENTO TILE 1: Main Analysis Editor (8 cols) - Glassmorphism */}
        <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 sm:p-7">
          
          {/* Workspace Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4E3424]/60 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "text"
                    ? "bg-[#140E0A]/90 backdrop-blur-md text-[#F5EFE1] border border-[#A88462]/60 shadow-sm"
                    : "text-[#A88462] hover:text-[#F5EFE1] hover:bg-white/[0.04]"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Academic Paper &amp; Text</span>
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-[#140E0A]/90 backdrop-blur-md text-[#F5EFE1] border border-[#A88462]/60 shadow-sm"
                    : "text-[#A88462] hover:text-[#F5EFE1] hover:bg-white/[0.04]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Source Code Logic</span>
              </button>
            </div>

            {activeTab === "code" && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#A88462]">Language:</span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-[#140E0A]/80 border border-[#4E3424] rounded-lg px-2.5 py-1 text-xs text-[#F5EFE1] outline-none"
                >
                  <option value="python">Python 3.x</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="java">Java 17+</option>
                  <option value="cpp">C / C++</option>
                  <option value="go">Golang</option>
                </select>
              </div>
            )}
          </div>

          {/* Title Input & File Upload */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              placeholder={activeTab === "text" ? "Document Title / Manuscript Header" : "Source Code Unit Name (e.g. quicksort.py)"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-[#F5EFE1] placeholder:text-[#6E6359] focus:outline-none font-sans"
            />

            <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#4E3424]/70 glass-card hover:bg-white/[0.06] text-xs font-medium text-[#A88462] hover:text-[#F5EFE1] cursor-pointer transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>Import (.pdf, .docx, .py)</span>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf,.docx,.py,.js,.ts,.java,.cpp,.c,.go"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Text Editor Container with Frosted Glassmorphism */}
          <div className="relative border border-[#4E3424]/70 rounded-2xl glass-input overflow-hidden">
            <textarea
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                activeTab === "text"
                  ? "Paste manuscript, article text, student essay, or research excerpt to begin verification..."
                  : "Paste source code to detect identical functions, structure copies, and renamed variables..."
              }
              className={`w-full bg-transparent p-4 text-xs text-[#F5EFE1] placeholder:text-[#6E6359] focus:outline-none resize-y ${
                activeTab === "code" ? "font-mono leading-relaxed" : "font-sans leading-relaxed"
              }`}
            />

            {/* Editor Telemetry Bar */}
            <div className="border-t border-[#4E3424]/50 bg-[#1e130c]/70 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-[#A88462]">
              <div className="flex items-center gap-4">
                <span>Words: <strong className="text-[#F5EFE1] tabular-nums">{wordCount}</strong></span>
                <span>Lines: <strong className="text-[#F5EFE1] tabular-nums">{lineCount}</strong></span>
                <span>Characters: <strong className="text-[#F5EFE1] tabular-nums">{charCount}</strong></span>
              </div>
              <span>UTF-8 Document</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-[#A88462]">
              Full confidentiality: Audit runs locally on machine.
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning || !content.trim()}
              className="px-7 py-3 rounded-full btn-juicy disabled:opacity-40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#f2572b]/25"
            >
              {isScanning ? (
                <>
                  <JuicyLoader size="sm" />
                  <span>Auditing Submission...</span>
                </>
              ) : (
                <>
                  <span>Execute Verification Audit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </>
              )}
            </button>
          </div>

          {isScanning && (
            <div className="p-3 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3 text-xs text-[#a3a3a3] font-sans">
              <JuicyLoader size="sm" />
              <span>{statusText}</span>
            </div>
          )}

        </div>

        {/* BENTO SIDEBAR: Configuration & Presets (4 cols) - Glassmorphism */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Bento Tile 2: Cross-Check Repositories */}
          <div className="glass-card rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#B08D57]">
              <ShieldCheck className="w-4 h-4" />
              <span>CROSS-CHECK CONFIGURATION</span>
            </div>

            <div className="space-y-3 text-xs font-sans text-[#F5EFE1]">
              {activeTab === "text" ? (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchAcademic}
                      onChange={(e) => setSearchAcademic(e.target.checked)}
                      className="accent-[#B08D57] rounded"
                    />
                    <span>Scientific Papers &amp; Journals</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchWeb}
                      onChange={(e) => setSearchWeb(e.target.checked)}
                      className="accent-[#B08D57] rounded"
                    />
                    <span>Published Articles &amp; Books</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchRepository}
                      onChange={(e) => setSearchRepository(e.target.checked)}
                      className="accent-[#B08D57] rounded"
                    />
                    <span>Past Institutional Submissions</span>
                  </label>

                  <div className="pt-2 border-t border-[#4E3424]/60 space-y-2">
                    <span className="text-[10px] font-mono text-[#B08D57] uppercase block tracking-wider font-semibold">
                      DrillBit Exclusion Filters:
                    </span>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] text-[#D9C7A3]">
                      <input
                        type="checkbox"
                        checked={excludeBibliography}
                        onChange={(e) => setExcludeBibliography(e.target.checked)}
                        className="accent-[#B08D57] rounded"
                      />
                      <span>Exclude Bibliography / References</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] text-[#D9C7A3]">
                      <input
                        type="checkbox"
                        checked={excludeQuotes}
                        onChange={(e) => setExcludeQuotes(e.target.checked)}
                        className="accent-[#B08D57] rounded"
                      />
                      <span>Exclude Quoted Expressions (&quot;...&quot;)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] text-[#D9C7A3]">
                      <input
                        type="checkbox"
                        checked={excludeSmallMatches}
                        onChange={(e) => setExcludeSmallMatches(e.target.checked)}
                        className="accent-[#B08D57] rounded"
                      />
                      <span>Exclude Small Matches (&lt; 8 Words)</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchGithub}
                      onChange={(e) => setSearchGithub(e.target.checked)}
                      className="accent-[#B08D57] rounded"
                    />
                    <span>Renamed Variable &amp; Logic Match</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchRepository}
                      onChange={(e) => setSearchRepository(e.target.checked)}
                      className="accent-[#B08D57] rounded"
                    />
                    <span>Class Assignment Archive</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Bento Tile 3: Sample Presets */}
          <div className="glass-card rounded-3xl p-6 space-y-3 shadow-xl">
            <span className="text-xs font-mono text-[#B08D57] block">QUICK LOAD SAMPLE:</span>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => loadSample("academic")}
                className="w-full text-left p-2.5 rounded-xl bg-[#140E0A]/70 backdrop-blur-md border border-[#4E3424]/60 hover:border-[#B08D57] text-[#F5EFE1] transition-colors"
              >
                1. Vaswani et al. Academic Excerpt
              </button>
              <button
                onClick={() => loadSample("ai_essay")}
                className="w-full text-left p-2.5 rounded-xl bg-[#140E0A]/70 backdrop-blur-md border border-[#4E3424]/60 hover:border-[#B08D57] text-[#F5EFE1] transition-colors"
              >
                2. AI Cadence Essay Excerpt
              </button>
              <button
                onClick={() => loadSample("code_clone")}
                className="w-full text-left p-2.5 rounded-xl bg-[#140E0A]/70 backdrop-blur-md border border-[#4E3424]/60 hover:border-[#B08D57] text-[#F5EFE1] transition-colors"
              >
                3. Quicksort Code Clone
              </button>
            </div>
          </div>

          {/* Bento Tile 4: Archive Shortcuts */}
          <div className="glass-card rounded-3xl p-6 space-y-3 shadow-xl">
            <span className="text-xs font-mono text-[#B08D57] block">QUICK NAVIGATION:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/repository"
                className="p-3 bg-[#140E0A]/70 backdrop-blur-md border border-[#4E3424]/60 rounded-xl hover:border-[#B08D57] text-[#F5EFE1] flex flex-col gap-1 transition-colors"
              >
                <Database className="w-4 h-4 text-[#B08D57]" />
                <span className="font-medium">Vault Archive</span>
              </Link>
              <Link
                href="/history"
                className="p-3 bg-[#140E0A]/70 backdrop-blur-md border border-[#4E3424]/60 rounded-xl hover:border-[#B08D57] text-[#F5EFE1] flex flex-col gap-1 transition-colors"
              >
                <Clock className="w-4 h-4 text-[#B08D57]" />
                <span className="font-medium">Audit History</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}