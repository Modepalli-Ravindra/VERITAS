"""
VERITAS // DrillBit-Inspired Integrity & QuillBot Writing Intelligence API Routes
Features:
- Configurable Plagiarism Exclusion Filters (Bibliography, Quotes, Small Matches)
- Independent Document Quality Analysis (Linguistic craftsmanship & Vocabulary Richness)
- Research Title Discovery Engine (Title collision detection against 250M catalog)
- QuillBot-style Abstract/Conclusion/Key-points Summarizer & Synonym Alternatives
- Institutional Audit Trail and Submission Receipts
"""

import uuid
import re
import json
import time
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.engines.document_quality_engine import analyze_document_quality
from app.engines.title_discovery_engine import discover_similar_titles
from app.engines.paraphrase_summarizer_engine import summarize_text, generate_vocabulary_alternatives
from app.engines.text_engine import TextPlagiarismEngine
from app.engines.search_engine import AcademicSearchEngine

router = APIRouter(prefix="/api/drillbit", tags=["DrillBit & Writing Intelligence"])

text_engine = TextPlagiarismEngine(k_gram_size=5, window_size=4)
search_engine = AcademicSearchEngine()

# --- Request Models ---

class DrillBitScanRequest(BaseModel):
    title: Optional[str] = "Untitled Manuscript"
    content: str = Field(..., min_length=15, description="Document body")
    exclude_bibliography: bool = True
    exclude_quotes: bool = True
    exclude_small_matches: bool = True
    min_match_words: int = 8
    exclude_repository: bool = False

class DocumentQualityRequest(BaseModel):
    text: str = Field(..., min_length=15, description="Text to analyze for quality")

class TitleDiscoveryRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Proposed manuscript title")

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Long text to summarize")
    mode: str = Field(default="key_points", description="'abstract', 'key_points', or 'conclusion'")


# --- Endpoints ---

