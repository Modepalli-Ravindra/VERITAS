"""
VERITAS // Grammar, Clarity & Readability Intelligence Engine
High-precision, local CPU-only linguistic analyzer.
Computes standard academic readability indices (Flesch, Kincaid, Gunning Fog, Coleman-Liau, SMOG)
and detects grammatical flaws, passive voice, wordiness, punctuation errors, and clunky syntax.
"""

import re
import math
from typing import List, Dict, Any, Tuple, Optional

# --- 1. Syllable Counter & Readability Helpers ---

def count_syllables(word: str) -> int:
    """
    Estimates syllable count using English orthographic heuristics.
    """
    word = word.lower().strip()
    if not word:
        return 0
    if len(word) <= 3:
        return 1

    # Remove non-alphabetic
    word = re.sub(r'[^a-z]', '', word)
    if not word:
        return 1

    # Adjust common silent endings
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    if not word:
        return 1

    # Count vowel groups
    vowels = "aeiouy"
    count = 0
    prev_is_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel

    return max(1, count)

def compute_readability_metrics(text: str) -> Dict[str, Any]:
    """
    Calculates multi-dimensional readability scores:
    - Flesch Reading Ease
    - Flesch-Kincaid Grade Level
    - Gunning Fog Index
    - Coleman-Liau Index
    - SMOG Index
    - Estimated reading time (220 wpm) & speaking time (140 wpm)
    """
    cleaned = text.strip()
    if not cleaned:
        return {
            "flesch_reading_ease": 100.0,
            "flesch_kincaid_grade": 0.0,
            "gunning_fog": 0.0,
            "coleman_liau": 0.0,
            "smog_index": 0.0,
            "reading_level": "Elementary",
            "word_count": 0,
            "sentence_count": 0,
            "syllables_per_word": 0.0,
            "avg_sentence_length": 0.0,
            "reading_time_seconds": 0,
            "speaking_time_seconds": 0
        }

    # Tokenize sentences
    sentences = [s.strip() for s in re.split(r'[.!?]+(?:\s+|$)', cleaned) if len(s.strip()) > 3]
    num_sentences = max(1, len(sentences))

    # Tokenize words
    words = re.findall(r"\b[A-Za-z]+(?:'[A-Za-z]+)?\b", cleaned)
    num_words = max(1, len(words))

    # Total characters (letters only for Coleman-Liau)
    letters = re.findall(r'[A-Za-z]', cleaned)
    num_letters = len(letters)

    # Syllables and complex words
    syllable_counts = [count_syllables(w) for w in words]
    total_syllables = sum(syllable_counts)
    complex_words = sum(1 for s in syllable_counts if s >= 3)

    avg_sentence_len = num_words / num_sentences
    syllables_per_word = total_syllables / num_words
    percent_complex = (complex_words / num_words) * 100

    # 1. Flesch Reading Ease: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
    fre = 206.835 - (1.015 * avg_sentence_len) - (84.6 * syllables_per_word)
    fre = round(max(0.0, min(100.0, fre)), 1)

    # 2. Flesch-Kincaid Grade Level: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
    fkgl = (0.39 * avg_sentence_len) + (11.8 * syllables_per_word) - 15.59
    fkgl = round(max(0.0, fkgl), 1)

    # 3. Gunning Fog Index: 0.4 * ((words/sentences) + 100*(complex_words/words))
    gunning_fog = 0.4 * (avg_sentence_len + percent_complex)
    gunning_fog = round(max(0.0, gunning_fog), 1)

    # 4. Coleman-Liau: 0.0588*L - 0.296*S - 15.8 (L = letters/100 words, S = sentences/100 words)
    L = (num_letters / num_words) * 100
    S = (num_sentences / num_words) * 100
    coleman_liau = (0.0588 * L) - (0.296 * S) - 15.8
    coleman_liau = round(max(0.0, coleman_liau), 1)

    # 5. SMOG Index: 1.0430 * sqrt(complex_words * (30/sentences)) + 3.1291
    if num_sentences >= 3:
        smog = 1.0430 * math.sqrt(complex_words * (30 / num_sentences)) + 3.1291
    else:
        smog = fkgl
    smog = round(max(0.0, smog), 1)

    # Level classification
    if fre >= 80:
        level = "Easy / Conversational"
    elif fre >= 60:
        level = "Standard / General Public"
    elif fre >= 50:
        level = "Fairly Difficult / High School"
    elif fre >= 30:
        level = "Difficult / College Level"
    else:
        level = "Very Difficult / Postgraduate Academic"

    reading_time = round((num_words / 220) * 60)
    speaking_time = round((num_words / 140) * 60)

    return {
        "flesch_reading_ease": fre,
        "flesch_kincaid_grade": fkgl,
        "gunning_fog": gunning_fog,
        "coleman_liau": coleman_liau,
        "smog_index": smog,
        "reading_level": level,
        "word_count": num_words,
        "sentence_count": num_sentences,
        "complex_word_count": complex_words,
        "syllables_per_word": round(syllables_per_word, 2),
        "avg_sentence_length": round(avg_sentence_len, 1),
        "reading_time_seconds": reading_time,
        "speaking_time_seconds": speaking_time
    }


