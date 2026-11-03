"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Invalid email or password.");
      }

      const data = await res.json();
      localStorage.setItem("veritas_user", JSON.stringify(data.user));
      localStorage.setItem("veritas_token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center p-4 bg-[#171717] relative select-none">
      
      {/* Full Screen Ambient Light Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f2572b]/25 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff7a52]/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#171717]/80 blur-[90px] pointer-events-none" />
      
      {/* Full Screen Glassmorphic Backdrop Blur */}
      <div className="absolute inset-0 bg-[#171717]/65 backdrop-blur-3xl pointer-events-none z-0" />

      {/* Main Glass Panel Card */}
      <div className="max-w-md w-full glass-panel rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 relative z-10 border border-white/[0.1] bg-[#171717]/85 backdrop-blur-2xl">
        
        {/* Back to Home Navigation */}
        <div className="flex items-center justify-between pb-1">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] glass-card hover:border-[#f2572b]/80 hover:bg-white/[0.06] text-xs font-mono text-[#e5e5e5] hover:text-white transition-all group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#f2572b] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-[#f2572b] px-3.5 py-1 rounded-full glass-card border border-white/[0.08]">
            Sign In
          </span>
        </div>

        {/* Distinct Brand Identity Box (Logo + Name) */}
        <div className="flex justify-center pt-1">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-card border border-white/[0.08] hover:border-[#f2572b]/80 shadow-md group transition-all"
            title="VERITAS Home"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#f2572b]/50 shadow-sm shrink-0">
              <img src="/veritas_emblem.jpg" alt="VERITAS" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-xl tracking-wider text-white group-hover:text-[#f2572b] transition-colors block leading-tight">
                VERITAS
              </span>
              <span className="text-[10px] font-mono text-[#f2572b] uppercase tracking-wider block">
                Verification Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Separator Divider Line with Label */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full border-t border-white/[0.08]" />
          <div className="absolute px-3 bg-[#171717] text-[10px] font-mono text-[#a3a3a3] uppercase tracking-widest rounded-full border border-white/[0.08]">
            Authentication
          </div>
        </div>

        {/* Welcome Back Heading & Description */}
        <div className="space-y-1 text-center">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-[#a3a3a3]">
            Sign in with your registered credentials to access the verification suite.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/80 rounded-xl text-xs text-rose-300 font-sans flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#a3a3a3] hover:text-white transition-colors p-0.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-full btn-juicy active:scale-[0.99] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-md shadow-[#f2572b]/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Studio</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-white/[0.08] text-center text-xs text-[#a3a3a3] flex items-center justify-between">
          <span>Don&apos;t have an account?</span>
          <Link href="/signup" className="text-[#f2572b] hover:text-[#e5e5e5] font-medium hover:underline">
            Register new account &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
