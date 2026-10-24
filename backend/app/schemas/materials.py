from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class MaterialCreate(BaseModel):
    title: str
    course: str
    faculty: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    type: str = "notes"  # "notes", "summary", "quiz", "pdf"
    content: str
    metadata: Optional[Dict[str, Any]] = None

class MaterialResponse(MaterialCreate):
    id: str
    created_at: str
    updated_at: str