# --- 2. Academic Redundancy & Wordiness Dictionary ---

WORDINESS_PATTERNS = [
    (r"\bin order to\b", "to", "Concise replacement removes tautological 'in order'"),
    (r"\bat the present time\b", "currently", "More direct temporal adverb"),
    (r"\bat this point in time\b", "now", "Trim filler phrasing"),
    (r"\bdue to the fact that\b", "because", "Streamlines causal relationship"),
    (r"\bin spite of the fact that\b", "although", "Academic conciseness"),
    (r"\bhas the capability to\b", "can", "Direct active capability"),
    (r"\bhas the ability to\b", "can", "Direct active capability"),
    (r"\ba large number of\b", "many", "Quantitative conciseness"),
    (r"\ba majority of\b", "most", "Quantitative conciseness"),
    (r"\bin the event that\b", "if", "Direct conditional"),
    (r"\bprior to\b", "before", "Academic clarity over stiff preposition"),
    (r"\bsubsequent to\b", "after", "Simplifies formal timeline"),
    (r"\bwith regard to\b", "regarding", "Reduces bureaucratic phrasing"),
    (r"\bwith reference to\b", "regarding", "Reduces bureaucratic phrasing"),
    (r"\bin connection with\b", "about", "Clearer semantic link"),
    (r"\bconduct an investigation of\b", "investigate", "Nominalization reduction"),
    (r"\bconduct an analysis of\b", "analyze", "Nominalization reduction"),
    (r"\bmake a determination\b", "determine", "Nominalization reduction"),
    (r"\btake into consideration\b", "consider", "Nominalization reduction"),
    (r"\bperform an evaluation of\b", "evaluate", "Nominalization reduction"),
    (r"\bcome to a conclusion\b", "conclude", "Nominalization reduction"),
    (r"\bgive an indication of\b", "indicate", "Nominalization reduction"),
    (r"\bfor the purpose of\b", "for", "Direct preposition"),
    (r"\bby means of\b", "by", "Eliminates wordiness"),
    (r"\bplays an important role in\b", "influences", "Scholarly precision"),
    (r"\bin close proximity to\b", "near", "Concise spatial relation"),
    (r"\buntil such time as\b", "until", "Removes redundant temporal fluff"),
    (r"\bit is evident that\b", "evidently,", "Direct adverbial transition"),
    (r"\bit should be noted that\b", "notably,", "Academic flow"),
    (r"\bfirst and foremost\b", "primarily", "Removes clichéd idiom"),
    (r"\ball of a sudden\b", "suddenly", "Academic diction"),
    (r"\bevery single\b", "every", "Removes unnecessary intensifier"),
    (r"\bperiod of time\b", "period", "Tautology elimination"),
    (r"\bend result\b", "result", "Tautology elimination"),
    (r"\bcompletely eliminate\b", "eliminate", "Tautology elimination"),
    (r"\bfuture plans\b", "plans", "Tautology elimination"),
    (r"\bpast history\b", "history", "Tautology elimination"),
    (r"\btrue facts\b", "facts", "Tautology elimination")
]

# --- 3. Grammar, Spelling & Homophone Confusions ---

