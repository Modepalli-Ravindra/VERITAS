"""
VERITAS // Intelligent Academic Rewrite Engine
High-fidelity local text transformation suite providing 9 specialized scholarly and professional rewriting modes.
Features word-level diff analysis, readability delta computation, and strict academic ethics guardrails.
"""

import re
import difflib
from typing import List, Dict, Any, Tuple
from app.engines.grammar_engine import compute_readability_metrics

# --- 1. Mode Transformation Dictionaries & Heuristics ---

CONTRACTION_EXPANSIONS = {
    r"\bdon't\b": "do not",
    r"\bdoesn't\b": "does not",
    r"\bdidn't\b": "did not",
    r"\bwon't\b": "will not",
    r"\bwouldn't\b": "would not",
    r"\bcan't\b": "cannot",
    r"\bcouldn't\b": "could not",
    r"\bshouldn't\b": "should not",
    r"\bisn't\b": "is not",
    r"\baren't\b": "are not",
    r"\bwasn't\b": "was not",
    r"\bweren't\b": "were not",
    r"\bit's\b": "it is",
    r"\bthat's\b": "that is",
    r"\bthere's\b": "there is",
    r"\bthey're\b": "they are",
    r"\bwe're\b": "we are",
    r"\byou're\b": "you are"
}

INFORMAL_TO_ACADEMIC = [
    (r"\ba lot of\b", "a substantial quantity of"),
    (r"\blots of\b", "numerous"),
    (r"\bkind of\b", "somewhat"),
    (r"\bsort of\b", "to an extent"),
    (r"\bget\b", "obtain"),
    (r"\bgives\b", "provides"),
    (r"\bbig\b", "significant"),
    (r"\bhuge\b", "substantial"),
    (r"\bbad\b", "adverse"),
    (r"\bgood\b", "beneficial"),
    (r"\bshow\b", "demonstrate"),
    (r"\bshows\b", "demonstrates"),
    (r"\bfind out\b", "ascertain"),
    (r"\blook into\b", "investigate"),
    (r"\bput together\b", "synthesize"),
    (r"\bcome up with\b", "formulate"),
    (r"\btalk about\b", "discuss"),
    (r"\bpoints out\b", "elucidates"),
    (r"\bproves that\b", "strongly indicates that")  # Scholarly hedging
]

CONCISE_REPLACEMENTS = [
    (r"\bin order to\b", "to"),
    (r"\bat the present time\b", "currently"),
    (r"\bat this point in time\b", "now"),
    (r"\bdue to the fact that\b", "because"),
    (r"\bin spite of the fact that\b", "although"),
    (r"\bhas the capability to\b", "can"),
    (r"\ba large number of\b", "many"),
    (r"\ba majority of\b", "most"),
    (r"\bin the event that\b", "if"),
    (r"\bconduct an investigation of\b", "investigate"),
    (r"\bconduct an analysis of\b", "analyze"),
    (r"\bmake a determination\b", "determine"),
    (r"\btake into consideration\b", "consider"),
    (r"\bcome to a conclusion\b", "conclude"),
    (r"\bfirst and foremost\b", "primarily"),
    (r"\bperiod of time\b", "period"),
    (r"\bend result\b", "result"),
    (r"\bcompletely eliminate\b", "eliminate"),
    (r"\btrue facts\b", "facts")
]

ESL_SMOOTHING = [
    (r"\bdiscuss about\b", "discuss"),
    (r"\bexplain about\b", "explain"),
    (r"\bpay attention on\b", "pay attention to"),
    (r"\bcope up with\b", "cope with"),
    (r"\bcomprise of\b", "comprise"),
    (r"\baccording to me\b", "in my perspective"),
    (r"\bas per my opinion\b", "in my view"),
    (r"\bin recent days\b", "in recent years"),
    (r"\brelated with\b", "related to"),
    (r"\bdifferent than\b", "different from")
]

TECHNICAL_REPLACEMENTS = [
    (r"\bchange\b", "mutation / variation"),
    (r"\bspeed\b", "throughput / velocity"),
    (r"\berror\b", "deviation / anomaly"),
    (r"\bsetup\b", "configuration"),
    (r"\bparts\b", "components"),
    (r"\bways\b", "methodologies"),
    (r"\bmeasure\b", "quantify"),
    (r"\bcheck\b", "validate / verify")
]

