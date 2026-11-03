import uuid
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.engines.text_engine import TextPlagiarismEngine
from app.engines.code_engine import CodePlagiarismEngine
from app.utils.file_parser import extract_text_from_file

router = APIRouter(prefix="/api/repository", tags=["Repository"])

text_engine = TextPlagiarismEngine()
code_engine = CodePlagiarismEngine()

class AddDocumentRequest(BaseModel):
    title: str
    content: str
    content_type: str = "text" # 'text' or 'code'
    language: Optional[str] = "english"

@router.get("")
async def list_repository_documents():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content_type, language, LENGTH(content) as content_length, uploaded_at FROM repository_documents ORDER BY uploaded_at DESC")
    docs = cursor.fetchall()
    conn.close()
    return [dict(d) for d in docs]

@router.post("")
async def add_document(payload: AddDocumentRequest):
    doc_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()

    # Pre-generate fingerprints
    fingerprints = {}
    if payload.content_type == "text":
        fps = text_engine.generate_winnowing_fingerprints(payload.content)
        fingerprints = {str(k): list(v) for k, v in fps.items()}
    else:
        norm, tokens = code_engine.normalize_identifiers(payload.content, payload.language or "python")
        fps_set = code_engine.generate_code_fingerprints(tokens)
        fingerprints = {"token_hashes": list(fps_set)}

    cursor.execute("""
        INSERT INTO repository_documents (id, title, content_type, language, content, fingerprints_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (doc_id, payload.title, payload.content_type, payload.language or "english", payload.content, json.dumps(fingerprints)))

    conn.commit()
    conn.close()

    return {"id": doc_id, "title": payload.title, "status": "stored"}

@router.post("/upload")
async def upload_repository_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
):
    contents = await file.read()
    file_title = title or file.filename or "Repository Doc"
    text, detected_type = extract_text_from_file(file.filename or "doc.txt", contents)
    
    req = AddDocumentRequest(
        title=file_title,
        content=text,
        content_type=detected_type,
        language="python" if detected_type == "code" else "english"
    )
    return await add_document(req)

@router.delete("/{doc_id}")
async def delete_repository_document(doc_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM repository_documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": doc_id}