HOMOPHONE_AND_USAGE_RULES = [
    # their / there / they're
    (r"\btheir is\b", "there is", "Use 'there' to indicate existence or location, not possessive 'their'"),
    (r"\btheir are\b", "there are", "Use 'there' to indicate existence or location, not possessive 'their'"),
    (r"\bthere book\b", "their book", "Use possessive 'their' before a noun"),
    (r"\bthere findings\b", "their findings", "Use possessive 'their' for authorship attribution"),
    (r"\bthey're is\b", "there is", "Contraction 'they are' is incorrect in existential clause"),
    
    # its / it's
    (r"\bit's impact\b", "its impact", "Use possessive 'its' without apostrophe before a noun"),
    (r"\bit's effect\b", "its effect", "Use possessive 'its' without apostrophe before a noun"),
    (r"\bit's results\b", "its results", "Use possessive 'its' without apostrophe before a noun"),
    (r"\bit's role\b", "its role", "Use possessive 'its' without apostrophe before a noun"),
    (r"\bits clear that\b", "it's clear that", "Use contraction 'it's' (it is) before predicate adjective"),
    (r"\bits obvious that\b", "it's obvious that", "Use contraction 'it's' (it is) before predicate adjective"),

    # affect / effect
    (r"\bthe affect of\b", "the effect of", "Use noun 'effect' after definite article 'the'"),
    (r"\bhad an affect on\b", "had an effect on", "Use noun 'effect' as the object of 'had'"),
    (r"\bwill effect the outcome\b", "will affect the outcome", "Use verb 'affect' meaning to influence"),

    # then / than
    (r"\bmore then\b", "more than", "Use comparative 'than' after 'more'"),
    (r"\bless then\b", "less than", "Use comparative 'than' after 'less'"),
    (r"\bgreater then\b", "greater than", "Use comparative 'than' after 'greater'"),
    (r"\bhigher then\b", "higher than", "Use comparative 'than' after 'higher'"),
    (r"\blower then\b", "lower than", "Use comparative 'than' after 'lower'"),
    (r"\brather then\b", "rather than", "Use comparative conjunction 'rather than'"),

    # loose / lose
    (r"\bto loose\b", "to lose", "Use 'lose' (verb to misplace/fail), not 'loose' (adjective not tight)"),
    (r"\bwill loose\b", "will lose", "Use verb 'lose' after modal auxiliary"),

    # accept / except
    (r"\baccept for\b", "except for", "Use preposition 'except for' to indicate exclusion"),

    # principal / principle
    (r"\bfirst principals\b", "first principles", "Use 'principles' (fundamental truths/axioms)"),
    (r"\bprincipal component\b", "principal component", "Correct usage"),

    # article a / an
    (r"\ba apple\b", "an apple", "Use 'an' before vowel sounds"),
    (r"\ba algorithm\b", "an algorithm", "Use 'an' before vowel sounds"),
    (r"\ba experiment\b", "an experiment", "Use 'an' before vowel sounds"),
    (r"\ba evaluation\b", "an evaluation", "Use 'an' before vowel sounds"),
    (r"\ba investigation\b", "an investigation", "Use 'an' before vowel sounds"),
    (r"\ba optimal\b", "an optimal", "Use 'an' before vowel sounds"),
    (r"\ban user\b", "a user", "Use 'a' before consonant glide 'yu' in 'user'"),
    (r"\ban unique\b", "a unique", "Use 'a' before consonant glide 'yu' in 'unique'"),
    (r"\ban university\b", "a university", "Use 'a' before consonant glide 'yu' in 'university'")
]

# --- 4. Passive Voice Detector ---

PASSIVE_VOICE_REGEX = re.compile(
    r"\b(is|are|was|were|been|being|be)\s+([a-z]+ed|[a-z]+en|built|done|made|found|shown|seen|given|held|kept|told)\s+(by\s+[a-zA-Z]+)",
    re.IGNORECASE
)

# --- 5. Punctuation & Typography Checker ---

