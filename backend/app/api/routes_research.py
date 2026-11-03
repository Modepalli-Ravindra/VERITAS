"""
VERITAS // Research Paper Workspace & SciSpace Intelligence API Routes
Handles the 19-stage academic research lifecycle, interactive PDF chat with local RAG,
comparative literature review matrix, and manuscript drafting.
"""

import uuid
import json
import time
import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.engines.research_studio_engine import (
    generate_research_scaffolding,
    synthesize_literature_matrix,
    discover_research_gaps,
    export_research_manuscript,
    export_matrix_csv,
    export_research_manuscript_latex,
    export_research_manuscript_docx,
    IEEE_SECTION_BLUEPRINTS,
    IEEE_ACADEMIC_RULES_FAQ,
    generate_autonomous_ieee_paper,
    analyze_existing_project_to_ieee_paper
)
from app.engines.pdf_chat_engine import (
    extract_and_index_pdf,
    answer_paper_query,
    compare_multiple_papers,
    PaperRAGIndex
)
from app.engines.search_engine import search_openalex_catalog

router = APIRouter(prefix="/api/research", tags=["Research Studio"])

# In-memory index cache for active PDF chat sessions
ACTIVE_PDF_INDICES: Dict[str, PaperRAGIndex] = {}

# --- Request Models ---

class CreateProjectRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Working manuscript title")
    topic: str = Field(..., min_length=3, description="Core research topic / domain")

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    problem_statement: Optional[str] = None
    research_questions: Optional[List[str]] = None
    objectives: Optional[List[str]] = None
    hypotheses: Optional[List[str]] = None
    methodology_plan: Optional[str] = None
    sections: Optional[Dict[str, str]] = None
    literature_matrix: Optional[List[Dict[str, Any]]] = None
    research_gaps: Optional[List[Dict[str, Any]]] = None
    current_stage: Optional[int] = None

class MatrixGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, description="Topic to search and synthesize matrix for")
    limit: Optional[int] = 5

class ChatPaperRequest(BaseModel):
    paper_id: str = Field(..., description="ID of uploaded paper")
    query: str = Field(..., min_length=2, description="Question about paper")

class ComparePaperRequest(BaseModel):
    paper_ids: List[str] = Field(..., min_items=2, description="IDs of papers to compare")
    query: Optional[str] = Field("Compare main findings, methodologies, and limitations", description="Question or focus query")

class ExportMatrixCSVRequest(BaseModel):
    matrix_rows: List[Dict[str, Any]]

class DraftSectionRequest(BaseModel):
    section_name: str = Field(..., description="Section name to draft, e.g. Introduction")
    notes: Optional[str] = Field(None, description="Optional researcher notes or specific requirements")

class AutonomousPaperRequest(BaseModel):
    instructions: Optional[str] = Field(None, description="Optional focus instructions for autonomous paper generation")

class AnalyzeProjectRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Paper / Project Title")
    topic: Optional[str] = Field(None, description="Domain / Area (e.g. Blockchain & AI)")
    project_description: str = Field(..., min_length=10, description="Detailed description of the college/client project, code, modules, tech stack")
    implemented_features: Optional[str] = Field(None, description="What was actually built and coded (UI, APIs, database, smart contracts)")
    proposed_extensions: Optional[str] = Field(None, description="Extra research features / theoretical ideas to propose (Academic Liberty)")
    screenshot_notes: Optional[str] = Field(None, description="Description of available project screenshots or experimental outputs")
    authors: Optional[List[Dict[str, str]]] = Field(None, description="List of authors: name, department, institution, location, email")


# --- Endpoints ---

