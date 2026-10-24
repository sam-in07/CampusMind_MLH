from fastapi import APIRouter, HTTPException
from backend.app.schemas.profile import ProfileUpdate
from backend.app.database.repository import Repository

router = APIRouter(tags=["Student Profile"])

@router.get("/profile")
async def get_profile():
    """Retrieve current student profile."""
    profiles = Repository.get_collection_items("student_profiles")
    if not profiles:
        default_profile = {
            "id": "student-default",
            "student_id": "C231001",
            "name": "IIUC Student",
            "faculty": "Faculty of Science and Engineering",
            "department": "Computer Science and Engineering",
            "semester": "5th Semester",
            "preferred_language": "English",
            "email": "student@iiuc.ac.bd"
        }
        saved = Repository.insert_item("student_profiles", default_profile)
        return saved
    return profiles[0]

@router.put("/profile")
async def update_profile(updates: ProfileUpdate):
    """Update student department, semester, language preference, and study settings."""
    profiles = Repository.get_collection_items("student_profiles")
    profile_id = profiles[0]["id"] if profiles else "student-default"
    
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    updated = Repository.update_item("student_profiles", profile_id, update_data)
    if not updated:
        # Insert if not present
        updated = Repository.insert_item("student_profiles", update_data)
    return {"status": "success", "profile": updated}
