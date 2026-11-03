"""
VERITAS // Citation Intelligence & Phantom Reference Verification Engine
Provides automated citation formatting across 7 international standards (APA 7, MLA 9, IEEE, Chicago, Harvard, Vancouver, BibTeX),
in-text citation to bibliography cross-referencing, and real-time phantom citation detection via OpenAlex & Crossref.
"""

import re
import urllib.parse
import httpx
from typing import List, Dict, Any, Optional, Tuple

# In-memory cache for API citation queries
CITATION_VERIFICATION_CACHE: Dict[str, Dict[str, Any]] = {}

# --- 1. Citation Formatter across 7 Styles ---

def format_citation(metadata: Dict[str, Any], style: str = "apa7") -> str:
    """
    Formats academic metadata into the requested citation standard.
    metadata keys: title, authors (list of str or str), year, journal/venue, volume, issue, pages, doi, url
    styles: apa7, mla9, ieee, chicago, harvard, vancouver, bibtex
    """
    title = metadata.get("title", "Untitled Work").strip().rstrip(".")
    raw_authors = metadata.get("authors", [])
    if isinstance(raw_authors, str):
        authors_list = [a.strip() for a in raw_authors.split(",") if a.strip()]
    else:
        authors_list = [str(a).strip() for a in raw_authors if str(a).strip()]

    year = str(metadata.get("year", "n.d."))
    venue = metadata.get("venue") or metadata.get("journal", "Academic Press")
    volume = str(metadata.get("volume", ""))
    issue = str(metadata.get("issue", ""))
    pages = str(metadata.get("pages", ""))
    doi = metadata.get("doi", "").strip()

    doi_url = f"https://doi.org/{doi.replace('https://doi.org/', '')}" if doi else ""

    # Parse authors for APA: Last, F. M.
    formatted_authors = []
    for a in authors_list:
        parts = a.split()
        if len(parts) > 1:
            last = parts[-1]
            initials = " ".join([p[0].upper() + "." for p in parts[:-1]])
            formatted_authors.append(f"{last}, {initials}")
        else:
            formatted_authors.append(a)

    style = style.lower().strip()

    # 1. APA 7th Edition
    if style == "apa7":
        if len(formatted_authors) == 1:
            auth_str = formatted_authors[0]
        elif len(formatted_authors) == 2:
            auth_str = f"{formatted_authors[0]} & {formatted_authors[1]}"
        elif len(formatted_authors) > 2:
            auth_str = f"{formatted_authors[0]} et al."
        else:
            auth_str = "Anonymous"

        vol_issue = f"{volume}({issue})" if volume and issue else (volume or issue)
        vol_str = f", {vol_issue}" if vol_issue else ""
        page_str = f", {pages}" if pages else ""
        doi_str = f" {doi_url}" if doi_url else ""

        return f"{auth_str} ({year}). {title}. {venue}{vol_str}{page_str}.{doi_str}".strip()

    # 2. MLA 9th Edition
    elif style == "mla9":
        if authors_list:
            parts = authors_list[0].split()
            first_auth = f"{parts[-1]}, {' '.join(parts[:-1])}" if len(parts) > 1 else authors_list[0]
            if len(authors_list) == 2:
                auth_str = f"{first_auth}, and {authors_list[1]}."
            elif len(authors_list) > 2:
                auth_str = f"{first_auth}, et al."
            else:
                auth_str = f"{first_auth}."
        else:
            auth_str = "Anonymous."

        vol_issue = f", vol. {volume}" if volume else ""
        vol_issue += f", no. {issue}" if issue else ""
        page_str = f", pp. {pages}" if pages else ""
        return f'{auth_str} "{title}." {venue}{vol_issue}, {year}{page_str}.'.strip()

    # 3. IEEE
    elif style == "ieee":
        ieee_authors = []
        for a in authors_list:
            parts = a.split()
            if len(parts) > 1:
                initials = " ".join([p[0].upper() + "." for p in parts[:-1]])
                ieee_authors.append(f"{initials} {parts[-1]}")
            else:
                ieee_authors.append(a)

        if len(ieee_authors) > 3:
            auth_str = f"{ieee_authors[0]} et al.,"
        elif ieee_authors:
            auth_str = ", ".join(ieee_authors) + ","
        else:
            auth_str = "Anon.,"

        vol_str = f"vol. {volume}, " if volume else ""
        no_str = f"no. {issue}, " if issue else ""
        pp_str = f"pp. {pages}, " if pages else ""
        return f'{auth_str} "{title}," {venue}, {vol_str}{no_str}{pp_str}{year}.'.strip()

    # 4. Chicago (Notes & Bibliography)
    elif style == "chicago":
        auth_str = formatted_authors[0] if formatted_authors else "Anonymous"
        if len(formatted_authors) > 1:
            auth_str += " et al."
        return f'{auth_str}. {year}. "{title}." {venue} {volume} ({issue}): {pages}. {doi_url}'.strip()

    # 5. Harvard
    elif style == "harvard":
        auth_str = formatted_authors[0] if formatted_authors else "Anon."
        if len(formatted_authors) > 2:
            auth_str += " et al."
        elif len(formatted_authors) == 2:
            auth_str += f" and {formatted_authors[1]}"
        return f"{auth_str} ({year}) '{title}', {venue}, {volume}({issue}), pp. {pages}.".strip()

    # 6. Vancouver
    elif style == "vancouver":
        v_auth = []
        for a in authors_list[:6]:
            parts = a.split()
            if len(parts) > 1:
                initials = "".join([p[0].upper() for p in parts[:-1]])
                v_auth.append(f"{parts[-1]} {initials}")
            else:
                v_auth.append(a)
        auth_str = ", ".join(v_auth) + (" et al." if len(authors_list) > 6 else "")
        return f"{auth_str}. {title}. {venue}. {year};{volume}({issue}):{pages}.".strip()

    # 7. BibTeX
    elif style == "bibtex":
        first_word = re.sub(r'[^a-zA-Z]', '', title.split()[0].lower()) if title else "paper"
        first_author_last = authors_list[0].split()[-1].lower() if authors_list else "anon"
        cite_key = f"{first_author_last}{year}{first_word}"
        bib_authors = " and ".join(authors_list) if authors_list else "Anonymous"

        return f"""@article{{{cite_key},
  author    = {{{bib_authors}}},
  title     = {{{title}}},
  journal   = {{{venue}}},
  year      = {{{year}}},
  volume    = {{{volume}}},
  number    = {{{issue}}},
  pages     = {{{pages}}},
  doi       = {{{doi}}}
}}""".strip()

    return f"{title} ({year})"


