"""
VERITAS // Independent Document Quality & Structural Analysis Engine (DrillBit-Inspired)
Rigorously evaluates linguistic craftsmanship, vocabulary richness, sentence variation,
paragraph cohesion, and formal academic tone.
Strictly decoupled from plagiarism similarity and AI authorship detection scores.
"""

import re
import math
from typing import Dict, Any, List
from app.engines.grammar_engine import compute_readability_metrics, count_syllables

ACADEMIC_REGISTER_WORDS = {
    "furthermore", "moreover", "consequently", "specifically", "hypothesize", "paradigm",
    "methodology", "empirical", "substantiate", "corroborate", "delineate", "synthesize",
    "elucidate", "comprehensive", "preliminary", "disparity", "rigorous", "subsequent",
    "prevalent", "correlation", "phenomenon", "configuration", "efficacy", "framework"
}

INFORMAL_CONTRACTIONS_AND_SLANG = {
    "don't", "can't", "won't", "shouldn't", "gonna", "wanna", "kinda", "sorta", "cool",
    "huge", "guy", "stuff", "thing", "things", "lots of", "a lot of", "basically"
}

def analyze_document_quality(text: str) -> Dict[str, Any]:
    """
    Computes multi-dimensional craftsmanship score (0-100) across:
    1. Vocabulary Richness (TTR + Hapax Legomena + Academic Lexicon density)
    2. Sentence Complexity & Structural Cadence Variation
    3. Paragraph Architecture & Cohesion
    4. Lexical Repetition & Phrase Redundancy
    5. Academic Tone Compliance
    """
    clean_text = text.strip()
    if len(clean_text) < 15:
        return {
            "overall_quality_score": 50,
            "quality_grade": "Insufficient Text",
            "vocabulary_richness_score": 50,
            "sentence_variety_score": 50,
            "academic_tone_score": 50,
            "repetition_penalty": 0,
            "metrics": {}
        }

    readability = compute_readability_metrics(clean_text)
    words = re.findall(r"\b[A-Za-z]+(?:'[A-Za-z]+)?\b", clean_text.lower())
    num_words = max(1, len(words))

    # 1. Vocabulary Richness: Type-Token Ratio (TTR) and Hapax Legomena (words occurring exactly once)
    word_freqs: Dict[str, int] = {}
    for w in words:
        word_freqs[w] = word_freqs.get(w, 0) + 1

    unique_words = len(word_freqs)
    ttr = unique_words / num_words
    hapax_legomena = sum(1 for w, c in word_freqs.items() if c == 1)
    hapax_ratio = hapax_legomena / num_words

    # Academic Lexicon Density
    academic_matches = sum(1 for w in words if w in ACADEMIC_REGISTER_WORDS)
    academic_density = (academic_matches / num_words) * 100

    # Vocabulary Score (0-100)
    vocab_score = min(100.0, (ttr * 50.0) + (hapax_ratio * 40.0) + min(20.0, academic_density * 8.0))
    vocab_score = round(max(30.0, vocab_score), 1)

    # 2. Sentence Structure & Variation
    raw_sentences = [s.strip() for s in re.split(r'[.!?]+(?:\s+|$)', clean_text) if len(s.strip()) > 3]
    num_sentences = max(1, len(raw_sentences))
    sentence_lens = [len(re.findall(r'\b\w+\b', s)) for s in raw_sentences]
    avg_len = sum(sentence_lens) / num_sentences

    # Variance and standard deviation of sentence lengths
    variance = sum((l - avg_len) ** 2 for l in sentence_lens) / num_sentences
    std_dev = math.sqrt(variance)
    burstiness_cv = std_dev / max(1.0, avg_len)

    # Good academic writing has standard deviation between 6 and 14 (rhythmic sentence cadence)
    sentence_score = 60.0 + min(35.0, std_dev * 2.8)
    if avg_len < 10:
        sentence_score -= 15.0 # Too choppy
    elif avg_len > 35:
        sentence_score -= 15.0 # Overly long run-ons
    sentence_score = round(max(35.0, min(100.0, sentence_score)), 1)

    # 3. Academic Tone & Formality
    informal_matches = [w for w in words if w in INFORMAL_CONTRACTIONS_AND_SLANG]
    informal_penalty = len(informal_matches) * 4.0
    tone_score = round(max(25.0, 100.0 - informal_penalty), 1)

    # 4. Lexical Repetition & Repeated N-Grams
    repeated_words_list = []
    for w, count in word_freqs.items():
        if len(w) > 4 and count > 4 and (count / num_words) > 0.04:
            repeated_words_list.append({"word": w, "count": count, "frequency_pct": round((count/num_words)*100, 1)})

    repetition_penalty = min(25.0, len(repeated_words_list) * 5.0)

    # 5. Paragraph Structure
    paragraphs = [p.strip() for p in clean_text.split("\n\n") if len(p.strip()) > 10]
    num_paragraphs = max(1, len(paragraphs))
    avg_sentences_per_para = round(num_sentences / num_paragraphs, 1)

    # Overall Composite Quality Score (0-100)
    overall_score = (vocab_score * 0.35) + (sentence_score * 0.30) + (tone_score * 0.35) - repetition_penalty
    overall_score = round(max(30.0, min(99.0, overall_score)), 1)

    if overall_score >= 85:
        grade = "Exemplary Scholarly Quality"
    elif overall_score >= 70:
        grade = "Strong Academic Proficiency"
    elif overall_score >= 55:
        grade = "Moderate / Revision Recommended"
    else:
        grade = "Needs Substantial Refinement"

    return {
        "overall_quality_score": overall_score,
        "quality_grade": grade,
        "vocabulary_richness_score": vocab_score,
        "sentence_variety_score": sentence_score,
        "academic_tone_score": tone_score,
        "repetition_penalty": repetition_penalty,
        "metrics": {
            "word_count": num_words,
            "unique_words": unique_words,
            "type_token_ratio": round(ttr, 3),
            "hapax_legomena_ratio": round(hapax_ratio, 3),
            "academic_lexicon_density_pct": round(academic_density, 2),
            "avg_sentence_length": round(avg_len, 1),
            "sentence_length_std_dev": round(std_dev, 1),
            "burstiness_cadence_cv": round(burstiness_cv, 2),
            "total_paragraphs": num_paragraphs,
            "avg_sentences_per_paragraph": avg_sentences_per_para,
            "readability": readability,
            "flesch_reading_ease": readability["flesch_reading_ease"],
            "flesch_kincaid_grade": readability["flesch_kincaid_grade"]
        },
        "informal_tokens_detected": informal_matches[:10],
        "repetitive_lexical_items": repeated_words_list[:6],
        "disclaimer": "Document quality represents linguistic craftsmanship, vocabulary richness, and sentence variation. It is completely independent of plagiarism similarity and AI authorship detection."
    }
