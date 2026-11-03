import re
import math
import hashlib
from typing import List, Dict, Set, Tuple, Any
from collections import Counter

class TextPlagiarismEngine:
    def __init__(self, k_gram_size: int = 5, window_size: int = 4):
        self.k = k_gram_size
        self.w = window_size

    def clean_text_for_comparison(self, text: str) -> str:
        """Lowercase and normalize whitespace"""
        return re.sub(r'\s+', ' ', text.lower().strip())

    def extract_words_with_spans(self, text: str) -> List[Tuple[str, int, int]]:
        """Returns list of (clean_word, start_char, end_char)"""
        words = []
        for match in re.finditer(r'\b\w+\b', text):
            words.append((match.group(0).lower(), match.start(), match.end()))
        return words

    def generate_winnowing_fingerprints(self, text: str) -> Dict[int, Tuple[int, int]]:
        """
        Winnowing algorithm implementation.
        Returns a dict: {hash_val: (start_char, end_char)}
        """
        words = self.extract_words_with_spans(text)
        if len(words) < self.k:
            return {}

        # 1. Generate k-grams and their hashes with spans
        hashes = []
        for i in range(len(words) - self.k + 1):
            k_gram = " ".join(w[0] for w in words[i : i + self.k])
            start_pos = words[i][1]
            end_pos = words[i + self.k - 1][2]
            
            # 64-bit integer hash
            hash_val = int(hashlib.md5(k_gram.encode('utf-8')).hexdigest()[:16], 16)
            hashes.append((hash_val, start_pos, end_pos))

        if not hashes:
            return {}

        # 2. Windowing algorithm to pick minimums
        fingerprints = {}
        if len(hashes) <= self.w:
            min_h = min(hashes, key=lambda x: x[0])
            fingerprints[min_h[0]] = (min_h[1], min_h[2])
            return fingerprints

        min_idx = -1
        for i in range(len(hashes) - self.w + 1):
            window = hashes[i : i + self.w]
            # Find minimum in window (rightmost min breaks ties)
            local_min = min(window, key=lambda x: x[0])
            fingerprints[local_min[0]] = (local_min[1], local_min[2])

        return fingerprints

    def compute_jaccard_similarity(self, set_a: Set[int], set_b: Set[int]) -> float:
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return (intersection / union) * 100.0 if union > 0 else 0.0

    def compute_containment(self, set_query: Set[int], set_source: Set[int]) -> float:
        """Percentage of query fingerprints found in source"""
        if not set_query or not set_source:
            return 0.0
        intersection = len(set_query.intersection(set_source))
        return (intersection / len(set_query)) * 100.0

    def calculate_semantic_similarity(self, text_a: str, text_b: str) -> float:
        """Ultra-fast, zero-overhead TF-IDF Cosine similarity between two texts"""
        try:
            words_a = re.findall(r'\b[a-zA-Z]{3,}\b', text_a.lower())
            words_b = re.findall(r'\b[a-zA-Z]{3,}\b', text_b.lower())

            if not words_a or not words_b:
                return 0.0

            tf_a = Counter(words_a)
            tf_b = Counter(words_b)
            all_vocab = set(tf_a.keys()).union(set(tf_b.keys()))

            # Cosine similarity between vectors
            dot_product = 0.0
            for word in all_vocab:
                dot_product += tf_a.get(word, 0) * tf_b.get(word, 0)

            norm_a = math.sqrt(sum(count ** 2 for count in tf_a.values()))
            norm_b = math.sqrt(sum(count ** 2 for count in tf_b.values()))

            if norm_a == 0 or norm_b == 0:
                return 0.0

            cosine_sim = dot_product / (norm_a * norm_b)
            return round(cosine_sim * 100.0, 1)
        except Exception:
            return 0.0

    def find_matching_spans(self, query_text: str, source_text: str) -> List[Dict[str, Any]]:
        """
        Finds contiguous phrase matches between query and source text,
        returning exact start and end char offsets in the query.
        """
        query_words = self.extract_words_with_spans(query_text)
        source_clean = " " + self.clean_text_for_comparison(source_text) + " "
        
        matches = []
        i = 0
        min_match_len = 4  # minimum 4 consecutive words match

        while i <= len(query_words) - min_match_len:
            # Try to find longest matching sequence starting at i
            curr_len = min_match_len
            best_match = None

            while i + curr_len <= len(query_words):
                phrase = " " + " ".join(w[0] for w in query_words[i : i + curr_len]) + " "
                if phrase in source_clean:
                    start_char = query_words[i][1]
                    end_char = query_words[i + curr_len - 1][2]
                    matched_snippet = query_text[start_char:end_char]
                    best_match = {
                        "start_char": start_char,
                        "end_char": end_char,
                        "matched_text": matched_snippet,
                        "word_count": curr_len
                    }
                    curr_len += 1
                else:
                    break

            if best_match:
                matches.append(best_match)
                # jump ahead to avoid overlapping internal tokens
                i += best_match["word_count"]
            else:
                i += 1

        return matches

    def classify_match_citation_status(self, full_text: str, start_char: int, end_char: int) -> Dict[str, Any]:
        """
        Differentiates legitimate academic citations from uncited plagiarism:
        1. CITED_QUOTATION: Text is in quotation marks or has adjacent citation marker [1] or (Author, 2024)
        2. BIBLIOGRAPHY_MATCH: Text occurs inside the References / Bibliography section
        3. UNCITED_MATCH: Text matches literature with zero attribution markers
        """
        # 1. Check if the match is in the References/Bibliography section
        text_before = full_text[:start_char].lower()
        ref_header_matches = list(re.finditer(r'\n\s*(references|bibliography|works cited|literature cited)\s*[\n:]', text_before))
        if ref_header_matches:
            last_header = ref_header_matches[-1]
            # If the header occurred in the latter half or before this text
            return {
                "match_type": "BIBLIOGRAPHY_MATCH",
                "is_problematic": False,
                "citation_label": "Bibliographic Reference Entry",
                "badge_color": "blue"
            }

        # 2. Check if enclosed in quotes
        # Look at 4 chars before start and 4 chars after end
        pre_context = full_text[max(0, start_char - 6):start_char]
        post_context = full_text[end_char:min(len(full_text), end_char + 6)]
        
        has_opening_quote = bool(re.search(r'["“\'‘]', pre_context))
        has_closing_quote = bool(re.search(r'["”\'’]', post_context))

        # Check for citation marker in immediate trailing context (up to 80 chars)
        trailing_window = full_text[end_char:min(len(full_text), end_char + 85)]
        has_numeric_citation = bool(re.search(r'^\s*(?:[,.]\s*)?\[\d+(?:,\s*\d+)*\]', trailing_window))
        has_author_citation = bool(re.search(r'^\s*(?:[,.]\s*)?\([A-Z][a-zA-Z\s.-]+,\s*\d{4}[a-z]?\)', trailing_window))

        if (has_opening_quote and has_closing_quote) or has_numeric_citation or has_author_citation:
            return {
                "match_type": "CITED_QUOTATION",
                "is_problematic": False,
                "citation_label": "Properly Cited Quotation",
                "badge_color": "emerald"
            }

        # 3. Check for partial paraphrasing vs verbatim match
        matched_slice = full_text[start_char:end_char]
        word_count = len(re.findall(r'\b\w+\b', matched_slice))
        
        if word_count < 7:
            return {
                "match_type": "COMMON_PHRASE",
                "is_problematic": False,
                "citation_label": "Common Idiomatic / Domain Phrase",
                "badge_color": "amber"
            }

        return {
            "match_type": "UNCITED_MATCH",
            "is_problematic": True,
            "citation_label": "Uncited Literature Match",
            "badge_color": "rose"
        }
