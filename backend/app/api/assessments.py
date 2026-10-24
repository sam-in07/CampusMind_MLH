from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from backend.app.schemas.assessments import AssessmentCreate
from backend.app.database.repository import Repository

router = APIRouter(tags=["Assessments & Academic Progress"])

# Sample syllabus configuration per course
DEFAULT_COURSE_SYLLABI = {
    "Operating Systems": {"total_topics": 12, "completed_topics": 8},
    "Database Systems": {"total_topics": 10, "completed_topics": 7},
    "Artificial Intelligence": {"total_topics": 10, "completed_topics": 5},
    "Electronics I": {"total_topics": 8, "completed_topics": 4},
    "Constitutional Law": {"total_topics": 14, "completed_topics": 9},
    "Principles of Marketing": {"total_topics": 10, "completed_topics": 8},
}

@router.post("/assessments")
async def record_assessment(item: AssessmentCreate):
    """Record a quiz or mock-test attempt."""
    pct = round((item.score / max(item.max_score, 1)) * 100, 1)
    record = item.model_dump()
    record["percentage"] = pct
    saved = Repository.insert_item("assessment_results", record)
    return {"status": "success", "assessment": saved}

@router.get("/assessments")
async def list_assessments(course: Optional[str] = Query(None)):
    """Retrieve authorized assessment attempt history."""
    filter_dict = {"course": course} if course else None
    items = Repository.get_collection_items("assessment_results", filter_dict)
    return {"assessments": items, "count": len(items)}

@router.get("/progress")
async def get_academic_progress():
    """
    Return distinct academic metrics:
    1. Syllabus Completion: % of curriculum topics covered.
    2. Assessment Performance: Actual mean quiz/test score.
    3. Exam Readiness: Transparent multi-factor estimated readiness score.
    """
    assessments = Repository.get_collection_items("assessment_results")
    materials = Repository.get_collection_items("study_materials")

    # If no assessments exist in DB yet, provide realistic demonstration records
    if not assessments:
        assessments = [
            {"id": "a-1", "course": "Operating Systems", "topic": "Process Synchronization & Semaphores", "score": 8, "max_score": 10, "percentage": 80.0, "created_at": "2026-10-20T10:00:00"},
            {"id": "a-2", "course": "Operating Systems", "topic": "Virtual Memory & Page Replacement", "score": 6, "max_score": 10, "percentage": 60.0, "created_at": "2026-10-21T14:30:00"},
            {"id": "a-3", "course": "Database Systems", "topic": "SQL & Relational Algebra", "score": 9, "max_score": 10, "percentage": 90.0, "created_at": "2026-10-22T09:15:00"},
            {"id": "a-4", "course": "Database Systems", "topic": "Normalization (1NF to BCNF)", "score": 7, "max_score": 10, "percentage": 70.0, "created_at": "2026-10-23T11:45:00"},
        ]

    # Calculate overall assessment score
    total_pct = sum(a.get("percentage", 0) for a in assessments)
    overall_assessment_avg = round(total_pct / len(assessments), 1) if assessments else 0.0

    # Calculate syllabus coverage across tracked courses
    total_curriculum_topics = sum(c["total_topics"] for c in DEFAULT_COURSE_SYLLABI.values())
    total_curriculum_completed = sum(c["completed_topics"] for c in DEFAULT_COURSE_SYLLABI.values())
    overall_syllabus_completion = round((total_curriculum_completed / max(total_curriculum_topics, 1)) * 100, 1)

    # Revision factor (based on materials generated & saved)
    revision_factor = min(100.0, len(materials) * 15.0 + 40.0)

    # Exam Readiness is a weighted estimate:
    # 50% Topic Coverage + 35% Assessment Mastery + 15% Study/Revision Notes
    exam_readiness = round(
        (0.50 * overall_syllabus_completion) +
        (0.35 * overall_assessment_avg) +
        (0.15 * revision_factor),
        1
    )

    # Per-subject breakdown
    subjects_progress = []
    for course_name, syl in DEFAULT_COURSE_SYLLABI.items():
        course_assessments = [a for a in assessments if course_name.lower() in a.get("course", "").lower()]
        course_avg = (
            round(sum(a.get("percentage", 0) for a in course_assessments) / len(course_assessments), 1)
            if course_assessments else 70.0
        )
        syl_pct = round((syl["completed_topics"] / syl["total_topics"]) * 100, 1)
        subj_readiness = round((0.55 * syl_pct) + (0.45 * course_avg), 1)

        subjects_progress.append({
            "course_name": course_name,
            "total_topics": syl["total_topics"],
            "completed_topics": syl["completed_topics"],
            "syllabus_completion_pct": syl_pct,
            "avg_assessment_pct": course_avg,
            "exam_readiness_pct": subj_readiness,
            "readiness_breakdown": {
                "syllabus_weight": "55%",
                "quiz_performance_weight": "45%",
                "contributing_quizzes_count": len(course_assessments)
            }
        })

    return {
        "overall_syllabus_completion_pct": overall_syllabus_completion,
        "overall_assessment_avg_pct": overall_assessment_avg,
        "overall_exam_readiness_pct": exam_readiness,
        "readiness_formula_explanation": (
            "Exam Readiness is an estimated metric derived from: (50% × Syllabus Topics Covered) + "
            "(35% × Average Assessment Performance) + (15% × Revision Activity Factor). "
            "It is distinct from pure quiz scores or syllabus checkboxes."
        ),
        "subjects": subjects_progress,
        "recent_assessments": assessments[-5:]
    }

@router.get("/history")
async def get_study_history():
    """Retrieve combined student activity history."""
    assessments = Repository.get_collection_items("assessment_results")
    materials = Repository.get_collection_items("study_materials")
    
    events = []
    for a in assessments:
        events.append({
            "type": "assessment",
            "title": f"Completed Quiz: {a.get('topic')}",
            "course": a.get("course"),
            "score": f"{a.get('score')}/{a.get('max_score')} ({a.get('percentage')}%)",
            "timestamp": a.get("created_at")
        })
    for m in materials:
        events.append({
            "type": "material",
            "title": f"Saved {m.get('type').capitalize()}: {m.get('title')}",
            "course": m.get("course"),
            "score": None,
            "timestamp": m.get("created_at")
        })

    # Sort descending by timestamp
    events.sort(key=lambda x: str(x.get("timestamp")), reverse=True)
    return {"history": events[:20]}
