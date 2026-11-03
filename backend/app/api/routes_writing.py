"""
VERITAS // Academic Writing Intelligence & Citation Studio API Routes
Exposes high-speed local CPU endpoints for Grammar Analysis, 9-mode Rewrite Studio,
Citation Formatting & Phantom Verification, and Document Forensics.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.engines.grammar_engine import analyze_document_writing
from app.engines.rewrite_engine import execute_rewrite, MODE_METADATA
from app.engines.citation_engine import (
    format_citation,
    parse_document_citations,
    verify_citation_authenticity
)
from app.engines.forensics_engine import analyze_document_forensics
from app.engines.search_engine import search_openalex_catalog
from app.core.llm_gateway import GATEWAY

router = APIRouter(prefix="/api/writing", tags=["Writing Studio"])


# --- Request Models ---

class TextPayload(BaseModel):
    text: str = Field(..., min_length=1, description="Raw text to analyze")

class RewritePayload(BaseModel):
    text: str = Field(..., min_length=1, description="Text to rewrite")
    mode: str = Field(default="academic_formal", description="Rewriting mode")

class HumanizePayload(BaseModel):
    text: str = Field(..., min_length=1, description="AI-generated text to humanize")
    intensity: Optional[str] = Field(default="high", description="Burstiness and variation intensity")

class PlagiarismRemovePayload(BaseModel):
    text: str = Field(..., min_length=1, description="Text with similarity to paraphrase")
    target_similarity: Optional[str] = Field(default="< 15%", description="Target similarity threshold")

class CitationFormatPayload(BaseModel):
    metadata: Dict[str, Any] = Field(..., description="Publication metadata")
    style: str = Field(default="apa7", description="Citation style standard")

class CitationVerifyPayload(BaseModel):
    query: str = Field(..., min_length=3, description="Citation string or paper title")
    doi: Optional[str] = Field(default=None, description="DOI string if available")


# --- Endpoints ---

@router.post("/grammar-check")
def run_grammar_audit(payload: TextPayload):
    """
    Executes deep grammar, readability, passive voice, and wordiness analysis.
    """
    try:
        report = analyze_document_writing(payload.text)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grammar analysis failed: {str(e)}")


@router.get("/gateway-status")
def get_llm_gateway_status():
    """
    Returns connection status and active priority cascade for configured LLM API keys:
    Groq (Qwen/GPT-OSS), Google Gemini, OpenRouter, and NVIDIA NIM.
    """
    return GATEWAY.get_status()


@router.post("/humanize")
def run_ai_humanize(payload: HumanizePayload):
    """
    Deeply humanizes text to drastically reduce AI detection probability (GPTZero, Turnitin, Copyleaks).
    Uses high-burstiness sentence variance, scholarly vocabulary, and eliminates repetitive robotic patterns.
    """
    try:
        result = GATEWAY.humanize_ai_text(payload.text, intensity=payload.intensity or "high")
        return {
            "success": True,
            "original_text": payload.text,
            "humanized_text": result["humanized_text"],
            "provider": result["provider"],
            "burstiness_enhanced": result["burstiness_enhanced"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Humanize engine error: {str(e)}")


@router.post("/plagiarism-remove")
def run_smart_plagiarism_removal(payload: PlagiarismRemovePayload):
    """
    Paraphrases and restructures scientific passages to drop plagiarism similarity below 20%.
    Inverts syntactic voice and uses domain-specific scholarly synonyms without altering meaning.
    """
    try:
        result = GATEWAY.remove_plagiarism_smart(payload.text, target_similarity=payload.target_similarity or "< 15%")
        return {
            "success": True,
            "original_text": payload.text,
            "paraphrased_text": result["paraphrased_text"],
            "provider": result["provider"],
            "target_similarity": payload.target_similarity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plagiarism removal error: {str(e)}")


@router.post("/rewrite")
def run_intelligent_rewrite(payload: RewritePayload):
    """
    Transforms text using one of 9 academic/professional modes with word diffs and readability shifts.
    """
    try:
        if payload.mode == "ai_humanize":
            humanize_res = GATEWAY.humanize_ai_text(payload.text)
            from app.engines.rewrite_engine import compute_word_diff, assess_text_readability
            before_stat = assess_text_readability(payload.text)
            after_stat = assess_text_readability(humanize_res["humanized_text"])
            diff_words = compute_word_diff(payload.text, humanize_res["humanized_text"])
            return {
                "success": True,
                "result": {
                    "original_text": payload.text,
                    "rewritten_text": humanize_res["humanized_text"],
                    "mode": "ai_humanize",
                    "provider": humanize_res["provider"],
                    "word_diff": diff_words,
                    "before_stats": before_stat,
                    "after_stats": after_stat
                }
            }

        result = execute_rewrite(payload.text, payload.mode)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rewrite engine failed: {str(e)}")


@router.get("/rewrite-modes")
def get_rewrite_modes():
    """
    Returns available rewriting styles and their scholarly descriptions.
    """
    return {"modes": MODE_METADATA}


@router.post("/citation-audit")
def run_citation_audit(payload: TextPayload):
    """
    Extracts in-text citations, cross-references with bibliography, and audits reference authenticity.
    """
    try:
        parsed = parse_document_citations(payload.text)

        # Check authenticity on first 4 parsed references if present
        verified_refs = []
        for ref in parsed["references"][:4]:
            verdict = verify_citation_authenticity(ref["text"], ref.get("doi"))
            verified_refs.append({
                **ref,
                "verification": verdict
            })

        parsed["references_verified"] = verified_refs
        return {"success": True, "audit": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation audit failed: {str(e)}")


@router.post("/verify-citation")
def run_single_citation_verification(payload: CitationVerifyPayload):
    """
    Validates whether a specific citation exists in OpenAlex/Crossref or is an AI hallucination.
    """
    try:
        verdict = verify_citation_authenticity(payload.query, payload.doi)
        return {"success": True, "verdict": verdict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.post("/format-citation")
def run_citation_formatting(payload: CitationFormatPayload):
    """
    Formats academic source metadata into APA 7, MLA 9, IEEE, Chicago, Harvard, Vancouver, or BibTeX.
    """
    try:
        formatted = format_citation(payload.metadata, payload.style)
        return {
            "success": True,
            "style": payload.style,
            "formatted_citation": formatted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Formatting failed: {str(e)}")


@router.post("/forensics-audit")
def run_forensics_audit(payload: TextPayload):
    """
    Inspects document for anti-AI and anti-plagiarism evasion attacks (zero-width chars, homoglyphs).
    """
    try:
        report = analyze_document_forensics(payload.text)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensics inspection failed: {str(e)}")


@router.get("/search-sources")
def search_literature_sources(q: str = Query(..., min_length=2, description="Search query")):
    """
    Searches 250M+ OpenAlex publications and generates live pre-formatted APA, MLA, IEEE, and BibTeX citations.
    """
    try:
        raw_results = search_openalex_catalog(q, limit=6)
        formatted_results = []
        for item in raw_results:
            meta = {
                "title": item.get("title", ""),
                "authors": item.get("authors", []),
                "year": item.get("year", ""),
                "venue": item.get("venue", "Open Access Archive"),
                "doi": item.get("doi", "")
            }
            formatted_results.append({
                "title": meta["title"],
                "authors": meta["authors"],
                "year": meta["year"],
                "venue": meta["venue"],
                "doi": meta["doi"],
                "abstract": item.get("snippet", ""),
                "citations": {
                    "apa7": format_citation(meta, "apa7"),
                    "mla9": format_citation(meta, "mla9"),
                    "ieee": format_citation(meta, "ieee"),
                    "bibtex": format_citation(meta, "bibtex")
                }
            })

        return {"success": True, "query": q, "results": formatted_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Literature search failed: {str(e)}")