@router.post("/scan-configured")
async def run_configured_integrity_scan(payload: DrillBitScanRequest):
    """
    Executes an academic similarity scan with configurable DrillBit exclusions:
    - Bibliography exclusion
    - Quoted passages exclusion
    - Small-match filtering (< N words)
    Every exclusion is explicitly documented in the final methodology receipt.
    """
    start_time = time.time()
    scan_id = str(uuid.uuid4())
    raw_content = payload.content.strip()

    # Apply Exclusions
    processed_content = raw_content
    exclusions_applied = []

    # 1. Bibliography Exclusion
    if payload.exclude_bibliography:
        bib_match = re.search(r'\n(?:#{1,3}\s*)?(References|Bibliography|Works Cited)\b', processed_content, re.IGNORECASE)
        if bib_match:
            processed_content = processed_content[:bib_match.start()].strip()
            exclusions_applied.append("Bibliography / Reference List excluded from similarity calculation")

    # 2. Quoted Text Exclusion
    if payload.exclude_quotes:
        # Mask out text inside quotation marks
        processed_content = re.sub(r'("[^"]{10,}"|“[^”]{10,}”)', ' [QUOTED_EXCLUDED] ', processed_content)
        exclusions_applied.append("Direct quotations enclosed in quotation marks excluded")

    # Extract sentences for literature search
    sentences = [s.strip() for s in re.split(r'[.!?]+(?:\s+|$)', processed_content) if len(s.strip()) > 20]
    queries = [sentences[0]] if sentences else []
    if len(sentences) > 2:
        queries.append(sentences[len(sentences)//2])

    candidates = []
    for q in queries[:2]:
        openalex_res = await search_engine.search_openalex(q, limit=2)
        candidates.extend(openalex_res)

    # Internal repository check if not excluded
    if not payload.exclude_repository:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT title, content FROM repository_documents WHERE content_type = 'text'")
        for r in cursor.fetchall():
            candidates.append({
                "source_type": "repository",
                "source_title": f"[Repo] {r['title']}",
                "snippet": r["content"]
            })
        conn.close()
    else:
        exclusions_applied.append("Internal institutional repository excluded from matching")

    # Winnowing comparison
    query_fps = text_engine.generate_winnowing_fingerprints(processed_content)
    query_fp_set = set(query_fps.keys())

    matched_sources = []
    matched_chars = set()

    for cand in candidates:
        source_text = cand.get("snippet", "")
        if len(source_text) < 25:
            continue

        cand_fps = text_engine.generate_winnowing_fingerprints(source_text)
        cand_fp_set = set(cand_fps.keys())

        spans = text_engine.find_matching_spans(processed_content, source_text)

        # 3. Small Match Exclusion filter
        filtered_spans = []
        for sp in spans:
            word_count = len(re.findall(r'\b\w+\b', sp["matched_text"]))
            if payload.exclude_small_matches and word_count < payload.min_match_words:
                continue # Discard small casual phrase matches
            filtered_spans.append(sp)
            for c in range(sp["start_char"], sp["end_char"]):
                matched_chars.add(c)

        if filtered_spans:
            matched_sources.append({
                "source_title": cand.get("source_title", "Academic Publication"),
                "source_url": cand.get("source_url"),
                "similarity_score": round(min(95.0, len(filtered_spans) * 18.0), 1),
                "matched_passages": len(filtered_spans)
            })

    sim_score = round((len(matched_chars) / max(1, len(processed_content))) * 100.0, 1)
    if matched_sources and matched_sources[0]["similarity_score"] > sim_score:
        sim_score = round(max(sim_score, matched_sources[0]["similarity_score"] * 0.65), 1)

    execution_time = round(time.time() - start_time, 2)

    # Save to SQLite Audit Log
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (id, scan_id, event_type, details_json)
        VALUES (?, ?, ?, ?)
    """, (
        str(uuid.uuid4()),
        scan_id,
        "CONFIGURED_INTEGRITY_AUDIT",
        json.dumps({
            "title": payload.title,
            "similarity_score": sim_score,
            "exclusions": exclusions_applied
        })
    ))
    conn.commit()
    conn.close()

    return {
        "scan_id": scan_id,
        "title": payload.title,
        "similarity_score": sim_score,
        "execution_time_sec": execution_time,
        "exclusions_applied": exclusions_applied,
        "sources_scanned": len(candidates),
        "matched_sources": matched_sources,
        "methodology_receipt": {
            "algorithm": "Winnowing Fingerprinting (k=5, w=4) + N-Gram Matching",
            "active_exclusions": exclusions_applied,
            "min_word_threshold": payload.min_match_words if payload.exclude_small_matches else 0,
            "verification_status": "Audited with configurable exclusions"
        }
    }


@router.post("/document-quality")
def run_document_quality(payload: DocumentQualityRequest):
    """
    Generates an independent DrillBit-inspired Document Quality Report.
    """
    try:
        report = analyze_document_quality(payload.text)
        return {"success": True, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality analysis failed: {str(e)}")


@router.post("/title-discovery")
def run_title_discovery(payload: TitleDiscoveryRequest):
    """
    Evaluates title similarity against 250M OpenAlex publications.
    """
    try:
        results = discover_similar_titles(payload.title)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Title discovery failed: {str(e)}")


@router.post("/summarize")
def run_summarization(payload: SummarizeRequest):
    """
    Generates an executive abstract, bullet key points, or conclusion from long text.
    """
    try:
        summary = summarize_text(payload.text, payload.mode)
        return {"success": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.get("/vocabulary-alternatives")
def get_synonyms(word: str = Query(..., min_length=2)):
    """
    Returns contextual academic vocabulary alternatives for a target word.
    """
    alternatives = generate_vocabulary_alternatives(word)
    return {"word": word, "alternatives": alternatives}


@router.get("/audit-logs")
def get_audit_logs():
    """
    Retrieves institutional integrity audit logs.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, scan_id, event_type, ip_address, details_json, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 50")
    rows = cursor.fetchall()
    logs = [dict(r) for r in rows]
    conn.close()
    return {"logs": logs}
