import httpx
import xml.etree.ElementTree as ET
import urllib.parse
import re
import time
import trafilatura
from typing import List, Dict, Any, Optional, Tuple

class AcademicSearchEngine:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (VERITAS-AcademicIntegrityEngine/2.0; mailto:auditor@veritas.local)"
        }
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self._cache_ttl = 3600 * 4  # 4-hour memory cache

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, data = self._cache[key]
            if time.time() - timestamp < self._cache_ttl:
                return data
            del self._cache[key]
        return None

    def _save_to_cache(self, key: str, data: Any):
        if len(self._cache) > 2000:
            # Simple eviction of oldest quarter
            oldest_keys = sorted(self._cache.keys(), key=lambda k: self._cache[k][0])[:500]
            for k in oldest_keys:
                del self._cache[k]
        self._cache[key] = (time.time(), data)

    def _reconstruct_openalex_abstract(self, inverted_index: Optional[Dict[str, List[int]]]) -> str:
        """Reconstruct full clean abstract text from OpenAlex inverted index"""
        if not inverted_index or not isinstance(inverted_index, dict):
            return ""
        try:
            pos_words = []
            for word, positions in inverted_index.items():
                for pos in positions:
                    pos_words.append((pos, word))
            pos_words.sort(key=lambda x: x[0])
            return " ".join(w for _, w in pos_words)
        except Exception:
            return ""

    async def fetch_full_page_content(self, url: str) -> Optional[str]:
        """
        Extracts full clean readable text from matched URLs/papers using trafilatura.
        Enables Turnitin-level deep document comparison beyond just snippets.
        """
        try:
            if not url or not url.startswith("http"):
                return None
            async with httpx.AsyncClient(timeout=6.0, headers=self.headers, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    extracted = trafilatura.extract(resp.text, include_comments=False, include_tables=False)
                    if extracted and len(extracted.strip()) > 100:
                        return extracted[:12000] # Cap at ~12k characters for fast hashing
        except Exception:
            pass
        return None

    async def search_semantic_scholar(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Search Semantic Scholar's free public database (200M+ papers)"""
        cache_key = f"s2:{query[:100]}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        results = []
        try:
            clean_q = urllib.parse.quote(query[:140].strip())
            url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={clean_q}&limit={limit}&fields=title,abstract,authors,year,url,venue"
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    papers = data.get("data", [])
                    for p in papers:
                        abstract = p.get("abstract") or ""
                        paper_url = p.get("url") or f"https://www.semanticscholar.org/paper/{p.get('paperId', '')}"
                        results.append({
                            "source_type": "academic",
                            "source_title": p.get("title", "Untitled Research Paper"),
                            "source_url": paper_url,
                            "snippet": abstract[:1000],
                            "year": p.get("year", "N/A"),
                            "provider": "Semantic Scholar (200M Papers)"
                        })
            self._save_to_cache(cache_key, results)
        except Exception:
            pass
        return results

    async def search_arxiv(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Search arXiv free public API for computer science, AI, math, physics papers"""
        cache_key = f"arxiv:{query[:100]}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        results = []
        try:
            clean_q = urllib.parse.quote(query[:120].strip())
            url = f"http://export.arxiv.org/api/query?search_query=all:{clean_q}&start=0&max_results={limit}"
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    root = ET.fromstring(res.text)
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    for entry in root.findall("atom:entry", ns):
                        title_el = entry.find("atom:title", ns)
                        summary_el = entry.find("atom:summary", ns)
                        id_el = entry.find("atom:id", ns)
                        
                        title = title_el.text.strip().replace("\n", " ") if title_el is not None else "arXiv Paper"
                        summary = summary_el.text.strip().replace("\n", " ") if summary_el is not None else ""
                        paper_url = id_el.text.strip() if id_el is not None else "https://arxiv.org"
                        
                        results.append({
                            "source_type": "academic",
                            "source_title": f"[arXiv] {title}",
                            "source_url": paper_url,
                            "snippet": summary[:1000],
                            "provider": "arXiv Academic Archive"
                        })
            self._save_to_cache(cache_key, results)
        except Exception:
            pass
        return results

    async def search_crossref(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Search Crossref free API for published journals and DOI literature"""
        cache_key = f"crossref:{query[:100]}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        results = []
        try:
            clean_q = urllib.parse.quote(query[:120].strip())
            url = f"https://api.crossref.org/works?query={clean_q}&rows={limit}"
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    items = data.get("message", {}).get("items", [])
                    for item in items:
                        title_list = item.get("title", [])
                        title = title_list[0] if title_list else "Published DOI Paper"
                        doi_url = item.get("URL") or f"https://doi.org/{item.get('DOI', '')}"
                        abstract = item.get("abstract") or item.get("container-title", [""])[0] or ""
                        abstract = re.sub(r'<[^>]+>', '', abstract)
                        results.append({
                            "source_type": "academic",
                            "source_title": f"[Crossref] {title}",
                            "source_url": doi_url,
                            "snippet": abstract[:1000],
                            "provider": "Crossref DOI Registry"
                        })
            self._save_to_cache(cache_key, results)
        except Exception:
            pass
        return results

    async def search_openalex(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Search OpenAlex open catalog (250M+ scientific publications with zero paywalls)"""
        cache_key = f"openalex:{query[:100]}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        results = []
        try:
            clean_q = urllib.parse.quote(query[:120].strip())
            url = f"https://api.openalex.org/works?search={clean_q}&per-page={limit}&mailto=auditor@veritas.local"
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    works = data.get("results", [])
                    for work in works:
                        title = work.get("title") or "Academic Publication"
                        doi = work.get("doi")
                        work_url = doi or work.get("id") or "https://openalex.org"
                        year = work.get("publication_year") or "N/A"
                        primary_loc = work.get("primary_location") or {}
                        source_info = primary_loc.get("source") or {}
                        venue = source_info.get("display_name") or "Peer-Reviewed Venue"
                        
                        abstract = self._reconstruct_openalex_abstract(work.get("abstract_inverted_index"))
                        if not abstract:
                            abstract = f"Published in {venue} ({year})."
                        
                        authorships = work.get("authorships", [])
                        author_names = [a.get("author", {}).get("display_name") for a in authorships[:3] if a.get("author")]
                        authors_str = ", ".join(filter(None, author_names))
                        
                        results.append({
                            "source_type": "academic",
                            "source_title": f"[OpenAlex] {title}",
                            "source_url": work_url,
                            "snippet": abstract[:1200],
                            "year": year,
                            "authors": authors_str,
                            "venue": venue,
                            "provider": "OpenAlex Global Index (250M Works)"
                        })
            self._save_to_cache(cache_key, results)
        except Exception:
            pass
        return results

    async def search_web_duckduckgo(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search DuckDuckGo HTML/Instant Answer for free web matches"""
        results = []
        try:
            clean_q = urllib.parse.quote(query[:130].strip())
            url = f"https://html.duckduckgo.com/html/?q={clean_q}"
            async with httpx.AsyncClient(timeout=8.0, headers=self.headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(res.text, "html.parser")
                    links = soup.select(".result__body")
                    for body in links[:limit]:
                        title_tag = body.select_one(".result__title .result__url, .result__title a")
                        snippet_tag = body.select_one(".result__snippet")
                        url_tag = body.select_one(".result__url")
                        
                        title = title_tag.get_text(strip=True) if title_tag else "Web Page"
                        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""
                        link_url = ""
                        if title_tag and title_tag.name == 'a' and title_tag.has_attr('href'):
                            raw_href = title_tag['href']
                            if "uddg=" in raw_href:
                                m = re.search(r'uddg=([^&]+)', raw_href)
                                if m:
                                    link_url = urllib.parse.unquote(m.group(1))
                            else:
                                link_url = raw_href
                        elif url_tag:
                            link_url = "https://" + url_tag.get_text(strip=True).replace(" ", "")
                            
                        if not link_url:
                            link_url = f"https://duckduckgo.com/?q={clean_q}"
                            
                        results.append({
                            "source_type": "web",
                            "source_title": title,
                            "source_url": link_url,
                            "snippet": snippet[:1000],
                            "provider": "Open Web Search"
                        })
        except Exception:
            pass
        return results

    async def search_github_code(self, code_query: str, language: str = "python", limit: int = 4) -> List[Dict[str, Any]]:
        """Search GitHub public code repositories for matching code signatures"""
        results = []
        try:
            clean_lines = [l.strip() for l in code_query.split("\n") if len(l.strip()) > 15 and not l.strip().startswith(("#", "//", "/*", "*"))]
            if not clean_lines:
                return []
            search_clause = " ".join(clean_lines[:2])[:100]
            clean_q = urllib.parse.quote(f"{search_clause} language:{language}")
            url = f"https://api.github.com/search/code?q={clean_q}&per_page={limit}"
            async with httpx.AsyncClient(timeout=8.0, headers={
                "User-Agent": "PlagiarismDetector-CodeQuery/2.0",
                "Accept": "application/vnd.github.v3+json"
            }) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    items = data.get("items", [])
                    for it in items:
                        repo_name = it.get("repository", {}).get("full_name", "Public GitHub Repo")
                        file_path = it.get("path", "")
                        html_url = it.get("html_url", "")
                        results.append({
                            "source_type": "code_clone",
                            "source_title": f"GitHub: {repo_name}/{file_path}",
                            "source_url": html_url,
                            "snippet": f"Found in repository {repo_name} at {file_path}",
                            "provider": "GitHub Public Code"
                        })
        except Exception:
            pass
        return results

# Synchronous helper for API endpoints and citation tools
def search_openalex_catalog(query: str, limit: int = 6) -> List[Dict[str, Any]]:
    """Synchronous helper querying OpenAlex 250M catalog with reconstructed abstracts"""
    clean_q = urllib.parse.quote(query[:140].strip())
    url = f"https://api.openalex.org/works?search={clean_q}&per-page={limit}&mailto=auditor@veritas.local"
    results = []
    try:
        with httpx.Client(timeout=6.0, headers={"User-Agent": "VERITAS-AcademicEngine/2.0 (mailto:auditor@veritas.local)"}) as client:
            res = client.get(url)
            if res.status_code == 200:
                data = res.json()
                engine = AcademicSearchEngine()
                for work in data.get("results", []):
                    title = work.get("title") or "Academic Publication"
                    doi = work.get("doi")
                    work_url = doi or work.get("id") or "https://openalex.org"
                    year = work.get("publication_year") or "N/A"
                    primary_loc = work.get("primary_location") or {}
                    source_info = primary_loc.get("source") or {}
                    venue = source_info.get("display_name") or "Peer-Reviewed Journal"
                    abstract = engine._reconstruct_openalex_abstract(work.get("abstract_inverted_index"))
                    authorships = work.get("authorships", [])
                    author_names = [a.get("author", {}).get("display_name") for a in authorships[:3] if a.get("author")]
                    results.append({
                        "title": title,
                        "doi": doi,
                        "url": work_url,
                        "year": year,
                        "venue": venue,
                        "snippet": abstract[:1000] if abstract else f"Published in {venue} ({year}).",
                        "authors": author_names
                    })
    except Exception:
        pass
    return results
