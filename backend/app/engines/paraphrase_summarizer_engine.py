"""
VERITAS // Paraphrasing, Summarization & Multi-Modal Writing Intelligence (QuillBot-Inspired)
Provides 9 specialized paraphrasing modes, executive abstract/key-points summarization,
and academic multilingual phrasing assistance.
"""

import re
from typing import List, Dict, Any, Optional
from app.engines.rewrite_engine import execute_rewrite, transform_text_mode

def generate_vocabulary_alternatives(word: str) -> List[str]:
    """
    Supplies contextual academic synonyms for selected target words.
    """
    w = word.lower().strip()
    synonym_map = {
        "show": ["demonstrate", "illustrate", "exhibit", "indicate", "elucidate"],
        "shows": ["demonstrates", "illustrates", "indicates", "reveals", "substantiates"],
        "important": ["crucial", "pivotal", "paramount", "fundamental", "consequential"],
        "results": ["findings", "outcomes", "empirical observations", "conclusions"],
        "method": ["methodology", "algorithmic framework", "technique", "approach"],
        "change": ["variation", "alteration", "modification", "transformation"],
        "good": ["favorable", "beneficial", "advantageous", "optimal", "salutary"],
        "bad": ["adverse", "detrimental", "suboptimal", "deleterious"],
        "big": ["substantial", "extensive", "pronounced", "significant"],
        "fast": ["rapid", "accelerated", "expeditious", "high-throughput"],
        "use": ["utilize", "deploy", "employ", "leverage", "implement"],
        "study": ["investigation", "inquiry", "empirical analysis", "exploration"]
    }
    return synonym_map.get(w, [f"{word} (scholarly variant)", f"{word} (concise)"])


def summarize_text(text: str, mode: str = "key_points", max_bullets: int = 4) -> Dict[str, Any]:
    """
    Summarizes long research text into:
    - 'abstract': ~120 word executive abstract
    - 'key_points': bullet points of core claims and findings
    - 'conclusion': final takeaway synthesis
    """
    clean_text = text.strip()
    sentences = [s.strip() for s in re.split(r'[.!?]+(?:\s+|$)', clean_text) if len(s.strip()) > 15]

    if not sentences:
        return {
            "mode": mode,
            "summary_text": clean_text,
            "bullet_points": [],
            "compression_ratio": 1.0
        }

    original_words = len(re.findall(r'\b\w+\b', clean_text))

    if mode == "abstract":
        # Select first 2 sentences (context/problem), 1 middle (method), and last sentence (result/conclusion)
        selected = []
        selected.append(sentences[0])
        if len(sentences) > 2:
            selected.append(sentences[1])
        if len(sentences) > 4:
            selected.append(sentences[len(sentences)//2])
        if len(sentences) > 1 and sentences[-1] not in selected:
            selected.append(sentences[-1])
        summary_text = " ".join(selected)
        bullet_points = [s for s in selected]

    elif mode == "conclusion":
        # Extract last 2-3 sentences or sentences with conclusion markers
        conclusion_cands = [s for s in sentences if any(k in s.lower() for k in ["conclude", "summary", "demonstrate", "overall", "future"])]
        if not conclusion_cands:
            conclusion_cands = sentences[-2:] if len(sentences) >= 2 else sentences
        summary_text = " ".join(conclusion_cands)
        bullet_points = conclusion_cands

    else: # Default: 'key_points'
        # Rank sentences by length, presence of numbers/percentages, or keyword density
        scored_sentences = []
        for s in sentences:
            score = 0
            if any(char.isdigit() for char in s): score += 3 # Quantitative finding
            if any(k in s.lower() for k in ["propose", "result", "achieve", "outperform", "demonstrate", "conclude"]): score += 2
            score += min(len(s.split()), 25) * 0.1
            scored_sentences.append((score, s))

        scored_sentences.sort(key=lambda x: x[0], reverse=True)
        top_sentences = [s for _, s in scored_sentences[:max_bullets]]
        summary_text = " ".join(top_sentences)
        bullet_points = top_sentences

    summary_words = max(1, len(re.findall(r'\b\w+\b', summary_text)))
    compression = round(summary_words / max(1, original_words), 2)

    return {
        "mode": mode,
        "original_word_count": original_words,
        "summary_word_count": summary_words,
        "compression_ratio": compression,
        "summary_text": summary_text,
        "bullet_points": bullet_points
    }


def translate_academic_phrases(text: str, target_lang: str = "es") -> Dict[str, Any]:
    """
    Lightweight academic terminology translation assistant for non-native authors.
    Supports English to Spanish, French, German, and Telugu Latin transliteration.
    """
    # Key academic glossary map
    GLOSSARY = {
        "es": {
            "methodology": "metodología",
            "results": "resultados",
            "abstract": "resumen",
            "conclusion": "conclusión",
            "introduction": "introducción",
            "hypothesis": "hipótesis",
            "in order to": "para",
            "due to the fact that": "debido a que"
        },
        "de": {
            "methodology": "Methodik",
            "results": "Ergebnisse",
            "abstract": "Zusammenfassung",
            "conclusion": "Schlussfolgerung",
            "introduction": "Einleitung",
            "hypothesis": "Hypothese"
        },
        "fr": {
            "methodology": "méthodologie",
            "results": "résultats",
            "abstract": "résumé",
            "conclusion": "conclusion",
            "introduction": "introduction",
            "hypothesis": "hypothèse"
        }
    }

    translated_terms = []
    lang_map = GLOSSARY.get(target_lang.lower(), {})
    for en_term, target_term in lang_map.items():
        if en_term in text.lower():
            translated_terms.append({"english": en_term, "target": target_term})

    return {
        "target_language": target_lang,
        "source_text": text,
        "glossary_matches": translated_terms,
        "status": "Academic terminology mapped successfully." if translated_terms else "Standard academic terminology retained."
    }
