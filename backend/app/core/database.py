import sqlite3
import hashlib
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "plagiarism_studio.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Researcher',
        institution TEXT DEFAULT 'Academic Institute',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed Demo User if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'demo@veritas.edu'")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role, institution)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            "demo-user-1",
            "Dr. Sarah Lin",
            "demo@veritas.edu",
            hash_password("demo123"),
            "Faculty / Lead Researcher",
            "Stanford Integrity Lab"
        ))

    # Scans Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'demo-user-1',
        title TEXT NOT NULL,
        content_type TEXT NOT NULL,
        language TEXT DEFAULT 'english',
        raw_content TEXT NOT NULL,
        plagiarism_score REAL NOT NULL DEFAULT 0.0,
        ai_score REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'completed',
        summary TEXT,
        metrics_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_sec REAL DEFAULT 0.0
    );
    """)

    # Matches Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_title TEXT NOT NULL,
        source_url TEXT,
        similarity_score REAL NOT NULL,
        matched_text_user TEXT NOT NULL,
        matched_text_source TEXT,
        start_char INTEGER DEFAULT 0,
        end_char INTEGER DEFAULT 0,
        FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
    );
    """)

    # Repository Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS repository_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content_type TEXT NOT NULL,
        language TEXT DEFAULT 'english',
        content TEXT NOT NULL,
        fingerprints_json TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Research Paper Workspace Projects (Part A & B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS research_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'demo-user-1',
        title TEXT NOT NULL,
        topic TEXT,
        problem_statement TEXT,
        research_questions_json TEXT DEFAULT '[]',
        objectives_json TEXT DEFAULT '[]',
        hypotheses_json TEXT DEFAULT '[]',
        methodology_plan TEXT,
        outline_json TEXT DEFAULT '[]',
        sections_json TEXT DEFAULT '{}',
        literature_matrix_json TEXT DEFAULT '[]',
        research_gaps_json TEXT DEFAULT '[]',
        current_stage INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Research Library Uploaded & Saved Papers (Part B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS research_library_papers (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT NOT NULL,
        authors TEXT,
        year TEXT,
        venue TEXT,
        doi TEXT,
        url TEXT,
        abstract TEXT,
        pdf_filename TEXT,
        extracted_text TEXT,
        chunks_json TEXT DEFAULT '[]',
        metadata_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Chat With Research Papers History (Part B2)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS paper_chat_history (
        id TEXT PRIMARY KEY,
        paper_id TEXT,
        project_id TEXT,
        user_query TEXT NOT NULL,
        answer TEXT NOT NULL,
        citations_json TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Institutional Workspaces & Folders (Part C4)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS institutional_folders (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'demo-user-1',
        folder_name TEXT NOT NULL,
        workspace_type TEXT DEFAULT 'researcher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Audit Logs & Receipts (Part C4)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        scan_id TEXT,
        user_id TEXT DEFAULT 'demo-user-1',
        event_type TEXT NOT NULL,
        ip_address TEXT DEFAULT '127.0.0.1',
        details_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
