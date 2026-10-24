from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AssessmentCreate(BaseModel):
    course: str
    topic: str
    assessment_type: str = "quiz"  # "quiz", "mock_test", "short_answer"
    score: int
    max_score: int
    difficulty: Optional[str] = "Medium"
    details: Optional[Dict[str, Any]] = None

class AssessmentResponse(AssessmentCreate):
    id: str
    percentage: float
    created_at: str

class SubjectProgress(BaseModel):
    course_name: str
    total_topics: int
    completed_topics: int
    syllabus_completion_pct: float
    avg_assessment_pct: float
    exam_readiness_pct: float
    readiness_breakdown: Dict[str, Any]

class AcademicProgressResponse(BaseModel):
    overall_syllabus_completion_pct: float
    overall_assessment_avg_pct: float
    overall_exam_readiness_pct: float
    readiness_formula_explanation: str
    subjects: List[SubjectProgress]
    recent_assessments: List[AssessmentResponse]