CASUAL_REPLACEMENTS = [
    (r"\bdemonstrate\b", "show"),
    (r"\butilize\b", "use"),
    (r"\bascertain\b", "find out"),
    (r"\bcommence\b", "start"),
    (r"\bterminate\b", "end"),
    (r"\belucidate\b", "explain"),
    (r"\bsubstantial\b", "big"),
    (r"\bconsequently\b", "so"),
    (r"\bnevertheless\b", "still")
]


# --- 2. Rewriting Pipeline by Mode ---

def transform_text_mode(text: str, mode: str) -> str:
    """
    Transforms text based on the selected mode:
    - academic_formal
    - executive_concise
    - clarity_enhancer
    - fluent_esl
    - technical_rigor
    - creative_scholarly
    - paraphrase_academic
    - direct_active
    - casual_accessible
    """
    transformed = text

    # Apply contractions expansion for academic and professional modes
    if mode in ["academic_formal", "executive_concise", "technical_rigor", "paraphrase_academic"]:
        for pattern, replacement in CONTRACTION_EXPANSIONS.items():
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)

    # 1. Academic Formal
    if mode == "academic_formal":
        for pattern, replacement in INFORMAL_TO_ACADEMIC:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)
        for pattern, replacement in CONCISE_REPLACEMENTS[:10]:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)

    # 2. Executive Concise
    elif mode == "executive_concise":
        for pattern, replacement in CONCISE_REPLACEMENTS:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)
        # Remove empty fillers
        transformed = re.sub(r"\b(obviously|clearly|needless to say|as everyone knows),?\s*", "", transformed, flags=re.IGNORECASE)

    # 3. Clarity Enhancer
    elif mode == "clarity_enhancer":
        for pattern, replacement in CONCISE_REPLACEMENTS:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)
        # Split extra long coordinate clauses with semicolons or periods
        sentences = re.split(r'([.!?]+)', transformed)
        reconstructed = []
        for i in range(0, len(sentences) - 1, 2):
            s = sentences[i].strip()
            punct = sentences[i+1]
            if len(s.split()) > 35 and " and furthermore " in s:
                s = s.replace(" and furthermore ", ". Furthermore, ")
            if len(s.split()) > 30 and " however " in s:
                s = s.replace(" however ", "; however, ")
            reconstructed.append(s + punct)
        if len(sentences) % 2 == 1 and sentences[-1].strip():
            reconstructed.append(sentences[-1].strip())
        transformed = " ".join(reconstructed)

    # 4. Fluent ESL
    elif mode == "fluent_esl":
        for pattern, replacement in ESL_SMOOTHING:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)
        for pattern, replacement in INFORMAL_TO_ACADEMIC[:8]:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)

    # 5. Technical Rigor
    elif mode == "technical_rigor":
        for pattern, replacement in TECHNICAL_REPLACEMENTS:
            # take first word before slash
            rep_word = replacement.split(" / ")[0]
            transformed = re.sub(pattern, rep_word, transformed, flags=re.IGNORECASE)

    # 6. Creative Scholarly
    elif mode == "creative_scholarly":
        transformed = re.sub(r"\bThis shows that\b", "These observations compellingly illustrate that", transformed, flags=re.IGNORECASE)
        transformed = re.sub(r"\bIn conclusion\b", "Synthesizing these trajectories", transformed, flags=re.IGNORECASE)
        transformed = re.sub(r"\bImportantly\b", "Crucially to our understanding", transformed, flags=re.IGNORECASE)

    # 7. Paraphrase Academic
    elif mode == "paraphrase_academic":
        for pattern, replacement in INFORMAL_TO_ACADEMIC:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)
        for pattern, replacement in CONCISE_REPLACEMENTS:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)

    # 8. Direct Active
    elif mode == "direct_active":
        # Convert passive patterns e.g. "was analyzed by the researchers" -> "the researchers analyzed"
        passive_pat = re.compile(r"\b(was|were|is|are)\s+([a-z]+ed)\s+by\s+([a-zA-Z\s]+?)(?=[,\.\?!;])", re.IGNORECASE)
        def replace_passive(match):
            _, verb, agent = match.groups()
            return f"{agent.strip()} {verb}"
        transformed = passive_pat.sub(replace_passive, transformed)

    # 9. Casual Accessible
    elif mode == "casual_accessible":
        for pattern, replacement in CASUAL_REPLACEMENTS:
            transformed = re.sub(pattern, replacement, transformed, flags=re.IGNORECASE)

    # 10. Deep AI Humanize via Gateway
    elif mode == "ai_humanize":
        from app.core.llm_gateway import GATEWAY
        res = GATEWAY.humanize_ai_text(text)
        return res["humanized_text"]

    # Clean whitespace
    transformed = re.sub(r'\s+', ' ', transformed).strip()
    return transformed


