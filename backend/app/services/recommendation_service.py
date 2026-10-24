from typing import List, Dict, Any, Optional
from backend.app.services.ollama_service import OllamaService
from backend.app.database.repository import Repository

class RecommendationService:
    @staticmethod
    async def generate_study_recommendations(student_id: str = "student-default") -> Dict[str, Any]:
        """
        Synthesizes student's actual assessment scores, syllabus items,
        and upcoming exams to generate personalized AI study actions.
        """
        # Fetch real assessment records
        assessments = Repository.get_collection_items("assessment_results")
        goals = Repository.get_collection_items("study_goals")
        student_goal = goals[0] if goals else {}
        materials = Repository.get_collection_items("study_materials")

        # Compute empirical stats
        low_score_assessments = [a for a in assessments if (a.get("score", 0) / max(a.get("max_score", 10), 1)) < 0.70]
        avg_score = 0.0
        if assessments:
            total_pct = sum((a.get("score", 0) / max(a.get("max_score", 10), 1)) * 100 for a in assessments)
            avg_score = round(total_pct / len(assessments), 1)

        # Build prompt based on actual history
        history_summary = []
        for a in assessments[-5:]:
            history_summary.append(
                f"- Course: {a.get('course')}, Topic: {a.get('topic')}, Score: {a.get('score')}/{a.get('max_score')} ({int((a.get('score', 0)/max(a.get('max_score', 10), 1))*100)}%)"
            )
        
        upcoming_exams = student_goal.get("upcoming_exams", [])
        exam_summary = [f"- {e.get('course')}: on {e.get('date')} (Focus: {e.get('topics')})" for e in upcoming_exams]

        system_prompt = (
            "You are CampusMind's Academic Success Coach for IIUC students.\n"
            "Analyze the student's real assessment performance and upcoming deadlines to provide "
            "practical, highly targeted study recommendations.\n"
            "Format your advice in 4 clear sections:\n"
            "1. ⚠️ Immediate Priority Weak Areas (topics scoring < 70%)\n"
            "2. 📅 7-Day Study & Revision Timetable\n"
            "3. 💡 Recommended Next Practice Tasks\n"
            "4. 🎯 Exam Strategy Advice for Upcoming Deadlines\n"
            "Be encouraging, realistic, and do not make up grades."
        )

        user_prompt = (
            f"Student Academic Context:\n"
            f"Average Quiz Performance: {avg_score}%\n"
            f"Total Completed Assessments: {len(assessments)}\n"
            f"Recent Quiz History:\n" + ("\n".join(history_summary) if history_summary else "No quiz attempts recorded yet.") + "\n\n"
            f"Upcoming Exams:\n" + ("\n".join(exam_summary) if exam_summary else "No upcoming exam dates registered.") + "\n\n"
            f"Available Saved Materials Count: {len(materials)}\n"
            "Please generate customized academic recommendations."
        )

        try:
            ai_recommendation = await OllamaService.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.3)
        except Exception as e:
            ai_recommendation = (
                f"### ⚠️ Immediate Priority Weak Areas\n"
                f"Review recent quiz topics that scored below 70%. Focus on fundamentals before attempting advanced problems.\n\n"
                f"### 📅 Recommended Next Action\n"
                f"Generate a targeted 5-question practice quiz on your lowest scoring topic.\n\n"
                f"*(Note: Ollama offline/timeout fallback; details: {str(e)})*"
            )

        return {
            "average_quiz_score": avg_score,
            "total_assessments_analyzed": len(assessments),
            "flagged_weak_topics": [a.get("topic") for a in low_score_assessments],
            "upcoming_exams_count": len(upcoming_exams),
            "recommendation_text": ai_recommendation,
            "data_sources": ["assessment_results", "study_goals", "study_materials"]
        }