# --- 2. In-Text Citation and Bibliography Parser ---

IN_TEXT_AUTHOR_DATE = re.compile(
    r'\(([A-Z][a-zA-Z]+(?:\s+et\s+al\.?|\s+and\s+[A-Z][a-zA-Z]+)?),\s*((?:19|20)\d{2}[a-z]?)(?:,\s*p{1,2}\.?\s*\d+)?\)'
)

IN_TEXT_NUMERIC = re.compile(r'\[(\d+(?:\s*,\s*\d+)*(?:\s*-\s*\d+)?)\]')

BIBLIOGRAPHY_SPLITTERS = [
    r'\n(?:#{1,3}\s*)?References\b',
    r'\n(?:#{1,3}\s*)?Works Cited\b',
    r'\n(?:#{1,3}\s*)?Bibliography\b',
    r'\n(?:#{1,3}\s*)?Literature Cited\b'
]

def parse_document_citations(text: str) -> Dict[str, Any]:
    """
    Splits document into body text and reference list, parses in-text citations,
    and cross-checks them against listed references.
    """
    body_text = text
    references_text = ""

    # Look for bibliography section header
    for splitter in BIBLIOGRAPHY_SPLITTERS:
        match = re.search(splitter, text, re.IGNORECASE)
        if match:
            body_text = text[:match.start()]
            references_text = text[match.end():]
            break

    # 1. Extract in-text author-date citations
    in_text_citations = []
    for m in IN_TEXT_AUTHOR_DATE.finditer(body_text):
        author, year = m.groups()
        in_text_citations.append({
            "raw": m.group(0),
            "author": author.strip(),
            "year": year.strip(),
            "type": "author-date",
            "start": m.start(),
            "end": m.end()
        })

    # 2. Extract numeric in-text citations [1], [2-4]
    for m in IN_TEXT_NUMERIC.finditer(body_text):
        num_str = m.group(1)
        in_text_citations.append({
            "raw": m.group(0),
            "numbers": num_str.strip(),
            "type": "numeric",
            "start": m.start(),
            "end": m.end()
        })

    # 3. Parse individual reference list entries
    parsed_references = []
    if references_text.strip():
        # Split references by numbering or blank lines
        raw_entries = re.split(r'\n+(?=\[\d+\]|\d+\.|\b[A-Z][a-zA-Z]+,\s+[A-Z]\.|\n)', references_text.strip())
        for idx, entry in enumerate(raw_entries):
            clean_entry = entry.strip()
            if len(clean_entry) > 15:
                # Extract year if present
                year_match = re.search(r'\b((?:19|20)\d{2})\b', clean_entry)
                year = year_match.group(1) if year_match else "n.d."
                
                # Extract DOI if present
                doi_match = re.search(r'10\.\d{4,9}/[-._;()/:A-Za-z0-9]+', clean_entry)
                doi = doi_match.group(0) if doi_match else None

                parsed_references.append({
                    "id": f"ref-{idx+1}",
                    "text": clean_entry,
                    "year": year,
                    "doi": doi
                })

    # 4. Cross-check: find orphaned in-text citations and uncited references
    orphaned_citations = []
    for it in in_text_citations:
        if it.get("type") == "author-date":
            auth_token = it["author"].split()[0].lower()
            year_token = it["year"]
            # Look for match in bibliography
            matched = any(auth_token in r["text"].lower() and year_token in r["text"] for r in parsed_references)
            if not matched and parsed_references:
                orphaned_citations.append(it)

    return {
        "has_bibliography": bool(parsed_references),
        "in_text_citation_count": len(in_text_citations),
        "in_text_citations": in_text_citations,
        "bibliography_count": len(parsed_references),
        "references": parsed_references,
        "orphaned_citations": orphaned_citations
    }


