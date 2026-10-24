from typing import List, Dict, Any, Optional

# Standard IIUC / UGC Bangladesh Grading Scale Assumption
DEFAULT_GRADING_SCALE: Dict[str, float] = {
    "A+": 4.00,
    "A": 3.75,
    "A-": 3.50,
    "B+": 3.25,
    "B": 3.00,
    "B-": 2.75,
    "C+": 2.50,
    "C": 2.25,
    "D": 2.00,
    "F": 0.00
}

class CgpaService:
    @staticmethod
    def calculate_cgpa(
        completed_courses: List[Dict[str, Any]], 
        custom_scale: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculates cumulative CGPA deterministically.
        Formula: Sum(grade_point * credits) / Sum(credits)
        """
        scale = custom_scale or DEFAULT_GRADING_SCALE
        total_credit_points = 0.0
        total_credits = 0.0
        course_breakdown = []

        for c in completed_courses:
            name = c.get("course_name", "Unnamed Course")
            credits = float(c.get("credits", 3.0))
            grade = c.get("grade", "A").upper().strip()
            
            # Allow direct grade_point or lookup in scale
            if "grade_point" in c and c["grade_point"] is not None:
                gp = float(c["grade_point"])
            else:
                gp = scale.get(grade, 0.0)

            earned_points = gp * credits
            total_credits += credits
            total_credit_points += earned_points

            course_breakdown.append({
                "course_name": name,
                "credits": credits,
                "grade": grade,
                "grade_point": gp,
                "earned_points": round(earned_points, 3)
            })

        cgpa = round(total_credit_points / total_credits, 2) if total_credits > 0 else 0.0

        return {
            "current_cgpa": cgpa,
            "total_credits": round(total_credits, 1),
            "total_credit_points": round(total_credit_points, 2),
            "course_count": len(completed_courses),
            "breakdown": course_breakdown,
            "scale_assumption": "Default UGC/IIUC 4.00 Grading Scale",
            "disclaimer": "This calculation is a deterministic academic estimate based on input course credits and letter grades."
        }

    @staticmethod
    def project_scenario(
        current_cgpa: float,
        completed_credits: float,
        future_courses: List[Dict[str, Any]],
        target_cgpa: Optional[float] = None,
        custom_scale: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Projects future semester GPA and cumulative CGPA based on hypothetical scenario grades.
        Also calculates required GPA to achieve a desired target CGPA.
        """
        scale = custom_scale or DEFAULT_GRADING_SCALE
        
        current_earned_points = current_cgpa * completed_credits
        future_credits = 0.0
        future_points = 0.0
        projected_courses = []

        for c in future_courses:
            name = c.get("course_name", "Future Course")
            credits = float(c.get("credits", 3.0))
            expected_grade = c.get("expected_grade", "A").upper().strip()
            gp = scale.get(expected_grade, 3.75)
            
            pts = gp * credits
            future_credits += credits
            future_points += pts
            
            projected_courses.append({
                "course_name": name,
                "credits": credits,
                "expected_grade": expected_grade,
                "grade_point": gp,
                "earned_points": round(pts, 3)
            })

        projected_semester_gpa = round(future_points / future_credits, 2) if future_credits > 0 else 0.0
        total_projected_credits = completed_credits + future_credits
        total_projected_points = current_earned_points + future_points
        new_cgpa = round(total_projected_points / total_projected_credits, 2) if total_projected_credits > 0 else current_cgpa

        # Target analysis if requested
        target_analysis = None
        if target_cgpa is not None and future_credits > 0:
            # required_points = (target_cgpa * total_projected_credits) - current_earned_points
            needed_points = (target_cgpa * total_projected_credits) - current_earned_points
            required_future_gpa = round(needed_points / future_credits, 2)
            is_possible = required_future_gpa <= 4.00 and required_future_gpa >= 0.0

            target_analysis = {
                "target_cgpa": target_cgpa,
                "required_future_gpa": required_future_gpa,
                "is_achievable_in_planned_credits": is_possible,
                "advice": (
                    f"To reach {target_cgpa:.2f}, you must maintain an average GPA of at least {required_future_gpa:.2f} across your upcoming {future_credits:.1f} credits."
                    if is_possible else
                    f"A target CGPA of {target_cgpa:.2f} requires a {required_future_gpa:.2f} GPA, which exceeds 4.00 within the planned {future_credits:.1f} credits. Consider planning across more semesters."
                )
            }

        return {
            "projected_semester_gpa": projected_semester_gpa,
            "projected_cumulative_cgpa": new_cgpa,
            "cgpa_delta": round(new_cgpa - current_cgpa, 2),
            "total_projected_credits": total_projected_credits,
            "future_credits": future_credits,
            "projected_courses": projected_courses,
            "target_analysis": target_analysis,
            "disclaimer": "Scenario projections are mathematical simulations. Examination results depend on actual academic evaluations."
        }
