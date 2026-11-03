"""
VERITAS // Multi-Provider LLM API Gateway
Unified, fault-tolerant orchestration gateway connecting to:
- Groq (Ultra-low latency, e.g. Qwen 27B / GPT-OSS)
- Google Gemini (Gemini 2.5 Flash / Pro)
- OpenRouter (Universal Multi-Model Router)
- NVIDIA NIM (Enterprise Neural Microservices)
- Local Deterministic Fallback (Zero crash guarantee)

Provides intelligent failover, load balancing, prompt crafting for Humanizing,
Plagiarism Paraphrasing, Academic Drafting, and Grounded PDF Reasoning.
"""

import os
import json
import time
import httpx
from typing import Dict, Any, Optional, List, Tuple

# Path to backend .env
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")

def load_gateway_credentials() -> Dict[str, str]:
    """
    Parses backend .env cleanly, stripping surrounding quotes and whitespace.
    """
    creds = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    creds[k.strip()] = v.strip().strip("'\"")
    # Also fallback to os.environ
    for key in ["GROQ_API_KEY", "GOOGLE_API_KEY", "NVIDIA_API_KEY", "OPENROUTER_API_KEY"]:
        if key not in creds and os.environ.get(key):
            creds[key] = os.environ[key].strip().strip("'\"")
    return creds


