import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import init_db, get_db
from app.api.routes_scan import router as scan_router
from app.api.routes_history import router as history_router
from app.api.routes_repository import router as repository_router
from app.api.routes_auth import router as auth_router
from app.api.routes_writing import router as writing_router
from app.api.routes_research import router as research_router
from app.api.routes_drillbit import router as drillbit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    init_db()
    
    # Seed sample repository items if empty
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM repository_documents")
    count = cursor.fetchone()["count"]
    
    if count == 0:
        sample_paper_title = "Attention Is All You Need - Transformer Architecture Overview"
        sample_paper_text = """
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.
        """.strip()
        
        sample_code_title = "Quicksort Algorithm & Binary Search Implementation"
        sample_code = """
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
        """.strip()

        cursor.execute("""
            INSERT INTO repository_documents (id, title, content_type, language, content, fingerprints_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("seed-paper-1", sample_paper_title, "text", "english", sample_paper_text, "{}"))

        cursor.execute("""
            INSERT INTO repository_documents (id, title, content_type, language, content, fingerprints_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("seed-code-1", sample_code_title, "code", "python", sample_code, "{}"))
        conn.commit()

    conn.close()
    yield

app = FastAPI(
    title="AI Plagiarism & Integrity Studio API",
    description="Enterprise-grade AI detection and Plagiarism Analysis Engine (Turnitin & Codequiry alternative)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(history_router)
app.include_router(repository_router)
app.include_router(auth_router)
app.include_router(writing_router)
app.include_router(research_router)
app.include_router(drillbit_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VERITAS Complete Research Intelligence & Academic Integrity Ecosystem",
        "version": "3.0.0-ENTERPRISE",
        "engines": {
            "academic_search": "OpenAlex (250M), Semantic Scholar, arXiv, Crossref",
            "code_engine": "Polyglot AST + Identifier Normalizer + Winnowing (Types 1-4 Clones)",
            "ai_detector": "Multi-Engine Calibrated Ensemble (Entropy, Burstiness, Stylometry, ESL Guardrail)",
            "fact_verification": "Claim Extractor + OpenAlex/Crossref NLI Entailment",
            "grammar_clarity": "Heuristic & Rule-Based Academic Style Inspector",
            "rewrite_studio": "9-Mode Scholarly & Professional Diff Engine",
            "citation_intelligence": "7-Style Formatter + Phantom Reference Verifier",
            "forensics_evasion": "Zero-Width & Homoglyph Anti-Bypass Detector",
            "research_studio": "19-Stage Academic Lifecycle + 17-Section Manuscript Drafter",
            "pdf_assistant": "Local RAG Vector Retrieval + Grounded Page Excerpts",
            "literature_matrix": "SciSpace-Style 8-Column Comparative Matrix + Gap Synthesizer",
            "document_quality": "DrillBit-Style Vocabulary Richness & Formality Auditor",
            "title_discovery": "Manuscript Title Collision & Similarity Analyzer"
        }
    }