@router.post("/projects")
def create_research_project(payload: CreateProjectRequest):
    """
    Initializes a new research workspace project and synthesizes stages 1-5
    (Problem Statement, Research Questions, Objectives, Hypotheses, Outline).
    """
    conn = get_db()
    cursor = conn.cursor()
    proj_id = str(uuid.uuid4())

    scaffolding = generate_research_scaffolding(payload.topic)

    cursor.execute("""
        INSERT INTO research_projects (
            id, user_id, title, topic, problem_statement, research_questions_json,
            objectives_json, hypotheses_json, methodology_plan, outline_json,
            sections_json, current_stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        proj_id,
        "demo-user-1",
        payload.title,
        payload.topic,
        scaffolding["problem_statement"],
        json.dumps(scaffolding["research_questions"]),
        json.dumps(scaffolding["objectives"]),
        json.dumps(scaffolding["hypotheses"]),
        scaffolding["methodology_plan"],
        json.dumps(scaffolding["outline"]),
        json.dumps({}),
        1
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "project_id": proj_id,
        "title": payload.title,
        "scaffolding": scaffolding
    }


@router.get("/projects")
def list_research_projects():
    """
    Returns all existing research projects for the user.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, topic, current_stage, created_at, updated_at
        FROM research_projects
        ORDER BY updated_at DESC
    """)
    rows = cursor.fetchall()
    projects = [dict(r) for r in rows]
    conn.close()
    return {"projects": projects}


@router.get("/projects/{project_id}")
def get_research_project(project_id: str):
    """
    Retrieves full research project workspace state with all 19 stages.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Research project not found")

    p = dict(row)
    return {
        "id": p["id"],
        "title": p["title"],
        "topic": p["topic"],
        "problem_statement": p["problem_statement"],
        "research_questions": json.loads(p["research_questions_json"] or "[]"),
        "objectives": json.loads(p["objectives_json"] or "[]"),
        "hypotheses": json.loads(p["hypotheses_json"] or "[]"),
        "methodology_plan": p["methodology_plan"],
        "outline": json.loads(p["outline_json"] or "[]"),
        "sections": json.loads(p["sections_json"] or "{}"),
        "literature_matrix": json.loads(p["literature_matrix_json"] or "[]"),
        "research_gaps": json.loads(p["research_gaps_json"] or "[]"),
        "current_stage": p["current_stage"],
        "created_at": p["created_at"],
        "updated_at": p["updated_at"]
    }


@router.put("/projects/{project_id}")
def update_research_project(project_id: str, payload: UpdateProjectRequest):
    """
    Autosaves or updates the project's drafting sections, stage, or matrix.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    updates = []
    values = []

    if payload.title is not None:
        updates.append("title = ?")
        values.append(payload.title)
    if payload.topic is not None:
        updates.append("topic = ?")
        values.append(payload.topic)
    if payload.problem_statement is not None:
        updates.append("problem_statement = ?")
        values.append(payload.problem_statement)
    if payload.research_questions is not None:
        updates.append("research_questions_json = ?")
        values.append(json.dumps(payload.research_questions))
    if payload.objectives is not None:
        updates.append("objectives_json = ?")
        values.append(json.dumps(payload.objectives))
    if payload.hypotheses is not None:
        updates.append("hypotheses_json = ?")
        values.append(json.dumps(payload.hypotheses))
    if payload.methodology_plan is not None:
        updates.append("methodology_plan = ?")
        values.append(payload.methodology_plan)
    if payload.sections is not None:
        updates.append("sections_json = ?")
        values.append(json.dumps(payload.sections))
    if payload.literature_matrix is not None:
        updates.append("literature_matrix_json = ?")
        values.append(json.dumps(payload.literature_matrix))
    if payload.research_gaps is not None:
        updates.append("research_gaps_json = ?")
        values.append(json.dumps(payload.research_gaps))
    if payload.current_stage is not None:
        updates.append("current_stage = ?")
        values.append(payload.current_stage)

    updates.append("updated_at = CURRENT_TIMESTAMP")

    if updates:
        values.append(project_id)
        cursor.execute(f"UPDATE research_projects SET {', '.join(updates)} WHERE id = ?", tuple(values))
        conn.commit()

    conn.close()
    return {"success": True, "project_id": project_id}


@router.post("/projects/{project_id}/draft-section")
def draft_project_section_with_gateway(project_id: str, payload: DraftSectionRequest):
    """
    Leverages the multi-provider LLM gateway (Groq/Gemini/OpenRouter/NIM) to generate
    authoritative, IEEE-standard academic prose for any selected section.
    Automatically saves the generated draft into the project's sections_json!
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Research project not found")

    p = dict(row)
    sections = json.loads(p["sections_json"] or "{}")

    from app.core.llm_gateway import GATEWAY
    draft_res = GATEWAY.draft_manuscript_section(
        project_title=p["title"],
        topic=p["topic"],
        section_name=payload.section_name,
        existing_notes=payload.notes or sections.get(payload.section_name, "")
    )

    sections[payload.section_name] = draft_res["draft"]
    cursor.execute("UPDATE research_projects SET sections_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                   (json.dumps(sections), project_id))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "section_name": payload.section_name,
        "draft": draft_res["draft"],
        "provider": draft_res["provider"]
    }


@router.get("/ieee-blueprints")
def get_ieee_blueprints():
    """
    Returns exact structural requirements, mandatory contents, and alignment rules
    for each section of an IEEE standard research publication.
    """
    return {"success": True, "blueprints": IEEE_SECTION_BLUEPRINTS}


@router.get("/academic-rules-faq")
def get_academic_rules_faq():
    """
    Returns definitive guidelines on IEEE paper page limits, column requirements,
    academic liberty (college project vs research framework), and proper screenshot placement.
    """
    return {"success": True, "faq": IEEE_ACADEMIC_RULES_FAQ}


@router.post("/projects/analyze-existing-project")
def analyze_existing_project_endpoint(payload: AnalyzeProjectRequest):
    """
    College/Client Project to IEEE Paper Conversion Engine:
    Deconstructs existing code, project reports, and screenshots. Formulates the overarching
    architectural model (Academic Liberty in Section III) and validates the implemented prototype
    with formal figure references and metrics in Section VI.
    Persists manuscript into workspace database and returns Overleaf-ready LaTeX code.
    """
    analysis = analyze_existing_project_to_ieee_paper(
        title=payload.title,
        project_description=payload.project_description,
        implemented_features=payload.implemented_features,
        proposed_extensions=payload.proposed_extensions,
        screenshot_notes=payload.screenshot_notes,
        domain_topic=payload.topic,
        authors=payload.authors
    )

    proj_id = str(uuid.uuid4())
    conn = get_db()
    cursor = conn.cursor()

    # Create new research project record
    cursor.execute("""
        INSERT INTO research_projects (
            id, user_id, title, topic, problem_statement, research_questions_json,
            objectives_json, hypotheses_json, methodology_plan, outline_json,
            sections_json, current_stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        proj_id,
        "demo-user-1",
        payload.title,
        payload.topic or payload.title,
        f"Addressing challenges in {payload.topic or payload.title} through a decentralized, verified architecture.",
        json.dumps(["How does the proposed framework optimize throughput and verification latency?", "What empirical gains are achieved over traditional centralized architectures?"]),
        json.dumps(["Design an immutable verification architecture", "Empirically evaluate prototype throughput and latency"]),
        json.dumps(["The proposed system will reduce latency by over 40%", "Verification accuracy will sustain 99%+"]),
        "Experimental prototype validation coupled with formal mathematical modeling.",
        json.dumps(list(analysis["sections"].keys())),
        json.dumps(analysis["sections"]),
        9  # Set to stage 9 (Final Review / Export)
    ))
    conn.commit()
    conn.close()

    return {
        **analysis,
        "project_id": proj_id,
        "overleaf_endpoint": "https://www.overleaf.com/docs"
    }


@router.post("/projects/{project_id}/generate-autonomous-paper")
def generate_autonomous_paper_endpoint(project_id: str, payload: Optional[AutonomousPaperRequest] = None):
    """
    End-to-End Autonomous AI Researcher:
    Synthesizes the entire research manuscript section-by-section using the Multi-Provider LLM Gateway.
    Generates Abstract, Keywords, Introduction, Literature Survey, Proposed Model, Comparative Tables,
    Formulas, Results, Conclusion, and References. Saves directly to database and returns Overleaf-ready LaTeX code.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    project_dict = dict(row)
    instructions = payload.instructions if payload else None

    result = generate_autonomous_ieee_paper(project_dict, instructions)

    # Persist generated sections into project
    cursor.execute(
        "UPDATE research_projects SET sections_json = ?, current_stage = 9, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (json.dumps(result["sections"]), project_id)
    )
    conn.commit()
    conn.close()

    return result


@router.get("/projects/{project_id}/overleaf-payload")
def get_overleaf_payload(project_id: str):
    """
    Returns the complete LaTeX source code and target Overleaf API endpoint
    for instant 1-click project initialization on Overleaf.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dict = dict(row)
    latex_code = export_research_manuscript_latex(project_dict)

    return {
        "success": True,
        "title": project_dict["title"],
        "latex_code": latex_code,
        "overleaf_endpoint": "https://www.overleaf.com/docs"
    }


@router.post("/projects/{project_id}/export")
def export_project(project_id: str, format_type: str = Query("markdown")):
    """
    Exports drafted research paper into publication-ready Markdown (.md), LaTeX (.tex), or Word (.docx).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dict = dict(row)
    safe_title = "".join(c for c in (row["title"] or "manuscript") if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')

    fmt = format_type.lower()
    if fmt in ["latex", "tex"]:
        content = export_research_manuscript_latex(project_dict)
        return {
            "success": True,
            "format": "latex",
            "title": row["title"],
            "filename": f"{safe_title}.tex",
            "content": content
        }
    elif fmt == "docx":
        docx_bytes = export_research_manuscript_docx(project_dict)
        return StreamingResponse(
            io.BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.docx"'}
        )
    else:
        content = export_research_manuscript(project_dict, format_type)
        return {
            "success": True,
            "format": format_type,
            "title": row["title"],
            "filename": f"{safe_title}.md",
            "content": content
        }


@router.get("/projects/{project_id}/download")
def download_project_manuscript(project_id: str, format_type: str = Query("docx")):
    """
    Direct browser download of drafted manuscript as Word (.docx), LaTeX (.tex), or Markdown (.md).
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dict = dict(row)
    safe_title = "".join(c for c in (row["title"] or "manuscript") if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')

    fmt = format_type.lower()
    if fmt == "docx":
        docx_bytes = export_research_manuscript_docx(project_dict)
        return StreamingResponse(
            io.BytesIO(docx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.docx"'}
        )
    elif fmt in ["latex", "tex"]:
        content = export_research_manuscript_latex(project_dict)
        return Response(
            content=content,
            media_type="application/x-tex",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.tex"'}
        )
    else:
        content = export_research_manuscript(project_dict, "markdown")
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{safe_title}.md"'}
        )


# --- SciSpace Literature Matrix & Gap Analysis ---

@router.post("/matrix/generate")
def generate_matrix(payload: MatrixGenerateRequest):
    """
    Searches 250M OpenAlex publications and generates a structured 8-column comparative matrix.
    """
    papers = search_openalex_catalog(payload.topic, limit=payload.limit)
    matrix = synthesize_literature_matrix(papers)
    gaps = discover_research_gaps(matrix)

    return {
        "success": True,
        "topic": payload.topic,
        "matrix": matrix,
        "research_gaps": gaps
    }


@router.post("/matrix/export-csv")
def export_matrix_to_csv(payload: ExportMatrixCSVRequest):
    """
    Exports provided literature matrix rows to downloadable CSV format.
    """
    csv_text = export_matrix_csv(payload.matrix_rows)
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="veritas_literature_matrix.csv"'}
    )


@router.get("/projects/{project_id}/matrix-csv")
def export_project_matrix_csv(project_id: str):
    """
    Fetches the saved literature matrix for a project and downloads as CSV file.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title, literature_matrix_json FROM research_projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    matrix = json.loads(row["literature_matrix_json"] or "[]")
    csv_text = export_matrix_csv(matrix)
    safe_title = "".join(c for c in (row["title"] or "matrix") if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe_title}_matrix.csv"'}
    )


# --- Interactive PDF Assistant & Local RAG Chat ---

@router.post("/pdf/upload")
async def upload_research_pdf(file: UploadFile = File(...), project_id: Optional[str] = Form(None)):
    """
    Uploads a research paper PDF, segments by page, builds a local in-memory vector index.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    paper_id = str(uuid.uuid4())
    paper_title = file.filename.replace(".pdf", "").replace("_", " ").title()

    # Index PDF locally
    index, chunks = extract_and_index_pdf(content, paper_id=paper_id, title=paper_title)
    ACTIVE_PDF_INDICES[paper_id] = index

    # Save to SQLite library
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO research_library_papers (
            id, project_id, title, pdf_filename, extracted_text, chunks_json
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        paper_id,
        project_id,
        paper_title,
        file.filename,
        f"Indexed {len(chunks)} passages across {len(index.chunks)} sections.",
        json.dumps(chunks[:30])
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "paper_id": paper_id,
        "title": paper_title,
        "total_chunks": len(index.chunks),
        "total_pages": max([c.get("page", 1) for c in chunks] or [1])
    }


@router.post("/pdf/chat")
def chat_with_pdf(payload: ChatPaperRequest):
    """
    Submits a query to the indexed PDF and returns grounded answer with page numbers and excerpts.
    """
    index = ACTIVE_PDF_INDICES.get(payload.paper_id)
    if not index:
        # Attempt to reconstruct index from database
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT title, chunks_json FROM research_library_papers WHERE id = ?", (payload.paper_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Paper not found or session expired. Please re-upload PDF.")

        index = PaperRAGIndex(paper_id=payload.paper_id, title=row["title"])
        stored_chunks = json.loads(row["chunks_json"] or "[]")
        for ch in stored_chunks:
            index.add_chunk(page_num=ch.get("page", 1), text=ch.get("text", ""))
        ACTIVE_PDF_INDICES[payload.paper_id] = index

    answer_data = answer_paper_query(index, payload.query)

    # Save conversation log
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO paper_chat_history (id, paper_id, user_query, answer, citations_json)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(uuid.uuid4()),
        payload.paper_id,
        payload.query,
        answer_data["answer"],
        json.dumps(answer_data["citations"])
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "paper_id": payload.paper_id,
        "query": payload.query,
        "answer": answer_data["answer"],
        "citations": answer_data["citations"],
        "grounded": answer_data["grounded"]
    }


@router.post("/pdf/compare")
def compare_papers_endpoint(payload: ComparePaperRequest):
    """
    SciSpace-grade Multi-Paper Comparative Chat.
    Interrogates 2 or more uploaded papers simultaneously, synthesizes comparative analysis,
    extracts key findings, agreements, and divergences with exact page numbers.
    """
    indices = []
    for pid in payload.paper_ids:
        idx = ACTIVE_PDF_INDICES.get(pid)
        if not idx:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT title, chunks_json FROM research_library_papers WHERE id = ?", (pid,))
            row = cursor.fetchone()
            conn.close()
            if row:
                idx = PaperRAGIndex(paper_id=pid, title=row["title"])
                chunks = json.loads(row["chunks_json"] or "[]")
                for ch in chunks:
                    idx.add_chunk(page_num=ch.get("page", 1), text=ch.get("text", ""))
                ACTIVE_PDF_INDICES[pid] = idx
        if idx:
            indices.append(idx)

    if len(indices) < 2:
        raise HTTPException(
            status_code=400,
            detail=f"At least 2 uploaded papers are required for comparative chat. Found {len(indices)} valid paper(s)."
        )

    comparison_data = compare_multiple_papers(indices, query=payload.query or "Compare main findings, methodologies, and limitations")
    return {
        "success": True,
        "comparison": comparison_data
    }


@router.get("/library")
def get_library_papers():
    """
    Lists all saved research papers in the workspace library.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, project_id, title, pdf_filename, created_at FROM research_library_papers ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return {"papers": [dict(r) for r in rows]}