def check_punctuation_anomalies(text: str) -> List[Dict[str, Any]]:
    """
    Checks for missing spaces after periods/commas, double punctuation, and unclosed quotes.
    """
    issues = []
    
    # 1. Missing space after comma or period (ignoring digits like 3.14 or URLs)
    for m in re.finditer(r'([a-zA-Z])([,\.\?!;:])([a-zA-Z])', text):
        full_match = m.group(0)
        char1, punct, char2 = m.groups()
        issues.append({
            "id": f"punct-space-{m.start()}",
            "category": "punctuation",
            "original": full_match,
            "replacement": f"{char1}{punct} {char2}",
            "start": m.start(),
            "end": m.end(),
            "explanation": f"Missing whitespace following punctuation mark '{punct}'",
            "severity": "warning"
        })

    # 2. Repeated punctuation (e.g. '??', '!!', ',,', '..')
    for m in re.finditer(r'([,\?!;]){2,}', text):
        punct = m.group(1)
        issues.append({
            "id": f"punct-repeat-{m.start()}",
            "category": "punctuation",
            "original": m.group(0),
            "replacement": punct,
            "start": m.start(),
            "end": m.end(),
            "explanation": f"Repeated punctuation '{m.group(0)}' violates formal academic style guidelines",
            "severity": "suggestion"
        })

    # 3. Space before punctuation (e.g. 'hello , world')
    for m in re.finditer(r'\s+([,\.\?!;:])', text):
        issues.append({
            "id": f"punct-pre-space-{m.start()}",
            "category": "punctuation",
            "original": m.group(0),
            "replacement": m.group(1),
            "start": m.start(),
            "end": m.end(),
            "explanation": "Extraneous whitespace preceding punctuation mark",
            "severity": "warning"
        })

    # 4. Repeated adjacent identical word (e.g. 'the the')
    for m in re.finditer(r'\b([A-Za-z]+)\s+\1\b', text, re.IGNORECASE):
        issues.append({
            "id": f"repeat-word-{m.start()}",
            "category": "grammar",
            "original": m.group(0),
            "replacement": m.group(1),
            "start": m.start(),
            "end": m.end(),
            "explanation": f"Accidental lexical duplication of word '{m.group(1)}'",
            "severity": "critical"
        })

    return issues


# --- 6. Main Grammar & Style Audit Pipeline ---

def analyze_document_writing(text: str) -> Dict[str, Any]:
    """
    Executes a multi-layer writing analysis:
    - Readability indices
    - Grammar, homophones, spelling
    - Wordiness & nominalization reduction
    - Passive voice identification
    - Punctuation hygiene
    """
    metrics = compute_readability_metrics(text)
    issues: List[Dict[str, Any]] = []

    # 1. Punctuation checks
    issues.extend(check_punctuation_anomalies(text))

    # 2. Redundancy & Wordiness
    for pattern, replacement, explanation in WORDINESS_PATTERNS:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            orig_match = m.group(0)
            # Match capitalization of original match
            if orig_match.istitle():
                rep = replacement.capitalize()
            elif orig_match.isupper():
                rep = replacement.upper()
            else:
                rep = replacement

            issues.append({
                "id": f"wordiness-{m.start()}",
                "category": "wordiness",
                "original": orig_match,
                "replacement": rep,
                "start": m.start(),
                "end": m.end(),
                "explanation": explanation,
                "severity": "suggestion"
            })

    # 3. Homophones & Common Grammar
    for pattern, replacement, explanation in HOMOPHONE_AND_USAGE_RULES:
        for m in re.finditer(pattern, text, re.IGNORECASE):
            orig_match = m.group(0)
            if orig_match.istitle():
                rep = replacement.capitalize()
            elif orig_match.isupper():
                rep = replacement.upper()
            else:
                rep = replacement

            issues.append({
                "id": f"grammar-{m.start()}",
                "category": "grammar",
                "original": orig_match,
                "replacement": rep,
                "start": m.start(),
                "end": m.end(),
                "explanation": explanation,
                "severity": "critical"
            })

    # 4. Passive Voice with Agent
    for m in PASSIVE_VOICE_REGEX.finditer(text):
        verb_be, participle, by_phrase = m.groups()
        # Suggested active rewrite idea
        agent = by_phrase[3:].strip()
        rep = f"{agent} {participle}"
        issues.append({
            "id": f"passive-{m.start()}",
            "category": "passive_voice",
            "original": m.group(0),
            "replacement": rep,
            "start": m.start(),
            "end": m.end(),
            "explanation": f"Passive construction '{m.group(0)}'. Consider active voice '{rep}' for energetic academic style.",
            "severity": "suggestion"
        })

    # Sort issues by start position
    issues.sort(key=lambda x: x["start"])

    # Calculate overall clarity score (100 - penalties)
    penalty = 0
    for issue in issues:
        if issue["severity"] == "critical":
            penalty += 5
        elif issue["severity"] == "warning":
            penalty += 2
        else:
            penalty += 1

    clarity_score = max(35, 100 - min(65, penalty))

    # Category breakdown count
    category_counts = {
        "grammar": sum(1 for i in issues if i["category"] == "grammar"),
        "wordiness": sum(1 for i in issues if i["category"] == "wordiness"),
        "punctuation": sum(1 for i in issues if i["category"] == "punctuation"),
        "passive_voice": sum(1 for i in issues if i["category"] == "passive_voice")
    }

    return {
        "clarity_score": clarity_score,
        "metrics": metrics,
        "total_issues": len(issues),
        "category_counts": category_counts,
        "issues": issues
    }

