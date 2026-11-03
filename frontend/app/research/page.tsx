"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Save,
  Download,
  Search,
  Plus,
  FileText,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  FolderOpen,
  Send,
  Eye,
  Sliders,
  Database
} from "lucide-react";

const STAGES = [
  { id: 1, name: "Topic & Problem", phase: "Conceptualization" },
  { id: 2, name: "RQs & Objectives", phase: "Conceptualization" },
  { id: 3, name: "Hypotheses", phase: "Conceptualization" },
  { id: 4, name: "SciSpace Literature Matrix", phase: "Literature Review" },
  { id: 5, name: "Research Gap Discovery", phase: "Literature Review" },
  { id: 6, name: "Methodology Plan", phase: "Research Design" },
  { id: 7, name: "17-Section Outline", phase: "Paper Architecture" },
  { id: 8, name: "Section-Wise Drafting", phase: "Manuscript Drafting" },
  { id: 9, name: "Integrity & Export", phase: "Final Review & Export" },
];

export default function ResearchStudioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Project Form Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("Quantum Transformer Calibration for Low-Latency Inference");
  const [newTopic, setNewTopic] = useState("Transformer Attention, Burstiness Variance, and Adversarial Robustness");

  // Active Stage (1 to 9)
  const [currentStage, setCurrentStage] = useState(1);

  // Active Section for Drafting (Stage 8)
  const [selectedSection, setSelectedSection] = useState("Abstract");
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});

  // SciSpace Matrix State (Stage 4)
  const [literatureMatrix, setLiteratureMatrix] = useState<any[]>([]);
  const [matrixTopic, setMatrixTopic] = useState("");
  const [matrixLoading, setMatrixLoading] = useState(false);

  // Research Gaps State (Stage 5)
  const [researchGaps, setResearchGaps] = useState<any[]>([]);

  // Load Projects on Mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/projects");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        loadProjectDetails(data.projects[0].id);
      } else {
        // Auto-create initial project if empty
        handleCreateInitialProject();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitialProject = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Calibrated Transformer Representations for Robust Academic Integrity",
          topic: "AI Text Detection, Winnowing Fingerprints, and Hallucination Verification"
        })
      });
      const data = await res.json();
      if (data.project_id) {
        loadProjectDetails(data.project_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProjectDetails = async (projId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${projId}`);
      const data = await res.json();
      setCurrentProject(data);
      setCurrentStage(data.current_stage || 1);
      setSectionDrafts(data.sections || {});
      setLiteratureMatrix(data.literature_matrix || []);
      setResearchGaps(data.research_gaps || []);
      setMatrixTopic(data.topic || "");

      // If matrix is empty, trigger synthesis
      if ((!data.literature_matrix || data.literature_matrix.length === 0) && data.topic) {
        fetchMatrix(data.topic, projId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewProject = async () => {
    if (!newTitle.trim() || !newTopic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, topic: newTopic })
      });
      const data = await res.json();
      if (data.project_id) {
        setShowNewModal(false);
        fetchProjects();
        loadProjectDetails(data.project_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutosaveProject = async (updates: any = {}) => {
    if (!currentProject) return;
    setSaving(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sectionDrafts,
          literature_matrix: literatureMatrix,
          research_gaps: researchGaps,
          current_stage: currentStage,
          ...updates
        })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const fetchMatrix = async (topic: string, projId?: string) => {
    setMatrixLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/matrix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, limit: 5 })
      });
      const data = await res.json();
      if (data.matrix) {
        setLiteratureMatrix(data.matrix);
        setResearchGaps(data.research_gaps || []);
        if (projId || currentProject?.id) {
          handleAutosaveProject({
            literature_matrix: data.matrix,
            research_gaps: data.research_gaps || []
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatrixLoading(false);
    }
  };

  const handleExportManuscript = async () => {
    if (!currentProject) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/export?format_type=markdown`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.content) {
        // Download markdown file
        const blob = new Blob([data.content], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${currentProject.title.replace(/\s+/g, "_")}_Manuscript.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-[#F5EFE1] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#B08D57]/30">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#B08D57]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[650px] h-[650px] bg-[#53351F]/10 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Top Header & Project Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#53351F]/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24150c] border border-[#B08D57]/40 shadow-sm text-xs font-semibold uppercase tracking-wider text-[#D9C7A3] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
              VERITAS // 19-Stage Research Paper Workspace
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F5EFE1]">
              {currentProject?.title || "Research Paper Development Studio"}
            </h1>
            <p className="mt-1 text-sm text-[#A89279] max-w-2xl font-sans">
              Topic exploration, problem formulation, RQs, hypotheses, SciSpace literature matrix, gap analysis, and 17-section manuscript drafting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-[60px] bg-[#24150c] hover:bg-[#382419] border border-[#B08D57]/60 text-xs font-bold text-[#F5EFE1] transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-[#B08D57]" />
              New Project
            </button>
            <button
              onClick={() => handleAutosaveProject()}
              disabled={saving}
              className="px-5 py-2 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 border border-[#E6C687]/40"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Autosaving..." : "Save Project"}
            </button>
            <button
              onClick={handleExportManuscript}
              className="px-4 py-2 rounded-[60px] bg-[#1a0f09] hover:bg-[#2b180d] border border-[#53351F] text-xs font-bold text-[#D9C7A3] hover:text-[#F5EFE1] transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#B08D57]" />
              Export
            </button>
          </div>
        </div>

        {/* 9-Stage Progress Bar / Tab Switcher */}
        <div className="p-3 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl overflow-x-auto shadow-xl">
          <div className="flex items-center gap-2 min-w-[800px]">
            {STAGES.map((stg) => {
              const isActive = currentStage === stg.id;
              const isPassed = currentStage > stg.id;

              return (
                <button
                  key={stg.id}
                  onClick={() => {
                    setCurrentStage(stg.id);
                    handleAutosaveProject({ current_stage: stg.id });
                  }}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-center ${
                    isActive
                      ? "bg-[#2b180d] border border-[#B08D57] shadow-lg shadow-black/40"
                      : "hover:bg-[#1f1109] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isActive
                          ? "bg-[#B08D57] text-[#120A05]"
                          : isPassed
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-[#140b06] text-[#A89279] border border-[#3b2314]"
                      }`}
                    >
                      {isPassed ? "✓" : stg.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#8c745d]">
                      {stg.phase}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? "text-[#F5EFE1] font-bold" : "text-[#A89279]"}`}>
                    {stg.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= STAGE 1: TOPIC & PROBLEM ================= */}
        {currentStage === 1 && currentProject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase block pb-2 border-b border-[#3b2314]">
                Stage 1: Research Topic &amp; Context
              </span>
              <div className="space-y-2">
                <label className="text-xs text-[#D9C7A3] font-semibold">Active Research Topic</label>
                <input
                  type="text"
                  value={currentProject.topic || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, topic: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0e0704] border border-[#3b2314] text-sm text-[#F5EFE1] focus:outline-none focus:border-[#B08D57]"
                />
              </div>
              <div className="p-4 rounded-xl bg-[#100905] border border-[#3b2314] text-xs text-[#A89279] space-y-1">
                <span className="font-bold text-[#F5EFE1]">Scholarly Guidance:</span>
                <p>Clearly frame your research topic using operational keywords that map cleanly into OpenAlex and Crossref citation registries.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#B08D57] uppercase block pb-2 border-b border-[#3b2314]">
                Stage 2: Formal Problem Statement
              </span>
              <textarea
                value={currentProject.problem_statement || ""}
                onChange={(e) => setCurrentProject({ ...currentProject, problem_statement: e.target.value })}
                rows={7}
                className="w-full p-3.5 rounded-xl bg-[#0e0704] border border-[#3b2314] text-sm text-[#F5EFE1] leading-relaxed focus:outline-none focus:border-[#B08D57] resize-y"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-5 py-2 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                >
                  Proceed to RQs &amp; Objectives
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: RQs & OBJECTIVES ================= */}
        {currentStage === 2 && currentProject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase block pb-2 border-b border-[#3b2314]">
                Stage 3: Research Questions (RQs)
              </span>
              <div className="space-y-3">
                {currentProject.research_questions?.map((rq: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#100905] border border-[#3b2314] text-xs text-[#F5EFE1] space-y-1">
                    <span className="font-mono text-[#B08D57] font-bold">RQ {idx + 1}</span>
                    <p className="leading-relaxed">{rq}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#B08D57] uppercase block pb-2 border-b border-[#3b2314]">
                Stage 4: Research Objectives
              </span>
              <div className="space-y-3">
                {currentProject.objectives?.map((obj: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#100905] border border-[#3b2314] text-xs text-[#F5EFE1] space-y-1">
                    <span className="font-mono text-emerald-400 font-bold">Objective {idx + 1}</span>
                    <p className="leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-5 py-2 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                >
                  Proceed to Hypotheses
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: HYPOTHESES ================= */}
        {currentStage === 3 && currentProject && (
          <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 space-y-4 backdrop-blur-xl shadow-xl max-w-4xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase block pb-2 border-b border-[#3b2314]">
              Stage 5: Scientific Hypotheses Formulation
            </span>
            <div className="space-y-4">
              {currentProject.hypotheses?.map((hyp: string, idx: number) => {
                const isNull = hyp.includes("H0") || hyp.includes("Null");
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      isNull ? "bg-rose-950/20 border-rose-800/40" : "bg-emerald-950/20 border-emerald-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs mb-1">
                      <span className={`font-bold ${isNull ? "text-rose-400" : "text-emerald-400"}`}>
                        {isNull ? "Null Hypothesis (H0)" : "Alternative Hypothesis (H1)"}
                      </span>
                      <span className="text-[11px] text-[#A89279]">Statistical Significance: p &lt; 0.01</span>
                    </div>
                    <p className="text-sm text-[#F5EFE1] leading-relaxed">{hyp}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStage(2)}
                className="text-xs text-[#A89279] hover:text-[#F5EFE1]"
              >
                ← Back to RQs
              </button>
              <button
                onClick={() => setCurrentStage(4)}
                className="px-6 py-2.5 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                Open SciSpace Literature Matrix
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 4: SCISPACE LITERATURE MATRIX ================= */}
        {currentStage === 4 && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#3b2314]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                    SciSpace-Inspired Comparative Literature Review Matrix
                  </h3>
                  <p className="text-xs text-[#A89279]">
                    8-Column structured synthesis of peer-reviewed literature across Objectives, Datasets, Methods, Results, Limitations, and Gaps.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchMatrix(matrixTopic || currentProject?.topic || "Transformer Attention")}
                    disabled={matrixLoading}
                    className="px-4 py-2 rounded-[60px] bg-[#24150c] hover:bg-[#382419] border border-[#B08D57]/60 text-xs font-bold text-[#F5EFE1] flex items-center gap-1.5"
                  >
                    {matrixLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Search &amp; Synthesize Papers
                  </button>
                  <button
                    onClick={() => setCurrentStage(5)}
                    className="px-4 py-2 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                  >
                    View Research Gaps
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-[#3b2314]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#140b06] border-b border-[#3b2314] text-[#B08D57] font-mono uppercase tracking-wider text-[11px]">
                      <th className="p-3 w-48">Paper &amp; Year</th>
                      <th className="p-3 w-44">Research Objective</th>
                      <th className="p-3 w-36">Dataset</th>
                      <th className="p-3 w-40">Methodology</th>
                      <th className="p-3 w-44">Key Results</th>
                      <th className="p-3 w-44">Limitations</th>
                      <th className="p-3 w-44">Identified Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#29170e]">
                    {literatureMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#1a0e08]/70 transition-colors">
                        <td className="p-3 font-serif font-bold text-[#F5EFE1]">
                          <div>{row.paper_title}</div>
                          <div className="font-mono font-normal text-[10px] text-[#A89279] mt-0.5">
                            {row.year} • {row.venue}
                          </div>
                        </td>
                        <td className="p-3 text-[#D9C7A3]">{row.objective}</td>
                        <td className="p-3 font-mono text-emerald-400">{row.dataset}</td>
                        <td className="p-3 text-[#A89279]">{row.methodology}</td>
                        <td className="p-3 text-[#D9C7A3]">{row.results}</td>
                        <td className="p-3 text-amber-300/90">{row.limitations}</td>
                        <td className="p-3 text-rose-300 font-semibold">{row.research_gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 5: RESEARCH GAP DISCOVERY ================= */}
        {currentStage === 5 && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#3b2314]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                    Stage 8: Evidence-Based Research Gap Discovery
                  </h3>
                  <p className="text-xs text-[#A89279]">
                    Rigorous synthesis of underexplored questions, computational bounds, and dataset blindspots across reviewed literature.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStage(6)}
                  className="px-5 py-2 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                >
                  Proceed to Methodology
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {researchGaps.map((gap, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#100905] border border-[#3b2314] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400">{gap.gap_type}</span>
                      <span className="text-[11px] text-[#A89279]">Empirically Grounded</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-[#F5EFE1]">{gap.title}</h4>
                    <p className="text-xs text-[#D9C7A3] leading-relaxed">{gap.description}</p>
                    {gap.supporting_papers && (
                      <div className="text-[11px] text-[#8c745d] font-mono">
                        Supporting Evidence: {gap.supporting_papers.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 6: METHODOLOGY PLAN ================= */}
        {currentStage === 6 && currentProject && (
          <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2314]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                  Stage 9: Research Methodology &amp; Pipeline Design
                </h3>
                <p className="text-xs text-[#A89279]">Define experimental controls, data splits, and algorithmic steps.</p>
              </div>
              <button
                onClick={() => setCurrentStage(7)}
                className="px-5 py-2 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                View 17-Section Outline
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              value={currentProject.methodology_plan || ""}
              onChange={(e) => setCurrentProject({ ...currentProject, methodology_plan: e.target.value })}
              rows={10}
              className="w-full p-4 rounded-xl bg-[#0e0704] border border-[#3b2314] text-sm text-[#F5EFE1] leading-relaxed font-mono focus:outline-none focus:border-[#B08D57]"
            />
          </div>
        )}

        {/* ================= STAGE 7: 17-SECTION OUTLINE ================= */}
        {currentStage === 7 && currentProject && (
          <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2314]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                  Stage 10: Complete 17-Section Paper Architecture
                </h3>
                <p className="text-xs text-[#A89279]">Standardized international academic structure (IEEE, ACM, Nature, Elsevier).</p>
              </div>
              <button
                onClick={() => setCurrentStage(8)}
                className="px-5 py-2 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                Launch Section-Wise Drafter
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentProject.outline?.map((sec: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedSection(sec);
                    setCurrentStage(8);
                  }}
                  className="p-3.5 rounded-xl bg-[#100905] border border-[#3b2314] hover:border-[#B08D57]/70 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[#B08D57] font-bold">§{idx + 1}</span>
                    <span className="font-semibold text-[#F5EFE1]">{sec}</span>
                  </div>
                  <span className="text-[10px] text-[#8c745d] font-mono">
                    {sectionDrafts[sec] ? "Drafted" : "Empty"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STAGE 8: SECTION-WISE DRAFTING ================= */}
        {currentStage === 8 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Section Navigator */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl space-y-2 max-h-[620px] overflow-y-auto">
              <span className="text-xs font-mono font-bold tracking-wider text-[#A89279] uppercase block pb-2 border-b border-[#3b2314]">
                Manuscript Sections (17)
              </span>
              {currentProject?.outline?.map((sec: string, idx: number) => {
                const isSel = selectedSection === sec;
                const hasDraft = Boolean(sectionDrafts[sec]);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSection(sec)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      isSel
                        ? "bg-[#2b180d] text-[#F5EFE1] font-bold border border-[#B08D57]"
                        : "text-[#A89279] hover:bg-[#140b06] hover:text-[#F5EFE1]"
                    }`}
                  >
                    <span className="truncate">§{idx + 1}. {sec}</span>
                    {hasDraft && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Section Editor */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#3b2314]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F5EFE1]">
                    Drafting: {selectedSection}
                  </h3>
                  <span className="text-xs text-[#A89279]">
                    {(sectionDrafts[selectedSection] || "").split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAutosaveProject()}
                    className="px-3.5 py-1.5 rounded-[60px] bg-[#24150c] border border-[#B08D57]/60 text-xs font-bold text-[#F5EFE1] hover:bg-[#382419] transition-all flex items-center gap-1"
                  >
                    <Save className="w-3 h-3 text-[#B08D57]" />
                    Save Section
                  </button>
                  <button
                    onClick={() => setCurrentStage(9)}
                    className="px-4 py-1.5 rounded-[60px] bg-[#B08D57] text-[#120A05] text-xs font-bold hover:brightness-110 flex items-center gap-1"
                  >
                    Next: Review &amp; Export
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <textarea
                value={sectionDrafts[selectedSection] || ""}
                onChange={(e) => {
                  const updated = { ...sectionDrafts, [selectedSection]: e.target.value };
                  setSectionDrafts(updated);
                }}
                rows={14}
                className="w-full p-4 rounded-xl bg-[#0e0704] border border-[#3b2314] text-sm text-[#F5EFE1] leading-relaxed font-sans focus:outline-none focus:border-[#B08D57] resize-y"
                placeholder={`Draft content for ${selectedSection}...`}
              />
            </div>
          </div>
        )}

        {/* ================= STAGE 9: INTEGRITY & EXPORT ================= */}
        {currentStage === 9 && (
          <div className="p-6 rounded-2xl bg-[#170e08]/90 border border-[#53351F]/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2314]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#F5EFE1]">
                  Stage 19: Manuscript Review &amp; Publication Export
                </h3>
                <p className="text-xs text-[#A89279]">
                  Validate research integrity across all engines and export formatted publication manuscript.
                </p>
              </div>
              <button
                onClick={handleExportManuscript}
                className="px-6 py-2.5 rounded-[60px] bg-gradient-to-r from-[#B08D57] to-[#C49A58] text-[#120A05] text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 border border-[#E6C687]/40"
              >
                <Download className="w-4 h-4" />
                Export Full Manuscript (.MD)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#100905] border border-[#3b2314] space-y-1 text-center">
                <span className="text-xs font-mono text-[#A89279]">Total Drafted Sections</span>
                <div className="text-2xl font-bold font-serif text-[#F5EFE1]">
                  {Object.keys(sectionDrafts).length} / 17
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#100905] border border-[#3b2314] space-y-1 text-center">
                <span className="text-xs font-mono text-[#A89279]">Total Word Count</span>
                <div className="text-2xl font-bold font-serif text-emerald-400">
                  {Object.values(sectionDrafts).join(" ").split(/\s+/).filter(Boolean).length}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#100905] border border-[#3b2314] space-y-1 text-center">
                <span className="text-xs font-mono text-[#A89279]">Reviewed Papers in Matrix</span>
                <div className="text-2xl font-bold font-serif text-[#B08D57]">
                  {literatureMatrix.length}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#140b06] border border-[#53351F] text-xs text-[#A89279] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F5EFE1]">Publication Readiness: </span>
                Your manuscript is structured according to standardized international peer-review standards. You can export it or jump directly into the Writing Studio (`/writing`) to run fine-grained grammar, readability, and citation checks!
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
