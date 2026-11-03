"use client";

import React from "react";

interface JuicyLoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export default function JuicyLoader({ size = "md", label, className = "" }: JuicyLoaderProps) {
  const dimensions =
    size === "sm"
      ? "w-4 h-4"
      : size === "lg"
      ? "w-10 h-10"
      : "w-6 h-6";

  const dotSize =
    size === "sm"
      ? "w-1 h-1"
      : size === "lg"
      ? "w-2.5 h-2.5"
      : "w-1.5 h-1.5";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
        {/* Outer Minimalist Glass Ring */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-white/15 border-t-[#f2572b] animate-spin" />
        {/* Inner Pulsing Juicy Orange Core */}
        <div className={`${dotSize} rounded-full bg-[#f2572b] shadow-[0_0_10px_#f2572b] animate-pulse`} />
      </div>
      {label && (
        <span className="text-xs font-mono text-[#a3a3a3] tracking-wide select-none">
          {label}
        </span>
      )}
    </div>
  );
}

