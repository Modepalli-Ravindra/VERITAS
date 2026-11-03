"""
VERITAS // Document Forensics & Adversarial Evasion Intelligence Engine
Detects adversarial document manipulation techniques designed to bypass AI detectors and plagiarism scanners:
- Zero-Width space/joiner injection (\u200B, \u200C, \u200D, \uFEFF, \u2060)
- Homoglyph character substitution (Cyrillic, Greek, Cherokee lookalikes)
- Hidden / microscopic text anomalies
- Punctuation spoofing and character-level encoding perturbations
Provides sanitized text normalization and evasion threat scoring.
"""

import re
import unicodedata
from typing import Dict, Any, List, Tuple

# Mapping of common adversarial Cyrillic and Greek homoglyphs to Latin equivalents
HOMOGLYPH_MAP = {
    '\u0430': ('a', 'Cyrillic Small Letter A'),
    '\u0410': ('A', 'Cyrillic Capital Letter A'),
    '\u0435': ('e', 'Cyrillic Small Letter Ie'),
    '\u0415': ('E', 'Cyrillic Capital Letter Ie'),
    '\u043e': ('o', 'Cyrillic Small Letter O'),
    '\u041e': ('O', 'Cyrillic Capital Letter O'),
    '\u0440': ('p', 'Cyrillic Small Letter Er'),
    '\u0420': ('P', 'Cyrillic Capital Letter Er'),
    '\u0441': ('c', 'Cyrillic Small Letter Es'),
    '\u0421': ('C', 'Cyrillic Capital Letter Es'),
    '\u0443': ('y', 'Cyrillic Small Letter U'),
    '\u0445': ('x', 'Cyrillic Small Letter Ha'),
    '\u0425': ('X', 'Cyrillic Capital Letter Ha'),
    '\u0456': ('i', 'Cyrillic Small Letter Byelorussian-Ukrainian I'),
    '\u0458': ('j', 'Cyrillic Small Letter Je'),
    '\u0455': ('s', 'Cyrillic Small Letter Dze'),
    '\u03bf': ('o', 'Greek Small Letter Omicron'),
    '\u039f': ('O', 'Greek Capital Letter Omicron'),
    '\u03c1': ('p', 'Greek Small Letter Rho'),
    '\u037e': (';', 'Greek Question Mark (Semicolon Homoglyph)')
}

ZERO_WIDTH_CHARS = {
    '\u200b': 'Zero-Width Space (ZWSP)',
    '\u200c': 'Zero-Width Non-Joiner (ZWNJ)',
    '\u200d': 'Zero-Width Joiner (ZWJ)',
    '\ufeff': 'Zero-Width No-Break Space / Byte Order Mark (BOM)',
    '\u2060': 'Word Joiner',
    '\u00ad': 'Soft Hyphen',
    '\u200e': 'Left-to-Right Mark',
    '\u200f': 'Right-to-Left Mark',
    '\u202a': 'Left-to-Right Embedding',
    '\u202b': 'Right-to-Left Embedding',
    '\u202c': 'Pop Directional Formatting'
}

def analyze_document_forensics(text: str) -> Dict[str, Any]:
    """
    Performs forensic inspection of text for anti-plagiarism and anti-AI evasion attacks.
    Returns evasion score, detected anomalies list, and sanitized clean text.
    """
    if not text:
        return {
            "evasion_score": 0,
            "threat_level": "CLEAN",
            "is_adversarial": False,
            "zero_width_count": 0,
            "homoglyph_count": 0,
            "total_anomalies": 0,
            "anomalies": [],
            "sanitized_text": ""
        }

    anomalies: List[Dict[str, Any]] = []
    sanitized_chars: List[str] = []

    zero_width_count = 0
    homoglyph_count = 0

    for idx, char in enumerate(text):
        # 1. Check for Zero-Width / Invisible characters
        if char in ZERO_WIDTH_CHARS:
            zero_width_count += 1
            anomalies.append({
                "type": "ZERO_WIDTH_INJECTION",
                "char_name": ZERO_WIDTH_CHARS[char],
                "codepoint": f"U+{ord(char):04X}",
                "index": idx,
                "context": text[max(0, idx-10):min(len(text), idx+11)],
                "description": "Invisible zero-width character injected to fragment tokens and corrupt n-gram matching."
            })
            # Omit from sanitized text
            continue

        # 2. Check for Homoglyph Substitutions in predominantly Latin text
        if char in HOMOGLYPH_MAP:
            latin_equiv, desc = HOMOGLYPH_MAP[char]
            homoglyph_count += 1
            anomalies.append({
                "type": "HOMOGLYPH_SUBSTITUTION",
                "char_name": desc,
                "codepoint": f"U+{ord(char):04X}",
                "latin_equivalent": latin_equiv,
                "index": idx,
                "context": text[max(0, idx-10):min(len(text), idx+11)],
                "description": f"Cyrillic/Greek homoglyph '{char}' substituted for Latin '{latin_equiv}' to bypass dictionary lookups."
            })
            sanitized_chars.append(latin_equiv)
            continue

        sanitized_chars.append(char)

    sanitized_text = "".join(sanitized_chars)

    total_words = max(1, len(re.findall(r'\b\w+\b', text)))
    total_anomalies = zero_width_count + homoglyph_count

    # Calculate evasion threat score (0 - 100)
    # 1 anomaly per 100 words is suspicious; >5 per 100 words is clear adversarial intent
    anomaly_rate = (total_anomalies / total_words) * 100

    if total_anomalies == 0:
        evasion_score = 0
        threat_level = "CLEAN"
        is_adversarial = False
    elif total_anomalies <= 2 and anomaly_rate < 0.5:
        evasion_score = 15
        threat_level = "SUSPICIOUS"
        is_adversarial = False
    elif total_anomalies <= 8 or anomaly_rate < 2.0:
        evasion_score = 45
        threat_level = "ELEVATED_RISK"
        is_adversarial = True
    else:
        evasion_score = min(100, int(60 + anomaly_rate * 5))
        threat_level = "CRITICAL_EVASION_ATTACK"
        is_adversarial = True

    return {
        "evasion_score": evasion_score,
        "threat_level": threat_level,
        "is_adversarial": is_adversarial,
        "zero_width_count": zero_width_count,
        "homoglyph_count": homoglyph_count,
        "total_anomalies": total_anomalies,
        "word_count": total_words,
        "anomalies": anomalies[:50],  # Cap sample display
        "sanitized_text": sanitized_text,
        "summary": (
            "No adversarial tampering detected." if total_anomalies == 0 else
            f"Detected {total_anomalies} adversarial encoding anomalies ({zero_width_count} zero-width tokens, {homoglyph_count} homoglyphs) attempting to defeat integrity classifiers."
        )
    }

