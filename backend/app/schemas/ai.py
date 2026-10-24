from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class SummarizeRequest(BaseModel):
    content: str = Field(..., min_length=10, description="Lecture text or extracted notes")
    language: str = Field("English", description="Response language: English or Bangla")
    focus_area: Optional[str] = None
    title: Optional[str] = "Lecture Notes Summary"
    course: Optional[str] = "General"

class QuizGenerateRequest(BaseModel):
    content: str = Field(..., min_length=10, description="Source lecture material")
    num_questions: int = Field(5, ge=1, le=15, description="Number of questions")
    difficulty: str = Field("Medium", description="Easy, Medium, Hard, or University-Level")
    language: str = Field("English", description="English or Bangla")
    course: Optional[str] = "General"

class ExplainRequest(BaseModel):
    topic: str = Field(..., min_length=2, description="Topic, question or concept to explain")
    faculty: str = Field("Faculty of Science and Engineering")
    department: str = Field("Computer Science and Engineering")
    course: Optional[str] = ""
    difficulty: str = Field("Undergraduate", description="Undergraduate, Beginner, or Advanced")
    language: str = Field("English", description="English or Bangla")
    context_notes: Optional[str] = None

class VoiceExplainRequest(BaseModel):
    transcribed_text: str = Field(..., min_length=1)
    faculty: str = "Faculty of Science and Engineering"
    department: str = "Computer Science and Engineering"
    course: Optional[str] = ""
    language: str = "English"

class QuizQuestion(BaseModel):
    id: int
    question: str
    type: str = "mcq"
    options: List[str]
    correct_answer: str
    explanation: str

class QuizSubmission(BaseModel):
    quiz_id: Optional[str] = None
    course: str
    topic: str
    score: int
    max_score: int
    answers: Dict[str, Any]
