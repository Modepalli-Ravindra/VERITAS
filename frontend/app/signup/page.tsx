"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, ArrowLeft, Loader2, Lock, Mail, User, 
  Eye, EyeOff, CheckCircle2, XCircle, AlertCircle 
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password Security Criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\/\\;']/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const doPasswordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be 8+ characters with uppercase, lowercase, number, and symbol.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password: password 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed. An account with this email may already exist.");
      }

      const data = await res.json();
      localStorage.setItem("veritas_user", JSON.stringify(data.user));
      localStorage.setItem("veritas_token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center p-4 bg-[#171717] relative select-none">
      
      {/* 1. Floating Back Button in Background Top-Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.1] glass-card hover:border-[#f2572b]/80 hover:bg-white/[0.08] text-xs font-mono text-[#e5e5e5] hover:text-white transition-all group shadow-lg backdrop-blur-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#f2572b] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Full Screen Ambient Light Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f2572b]/25 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff7a52]/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#171717]/80 blur-[90px] pointer-events-none" />

      {/* Full Screen Glassmorphic Backdrop Blur */}
      <div className="absolute inset-0 bg-[#171717]/65 backdrop-blur-3xl pointer-events-none z-0" />

      {/* Main Glass Panel Card */}
      <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative z-10 border border-white/[0.1] bg-[#171717]/85 backdrop-blur-2xl">
        
        {/* Distinct Brand Identity Box (Logo + Name) */}
        <div className="flex justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3.5 px-5 py-2 rounded-2xl glass-card border border-white/[0.1] hover:border-[#f2572b]/80 shadow-md group transition-all"
            title="VERITAS Home"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#f2572b]/50 shadow-sm shrink-0 bg-[#120a05]">
              <img src="/veritas_logo.jpg" alt="VERITAS" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-lg tracking-wider text-white group-hover:text-[#f2572b] transition-colors block leading-tight">
                VERITAS
              </span>
              <span className="text-[10px] font-mono text-[#f2572b] uppercase tracking-wider block font-semibold">
                Verification Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Separator Divider Line with Register Label (Moved from top to here) */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-white/[0.08]" />
          <div className="absolute px-4 py-0.5 bg-[#171717] text-[11px] font-mono text-[#f2572b] font-bold uppercase tracking-widest rounded-full border border-white/[0.1] shadow-sm">
            Register
          </div>
        </div>

        {/* Create an Account Heading & Description */}
        <div className="space-y-0.5 text-center">
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
            Create an Account
          </h1>
          <p className="text-[11px] text-[#a3a3a3]">
            Register to access the local originality suite and submission audit archive.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-900/80 rounded-xl text-xs text-rose-300 font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#f2572b] block font-medium">Full Name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3.5 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alexander Wright"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#f2572b] block font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexander@institute.edu"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
              />
            </div>
          </div>

          {/* Password Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#f2572b] block font-medium">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full glass-input rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-[#a3a3a3] hover:text-white transition-colors p-0.5 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#f2572b] block font-medium">Confirm</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3 top-2.5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat"
                  className="w-full glass-input rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder:text-[#737373] focus:outline-none focus:border-[#f2572b] font-sans"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2 text-[#a3a3a3] hover:text-white transition-colors p-0.5 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {confirmPassword && (
            <div className="text-[10px] font-mono flex items-center gap-1">
              {doPasswordsMatch ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Passwords do not match
                </span>
              )}
            </div>
          )}

          {/* Interactive Password Strength Criteria */}
          {(isPasswordFocused || password.length > 0) && (
            <div className="p-2.5 glass-card rounded-xl space-y-1.5 text-[10px] font-sans transition-all">
              <span className="font-mono text-[#f2572b] block font-semibold">Security:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  <span className={`w-2 h-2 rounded-full ${hasMinLength ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span>8+ chars</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  <span className={`w-2 h-2 rounded-full ${hasUppercase ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span>1 uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  <span className={`w-2 h-2 rounded-full ${hasLowercase ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span>1 lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  <span className={`w-2 h-2 rounded-full ${hasNumber && hasSpecial ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span>Number &amp; symbol</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-5 rounded-full btn-juicy active:scale-[0.99] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 shadow-md shadow-[#f2572b]/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.08] text-center text-[11px] text-[#a3a3a3] flex items-center justify-between">
          <span>Already have an account?</span>
          <Link href="/login" className="text-[#f2572b] hover:text-[#e5e5e5] font-medium hover:underline">
            Sign In &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
