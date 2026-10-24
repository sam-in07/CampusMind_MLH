from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional, List, Dict, Any
from backend.app.schemas.ai import SummarizeRequest, QuizGenerateRequest, ExplainRequest, VoiceExplainRequest
from backend.app.services.ollama_service import OllamaService
from backend.app.services.pdf_service import DocumentService
from backend.app.services.speech_service import SpeechService
from backend.app.services.recommendation_service import RecommendationService
from backend.app.database.repository import Repository

router = APIRouter(tags=["AI Study Assistant"])

@router.post("/summarize")
async def summarize_lecture(req: SummarizeRequest):
    """Generate structured study notes and executive summary using Gemma via Ollama."""
    try:
        result = await OllamaService.summarize_lecture(
            content=req.content,
            language=req.language,
            focus_area=req.focus_area
        )
        
        # Save automatically to study_materials collection
        saved_material = Repository.insert_item("study_materials", {
            "title": req.title or "Lecture Summary",
            "course": req.course or "General",
            "type": "summary",
            "content": result["summary_text"],
            "original_content_snippet": req.content[:300] + "...",
            "language": req.language,
            "model": result.get("model_used")
        })

        return {
            "status": "success",
            "summary": result["summary_text"],
            "language": req.language,
            "material_id": saved_material.get("id"),
            "model_used": result.get("model_used")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-quiz")
async def generate_quiz(req: QuizGenerateRequest):
    """Generate multiple-choice practice quiz questions from study notes."""
    try:
        questions = await OllamaService.generate_quiz(
            content=req.content,
            num_questions=req.num_questions,
            difficulty=req.difficulty,
            language=req.language
        )

        # Save to quizzes collection
        saved_quiz = Repository.insert_item("quizzes", {
            "course": req.course or "General",
            "num_questions": len(questions),
            "difficulty": req.difficulty,
            "language": req.language,
            "questions": questions
        })

        return {
            "status": "success",
            "quiz_id": saved_quiz.get("id"),
            "course": req.course,
            "questions": questions,
            "disclaimer": "These practice questions are AI-generated based on provided notes and are not official university examination questions."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain_topic(req: ExplainRequest):
    """AI Topic Explainer tutor tailored by IIUC faculty, department, and course."""
    try:
        explanation = await OllamaService.explain_topic(
            topic=req.topic,
            faculty=req.faculty,
            department=req.department,
            course=req.course or "",
            difficulty=req.difficulty,
            language=req.language,
            context_notes=req.context_notes
        )
        return {
            "status": "success",
            "topic": req.topic,
            "explanation": explanation,
            "faculty": req.faculty,
            "department": req.department,
            "course": req.course,
            "language": req.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/extract")
async def extract_document(file: UploadFile = File(...)):
    """Extract clean text and metadata from uploaded PDF or TXT file."""
    text, pages = await DocumentService.extract_text(file)
    return {
        "status": "success",
        "filename": file.filename,
        "page_count": pages,
        "char_count": len(text),
        "extracted_text": text
    }

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = Form("en-US")):
    """Transcribe recorded microphone speech to editable text."""
    result = await SpeechService.transcribe_audio(file, language=language)
    return result

@router.post("/voice/explain")
async def voice_explain(req: VoiceExplainRequest):
    """Generate academic explanation from confirmed voice transcription."""
    try:
        explanation = await OllamaService.explain_topic(
            topic=req.transcribed_text,
            faculty=req.faculty,
            department=req.department,
            course=req.course or "",
            language=req.language
        )
        return {
            "status": "success",
            "transcription": req.transcribed_text,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
async def get_study_recommendations():
    """Generate personalized study recommendations based on assessment history."""
    try:
        recommendations = await RecommendationService.generate_study_recommendations()
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
