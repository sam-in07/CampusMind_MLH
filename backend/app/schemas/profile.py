from typing import Optional, List
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    student_id: Optional[str] = None
    faculty: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    preferred_language: Optional[str] = None
    email: Optional[str] = None
    target_cgpa: Optional[float] = None

class ProfileResponse(BaseModel):
    id: str
    name: str
    student_id: str
    faculty: str
    department: str
    semester: str
    preferred_language: str
    email: str
    created_at: str
    updated_at: str