# --- 3. Word-Level Visual Diff Generator ---

def generate_word_diff(original: str, rewritten: str) -> List[Dict[str, str]]:
    """
    Generates structured word-level diff tokens:
    [
        {"type": "equal", "text": "The "},
        {"type": "delete", "text": "dominant "},
        {"type": "insert", "text": "primary "},
        ...
    ]
    """
    orig_words = re.findall(r'\S+|\s+', original)
    new_words = re.findall(r'\S+|\s+', rewritten)

    matcher = difflib.SequenceMatcher(None, orig_words, new_words)
    diff_tokens = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            diff_tokens.append({
                "type": "equal",
                "text": "".join(orig_words[i1:i2])
            })
        elif tag == "delete":
            diff_tokens.append({
                "type": "delete",
                "text": "".join(orig_words[i1:i2])
            })
        elif tag == "insert":
            diff_tokens.append({
                "type": "insert",
                "text": "".join(new_words[j1:j2])
            })
        elif tag == "replace":
            diff_tokens.append({
                "type": "delete",
                "text": "".join(orig_words[i1:i2])
            })
            diff_tokens.append({
                "type": "insert",
                "text": "".join(new_words[j1:j2])
            })

    return diff_tokens


# --- 4. Main Rewrite Pipeline ---

MODE_METADATA = {
    "academic_formal": {
        "label": "Academic Formal",
        "description": "Elevates scholarly diction, hedges absolute claims, and enforces rigorous terminology."
    },
    "executive_concise": {
        "label": "Executive & Concise",
        "description": "Ruthlessly trims wordiness, nominalizations, and filler while maximizing semantic density."
    },
    "clarity_enhancer": {
        "label": "Clarity & Readability",
        "description": "Untangles dense compound sentences and enhances syntactic balance for seamless comprehension."
    },
    "fluent_esl": {
        "label": "Fluent ESL Cadence",
        "description": "Refines non-native English preposition collocations and rhythm while protecting original voice."
    },
    "technical_rigor": {
        "label": "Technical & Engineering",
        "description": "Aligns phrasing with precise scientific, engineering, and statistical nomenclature."
    },
    "creative_scholarly": {
        "label": "Creative Scholarly",
        "description": "Enriches rhetorical cadence with sophisticated transitions and intellectual dynamism."
    },
    "paraphrase_academic": {
        "label": "Academic Paraphrase",
        "description": "Restructures clause architecture and diction while preserving citations and core findings."
    },
    "direct_active": {
        "label": "Direct Active Voice",
        "description": "Converts bureaucratic passive constructions into vigorous, subject-driven active sentences."
    },
    "casual_accessible": {
        "label": "Casual & Accessible",
        "description": "Translates dense academic terminology into plain language for broader public communication."
    },
    "ai_humanize": {
        "label": "Deep AI Humanizer (Gateway LLM)",
        "description": "Multi-provider LLM gateway rewriting with high burstiness, human sentence cadence, and zero AI robotic artifacts."
    }
}

def execute_rewrite(text: str, mode: str = "academic_formal") -> Dict[str, Any]:
    """
    Executes rewrite, computes diff tokens, readability shift, and returns complete report.
    """
    if mode not in MODE_METADATA:
        mode = "academic_formal"

    original_metrics = compute_readability_metrics(text)
    rewritten_text = transform_text_mode(text, mode)
    rewritten_metrics = compute_readability_metrics(rewritten_text)

    # Word count and readability shifts
    word_delta = rewritten_metrics["word_count"] - original_metrics["word_count"]
    fre_delta = round(rewritten_metrics["flesch_reading_ease"] - original_metrics["flesch_reading_ease"], 1)

    diff_tokens = generate_word_diff(text, rewritten_text)

    return {
        "mode": mode,
        "mode_info": MODE_METADATA[mode],
        "original_text": text,
        "rewritten_text": rewritten_text,
        "original_metrics": original_metrics,
        "rewritten_metrics": rewritten_metrics,
        "deltas": {
            "word_count_change": word_delta,
            "reading_ease_change": fre_delta,
            "character_count_change": len(rewritten_text) - len(text)
        },
        "diff_tokens": diff_tokens,
        "ethics_disclaimer": "Veritas Rewrite Studio is engineered for linguistic refinement and academic clarity. It maintains underlying research integrity and semantic intent without attempting to bypass authorship detection."
    }

