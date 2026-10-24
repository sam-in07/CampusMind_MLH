from fastapi import APIRouter
from backend.app.schemas.cgpa import CgpaCalculateRequest, CgpaProjectRequest
from backend.app.services.cgpa_service import CgpaService, DEFAULT_GRADING_SCALE

router = APIRouter(tags=["CGPA Calculator & Scenario Estimator"])

@router.get("/cgpa/scale")
async def get_grading_scale():
    """Return default UGC / IIUC grading scale assumption."""
    return {
        "scale_name": "Standard UGC / IIUC 4.00 Scale",
        "scale": DEFAULT_GRADING_SCALE,
        "is_assumption": True,
        "note": "Standard university letter grading scale assumption. Configurable per department if custom scales apply."
    }

@router.post("/cgpa/calculate")
async def calculate_cgpa(req: CgpaCalculateRequest):
    """
    Deterministic CGPA calculation.
    Calculates weighted average of grade points and credit hours.
    """
    courses_dict = [c.model_dump() for c in req.completed_courses]
    result = CgpaService.calculate_cgpa(
        completed_courses=courses_dict,
        custom_scale=req.custom_scale
    )
    return result

@router.post("/cgpa/project")
async def project_cgpa_scenario(req: CgpaProjectRequest):
    """
    Calculate hypothetical future-grade scenarios and determine
    required semester GPA to hit a target CGPA.
    """
    future_dict = [c.model_dump() for c in req.future_courses]
    result = CgpaService.project_scenario(
        current_cgpa=req.current_cgpa,
        completed_credits=req.completed_credits,
        future_courses=future_dict,
        target_cgpa=req.target_cgpa,
        custom_scale=req.custom_scale
    )
    return result
