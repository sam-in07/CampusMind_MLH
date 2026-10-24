from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from backend.app.schemas.materials import MaterialCreate
from backend.app.database.repository import Repository

router = APIRouter(tags=["Study Materials"])

@router.post("/materials")
async def save_material(item: MaterialCreate):
    """Save student study notes, summary, or custom study document."""
    saved = Repository.insert_item("study_materials", item.model_dump())
    return {"status": "success", "material": saved}

@router.get("/materials")
async def list_materials(
    course: Optional[str] = Query(None),
    material_type: Optional[str] = Query(None)
):
    """List saved study materials with optional filtering."""
    filter_dict = {}
    if course:
        filter_dict["course"] = course
    if material_type:
        filter_dict["type"] = material_type

    items = Repository.get_collection_items("study_materials", filter_dict if filter_dict else None)
    return {"materials": items, "count": len(items)}

@router.get("/materials/{item_id}")
async def get_material(item_id: str):
    """Retrieve one study material by ID."""
    item = Repository.get_by_id("study_materials", item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Study material not found.")
    return item

@router.delete("/materials/{item_id}")
async def delete_material(item_id: str):
    """Delete a saved study material."""
    success = Repository.delete_item("study_materials", item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found or could not be deleted.")
    return {"status": "success", "message": "Material deleted successfully."}