# --- 3. Phantom Citation & Hallucination Detector ---

def verify_citation_authenticity(query: str, doi: Optional[str] = None) -> Dict[str, Any]:
    """
    Verifies if a citation represents a real, published academic work
    by cross-referencing Crossref and OpenAlex.
    Detects fake or hallucinated citations generated by AI models.
    """
    cache_key = f"{doi}_{query[:80]}"
    if cache_key in CITATION_VERIFICATION_CACHE:
        return CITATION_VERIFICATION_CACHE[cache_key]

    headers = {"User-Agent": "VeritasCitationAudit/2.0 (mailto:integrity@veritas.edu)"}

    # 1. DOI Resolution Verification
    if doi:
        clean_doi = doi.replace("https://doi.org/", "").strip()
        try:
            with httpx.Client(timeout=4.0) as client:
                res = client.get(f"https://api.crossref.org/works/{clean_doi}", headers=headers)
                if res.status_code == 200:
                    data = res.json().get("message", {})
                    title = data.get("title", [""])[0]
                    year = data.get("created", {}).get("date-parts", [[None]])[0][0]
                    authors = [f"{a.get('given','')} {a.get('family','')}".strip() for a in data.get("author", [])]

                    result = {
                        "status": "VERIFIED_AUTHENTIC",
                        "verdict": "Verified via Crossref DOI Registry",
                        "title": title,
                        "year": year,
                        "authors": authors[:3],
                        "doi": clean_doi,
                        "confidence": 0.99
                    }
                    CITATION_VERIFICATION_CACHE[cache_key] = result
                    return result
                elif res.status_code == 404:
                    result = {
                        "status": "HALLUCINATED_PHANTOM",
                        "verdict": "Invalid DOI: Not found in international Crossref registry",
                        "doi": clean_doi,
                        "confidence": 0.95
                    }
                    CITATION_VERIFICATION_CACHE[cache_key] = result
                    return result
        except Exception:
            pass

    # 2. OpenAlex Title / Text Query
    try:
        # Extract title keywords
        clean_query = re.sub(r'\[\d+\]|\(\d{4}\)|pp\.\s*\d+-\d+|https?://\S+', '', query).strip()
        clean_query = clean_query[:120]

        with httpx.Client(timeout=4.5) as client:
            url = f"https://api.openalex.org/works?search={urllib.parse.quote(clean_query)}&per_page=1"
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                if results:
                    top = results[0]
                    top_title = top.get("title", "")
                    top_year = top.get("publication_year")
                    top_doi = top.get("doi")
                    authors = [a.get("author", {}).get("display_name", "") for a in top.get("authorships", [])]

                    # Check title similarity
                    query_words = set(re.findall(r'\b[A-Za-z]{4,}\b', clean_query.lower()))
                    match_words = set(re.findall(r'\b[A-Za-z]{4,}\b', top_title.lower()))
                    overlap = len(query_words & match_words) / max(1, len(query_words))

                    if overlap >= 0.45:
                        result = {
                            "status": "VERIFIED_AUTHENTIC",
                            "verdict": "Authentic academic paper verified in OpenAlex catalog (250M index)",
                            "title": top_title,
                            "year": top_year,
                            "authors": authors[:3],
                            "doi": top_doi,
                            "confidence": round(min(0.98, 0.6 + overlap * 0.4), 2)
                        }
                    else:
                        result = {
                            "status": "METADATA_MISMATCH",
                            "verdict": "Closest matching work differs significantly from cited title",
                            "title": top_title,
                            "year": top_year,
                            "confidence": 0.70
                        }
                    CITATION_VERIFICATION_CACHE[cache_key] = result
                    return result
                else:
                    result = {
                        "status": "HALLUCINATED_PHANTOM",
                        "verdict": "Potential Hallucination: No published work found matching this citation in 250M catalog",
                        "confidence": 0.85
                    }
                    CITATION_VERIFICATION_CACHE[cache_key] = result
                    return result
    except Exception as e:
        return {
            "status": "INCONCLUSIVE",
            "verdict": f"Citation audit registry unreachable: {str(e)[:50]}",
            "confidence": 0.50
        }

