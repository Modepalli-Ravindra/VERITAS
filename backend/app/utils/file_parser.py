import io
from typing import Tuple

def extract_text_from_file(filename: str, content_bytes: bytes) -> Tuple[str, str]:
    """
    Extracts text and detects format.
    Returns (extracted_text, detected_type: 'text' | 'code')
    """
    lower_name = filename.lower()
    
    # 1. PDF
    if lower_name.endswith(".pdf"):
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content_bytes))
        pages_text = []
        for p in reader.pages:
            t = p.extract_text()
            if t:
                pages_text.append(t)
        return "\n\n".join(pages_text), "text"

    # 2. DOCX
    elif lower_name.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(content_bytes))
        full_text = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(full_text), "text"

    # 3. Source Code Files
    code_extensions = {
        ".py": "python", ".js": "javascript", ".ts": "typescript",
        ".java": "java", ".cpp": "cpp", ".c": "c", ".cs": "csharp",
        ".go": "go", ".rs": "rust", ".php": "php", ".rb": "ruby",
        ".html": "html", ".css": "css", ".sql": "sql"
    }
    for ext in code_extensions:
        if lower_name.endswith(ext):
            try:
                return content_bytes.decode("utf-8"), "code"
            except UnicodeDecodeError:
                return content_bytes.decode("latin-1", errors="replace"), "code"

    # 4. Default plain text
    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = content_bytes.decode("latin-1", errors="replace")

    # If it looks like code (lots of brackets, semicolons, def/class/function)
    if any(k in text for k in ["def ", "class ", "function(", "public static void", "import React", "#include"]):
        return text, "code"

    return text, "text"
