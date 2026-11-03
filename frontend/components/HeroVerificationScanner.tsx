"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileSearch, Code2, ShieldCheck, AlertTriangle, 
  CheckCircle2, Sparkles, ExternalLink, RefreshCw 
} from "lucide-react";

export default function HeroVerificationScanner() {
  const [mode, setMode] = useState<"manuscript" | "code">("manuscript");
  const [scanStep, setScanStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatic verification scan cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // 3D Mouse Parallax Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[540px] select-none perspective-[1200px]"
      style={{
        perspective: "1200px",
      }}
    >
      {/* Dynamic 3D Transform Container */}
      <div 
        className="relative w-full transition-transform duration-300 ease-out"
        style={{
          transform: `rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        
        {/* Mode Toggle Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f1f] border border-[white/[0.08]]">
            <button
              onClick={() => setMode("manuscript")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                mode === "manuscript"
                  ? "bg-[#f2572b] text-[#1f1f1f] font-bold shadow-sm"
                  : "text-[#a3a3a3] hover:text-[#ffffff]"
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Manuscript Audit</span>
            </button>
            <button
              onClick={() => setMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                mode === "code"
                  ? "bg-[#f2572b] text-[#1f1f1f] font-bold shadow-sm"
                  : "text-[#a3a3a3] hover:text-[#ffffff]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Clone Scan</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#f2572b]">
            <span className="w-2 h-2 rounded-full bg-[#f2572b] animate-ping" />
            <span className="hidden sm:inline">VERITAS SCANNER</span>
          </div>
        </div>

        {/* Main Terminal Window Card */}
        <div className="relative rounded-2xl bg-[#1f1f1f] border border-[white/[0.08]] shadow-2xl overflow-hidden p-5 space-y-4">
          
          {/* Top Titlebar */}
          <div className="flex items-center justify-between pb-3 border-b border-[white/[0.08]]/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[white/[0.08]]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f2572b]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f2572b]" />
              <span className="text-xs font-mono text-[#e5e5e5] ml-2 font-medium">
                {mode === "manuscript" ? "quantum_attention_audit.pdf" : "tree_partition_clone.py"}
              </span>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[white/[0.08]] text-[#a3a3a3]">
              UTF-8 Verified
            </span>
          </div>

          {/* Sweeping Laser Audit Beam */}
          <div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f2572b] to-transparent shadow-[0_0_12px_#f2572b] pointer-events-none transition-all duration-1000 ease-in-out z-20"
            style={{
              top: `${28 + scanStep * 20}%`,
            }}
          />

          {/* Live Document Lines */}
          <div className="space-y-3 font-mono text-xs relative z-10 pt-1">
            
            {mode === "manuscript" ? (
              <>
                {/* Line 1: Authentic Human */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 0
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[#ffffff] font-sans text-xs leading-relaxed">
                      &ldquo;Recent advances in autoregressive sparse attention have significantly reduced quadratic matrix memory bounds.&rdquo;
                    </p>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Original</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#a3a3a3]">
                    <span>Sentence 01</span>
                    <span>•</span>
                    <span className="text-[#e5e5e5]">Perplexity Score: 48.2 (Human Writing Cadence)</span>
                  </div>
                </div>

                {/* Line 2: Literature Citation Match */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 1
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[#ffffff] font-sans text-xs leading-relaxed">
                      &ldquo;The scaled dot-product attention computes query-key matrix multiplication divided by square root dimension d_k.&rdquo;
                    </p>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-rose-300 bg-rose-950/50 border border-rose-900/60 px-2 py-0.5 rounded-full">
                      <ExternalLink className="w-3 h-3" />
                      <span>arXiv Match</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-rose-300/90">
                    <span>Vaswani et al. (2017) &ldquo;Attention Is All You Need&rdquo; • 92% verbatim citation</span>
                  </div>
                </div>

                {/* Line 3: AI Formulaic Cadence Flagged */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 2
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[#ffffff] font-sans text-xs leading-relaxed">
                      &ldquo;It is crucial to remember that moreover, furthermore, comprehensive analysis highlights pivotal paradigms in modern research.&rdquo;
                    </p>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/50 border border-amber-900/60 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      <span>AI Cadence</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-amber-400/90">
                    <span>Repetitive robotic transitional cadence detected (Formulaic AI tone)</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Code Line 1 */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 0
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-[#e5e5e5] font-mono text-xs">
                      <span className="text-[#f2572b]">def</span> partition_tree(arr, low, high):
                    </code>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Clean AST</span>
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#a3a3a3]">
                    <span>Structure Tree: Validated signature</span>
                  </div>
                </div>

                {/* Code Line 2: Renamed Variable Clone */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 1
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-[#ffffff] font-mono text-xs">
                      &nbsp;&nbsp;pivot_val = arr[high] <span className="text-[#a3a3a3]"># var renamed</span>
                    </code>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-rose-300 bg-rose-950/50 border border-rose-900/60 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Code Clone</span>
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-rose-300/90">
                    <span>97% AST Match with Assignment Submissions (Fall 2024 cohort repo)</span>
                  </div>
                </div>

                {/* Code Line 3 */}
                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  scanStep === 2
                    ? "bg-[#262626] border-[#f2572b] shadow-md"
                    : "bg-[#1f1f1f]/60 border-[white/[0.08]]"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-[#e5e5e5] font-mono text-xs">
                      &nbsp;&nbsp;idx = low - 1
                    </code>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/50 border border-amber-900/60 px-2 py-0.5 rounded-full">
                      <span>Normalized Token</span>
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#a3a3a3]">
                    <span>Logic preserved across variable name obfuscation</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Bottom Telemetry HUD */}
          <div className="pt-3 border-t border-[white/[0.08]]/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#a3a3a3]">Integrity Index:</span>
              <span className="text-emerald-400 font-bold">94.8% Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#f2572b]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Cloud Uploads</span>
            </div>
          </div>

        </div>

        {/* Floating Holographic Telemetry Pill Top Right */}
        <div 
          className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-[#f2572b]/70 shadow-xl text-xs font-mono text-[#ffffff]"
          style={{ transform: "translateZ(30px)" }}
        >
          <ShieldCheck className="w-4 h-4 text-[#f2572b]" />
          <span>Cross-Student Collusion: <strong>0%</strong></span>
        </div>

        {/* Floating Telemetry Pill Bottom Left */}
        <div 
          className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f1f1f] border border-[white/[0.08]] shadow-xl text-[11px] font-mono text-[#a3a3a3]"
          style={{ transform: "translateZ(25px)" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>2.4M Academic &amp; Git Repos Checked</span>
        </div>

      </div>
    </div>
  );
}

