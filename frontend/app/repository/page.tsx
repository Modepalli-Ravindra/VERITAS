"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Database, UploadCloud, Plus, Trash2, FileText, Code2, 
  CheckCircle2, Search, ArrowRight, ShieldCheck, Filter 
} from "lucide-react";

interface RepoDoc {
  id: string;
  title: string;
  content_type: "text" | "code";
  language: string;
  content_length: number;
  uploaded_at: string;
}

export default function RepositoryPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<RepoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Doc Form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"text" | "code">("text");
  const [newLang, setNewLang] = useState("python");

  // Route Authentication Guard
  useEffect(() => {
    const user = localStorage.getItem("veritas_user");
    const token = localStorage.getItem("veritas_token");
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    fetchDocs();
  }, [router]);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/repository");
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error("Failed to load repo docs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please provide both document title and content.");
      return;
    }

    try {
      const res = await fetch("/api/repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          content_type: newType,
          language: newType === "code" ? newLang : "english",
        }),
      });

      if (!res.ok) throw new Error("Failed to index document");
      setNewTitle("");
      setNewContent("");
      setIsAdding(false);
      fetchDocs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);

    try {
      const res = await fetch("/api/repository/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      fetchDocs();
    } catch (err: any) {
      alert("Failed to upload archive: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this document from the local institutional index?")) return;
    try {
      await fetch(`/api/repository/${id}`, { method: "DELETE" });
      setDocs(docs.filter((d) => d.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#171717] text-white">
      
      {/* Vault Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3 shrink-0">
        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
            Institutional Archive &amp; Repository Index
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 glass-card hover:bg-white/[0.06] text-xs font-medium text-white cursor-pointer transition-colors shadow-sm">
            <UploadCloud className="w-3.5 h-3.5 text-[#f2572b]" />
            <span>Import Document</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.pdf,.docx,.py,.js,.ts,.java,.cpp"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg btn-juicy text-white text-xs font-bold transition-all shadow-sm shadow-[#f2572b]/20 hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Form - Glassmorphism */}
      {isAdding && (
        <form onSubmit={handleCreateDoc} className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-white/[0.08] bg-[#1a1a1a]/90">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-serif text-base font-semibold text-white">
              Index New Reference Document
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="text-xs bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono outline-none"
              >
                <option value="text">Academic Manuscript / Text</option>
                <option value="code">Source Code Unit</option>
              </select>

              {newType === "code" && (
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="text-xs bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono outline-none"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Document Identifier / Title (e.g. CS240 Spring 2024 Final Project Solutions)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2.5 bg-[#141414] border border-white/10 text-xs text-white placeholder:text-[#737373] outline-none font-sans focus:border-[#f2572b]"
          />

          <textarea
            rows={6}
            placeholder="Paste complete manuscript text or source code..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full glass-input rounded-xl p-4 bg-[#141414] border border-white/10 text-xs text-white placeholder:text-[#737373] outline-none font-mono focus:border-[#f2572b]"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="h-8 px-3 rounded-lg text-xs text-[#a3a3a3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-lg btn-juicy text-white text-xs font-bold shadow-sm shadow-[#f2572b]/20 hover:brightness-110"
            >
              Save &amp; Index Document
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar in Glassmorphic Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search indexed manuscripts or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 bg-[#141414] border border-white/10 text-xs text-white placeholder:text-[#737373] outline-none font-sans focus:border-[#f2572b]"
          />
        </div>

        <div className="text-xs font-mono text-[#a3a3a3]">
          Indexed Records: <strong className="text-white tabular-nums">{docs.length}</strong>
        </div>
      </div>

      {/* Glassmorphic Grid of Indexed Documents */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#a3a3a3]">
          Loading vault repository...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3 border border-white/[0.08] bg-[#1a1a1a]/90">
          <Database className="w-8 h-8 mx-auto text-[#f2572b]" />
          <p className="text-sm font-semibold text-white">No Indexed Documents Found</p>
          <p className="text-xs text-[#a3a3a3] max-w-md mx-auto">
            Add sample student assignments, publications, or code repositories to enable localized cross-check comparisons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-6 glass-card glass-card-hover rounded-3xl flex flex-col justify-between space-y-4 shadow-xl border border-white/[0.08] bg-[#1a1a1a]/90 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#141414] border border-white/10 text-[#f2572b]">
                    {doc.content_type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-[#a3a3a3] hover:text-rose-400 rounded-lg transition-colors"
                    title="Remove from index"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-serif text-base font-bold text-white leading-snug line-clamp-2">
                  {doc.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#a3a3a3]">
                <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                <span>{doc.content_length} chars</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}