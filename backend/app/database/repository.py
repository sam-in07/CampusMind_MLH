import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from bson import ObjectId
from backend.app.core.config import settings
from backend.app.database.mongodb import mongo_db, is_mongo_connected

DB_FILE = settings.DATA_DIR / "campusmind_db.json"

def _load_local_db() -> Dict[str, List[Dict[str, Any]]]:
    if not DB_FILE.exists():
        default_data = {
            "student_profiles": [
                {
                    "id": "student-default",
                    "student_id": "C231001",
                    "faculty": "Faculty of Science and Engineering",
                    "department": "Computer Science and Engineering",
                    "semester": "5th Semester",
                    "preferred_language": "English",
                    "name": "IIUC Student",
                    "email": "student@iiuc.ac.bd",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ],
            "study_materials": [],
            "summaries": [],
            "quizzes": [],
            "assessment_results": [],
            "study_goals": [
                {
                    "id": "goal-default",
                    "target_cgpa": 3.75,
                    "target_study_hours": 20,
                    "completed_study_hours": 14,
                    "upcoming_exams": [
                        {"course": "CSE 3515 - Operating Systems", "date": "2026-11-15", "topics": "Memory Management & Paging"},
                        {"course": "CSE 3521 - Database Systems", "date": "2026-11-22", "topics": "Normalization & Transactions"}
                    ]
                }
            ],
            "study_history": []
        }
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)
        return default_data
    
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_local_db(data: Dict[str, Any]):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def _serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res["_id"])
        del res["_id"]
    return res

class Repository:
    @staticmethod
    def get_collection_items(collection_name: str, filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        global mongo_db, is_mongo_connected
        if is_mongo_connected and mongo_db is not None:
            try:
                col = mongo_db[collection_name]
                query = filter_dict or {}
                items = list(col.find(query))
                return [_serialize_doc(item) for item in items]
            except Exception as e:
                pass
        
        # Local fallback
        db_data = _load_local_db()
        items = db_data.get(collection_name, [])
        if not filter_dict:
            return items
        
        filtered = []
        for item in items:
            match = True
            for k, v in filter_dict.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(item)
        return filtered

    @staticmethod
    def get_by_id(collection_name: str, item_id: str) -> Optional[Dict[str, Any]]:
        global mongo_db, is_mongo_connected
        if is_mongo_connected and mongo_db is not None:
            try:
                col = mongo_db[collection_name]
                if ObjectId.is_valid(item_id):
                    doc = col.find_one({"_id": ObjectId(item_id)})
                    if doc:
                        return _serialize_doc(doc)
                doc = col.find_one({"id": item_id})
                if doc:
                    return _serialize_doc(doc)
            except Exception:
                pass
        
        # Local fallback
        db_data = _load_local_db()
        items = db_data.get(collection_name, [])
        for item in items:
            if item.get("id") == item_id:
                return item
        return None

    @staticmethod
    def insert_item(collection_name: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
        global mongo_db, is_mongo_connected
        new_doc = dict(item_data)
        if "id" not in new_doc:
            new_doc["id"] = str(uuid.uuid4())
        if "created_at" not in new_doc:
            new_doc["created_at"] = datetime.now().isoformat()
        new_doc["updated_at"] = datetime.now().isoformat()

        if is_mongo_connected and mongo_db is not None:
            try:
                col = mongo_db[collection_name]
                res = col.insert_one(new_doc)
                new_doc["_id"] = str(res.inserted_id)
                return _serialize_doc(new_doc)
            except Exception:
                pass
        
        # Local fallback
        db_data = _load_local_db()
        if collection_name not in db_data:
            db_data[collection_name] = []
        db_data[collection_name].insert(0, new_doc)
        _save_local_db(db_data)
        return new_doc

    @staticmethod
    def update_item(collection_name: str, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        global mongo_db, is_mongo_connected
        updates["updated_at"] = datetime.now().isoformat()

        if is_mongo_connected and mongo_db is not None:
            try:
                col = mongo_db[collection_name]
                q = {"_id": ObjectId(item_id)} if ObjectId.is_valid(item_id) else {"id": item_id}
                col.update_one(q, {"$set": updates})
                updated = col.find_one(q)
                if updated:
                    return _serialize_doc(updated)
            except Exception:
                pass
        
        # Local fallback
        db_data = _load_local_db()
        items = db_data.get(collection_name, [])
        for item in items:
            if item.get("id") == item_id:
                item.update(updates)
                _save_local_db(db_data)
                return item
        return None

    @staticmethod
    def delete_item(collection_name: str, item_id: str) -> bool:
        global mongo_db, is_mongo_connected
        if is_mongo_connected and mongo_db is not None:
            try:
                col = mongo_db[collection_name]
                q = {"_id": ObjectId(item_id)} if ObjectId.is_valid(item_id) else {"id": item_id}
                res = col.delete_one(q)
                if res.deleted_count > 0:
                    return True
            except Exception:
                pass
        
        # Local fallback
        db_data = _load_local_db()
        items = db_data.get(collection_name, [])
        new_items = [item for item in items if item.get("id") != item_id]
        if len(new_items) != len(items):
            db_data[collection_name] = new_items
            _save_local_db(db_data)
            return True
        return False