class LLMGateway:
    def __init__(self):
        self.creds = load_gateway_credentials()
        self.client = httpx.Client(timeout=25.0)

        # Provider configurations
        self.groq_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "allam-2-7b"]
        self.gemini_models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.5-flash-lite", "gemini-2.5-flash"]
        self.openrouter_models = ["nvidia/nemotron-3.5-lightning:free", "liquid/lfm-2.5-2.6b:free", "meta-llama/llama-3.1-8b-instruct:free"]
        self.nvidia_models = ["mistralai/mistral-7b-instruct-v0.3", "01-ai/yi-large", "meta/llama3-70b-instruct"]

    def reload_credentials(self):
        self.creds = load_gateway_credentials()

    def get_status(self) -> Dict[str, Any]:
        """
        Returns active provider readiness and configured keys.
        """
        self.reload_credentials()
        return {
            "gateway_active": True,
            "providers": {
                "groq": {
                    "configured": bool(self.creds.get("GROQ_API_KEY")),
                    "priority": 1,
                    "default_model": self.groq_models[0]
                },
                "google_gemini": {
                    "configured": bool(self.creds.get("GOOGLE_API_KEY")),
                    "priority": 2,
                    "default_model": self.gemini_models[0]
                },
                "openrouter": {
                    "configured": bool(self.creds.get("OPENROUTER_API_KEY")),
                    "priority": 3,
                    "default_model": self.openrouter_models[0]
                },
                "nvidia_nim": {
                    "configured": bool(self.creds.get("NVIDIA_API_KEY")),
                    "priority": 4,
                    "default_model": self.nvidia_models[0]
                }
            },
            "active_configured_count": sum(1 for k in ["GROQ_API_KEY", "GOOGLE_API_KEY", "NVIDIA_API_KEY", "OPENROUTER_API_KEY"] if self.creds.get(k))
        }

    # --- Low-level Provider Dispatchers ---

    def _call_groq(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1200, temperature: float = 0.7) -> Optional[str]:
        api_key = self.creds.get("GROQ_API_KEY")
        if not api_key:
            return None

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        for model in self.groq_models:
            try:
                res = self.client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        msg = choices[0].get("message", {})
                        content = msg.get("content") or msg.get("reasoning")
                        if content and content.strip():
                            return content.strip()
            except Exception:
                continue
        return None

    def _call_openrouter(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1200, temperature: float = 0.7) -> Optional[str]:
        api_key = self.creds.get("OPENROUTER_API_KEY")
        if not api_key:
            return None

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        for model in self.openrouter_models:
            try:
                res = self.client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://veritas.academic",
                        "X-Title": "VERITAS Gateway"
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        msg = choices[0].get("message", {})
                        content = msg.get("content")
                        if content and content.strip():
                            return content.strip()
            except Exception:
                continue
        return None

    def _call_google(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1200, temperature: float = 0.7) -> Optional[str]:
        api_key = self.creds.get("GOOGLE_API_KEY")
        if not api_key:
            return None

        contents = []
        full_prompt = f"{system_prompt}\n\nTask:\n{prompt}" if system_prompt else prompt
        contents.append({"parts": [{"text": full_prompt}]})

        for model in self.gemini_models:
            try:
                res = self.client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": contents,
                        "generationConfig": {
                            "maxOutputTokens": max_tokens,
                            "temperature": temperature
                        }
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and parts[0].get("text"):
                            return parts[0]["text"].strip()
            except Exception:
                continue
        return None

    def _call_nvidia(self, prompt: str, system_prompt: Optional[str] = None, max_tokens: int = 1200, temperature: float = 0.7) -> Optional[str]:
        api_key = self.creds.get("NVIDIA_API_KEY")
        if not api_key:
            return None

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        for model in self.nvidia_models:
            try:
                res = self.client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": temperature
                    }
                )
                if res.status_code == 200:
                    choices = res.json().get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content and content.strip():
                            return content.strip()
            except Exception:
                continue
        return None

    # --- Gateway Dispatch Orchestrator (Auto-Failover Cascade) ---

    def execute_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1200,
        temperature: float = 0.7
    ) -> Tuple[str, str]:
        """
        Executes prompt through active providers in priority order.
        Returns: (output_text, provider_name)
        """
        self.reload_credentials()

        # 1. Try Groq (Fastest)
        res_groq = self._call_groq(prompt, system_prompt, max_tokens, temperature)
        if res_groq:
            return res_groq, "Groq (Qwen / GPT-OSS)"

        # 2. Try OpenRouter
        res_or = self._call_openrouter(prompt, system_prompt, max_tokens, temperature)
        if res_or:
            return res_or, "OpenRouter Gateway"

        # 3. Try Google Gemini
        res_gemini = self._call_google(prompt, system_prompt, max_tokens, temperature)
        if res_gemini:
            return res_gemini, "Google Gemini"

        # 4. Try NVIDIA NIM
        res_nv = self._call_nvidia(prompt, system_prompt, max_tokens, temperature)
        if res_nv:
            return res_nv, "NVIDIA NIM"

        # 5. Local Deterministic Fallback
        return "", "Local Fallback"

    # --- High-Level Academic Workflows ---

    def humanize_ai_text(self, text: str, intensity: str = "high") -> Dict[str, Any]:
        """
        Deeply humanizes text to drastically reduce AI detection scores (GPTZero, Turnitin, Copyleaks).
        Varies sentence lengths (burstiness), introduces human stylistic transitions, removes robotic formulas.
        """
        sys_prompt = (
            "You are a distinguished academic editor and linguist specializing in natural, human scientific writing. "
            "Your objective is to rewrite the input text so it exhibits high human stylistic variance: "
            "1. Vary sentence length dramatically (mix short, impactful sentences with detailed, complex clauses). "
            "2. Eliminate repetitive robotic AI phrases like 'delve into', 'in conclusion', 'it is important to note', 'testament to'. "
            "3. Maintain high academic vocabulary, technical precision, and factual integrity. "
            "4. Return ONLY the humanized text directly without preambles or meta commentary."
        )

        user_prompt = f"Please humanize the following text while preserving all technical facts, equations, and citations:\n\n{text}"

        output, provider = self.execute_completion(user_prompt, system_prompt=sys_prompt, temperature=0.75)
        if not output:
            # Fallback to local heuristic rewriter
            from app.engines.rewrite_engine import execute_rewrite
            fallback = execute_rewrite(text, "academic_formal")
            return {
                "humanized_text": fallback.get("rewritten_text", text),
                "provider": "Local Heuristic Engine",
                "burstiness_enhanced": True
            }

        return {
            "humanized_text": output,
            "provider": provider,
            "burstiness_enhanced": True
        }

    def remove_plagiarism_smart(self, text: str, target_similarity: str = "< 15%") -> Dict[str, Any]:
        """
        Restructures passages to drop similarity metrics below 20% for IEEE/Scopus compliance.
        Changes syntactic voice, substitutes domain synonyms, and re-orders clauses while preserving meaning.
        """
        sys_prompt = (
            "You are an expert research manuscript consultant. Your task is to rewrite the following academic passage "
            "to achieve zero verbatim textual overlap while perfectly retaining all scientific semantics, theorems, citations, and data. "
            "Invert clauses, shift active/passive voice, utilize domain-specific synonyms, and maintain strict IEEE publication rigor. "
            "Return ONLY the rewritten passage without conversational preamble."
        )

        user_prompt = f"Rewrite this passage to eliminate text plagiarism while preserving technical accuracy:\n\n{text}"

        output, provider = self.execute_completion(user_prompt, system_prompt=sys_prompt, temperature=0.7)
        if not output:
            from app.engines.rewrite_engine import execute_rewrite
            fallback = execute_rewrite(text, "academic_formal")
            return {
                "paraphrased_text": fallback.get("rewritten_text", text),
                "provider": "Local Heuristic Engine"
            }

        return {
            "paraphrased_text": output,
            "provider": provider
        }

    def draft_manuscript_section(self, project_title: str, topic: str, section_name: str, existing_notes: str) -> Dict[str, Any]:
        """
        Drafts a full, publication-ready academic section adhering to IEEE/ACM conference standards.
        """
        sys_prompt = (
            "You are a senior computer science professor and IEEE Fellow. You write authoritative, rigorous academic research papers. "
            "Format your output with formal scholarly vocabulary, clear mathematical notation where appropriate, and structured paragraphs. "
            "Do not use generic filler words."
        )

        user_prompt = (
            f"Paper Title: {project_title}\n"
            f"Core Topic: {topic}\n"
            f"Section to Draft: {section_name}\n"
            f"Researcher's Notes & Context:\n{existing_notes or 'Standard methodological framework'}\n\n"
            f"Write a rigorous, comprehensive draft for the '{section_name}' section suitable for an IEEE conference manuscript. "
            f"Output the complete section content."
        )

        output, provider = self.execute_completion(user_prompt, system_prompt=sys_prompt, max_tokens=1500, temperature=0.65)
        if not output:
            from app.engines.research_studio_engine import SECTION_TEMPLATES
            return {
                "draft": SECTION_TEMPLATES.get(section_name, f"Draft for {section_name}"),
                "provider": "Local Template Engine"
            }

        return {
            "draft": output,
            "provider": provider
        }


# Singleton Gateway Instance
GATEWAY = LLMGateway()
