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
  Database,
  ExternalLink,
  Users,
  Trash2,
  CheckSquare,
  Code,
  Image as ImageIcon
} from "lucide-react";
import JuicyLoader from "@/components/JuicyLoader";

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
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");

  // Active Stage (1 to 9)
  const [currentStage, setCurrentStage] = useState(1);

  // Active Section for Drafting (Stage 8)
  const [selectedSection, setSelectedSection] = useState("Abstract");
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, string>>({});
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftProvider, setDraftProvider] = useState("");

  // Autonomous Full-Paper Generation & Overleaf Integration
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [blueprints, setBlueprints] = useState<any>(null);
  const [overleafLoading, setOverleafLoading] = useState(false);

  // College/Client Project Analyzer Modal State
  const [showProjectAnalyzerModal, setShowProjectAnalyzerModal] = useState(false);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubSuccess, setGithubSuccess] = useState(false);
  const [analyzerTitle, setAnalyzerTitle] = useState("");
  const [analyzerTopic, setAnalyzerTopic] = useState("");
  const [analyzerDescription, setAnalyzerDescription] = useState("");
  const [analyzerImplemented, setAnalyzerImplemented] = useState("");
  const [analyzerProposed, setAnalyzerProposed] = useState("");
  const [analyzerScreenshots, setAnalyzerScreenshots] = useState("");
  const [analyzerAuthors, setAnalyzerAuthors] = useState([
    { name: "Chinni Ganesh Kumar", department: "Dept of Artificial Intelligence & Machine Learning", institution: "NRI Institute Of Technology", location: "Agiripalli, India", email: "ganeshkumar.chinni@gmail.com" },
    { name: "M Ravindra Babu", department: "Dept of Artificial Intelligence & Machine Learning", institution: "NRI Institute Of Technology", location: "Agiripalli, India", email: "ravindramodepalli23@gmail.com" }
  ]);

  // IEEE Academic Rules FAQ State
  const [academicFaq, setAcademicFaq] = useState<any>(null);
  const [blueprintActiveTab, setBlueprintActiveTab] = useState<"blueprints" | "limits" | "liberty" | "screenshots" | "checklist">("blueprints");

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
          title: "New Research Paper",
          topic: ""
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

  const handleExportManuscript = async (formatType: "markdown" | "latex" | "docx" | any = "markdown") => {
    if (!currentProject) return;
    const fmt = typeof formatType === "string" ? formatType : "markdown";
    try {
      const safeTitle = currentProject.title.replace(/[^a-zA-Z0-9_\-]/g, "_");
      if (fmt === "docx") {
        const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/download?format_type=docx`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${safeTitle}_Manuscript.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (fmt === "latex") {
        const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/download?format_type=latex`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${safeTitle}_IEEE_Conference.tex`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/export?format_type=markdown`, {
          method: "POST"
        });
        const data = await res.json();
        if (data.content) {
          const blob = new Blob([data.content], { type: "text/markdown;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${safeTitle}_Manuscript.md`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportMatrixCSV = async () => {
    if (!literatureMatrix || literatureMatrix.length === 0) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/matrix/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix_rows: literatureMatrix })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${(currentProject?.title || "veritas").replace(/[^a-zA-Z0-9_\-]/g, "_")}_Literature_Matrix.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDraftSectionWithGateway = async () => {
    if (!currentProject || !selectedSection) return;
    setDraftLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/draft-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_name: selectedSection,
          notes: sectionDrafts[selectedSection] || ""
        })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setSectionDrafts((prev) => ({
          ...prev,
          [selectedSection]: data.draft
        }));
        setDraftProvider(data.provider);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDraftLoading(false);
    }
  };

  const fetchBlueprints = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/ieee-blueprints");
      const data = await res.json();
      if (data.blueprints) setBlueprints(data.blueprints);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAcademicFaq = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/academic-rules-faq");
      const data = await res.json();
      if (data.faq) setAcademicFaq(data.faq);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeExistingProject = async () => {
    if (!analyzerTitle.trim() || !analyzerDescription.trim()) return;
    setAnalyzerLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/projects/analyze-existing-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: analyzerTitle,
          topic: analyzerTopic,
          project_description: analyzerDescription,
          implemented_features: analyzerImplemented,
          proposed_extensions: analyzerProposed,
          screenshot_notes: analyzerScreenshots,
          authors: analyzerAuthors
        })
      });
      const data = await res.json();
      if (data.project_id) {
        setShowProjectAnalyzerModal(false);
        await fetchProjects();
        await loadProjectDetails(data.project_id);
        setCurrentStage(9);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzerLoading(false);
    }
  };

  const handleInspectGitHubRepo = async () => {
    if (!githubRepoUrl.trim()) return;
    setGithubLoading(true);
    setGithubSuccess(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/projects/inspect-github-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubRepoUrl })
      });
      const data = await res.json();
      if (data.title) setAnalyzerTitle(data.title);
      if (data.topic) setAnalyzerTopic(data.topic);
      if (data.project_description) setAnalyzerDescription(data.project_description);
      if (data.implemented_features) setAnalyzerImplemented(data.implemented_features);
      if (data.proposed_extensions) setAnalyzerProposed(data.proposed_extensions);
      if (data.screenshot_notes) setAnalyzerScreenshots(data.screenshot_notes);
      setGithubSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleAddAuthor = () => {
    setAnalyzerAuthors([
      ...analyzerAuthors,
      { name: "New Co-Author", department: "Dept of Computer Science & Engineering", institution: "NRI Institute Of Technology", location: "Agiripalli, India", email: "coauthor@example.com" }
    ]);
  };

  const handleRemoveAuthor = (idx: number) => {
    if (analyzerAuthors.length <= 1) return;
    setAnalyzerAuthors(analyzerAuthors.filter((_, i) => i !== idx));
  };

  const handleUpdateAuthor = (idx: number, field: string, val: string) => {
    const updated = [...analyzerAuthors];
    updated[idx] = { ...updated[idx], [field]: val };
    setAnalyzerAuthors(updated);
  };

  const handleAutoGenerateFullPaper = async () => {
    if (!currentProject) return;
    setAutoGenLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/generate-autonomous-paper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: "Write complete IEEE publication manuscript matching IEEE two-column conference layout with previous works table and formulas." })
      });
      const data = await res.json();
      if (data.success && data.sections) {
        setSectionDrafts(data.sections);
        setDraftProvider(data.provider);
        setCurrentStage(9);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoGenLoading(false);
    }
  };

  const handleOpenInOverleaf = async () => {
    if (!currentProject) return;
    setOverleafLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/research/projects/${currentProject.id}/overleaf-payload`);
      const data = await res.json();
      if (data.success && data.latex_code) {
        // Create dynamic form and POST to Overleaf
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://www.overleaf.com/docs";
        form.target = "_blank";

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "snip";
        input.value = data.latex_code;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOverleafLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#171717] text-white p-4 sm:p-6 space-y-4">
      {/* Top Header & Compact Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-xl">
            {currentProject?.title || "Research Paper Studio"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowProjectAnalyzerModal(true)}
            className="h-8 px-3 rounded-lg btn-juicy text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#f2572b]/20"
            title="Convert an existing college or client project into an IEEE paper"
          >
            <FolderOpen className="w-3.5 h-3.5 text-white" />
            <span>Convert College Project</span>
          </button>

          <button
            onClick={handleAutoGenerateFullPaper}
            disabled={autoGenLoading}
            className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#e5e5e5] hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Autonomously research and draft the complete IEEE paper"
          >
            {autoGenLoading ? <JuicyLoader size="sm" /> : <Sparkles className="w-3.5 h-3.5 text-[#f2572b]" />}
            <span>{autoGenLoading ? "Drafting..." : "Auto-Generate"}</span>
          </button>

          <button
            onClick={() => {
              fetchBlueprints();
              fetchAcademicFaq();
              setShowBlueprintModal(true);
            }}
            className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#e5e5e5] hover:text-white transition-all flex items-center gap-1.5"
            title="View IEEE requirements and rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#f2572b]" />
            <span>IEEE Rules</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#a3a3a3] hover:text-white transition-all flex items-center gap-1"
            title="Create New Project"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={() => handleAutosaveProject()}
            disabled={saving}
            className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-[#a3a3a3] hover:text-white transition-all flex items-center gap-1"
            title="Save Project"
          >
            {saving ? <JuicyLoader size="sm" /> : <Save className="w-3.5 h-3.5 text-[#f2572b]" />}
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Sleek, Slim 9-Stage Progress Bar / Stepper */}
      <div className="p-1 rounded-xl bg-[#1a1a1a] border border-white/[0.08] backdrop-blur-md overflow-x-auto shadow-sm shrink-0">
        <div className="flex items-center gap-1 min-w-[760px]">
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all text-center ${
                  isActive
                    ? "bg-[#262626] text-white font-semibold border border-[#f2572b]/50 shadow-sm"
                    : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono shrink-0 ${
                    isActive
                      ? "bg-[#f2572b] text-white"
                      : isPassed
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-white/[0.06] text-[#737373]"
                  }`}
                >
                  {isPassed ? "✓" : stg.id}
                </span>
                <span className="text-xs whitespace-nowrap truncate">{stg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Stage Content Container (Internal Scroll Only) */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {/* ================= STAGE 1: TOPIC & PROBLEM ================= */}
        {currentStage === 1 && currentProject && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block pb-2 border-b border-white/[0.08]">
                Stage 1: Research Topic &amp; Context
              </span>
              <div className="space-y-2">
                <label className="text-xs text-[#e5e5e5] font-semibold">Active Research Topic</label>
                <input
                  type="text"
                  value={currentProject.topic || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, topic: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#171717] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#f2572b]"
                />
              </div>
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-xs text-[#a3a3a3] space-y-1">
                <span className="font-bold text-white">Scholarly Guidance:</span>
                <p>Clearly frame your research topic using operational keywords that map cleanly into OpenAlex and Crossref citation registries.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#f2572b] uppercase block pb-2 border-b border-white/[0.08]">
                Stage 2: Formal Problem Statement
              </span>
              <textarea
                value={currentProject.problem_statement || ""}
                onChange={(e) => setCurrentProject({ ...currentProject, problem_statement: e.target.value })}
                rows={7}
                className="w-full p-3.5 rounded-xl bg-[#171717] border border-white/[0.08] text-sm text-white leading-relaxed focus:outline-none focus:border-[#f2572b] resize-y"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStage(2)}
                  className="px-5 py-2 rounded-[60px] btn-juicy text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
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
            <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block pb-2 border-b border-white/[0.08]">
                Stage 3: Research Questions (RQs)
              </span>
              <div className="space-y-3">
                {currentProject.research_questions?.map((rq: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-xs text-white space-y-1">
                    <span className="font-mono text-[#f2572b] font-bold">RQ {idx + 1}</span>
                    <p className="leading-relaxed">{rq}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 space-y-4 backdrop-blur-xl shadow-xl">
              <span className="text-xs font-mono font-bold tracking-wider text-[#f2572b] uppercase block pb-2 border-b border-white/[0.08]">
                Stage 4: Research Objectives
              </span>
              <div className="space-y-3">
                {currentProject.objectives?.map((obj: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-xs text-white space-y-1">
                    <span className="font-mono text-emerald-400 font-bold">Objective {idx + 1}</span>
                    <p className="leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-5 py-2 rounded-[60px] btn-juicy text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
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
          <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 space-y-4 backdrop-blur-xl shadow-xl max-w-4xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block pb-2 border-b border-white/[0.08]">
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
                      <span className="text-[11px] text-[#a3a3a3]">Statistical Significance: p &lt; 0.01</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{hyp}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStage(2)}
                className="text-xs text-[#a3a3a3] hover:text-white"
              >
                ← Back to RQs
              </button>
              <button
                onClick={() => setCurrentStage(4)}
                className="px-6 py-2.5 rounded-[60px] bg-gradient-to-r from-[#f2572b] to-[#ff7a52] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
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
            <div className="p-5 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    SciSpace-Inspired Comparative Literature Review Matrix
                  </h3>
                  <p className="text-xs text-[#a3a3a3]">
                    8-Column structured synthesis of peer-reviewed literature across Objectives, Datasets, Methods, Results, Limitations, and Gaps.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportMatrixCSV}
                    disabled={literatureMatrix.length === 0}
                    className="px-4 py-2 rounded-[60px] bg-[#1a100a] hover:bg-[#262626] border border-emerald-500/50 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all disabled:opacity-40"
                    title="Export 8-column comparative literature review matrix to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Matrix (.CSV)
                  </button>
                  <button
                    onClick={() => fetchMatrix(matrixTopic || currentProject?.topic || "Transformer Attention")}
                    disabled={matrixLoading}
                    className="px-4 py-2 rounded-[60px] bg-[#262626] hover:bg-[#382419] border border-[#f2572b]/60 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    {matrixLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Search &amp; Synthesize Papers
                  </button>
                  <button
                    onClick={() => setCurrentStage(5)}
                    className="px-4 py-2 rounded-[60px] btn-juicy text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                  >
                    View Research Gaps
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1a1a1a] border-b border-white/[0.08] text-[#f2572b] font-mono uppercase tracking-wider text-[11px]">
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
                        <td className="p-3 font-serif font-bold text-white">
                          <div>{row.paper_title}</div>
                          <div className="font-mono font-normal text-[10px] text-[#a3a3a3] mt-0.5">
                            {row.year} • {row.venue}
                          </div>
                        </td>
                        <td className="p-3 text-[#e5e5e5]">{row.objective}</td>
                        <td className="p-3 font-mono text-emerald-400">{row.dataset}</td>
                        <td className="p-3 text-[#a3a3a3]">{row.methodology}</td>
                        <td className="p-3 text-[#e5e5e5]">{row.results}</td>
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
            <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Stage 8: Evidence-Based Research Gap Discovery
                  </h3>
                  <p className="text-xs text-[#a3a3a3]">
                    Rigorous synthesis of underexplored questions, computational bounds, and dataset blindspots across reviewed literature.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStage(6)}
                  className="px-5 py-2 rounded-[60px] btn-juicy text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                >
                  Proceed to Methodology
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {researchGaps.map((gap, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400">{gap.gap_type}</span>
                      <span className="text-[11px] text-[#a3a3a3]">Empirically Grounded</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-white">{gap.title}</h4>
                    <p className="text-xs text-[#e5e5e5] leading-relaxed">{gap.description}</p>
                    {gap.supporting_papers && (
                      <div className="text-[11px] text-[#737373] font-mono">
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
          <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Stage 9: Research Methodology &amp; Pipeline Design
                </h3>
                <p className="text-xs text-[#a3a3a3]">Define experimental controls, data splits, and algorithmic steps.</p>
              </div>
              <button
                onClick={() => setCurrentStage(7)}
                className="px-5 py-2 rounded-[60px] btn-juicy text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                View 17-Section Outline
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              value={currentProject.methodology_plan || ""}
              onChange={(e) => setCurrentProject({ ...currentProject, methodology_plan: e.target.value })}
              rows={10}
              className="w-full p-4 rounded-xl bg-[#171717] border border-white/[0.08] text-sm text-white leading-relaxed font-mono focus:outline-none focus:border-[#f2572b]"
            />
          </div>
        )}

        {/* ================= STAGE 7: 17-SECTION OUTLINE ================= */}
        {currentStage === 7 && currentProject && (
          <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Stage 10: Complete 17-Section Paper Architecture
                </h3>
                <p className="text-xs text-[#a3a3a3]">Standardized international academic structure (IEEE, ACM, Nature, Elsevier).</p>
              </div>
              <button
                onClick={() => setCurrentStage(8)}
                className="px-5 py-2 rounded-[60px] bg-gradient-to-r from-[#f2572b] to-[#ff7a52] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
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
                  className="p-3.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] hover:border-[#f2572b]/70 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[#f2572b] font-bold">§{idx + 1}</span>
                    <span className="font-semibold text-white">{sec}</span>
                  </div>
                  <span className="text-[10px] text-[#737373] font-mono">
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
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl space-y-2 max-h-[620px] overflow-y-auto">
              <span className="text-xs font-mono font-bold tracking-wider text-[#a3a3a3] uppercase block pb-2 border-b border-white/[0.08]">
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
                        ? "bg-[#262626] text-white font-bold border border-[#f2572b]"
                        : "text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    <span className="truncate">§{idx + 1}. {sec}</span>
                    {hasDraft && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Section Editor */}
            <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] backdrop-blur-xl space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-white/[0.08] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                      Drafting: {selectedSection}
                    </h3>
                    {draftProvider && (
                      <span className="px-2 py-0.5 rounded-full bg-[#262626] border border-emerald-500/60 font-mono text-[10px] text-emerald-400">
                        ⚡ {draftProvider}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#a3a3a3]">
                    {(sectionDrafts[selectedSection] || "").split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={handleDraftSectionWithGateway}
                    disabled={draftLoading}
                    className="h-8 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-purple-500/40 text-xs font-medium text-purple-200 hover:text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                    title="Draft section with multi-provider LLM Gateway"
                  >
                    {draftLoading ? <RefreshCw className="w-3 h-3 animate-spin text-purple-300" /> : <Sparkles className="w-3 h-3 text-purple-300" />}
                    <span>{draftLoading ? "Drafting..." : "⚡ Draft with LLM"}</span>
                  </button>
                  <button
                    onClick={() => handleAutosaveProject()}
                    className="h-8 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white hover:border-[#f2572b] transition-all flex items-center gap-1"
                  >
                    <Save className="w-3 h-3 text-[#f2572b]" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setCurrentStage(9)}
                    className="h-8 px-3.5 rounded-lg btn-juicy text-white text-xs font-semibold flex items-center gap-1 shadow-sm shadow-[#f2572b]/20"
                  >
                    <span>Next: Review &amp; Export</span>
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
                className="w-full p-4 rounded-xl bg-[#171717] border border-white/[0.08] text-sm text-white leading-relaxed font-sans focus:outline-none focus:border-[#f2572b] resize-y"
                placeholder={`Draft content for ${selectedSection}...`}
              />
            </div>
          </div>
        )}

        {/* ================= STAGE 9: INTEGRITY & EXPORT ================= */}
        {currentStage === 9 && (
          <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/10/70 backdrop-blur-xl shadow-xl max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Stage 19: Manuscript Review &amp; Publication Export
                </h3>
                <p className="text-xs text-[#a3a3a3]">
                  Validate research integrity across all engines and export formatted publication manuscript.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleOpenInOverleaf}
                  disabled={overleafLoading}
                  className="px-4 py-2 rounded-[60px] bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400/40"
                  title="Instant 1-click project initialization on Overleaf"
                >
                  {overleafLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>Open in Overleaf (1-Click)</span>
                </button>
                <button
                  onClick={() => handleExportManuscript("docx")}
                  className="px-4 py-2 rounded-[60px] bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 border border-blue-400/30"
                  title="Export styled Microsoft Word (.docx) publication document"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (.DOCX)
                </button>
                <button
                  onClick={() => handleExportManuscript("latex")}
                  className="px-4 py-2 rounded-[60px] bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400/30"
                  title="Export IEEEtran LaTeX (.tex) for Overleaf / ArXiv submission"
                >
                  <Download className="w-3.5 h-3.5" />
                  LaTeX (.TEX)
                </button>
                <button
                  onClick={() => handleExportManuscript("markdown")}
                  className="px-4 py-2 rounded-[60px] bg-gradient-to-r from-[#f2572b] to-[#ff7a52] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 border border-[#E6C687]/40"
                  title="Export raw Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  Markdown (.MD)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08] space-y-1 text-center">
                <span className="text-xs font-mono text-[#a3a3a3]">Total Drafted Sections</span>
                <div className="text-2xl font-bold font-serif text-white">
                  {Object.keys(sectionDrafts).length} / 17
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08] space-y-1 text-center">
                <span className="text-xs font-mono text-[#a3a3a3]">Total Word Count</span>
                <div className="text-2xl font-bold font-serif text-emerald-400">
                  {Object.values(sectionDrafts).join(" ").split(/\s+/).filter(Boolean).length}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08] space-y-1 text-center">
                <span className="text-xs font-mono text-[#a3a3a3]">Reviewed Papers in Matrix</span>
                <div className="text-2xl font-bold font-serif text-[#f2572b]">
                  {literatureMatrix.length}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-xs text-[#a3a3a3] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Publication Readiness: </span>
                Your manuscript is structured according to standardized international peer-review standards. You can export it or jump directly into the Writing Studio (`/writing`) to run fine-grained grammar, readability, and citation checks!
              </div>
            </div>
          </div>
        )}
      </div>

        {/* ================= IEEE SECTION BLUEPRINT GUIDE & ACADEMIC RULES MODAL ================= */}
        {showBlueprintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-3xl bg-[#1a1a1a]/95 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#f2572b]/15 border border-[#f2572b]/30 flex items-center justify-center text-[#f2572b]">
                    <BookOpen className="w-5 h-5 text-[#f2572b]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      IEEE Standard Publication Blueprint &amp; Academic Liberty Rules
                    </h3>
                    <p className="text-xs text-[#a3a3a3]">
                      Official IEEE Conference specifications, page/column limits, research liberty guidelines, and screenshot alignment rules.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBlueprintModal(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  ✕ Close
                </button>
              </div>

              {/* Sub-tab Switcher (Bento Studio Style) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-white/10">
                {[
                  { id: "blueprints", label: "📋 11 IEEE Section Blueprints" },
                  { id: "limits", label: "📐 Page Limits & Columns" },
                  { id: "liberty", label: "💡 Project vs Academic Liberty" },
                  { id: "screenshots", label: "🖼️ Screenshots & Alignment" },
                  { id: "checklist", label: "✅ Reviewer Acceptance Checklist" },
                ].map((tb) => {
                  const isActive = blueprintActiveTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => setBlueprintActiveTab(tb.id as any)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#f2572b]/15 text-[#f2572b] border border-[#f2572b]/40 font-semibold shadow-sm"
                          : "text-[#a3a3a3] hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {tb.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Section Blueprints */}
              {blueprintActiveTab === "blueprints" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blueprints &&
                    Object.entries(blueprints).map(([secKey, secVal]: [string, any], idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] hover:border-[#f2572b]/50 transition-all space-y-2.5 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-serif font-bold text-white">{secVal.title}</h4>
                          <span className="text-[10px] font-mono text-[#f2572b] bg-[#f2572b]/10 px-2.5 py-0.5 rounded-full border border-[#f2572b]/30">
                            {secVal.alignment_rule?.slice(0, 24)}...
                          </span>
                        </div>
                        <p className="text-xs text-[#a3a3a3] leading-relaxed">{secVal.description}</p>
                        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                          <span className="text-[10px] font-mono text-[#f2572b] uppercase font-bold block">
                            Mandatory Contents:
                          </span>
                          <ul className="space-y-1 text-xs text-[#e5e5e5]">
                            {secVal.must_contain?.map((item: string, iIdx: number) => (
                              <li key={iIdx} className="list-disc list-inside leading-relaxed text-[11px] text-[#cccccc]">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Tab 2: Page Limits & Columns */}
              {blueprintActiveTab === "limits" && (
                <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] space-y-4 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h4 className="text-base font-serif font-bold text-white">
                      {academicFaq?.page_and_column_rules?.title || "Page Limits & Column Standards"}
                    </h4>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Strict formatting rules mandated by IEEE Conference Publications (IEEEtran format).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Column Format</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.page_and_column_rules?.columns || "Strictly 2 Columns (Standard 58 picas / ~7.25 inches width, 0.25 inch column separation)"}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Standard Page Limit</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.page_and_column_rules?.page_limit || "Standard Conference: 4 to 6 pages. (Short paper: 4 pages max; Regular paper: 6 pages max. Extra pages incur $100-$150/page fee up to 8 pages)"}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Typography Hierarchy</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.page_and_column_rules?.typography || "Title: 24pt Bold. Section Headings: 10pt Small Caps (Roman numerals). Body Text: 10pt Regular Times New Roman. Table/Figure Captions: 8pt Regular."}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Abstract Constraints</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.page_and_column_rules?.abstract_rule || "Abstract must be 150-250 words, single paragraph, plain text. No math equations, no footnotes, and NO citations like [1]."}
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#141414] border border-[#f2572b]/40 text-xs text-[#f2572b]">
                    💡 <span className="font-bold text-white">Final Column Balance Rule: </span>
                    {academicFaq?.page_and_column_rules?.last_page_rule || "The two columns on the final page (References) must be balanced evenly in height using the flushend or balance package."}
                  </div>
                </div>
              )}

              {/* Tab 3: College Project vs Academic Liberty */}
              {blueprintActiveTab === "liberty" && (
                <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] space-y-4 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h4 className="text-base font-serif font-bold text-white">
                      {academicFaq?.project_vs_research_liberty?.title || "College/Client Project vs Academic Research Liberty"}
                    </h4>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      {academicFaq?.project_vs_research_liberty?.core_principle || "A college/client project is an implementation artifact, whereas an IEEE research paper is an academic scientific contribution."}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#141414] border border-[#f2572b]/50 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#f2572b] uppercase tracking-wider block">
                      The Fundamental Golden Rule:
                    </span>
                    <p className="text-xs text-white leading-relaxed">
                      {academicFaq?.project_vs_research_liberty?.liberty_rule || "You 100% HAVE research liberty to propose advanced modules, theoretical frameworks, and prospective architectures beyond what was coded."}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono font-bold text-[#f2572b] uppercase tracking-wider block">
                      How to Structure Without Peer-Review Discrepancies:
                    </span>
                    <div className="space-y-2.5 text-xs text-[#e5e5e5]">
                      {(academicFaq?.project_vs_research_liberty?.how_to_structure || [
                        "Section III (Proposed Architectural Framework): Propose the full, comprehensive system architecture (both implemented core + advanced conceptual modules like AI scanning, zero-knowledge proofs, or cross-chain bridges).",
                        "Section VI (Prototype Implementation & Experimental Evaluation): Explicitly state: 'To empirically validate the feasibility of the proposed framework, an experimental prototype was implemented...' and report actual results from what was coded.",
                        "Reviewer Safety: By clearly distinguishing the 'Architectural Framework' from the 'Experimental Prototype', reviewers will praise your architectural vision and validate your proof-of-concept without raising discrepancies!"
                      ]).map((step: string, sIdx: number) => (
                        <div key={sIdx} className="p-3.5 rounded-xl bg-[#141414] border border-white/[0.08] flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#f2572b]/20 text-[#f2572b] border border-[#f2572b]/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <p className="leading-relaxed text-xs">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Screenshots & Alignment */}
              {blueprintActiveTab === "screenshots" && (
                <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] space-y-4 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h4 className="text-base font-serif font-bold text-white">
                      {academicFaq?.screenshot_and_figure_guidelines?.title || "Screenshot Placement & Results Matching"}
                    </h4>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      How to present project UI screenshots and empirical graphs according to IEEE production guidelines.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Column Placement Rule</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.screenshot_and_figure_guidelines?.figure_placement || "Strictly place figures at the TOP or BOTTOM of columns (never floated in the middle of text). Use [htbp] or [t] / [b]."}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Clean Cropping Standard</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.screenshot_and_figure_guidelines?.clean_cropping || "Never include raw browser chrome, URL bars, operating system taskbars, or desktop backgrounds. Crop strictly to the active UI component or dashboard."}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Caption Conventions</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.screenshot_and_figure_guidelines?.caption_convention || "Figure captions go BELOW the figure: 'Fig. 1. Prototype dashboard for cryptographic asset hashing and wallet authentication.' (Table captions go ABOVE the table)."}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#f2572b] block">Conceptual vs Implemented Artifacts</span>
                      <p className="text-[#e5e5e5]">
                        {academicFaq?.screenshot_and_figure_guidelines?.conceptual_vs_implemented || "For implemented modules, use clean UI screenshots and performance metric tables in Section VI. For conceptual/extended features, use architectural block diagrams or dataflow flowcharts in Section III."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Reviewer Acceptance Checklist */}
              {blueprintActiveTab === "checklist" && (
                <div className="p-6 rounded-2xl bg-[#1f1f1f]/90 border border-white/[0.08] space-y-4 shadow-xl">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h4 className="text-base font-serif font-bold text-white">
                      Peer-Review Acceptance Checklist
                    </h4>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Checklist used by IEEE conference reviewers to score technical rigor and format compliance.
                    </p>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {(academicFaq?.reviewer_acceptance_checklist || [
                      { item: "Title", status: "Mandatory", rule: "Concise, title case, no abbreviations, no math symbols." },
                      { item: "Abstract & Keywords", status: "Mandatory", rule: "Self-contained summary without citations or equations. 4-6 IEEE taxonomy keywords." },
                      { item: "Comparative Drawbacks Table", status: "High Impact", rule: "Tabular comparison of 4-5 existing works highlighting their specific limitations vs your proposal." },
                      { item: "Mathematical Formulations", status: "High Impact", rule: "At least 3-5 numbered equations with all parameters and variables rigorously defined." },
                      { item: "Empirical Benchmark Metrics", status: "Mandatory", rule: "Quantitative metrics (TPS, latency, accuracy, cost savings) with a summary table in Section VI." },
                      { item: "References", status: "Mandatory", rule: "15-25 references in strict IEEE bracketed numerical format [1], [2], sorted in order of appearance." }
                    ]).map((chk: any, cIdx: number) => (
                      <div key={cIdx} className="p-3.5 rounded-xl bg-[#141414] border border-white/[0.08] flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white">{chk.item}</span>
                          <p className="text-[11px] text-[#a3a3a3]">{chk.rule}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                          chk.status === "Mandatory" ? "bg-red-950/60 text-red-300 border-red-500/40" : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#a3a3a3]">
                  Ready to draft? The Autonomous AI Researcher generates all these sections automatically.
                </span>
                <button
                  onClick={() => {
                    setShowBlueprintModal(false);
                    handleAutoGenerateFullPaper();
                  }}
                  className="h-9 px-4 rounded-xl btn-juicy text-xs font-bold text-white shadow-md shadow-[#f2572b]/25 flex items-center gap-2 hover:brightness-110"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Auto-Generate Full Paper</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= COLLEGE / CLIENT PROJECT ANALYZER MODAL ================= */}
        {showProjectAnalyzerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#1a1a1a]/95 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f2572b]/15 border border-[#f2572b]/30 flex items-center justify-center text-[#f2572b] text-base font-bold shadow-sm">
                    🎓
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      Convert Existing Project to IEEE Conference Paper
                    </h3>
                    <p className="text-xs text-[#a3a3a3]">
                      Transforms college or client projects into an authentic IEEE paper. Maps your code as the Implemented Prototype (Section VI) and expands visionary research modules in Section III.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProjectAnalyzerModal(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* GitHub Repo Auto-Import Bar */}
                <div className="p-4 rounded-2xl bg-[#1f1f1f]/90 border border-[#f2572b]/40 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#f2572b] flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#f2572b]" />
                      ⚡ Instant Auto-Import from GitHub Repository URL
                    </span>
                    {githubSuccess && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        ✓ Repo Analyzed &amp; Fields Populated
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#a3a3a3]">
                    Mee college project GitHub public repo URL isthe chalu! Mana system README.md, tech stack, and code modules automatic ga read chesi IEEE proposal fields anni fill chesthundhi.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={githubRepoUrl}
                      onChange={(e) => setGithubRepoUrl(e.target.value)}
                      placeholder="e.g. https://github.com/username/college-project"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleInspectGitHubRepo}
                      disabled={githubLoading || !githubRepoUrl.trim()}
                      className="h-9 px-4 rounded-xl btn-juicy text-white text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-[#f2572b]/25"
                    >
                      {githubLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                      <span>{githubLoading ? "Reading Repo..." : "Inspect & Auto-Fill"}</span>
                    </button>
                  </div>
                </div>

                {/* Title & Domain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#e5e5e5]">Manuscript / Project Title:</label>
                    <input
                      type="text"
                      value={analyzerTitle}
                      onChange={(e) => setAnalyzerTitle(e.target.value)}
                      placeholder="e.g. Empowering Creators with a Blockchain-Based IP Protection System"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#e5e5e5]">Domain &amp; Research Topic:</label>
                    <input
                      type="text"
                      value={analyzerTopic}
                      onChange={(e) => setAnalyzerTopic(e.target.value)}
                      placeholder="e.g. Blockchain, Smart Contracts, and AI-Driven Copyright Verification"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] transition-all"
                    />
                  </div>
                </div>

                {/* College Project Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#e5e5e5]">
                    1. What was built in your college/client project? (Code, Frameworks, Architecture):
                  </label>
                  <textarea
                    value={analyzerDescription}
                    onChange={(e) => setAnalyzerDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe your tech stack, database, APIs, and overall system workflow..."
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] outline-none resize-none font-sans transition-all"
                  />
                </div>

                {/* Implemented Features vs Proposed Extensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#1f1f1f]/90 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-emerald-400 font-semibold text-xs">
                        2. Implemented Features (Physically Coded):
                      </label>
                      <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Mapped to Sec VI
                      </span>
                    </div>
                    <textarea
                      value={analyzerImplemented}
                      onChange={(e) => setAnalyzerImplemented(e.target.value)}
                      rows={3}
                      placeholder="List features that actually work in code: UI dashboard, hashing, MetaMask, smart contracts..."
                      className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] focus:border-emerald-500/60 outline-none resize-none font-sans text-xs transition-all"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1f1f1f]/90 border border-[#f2572b]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[#f2572b] font-semibold text-xs">
                        3. Extended Research Modules (Academic Liberty):
                      </label>
                      <span className="text-[10px] text-[#f2572b]/80 font-mono bg-[#f2572b]/10 px-2 py-0.5 rounded-md border border-[#f2572b]/30">
                        Mapped to Sec III
                      </span>
                    </div>
                    <textarea
                      value={analyzerProposed}
                      onChange={(e) => setAnalyzerProposed(e.target.value)}
                      rows={3}
                      placeholder="Features you want to propose in the paper: AI violation scanner, automated royalty sharing, cross-chain..."
                      className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] focus:border-[#f2572b] outline-none resize-none font-sans text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Screenshots & Experimental Notes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#e5e5e5]">
                      4. Available Project Screenshots &amp; Benchmark Metrics:
                    </label>
                    <span className="text-[10px] text-[#f2572b] font-mono">Figures Fig. 1, 2, 3</span>
                  </div>
                  <textarea
                    value={analyzerScreenshots}
                    onChange={(e) => setAnalyzerScreenshots(e.target.value)}
                    rows={2}
                    placeholder="Describe your screenshots (e.g., Fig. 1: Dashboard; Fig. 2: Transaction receipt; Throughput: 50 TPS; Latency: 3-5s)..."
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] resize-none font-sans text-xs transition-all"
                  />
                </div>

                {/* Authors Section */}
                <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#e5e5e5] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#f2572b]" />
                      5. Authors &amp; Institutional Affiliations (IEEE Grid):
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAuthor}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-semibold text-[#e5e5e5] transition-all"
                    >
                      + Add Co-Author
                    </button>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {analyzerAuthors.map((auth, aIdx) => (
                      <div key={aIdx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2.5 rounded-xl bg-[#141414] border border-white/10 items-center">
                        <input
                          type="text"
                          value={auth.name}
                          onChange={(e) => handleUpdateAuthor(aIdx, "name", e.target.value)}
                          placeholder="Author Name"
                          className="px-2.5 py-1.5 rounded-lg bg-[#1f1f1f] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#f2572b]"
                        />
                        <input
                          type="text"
                          value={auth.department}
                          onChange={(e) => handleUpdateAuthor(aIdx, "department", e.target.value)}
                          placeholder="Department"
                          className="px-2.5 py-1.5 rounded-lg bg-[#1f1f1f] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#f2572b]"
                        />
                        <input
                          type="text"
                          value={auth.institution}
                          onChange={(e) => handleUpdateAuthor(aIdx, "institution", e.target.value)}
                          placeholder="College / University"
                          className="px-2.5 py-1.5 rounded-lg bg-[#1f1f1f] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#f2572b]"
                        />
                        <input
                          type="text"
                          value={auth.email}
                          onChange={(e) => handleUpdateAuthor(aIdx, "email", e.target.value)}
                          placeholder="Email Address"
                          className="px-2.5 py-1.5 rounded-lg bg-[#1f1f1f] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#f2572b]"
                        />
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(aIdx)}
                            disabled={analyzerAuthors.length <= 1}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 transition-all"
                            title="Remove author"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit / Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <div className="text-[11px] text-[#a3a3a3]">
                  ⚡ The AI Gateway synthesizes all 10 IEEE sections + Overleaf-ready LaTeX code in ~10 seconds.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProjectAnalyzerModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAnalyzeExistingProject}
                    disabled={analyzerLoading}
                    className="h-9 px-5 rounded-xl btn-juicy text-white text-xs font-bold hover:brightness-110 active:scale-95 shadow-md shadow-[#f2572b]/25 flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {analyzerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                    <span>{analyzerLoading ? "Synthesizing IEEE Paper..." : "⚡ Transform to Publication-Ready IEEE Paper"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= NEW PROJECT MODAL ================= */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl bg-[#1a1a1a]/95 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-serif text-lg font-bold text-white">
                  Initialize New Research Workspace Project
                </h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[#e5e5e5] font-semibold">Manuscript Working Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus in Multi-Agent Verification"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#e5e5e5] font-semibold">Core Research Topic &amp; Domain:</label>
                  <textarea
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    rows={3}
                    placeholder="Enter research topic, domains, problem statement keywords..."
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder:text-[#737373] text-xs focus:outline-none focus:border-[#f2572b] outline-none resize-none font-sans transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewProject}
                  className="h-9 px-5 rounded-xl btn-juicy text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#f2572b]/25 transition-all flex items-center gap-1.5"
                >
                  <span>Create Project</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

