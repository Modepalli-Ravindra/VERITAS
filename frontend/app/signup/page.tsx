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
      setError("Password must contain at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090604] relative overflow-hidden py-10">
      
      {/* Ambient Gradient Lights in Background */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#f2572b]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#D62920]/20 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative z-10 border border-[white/[0.08]]/70">
        
        {/* Back to Home Navigation with Rounded Border */}
        <div className="flex items-center justify-between pb-1">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[white/[0.08]]/70 glass-card hover:border-[#f2572b]/80 hover:bg-white/[0.06] text-xs font-mono text-[#e5e5e5] hover:text-white transition-all group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#f2572b] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-[#f2572b] px-3.5 py-1 rounded-full glass-card border border-[white/[0.08]]/70">
            Register
          </span>
        </div>

        {/* Distinct Brand Identity Box (Logo + Name) */}
        <div className="flex justify-center pt-1">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-card border border-[white/[0.08]]/70 hover:border-[#f2572b]/80 shadow-md group transition-all"
            title="VERITAS Home"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#f2572b]/50 shadow-sm shrink-0">
              <img src="/veritas_emblem.jpg" alt="VERITAS" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-xl tracking-wider text-[#ffffff] group-hover:text-[#f2572b] transition-colors block leading-tight">
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
          <div className="w-full border-t border-[white/[0.08]]/60" />
          <div className="absolute px-3 bg-[#171717] text-[10px] font-mono text-[#a3a3a3] uppercase tracking-widest rounded-full border border-[white/[0.08]]/50">
            Registration
          </div>
        </div>

        {/* Create an Account Heading & Description */}
        <div className="space-y-1 text-center">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#ffffff]">
            Create an Account
          </h1>
          <p className="text-xs text-[#a3a3a3]">
            Register to access the local originality suite and submission audit archive.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-900/80 rounded-xl text-xs text-rose-300 font-sans flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alexander Wright"
                className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#ffffff] placeholder:text-[#737373] focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexander@institute.edu"
                className="w-full glass-input rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#ffffff] placeholder:text-[#737373] focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  if (!password) setIsPasswordFocused(false);
                }}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#ffffff] placeholder:text-[#737373] focus:outline-none font-sans"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#a3a3a3] hover:text-[#ffffff] transition-colors p-0.5 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#f2572b] block font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a3a3a3] absolute left-3.5 top-3" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#ffffff] placeholder:text-[#737373] focus:outline-none font-sans"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-[#a3a3a3] hover:text-[#ffffff] transition-colors p-0.5 cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <div className="text-[11px] font-mono flex items-center gap-1.5 pt-1">
                {doPasswordsMatch ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Interactive Password Strength Criteria Checklist (Only appears when entering password) */}
          {(isPasswordFocused || password.length > 0) && (
            <div className="p-3.5 glass-card rounded-xl space-y-2 text-[11px] font-sans transition-all animate-fadeIn">
              <span className="text-xs font-mono text-[#f2572b] block font-semibold">Security Requirements:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  {hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-[white/[0.08]] bg-[#1f1f1f] inline-block shrink-0" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-2 ${hasUppercase ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  {hasUppercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-[white/[0.08]] bg-[#1f1f1f] inline-block shrink-0" />
                  )}
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${hasLowercase ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  {hasLowercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-[white/[0.08]] bg-[#1f1f1f] inline-block shrink-0" />
                  )}
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  {hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-[white/[0.08]] bg-[#1f1f1f] inline-block shrink-0" />
                  )}
                  <span>1 number</span>
                </div>
                <div className={`flex items-center gap-2 col-span-2 ${hasSpecial ? "text-emerald-400" : "text-[#a3a3a3]"}`}>
                  {hasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-[white/[0.08]] bg-[#1f1f1f] inline-block shrink-0" />
                  )}
                  <span>1 special character (!@#$%^&amp;*)</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-full btn-3d-gold active:scale-[0.99] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#120B07]" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4 text-[#120B07]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[white/[0.08]] text-center text-xs text-[#a3a3a3] flex items-center justify-between">
          <span>Already have an account?</span>
          <Link href="/login" className="text-[#f2572b] hover:text-[#a3a3a3] font-medium hover:underline">
            Sign In &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
