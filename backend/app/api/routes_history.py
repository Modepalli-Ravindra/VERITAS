from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.core.database import get_db

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("")
async def get_all_scans():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, content_type, language, plagiarism_score, ai_score, status, created_at, execution_time_sec 
        FROM scans 
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.delete("/{scan_id}")
async def delete_scan(scan_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
    cursor.execute("DELETE FROM scan_matches WHERE scan_id = ?", (scan_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": scan_id}
