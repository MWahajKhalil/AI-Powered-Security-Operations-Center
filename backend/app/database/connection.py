import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any

from app.core.config import settings

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        """
        Creates a connection to the SQLite database.
        Enables row factories to return dict-like objects.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """
        Initializes the database directory and tables if they do not exist.
        """
        # Ensure parent folder exists (e.g. create /database/ if missing)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Create Tool Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tool_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                arguments TEXT NOT NULL,
                result TEXT NOT NULL,
                execution_time_ms REAL NOT NULL,
                status TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
        print(f"[Database] SQLite initialized successfully at: {self.db_path}")

    def log_tool_execution(
        self,
        tool_name: str,
        arguments: dict,
        result: Any,
        execution_time_ms: float,
        status: str
    ) -> int:
        """
        Records an audit trace of a tool execution in the database.
        Returns the inserted row ID.
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Serialize dicts/complex structures to JSON strings for storage
        args_str = json.dumps(arguments)
        
        if isinstance(result, (dict, list)):
            result_str = json.dumps(result)
        else:
            result_str = str(result)
            
        timestamp_str = datetime.utcnow().isoformat()
        
        cursor.execute(
            """
            INSERT INTO tool_logs (timestamp, tool_name, arguments, result, execution_time_ms, status)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (timestamp_str, tool_name, args_str, result_str, execution_time_ms, status)
        )
        
        conn.commit()
        row_id = cursor.lastrowid
        conn.close()
        return row_id

    def get_tool_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetches historical tool logs, sorted by most recent first.
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT id, timestamp, tool_name, arguments, result, execution_time_ms, status
            FROM tool_logs
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        logs = []
        for row in rows:
            # Parse argument JSON strings back into actual dicts
            try:
                parsed_args = json.loads(row["arguments"])
            except Exception:
                parsed_args = {}
                
            # Try to parse results as JSON if structured, else keep as text
            try:
                parsed_result = json.loads(row["result"])
            except Exception:
                parsed_result = row["result"]
                
            logs.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "tool_name": row["tool_name"],
                "arguments": parsed_args,
                "result": parsed_result,
                "execution_time_ms": row["execution_time_ms"],
                "status": row["status"]
            })
            
        return logs

# App-wide singleton instance of the database manager
db_manager = DatabaseManager(settings.DATABASE_PATH)
