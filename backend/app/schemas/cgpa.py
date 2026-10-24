from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CourseGradeInput(BaseModel):
    course_name: str
    credits: float = Field(..., gt=0, le=10)
    grade: str = Field(..., min_length=1, max_length=5)
    grade_point: Optional[float] = None

class CgpaCalculateRequest(BaseModel):
    completed_courses: List[CourseGradeInput]
    custom_scale: Optional[Dict[str, float]] = None

class FutureCourseInput(BaseModel):
    course_name: str
    credits: float = Field(..., gt=0, le=10)
    expected_grade: str = Field(..., min_length=1, max_length=5)

class CgpaProjectRequest(BaseModel):
    current_cgpa: float = Field(..., ge=0.0, le=4.0)
    completed_credits: float = Field(..., ge=0.0)
    future_courses: List[FutureCourseInput]
    target_cgpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    custom_scale: Optional[Dict[str, float]] = None
