import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

mongo_client = None
mongo_db = None
is_mongo_connected = False

def init_mongo():
    global mongo_client, mongo_db, is_mongo_connected
    if not settings.MONGODB_URI:
        logger.info("MONGODB_URI not provided. CampusMind running in local fallback persistence mode.")
        is_mongo_connected = False
        return False
        
    try:
        mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        # Verify connection
        mongo_client.admin.command('ping')
        mongo_db = mongo_client[settings.MONGODB_DATABASE]
        is_mongo_connected = True
        logger.info(f"Successfully connected to MongoDB Atlas database: {settings.MONGODB_DATABASE}")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        logger.warning(f"Could not connect to MongoDB Atlas ({e}). Falling back to local persistence mode.")
        mongo_client = None
        mongo_db = None
        is_mongo_connected = False
        return False

def get_db_status():
    global is_mongo_connected
    return {
        "connected": is_mongo_connected,
        "database": settings.MONGODB_DATABASE if is_mongo_connected else "local_json_persistence",
        "mode": "mongodb_atlas" if is_mongo_connected else "local_file_persistence",
        "uri_configured": bool(settings.MONGODB_URI)
    }
