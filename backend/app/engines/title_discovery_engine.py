"""
VERITAS // Research Title Similarity & Discovery Intelligence Engine (DrillBit-Inspired)
Allows researchers to submit prospective research paper titles and evaluates lexical/semantic
overlap against 250M+ published papers via OpenAlex and Crossref.
Distinguishes topic/title similarity from proof of duplicate research.
"""

import re
import difflib
from typing import List, Dict, Any
from app.engines.search_engine import search_openalex_catalog

def calculate_title_similarity(proposed: str, published: str) -> float:
    """
    Computes ensemble title similarity (0-100%):
    Combines Jaccard word set overlap with sequence matching.
    """
    p1 = set(re.findall(r'\b[a-zA-Z]{3,}\b', proposed.lower()))
    p2 = set(re.findall(r'\b[a-zA-Z]{3,}\b', published.lower()))
    if not p1 or not p2:
        return 0.0

    # Jaccard overlap
    jaccard = len(p1 & p2) / len(p1 | p2)

    # Sequence matcher ratio
    seq = difflib.SequenceMatcher(None, proposed.lower(), published.lower()).ratio()

    composite = (jaccard * 0.55) + (seq * 0.45)
    return round(composite * 100.0, 1)


def discover_similar_titles(proposed_title: str, limit: int = 8) -> Dict[str, Any]:
    """
    Searches 250M OpenAlex publications for published research sharing conceptual
    or syntactic titles with the user's proposed manuscript title.
    """
    clean_title = proposed_title.strip()
    if len(clean_title) < 5:
        return {
            "proposed_title": proposed_title,
            "max_similarity_score": 0.0,
            "verdict": "Title too short for discovery analysis.",
            "results": []
        }

    raw_candidates = search_openalex_catalog(clean_title, limit=limit)
    scored_results = []

    for item in raw_candidates:
        pub_title = item.get("title", "")
        sim_score = calculate_title_similarity(clean_title, pub_title)
        
        scored_results.append({
            "published_title": pub_title,
            "similarity_score": sim_score,
            "year": item.get("year", "N/A"),
            "venue": item.get("venue", "Peer-Reviewed Venue"),
            "doi": item.get("doi"),
            "url": item.get("url"),
            "authors": item.get("authors", [])
        })

    scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
    max_sim = scored_results[0]["similarity_score"] if scored_results else 0.0

    if max_sim >= 85.0:
        verdict = "Identical or near-duplicate title exists in academic literature."
    elif max_sim >= 60.0:
        verdict = "Significant title overlap detected; review related work to articulate distinct novelty."
    elif max_sim >= 35.0:
        verdict = "Moderate thematic overlap; common domain phrasing observed."
    else:
        verdict = "Distinctive manuscript title with minimal published title collision."

    return {
        "proposed_title": clean_title,
        "max_similarity_score": max_sim,
        "verdict": verdict,
        "total_literature_checked": len(scored_results),
        "results": scored_results,
        "disclaimer": "Notice: Title similarity quantifies naming collision with existing literature. High title similarity does not constitute proof of duplicate research or plagiarism; novelty resides in underlying methodology and empirical findings."
    }
