import re
import ast
import hashlib
from typing import List, Dict, Set, Tuple, Any, Optional

class CodePlagiarismEngine:
    """
    Enterprise-grade Polyglot Code Plagiarism & Clone Detection Engine.
    Supports: Python, Java, JavaScript, TypeScript, C, C++, Go.
    
    Clone Taxonomy (Bellon, Roy & Cordy Standard):
    - Type 1: Exact Clone (Verbatim copy except whitespace & comments)
    - Type 2: Parameterized / Renamed Clone (Syntactically identical with renamed identifiers/literals)
    - Type 3: Gapped / Modified Clone (Modified statements, additions, deletions, reordered blocks)
    - Type 4: Semantic Clone (Experimental: functionally similar algorithmic behavior)
    """

    KEYWORDS = {
        "python": {
            "def", "class", "if", "elif", "else", "for", "while", "return", "import", "from", 
            "as", "try", "except", "finally", "with", "lambda", "yield", "raise", "break", 
            "continue", "pass", "in", "is", "not", "and", "or", "assert", "global", "nonlocal"
        },
        "java": {
            "public", "private", "protected", "class", "interface", "extends", "implements", 
            "void", "int", "float", "double", "char", "boolean", "byte", "short", "long", 
            "String", "static", "final", "abstract", "synchronized", "volatile", "native", 
            "for", "while", "do", "if", "else", "switch", "case", "default", "break", 
            "continue", "return", "new", "try", "catch", "finally", "throw", "throws", 
            "import", "package", "this", "super", "null", "true", "false"
        },
        "javascript": {
            "function", "var", "let", "const", "class", "async", "await", "export", "import", 
            "from", "default", "return", "if", "else", "for", "while", "do", "switch", "case", 
            "break", "continue", "try", "catch", "finally", "throw", "new", "this", "typeof", 
            "instanceof", "in", "of", "null", "undefined", "true", "false", "yield"
        },
        "typescript": {
            "function", "var", "let", "const", "class", "interface", "type", "enum", "async", 
            "await", "export", "import", "from", "default", "return", "if", "else", "for", 
            "while", "do", "switch", "case", "break", "continue", "try", "catch", "finally", 
            "throw", "new", "this", "typeof", "instanceof", "in", "of", "public", "private", 
            "protected", "readonly", "as", "any", "string", "number", "boolean", "void", "null"
        },
        "c": {
            "int", "void", "char", "float", "double", "short", "long", "unsigned", "signed", 
            "struct", "union", "enum", "typedef", "sizeof", "static", "extern", "const", 
            "volatile", "register", "auto", "if", "else", "for", "while", "do", "switch", 
            "case", "default", "break", "continue", "return", "goto"
        },
        "cpp": {
            "int", "void", "char", "float", "double", "bool", "string", "struct", "class", 
            "public", "private", "protected", "virtual", "override", "template", "typename", 
            "namespace", "using", "std", "include", "new", "delete", "this", "operator", 
            "constexpr", "auto", "nullptr", "if", "else", "for", "while", "do", "switch", 
            "case", "default", "break", "continue", "return", "try", "catch", "throw"
        },
        "go": {
            "func", "package", "import", "type", "struct", "interface", "return", "var", 
            "const", "for", "range", "if", "else", "switch", "case", "default", "break", 
            "continue", "go", "chan", "select", "defer", "map", "make", "new", "nil", "true", "false"
        },
        "generic": {
            "function", "func", "def", "var", "let", "const", "class", "public", "private", 
            "protected", "static", "void", "int", "float", "double", "char", "boolean", "bool", 
            "string", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", 
            "return", "try", "catch", "throw", "import", "package"
        }
    }

    def strip_comments(self, code: str, language: str = "python") -> str:
        """Strips single-line and multi-line comments across languages"""
        lang = language.lower()
        if lang == "python":
            code = re.sub(r'(""".*?"""|\'\'\'.*?\'\'\')', '', code, flags=re.DOTALL)
            code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
        else:
            # C, C++, Java, JS, TS, Go block comments
            code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
            # Single-line comments
            code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
        return code

    def normalize_identifiers(self, code: str, language: str = "python") -> Tuple[str, List[str]]:
        """
        Normalizes variable and function names to V0, V1, F0, etc.
        Enables Type 2 clone detection resilient against renaming.
        """
        lang = language.lower()
        stripped = self.strip_comments(code, lang)
        lang_kw = self.KEYWORDS.get(lang, self.KEYWORDS["generic"])

        # Tokenize identifiers, numbers, operators, punctuation
        tokens = re.findall(
            r'[a-zA-Z_]\w*|\d+(?:\.\d+)?|==|!=|<=|>=|\+\+|--|&&|\|\||->|:=|[{}()\[\];,\+\-\*/%<>=!]', 
            stripped
        )
        
        var_map: Dict[str, str] = {}
        var_counter = 0
        func_counter = 0
        normalized_tokens = []

        is_next_func = False

        for tok in tokens:
            if tok in ("def", "function", "func"):
                is_next_func = True
                normalized_tokens.append(tok)
                continue

            if tok in lang_kw:
                normalized_tokens.append(tok)
                is_next_func = False
            elif re.match(r'^\d', tok):
                normalized_tokens.append("NUM_LIT")
                is_next_func = False
            elif re.match(r'^[a-zA-Z_]\w*$', tok):
                if is_next_func:
                    if tok not in var_map:
                        var_map[tok] = f"F{func_counter}"
                        func_counter += 1
                    normalized_tokens.append(var_map[tok])
                    is_next_func = False
                else:
                    if tok not in var_map:
                        var_map[tok] = f"V{var_counter}"
                        var_counter += 1
                    normalized_tokens.append(var_map[tok])
            else:
                normalized_tokens.append(tok)
                is_next_func = False

        return " ".join(normalized_tokens), normalized_tokens

    def extract_python_ast_sequence(self, code: str) -> List[str]:
        """Extracts native AST node type sequences for Python code"""
        try:
            tree = ast.parse(code)
            nodes = []
            for node in ast.walk(tree):
                nodes.append(type(node).__name__)
            return nodes
        except Exception:
            return []

    def extract_polyglot_structural_ast(self, code: str, language: str = "python") -> List[str]:
        """
        Extracts structural control-flow sequences for polyglot languages
        (Java, JS, TS, C, C++, Go, Python) to detect structural reordering.
        """
        lang = language.lower()
        if lang == "python":
            py_ast = self.extract_python_ast_sequence(code)
            if py_ast:
                return py_ast

        stripped = self.strip_comments(code, lang)
        lines = stripped.split("\n")
        structural_nodes = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            if re.search(r'\b(def|function|func)\b', line_str) or re.search(r'\b(?:public|private|protected)?\s*(?:static\s+)?[a-zA-Z0-9_<>]+\s+[a-zA-Z_]\w*\s*\(', line_str):
                structural_nodes.append("FunctionDef")
            elif re.search(r'\b(class|struct|interface)\b', line_str):
                structural_nodes.append("ClassDef")
            elif re.search(r'\b(if)\b', line_str):
                structural_nodes.append("IfStmt")
            elif re.search(r'\b(elif|else\s+if)\b', line_str):
                structural_nodes.append("ElifStmt")
            elif re.search(r'\b(else)\b', line_str):
                structural_nodes.append("ElseStmt")
            elif re.search(r'\b(for)\b', line_str):
                structural_nodes.append("ForLoop")
            elif re.search(r'\b(while)\b', line_str):
                structural_nodes.append("WhileLoop")
            elif re.search(r'\b(return)\b', line_str):
                structural_nodes.append("ReturnStmt")
            elif re.search(r'\b(try)\b', line_str):
                structural_nodes.append("TryBlock")
            elif re.search(r'\b(catch|except)\b', line_str):
                structural_nodes.append("CatchBlock")
            elif re.search(r'=', line_str) and not re.search(r'[!=]=', line_str):
                structural_nodes.append("AssignStmt")
            elif re.search(r'[a-zA-Z_]\w*\s*\(', line_str):
                structural_nodes.append("CallExpr")

        return structural_nodes

    def extract_functions(self, code: str, language: str = "python") -> List[Dict[str, Any]]:
        """
        Extracts individual functions with name, line numbers, and bodies
        to enable function-level clone comparison.
        """
        lang = language.lower()
        functions = []

        if lang == "python":
            try:
                tree = ast.parse(code)
                lines = code.split("\n")
                for node in ast.walk(tree):
                    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        start_line = node.lineno - 1
                        end_line = getattr(node, "end_lineno", start_line + 10)
                        body_code = "\n".join(lines[start_line:end_line])
                        functions.append({
                            "name": node.name,
                            "start_line": node.lineno,
                            "end_line": end_line,
                            "body": body_code
                        })
                if functions:
                    return functions
            except Exception:
                pass

        # Polyglot Regex Function Extractor for JS, Java, C/C++, Go
        func_patterns = [
            # def func(
            r'def\s+([a-zA-Z_]\w*)\s*\(',
            # function func(
            r'function\s+([a-zA-Z_]\w*)\s*\(',
            # func func(
            r'func\s+(?:\([^)]+\)\s*)?([a-zA-Z_]\w*)\s*\(',
            # const func = (...) =>
            r'(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>',
            # public int func(
            r'(?:public|private|protected|static|\s)*[a-zA-Z_][\w<>]*\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{'
        ]

        lines = code.split("\n")
        for i, line in enumerate(lines):
            for pat in func_patterns:
                m = re.search(pat, line)
                if m:
                    fname = m.group(1)
                    if fname in ("if", "for", "while", "switch", "catch"):
                        continue
                    # Approximate function block (next 35 lines or until next definition)
                    chunk = "\n".join(lines[i : min(len(lines), i + 40)])
                    functions.append({
                        "name": fname,
                        "start_line": i + 1,
                        "end_line": min(len(lines), i + 40),
                        "body": chunk
                    })
                    break

        return functions

    def generate_code_fingerprints(self, tokens: List[str], k: int = 6, w: int = 4) -> Set[int]:
        """Winnowing on normalized code tokens"""
        if len(tokens) < k:
            return set()

        hashes = []
        for i in range(len(tokens) - k + 1):
            k_gram = "_".join(tokens[i : i + k])
            h = int(hashlib.md5(k_gram.encode('utf-8')).hexdigest()[:16], 16)
            hashes.append(h)

        if not hashes:
            return set()

        if len(hashes) <= w:
            return {min(hashes)}

        fingerprints = set()
        for i in range(len(hashes) - w + 1):
            window = hashes[i : i + w]
            fingerprints.add(min(window))

        return fingerprints

    def compare_code(self, code_a: str, code_b: str, language: str = "python") -> Dict[str, Any]:
        """
        Deep Polyglot Code Plagiarism & Clone Analysis.
        Classifies clones across the complete 4-tier taxonomy:
        - Type 1: Exact Clone (Verbatim copy)
        - Type 2: Parameterized Clone (Renamed identifiers & modified constants)
        - Type 3: Gapped / Modified Clone (Statement insertions, deletions, block reordering)
        - Type 4: Semantic Similarity (Algorithmic equivalence with disparate syntax)
        """
        lang = language.lower()

        # 1. Exact match check
        clean_a = self.strip_comments(code_a, lang).strip()
        clean_b = self.strip_comments(code_b, lang).strip()

        if clean_a == clean_b and len(clean_a) > 20:
            return {
                "similarity_score": 100.0,
                "token_similarity": 100.0,
                "ast_similarity": 100.0,
                "clone_type": "Type 1: Exact Clone (Verbatim implementation)",
                "clone_tier": 1,
                "explanation": "Code is identical verbatim after removing formatting and comments.",
                "function_matches": []
            }

        # 2. Token Normalization & Winnowing (Type 2)
        norm_a, tokens_a = self.normalize_identifiers(code_a, lang)
        norm_b, tokens_b = self.normalize_identifiers(code_b, lang)

        fps_a = self.generate_code_fingerprints(tokens_a)
        fps_b = self.generate_code_fingerprints(tokens_b)

        token_sim = 0.0
        if fps_a and fps_b:
            intersection = len(fps_a.intersection(fps_b))
            union = len(fps_a.union(fps_b))
            token_sim = (intersection / union) * 100.0 if union > 0 else 0.0

        # Check if normalized tokens are identical
        if norm_a == norm_b and len(tokens_a) > 10:
            return {
                "similarity_score": 98.5,
                "token_similarity": 100.0,
                "ast_similarity": 98.0,
                "clone_type": "Type 2: Parameterized Clone (Renamed identifiers & constants)",
                "clone_tier": 2,
                "explanation": "Identical syntax structure with systematic variable/function renaming.",
                "function_matches": []
            }

        # 3. Structural AST Sequence Similarity (Type 3)
        ast_nodes_a = self.extract_polyglot_structural_ast(code_a, lang)
        ast_nodes_b = self.extract_polyglot_structural_ast(code_b, lang)

        ast_sim = 0.0
        if ast_nodes_a and ast_nodes_b:
            k = 3
            ast_grams_a = set("_".join(ast_nodes_a[i:i+k]) for i in range(max(1, len(ast_nodes_a) - k + 1)))
            ast_grams_b = set("_".join(ast_nodes_b[i:i+k]) for i in range(max(1, len(ast_nodes_b) - k + 1)))
            inter = len(ast_grams_a.intersection(ast_grams_b))
            un = len(ast_grams_a.union(ast_grams_b))
            ast_sim = (inter / un) * 100.0 if un > 0 else 0.0

        # 4. Function-to-Function Matching
        funcs_a = self.extract_functions(code_a, lang)
        funcs_b = self.extract_functions(code_b, lang)
        function_matches = []

        for fa in funcs_a:
            for fb in funcs_b:
                f_sim_data = self.compare_code(fa["body"], fb["body"], lang)
                if f_sim_data["similarity_score"] >= 45.0:
                    function_matches.append({
                        "source_func": fa["name"],
                        "target_func": fb["name"],
                        "similarity": f_sim_data["similarity_score"],
                        "clone_type": f_sim_data["clone_type"]
                    })

        # Calculate Combined Weighted Similarity
        if ast_nodes_a and ast_nodes_b:
            combined_similarity = (token_sim * 0.55) + (ast_sim * 0.45)
        else:
            combined_similarity = token_sim

        # Classification
        if combined_similarity >= 88.0:
            clone_type = "Type 2: Parameterized Clone (Renamed identifiers)"
            tier = 2
            explanation = "Variables and helper names were modified, but control-flow and operations match."
        elif combined_similarity >= 55.0:
            clone_type = "Type 3: Modified Clone (Gapped logic & reordered statements)"
            tier = 3
            explanation = "Core logic structure matches with added, deleted, or reordered statements."
        elif combined_similarity >= 30.0:
            clone_type = "Type 4: Semantic Similarity (Algorithmic / Pattern equivalence)"
            tier = 4
            explanation = "Common algorithmic pattern or template detected. Note: Does not confirm plagiarism without review."
        else:
            clone_type = "No Substantial Clone Detected"
            tier = 0
            explanation = "Code manifests distinct implementation logic."

        return {
            "similarity_score": round(combined_similarity, 1),
            "token_similarity": round(token_sim, 1),
            "ast_similarity": round(ast_sim, 1),
            "clone_type": clone_type,
            "clone_tier": tier,
            "explanation": explanation,
            "function_matches": function_matches[:8],
            "structural_nodes_count": len(ast_nodes_a)
        }
