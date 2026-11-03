"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trash2, ArrowRight, FileText, Code2, 
  Search, ExternalLink, Clock, Plus 
} from "lucide-react";

interface ScanRecord {
  id: string;
  title: string;
  content_type: "text" | "code";
  language: string;
  plagiarism_score: number;
  ai_score: number;
  status: string;
  created_at: string;
  execution_time_sec: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "code">("all");

  // Authentication Guard
  useEffect(() => {
    const user = localStorage.getItem("veritas_user");
    const token = localStorage.getItem("veritas_token");
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    fetchScans();
  }, [router]);

  const fetchScans = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch (err) {
      console.error("Failed to load audit history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to permanently delete this audit record?")) return;
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setScans(scans.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = 
      scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || scan.content_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#171717] text-white">
      
      {/* Header & New Audit CTA */}
      {/* Audit Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3 shrink-0">
        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
            Submissions Audit Ledger
          </h1>
        </div>

        <Link
          href="/dashboard"
          className="h-8 px-3 rounded-lg btn-juicy text-xs font-bold transition-all shadow-sm shadow-[#f2572b]/25 flex items-center gap-1.5 hover:brightness-110 text-white"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Audit</span>
        </Link>
      </div>

      {/* Filter and Search Bar in Glassmorphic Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title or scan key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 bg-[#141414] border border-white/10 text-xs text-white placeholder:text-[#737373] outline-none font-sans focus:border-[#f2572b]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "all"
                ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 font-semibold shadow-sm"
                : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            All ({scans.length})
          </button>
          <button
            onClick={() => setFilterType("text")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "text"
                ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 font-semibold shadow-sm"
                : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Manuscripts
          </button>
          <button
            onClick={() => setFilterType("code")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "code"
                ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 font-semibold shadow-sm"
                : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Source Code
          </button>
        </div>
      </div>

      {/* Glassmorphic Grid of Historical Audits */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#a3a3a3]">
          Loading audit ledger...
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-white/[0.08] bg-[#1a1a1a]/90">
          <Clock className="w-8 h-8 mx-auto text-[#f2572b]" />
          <p className="text-sm font-semibold text-white">No Audit Records Found</p>
          <p className="text-xs text-[#a3a3a3] max-w-md mx-auto">
            Audit manuscripts or source code files from the studio workbench to generate persistent verification dossiers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScans.map((scan) => (
            <Link
              key={scan.id}
              href={`/report/${scan.id}`}
              className="p-6 glass-card glass-card-hover rounded-3xl flex flex-col justify-between space-y-4 shadow-xl border border-white/[0.08] bg-[#1a1a1a]/90 group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/10 text-[#f2572b]">
                    {scan.content_type}
                  </span>
                  <button
                    onClick={(e) => handleDelete(scan.id, e)}
                    className="p-1.5 text-[#a3a3a3] hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-serif text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {scan.title}
                </h3>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#141414] border border-white/10 rounded-xl">
                    <span className="text-[10px] text-[#a3a3a3] block">Similarity</span>
                    <span className="font-bold text-rose-400 text-sm tabular-nums">
                      {Math.round(scan.plagiarism_score)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#141414] border border-white/10 rounded-xl">
                    <span className="text-[10px] text-[#a3a3a3] block">AI Score</span>
                    <span className="font-bold text-[#f2572b] text-sm tabular-nums">
                      {Math.round(scan.ai_score)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a3a3]">
                  <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                  <span className="text-[#f2572b] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span> &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}