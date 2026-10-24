from typing import List, Optional
from pydantic import BaseModel

class Department(BaseModel):
    id: str
    name: str
    faculty_id: str
    code: Optional[str] = None

class Faculty(BaseModel):
    id: str
    name: str
    departments: List[str]

class Course(BaseModel):
    id: str
    name: str
    code: str
    department: str
    semester: str
    credits: float = 3.0
