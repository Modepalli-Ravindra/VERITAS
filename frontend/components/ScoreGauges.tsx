"use client";

import React from "react";
import { FileText, Bot, ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface GaugeProps {
  score: number;
  label: string;
  type: "plagiarism" | "ai";
  subtitle?: string;
}

export function ScoreGauge({ score, label, type, subtitle }: GaugeProps) {
  const rounded = Math.round(score);

  const isHighRisk = rounded >= 45;
  const isMediumRisk = rounded >= 15 && rounded < 45;

  let riskLabel = "Low Similarity";
  let statusBadgeColor = "text-[#e5e5e5] bg-[#1f1f1f] border-[white/[0.08]]";
  let barColor = "bg-[#f2572b]";
  let textColor = "text-[#e5e5e5]";

  if (type === "plagiarism") {
    if (isHighRisk) {
      riskLabel = "High Overlap (Potential Plagiarism)";
      statusBadgeColor = "text-rose-400 bg-rose-950/40 border-rose-900/60";
      barColor = "bg-rose-500";
      textColor = "text-rose-400";
    } else if (isMediumRisk) {
      riskLabel = "Moderate Overlap (Common Citations)";
      statusBadgeColor = "text-[#f2572b] bg-[white/[0.08]]/60 border-[#f2572b]/60";
      barColor = "bg-[#f2572b]";
      textColor = "text-[#ffffff]";
    }
  } else {
    if (isHighRisk) {
      riskLabel = "Robotic Rhythm (Likely AI Generated)";
      statusBadgeColor = "text-amber-400 bg-amber-950/40 border-amber-900/60";
      barColor = "bg-amber-500";
      textColor = "text-amber-400";
    } else if (isMediumRisk) {
      riskLabel = "Mixed Human & AI Characteristics";
      statusBadgeColor = "text-[#ffffff] bg-[white/[0.08]]/60 border-[#f2572b]/60";
      barColor = "bg-[#f2572b]";
      textColor = "text-[#ffffff]";
    } else {
      riskLabel = "Natural Human Writing Rhythm";
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xl border border-[white/[0.08]]/70">
      {/* Metric Label & Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === "plagiarism" ? (
            <FileText className="w-4 h-4 text-[#f2572b]" />
          ) : (
            <Bot className="w-4 h-4 text-[#f2572b]" />
          )}
          <span className="text-xs font-mono uppercase tracking-wider text-[#f2572b]">
            {label}
          </span>
        </div>

        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-medium ${statusBadgeColor}`}>
          {riskLabel}
        </span>
      </div>

      {/* Main Score & Segmented Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`font-serif text-3xl font-bold tracking-tight tabular-nums ${textColor}`}>
              {rounded}%
            </span>
            <span className="text-xs font-mono text-[#a3a3a3]">/ 100 Index</span>
          </div>
          <span className="text-xs font-mono text-[#a3a3a3]">
            Threshold: &gt;15% Review
          </span>
        </div>

        {/* Precision Progress Track with Glass Inset */}
        <div className="relative w-full h-2.5 bg-[#1f1f1f]/80 backdrop-blur-md rounded-full overflow-hidden border border-[white/[0.08]]/60">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full shadow-sm`}
            style={{ width: `${Math.min(100, Math.max(0, rounded))}%` }}
          />
        </div>
      </div>

      {/* Subtitle / Diagnostic Details */}
      {subtitle && (
        <p className="text-xs text-[#a3a3a3] leading-relaxed pt-2 border-t border-[white/[0.08]]/60 font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}