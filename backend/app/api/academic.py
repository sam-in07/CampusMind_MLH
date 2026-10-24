from fastapi import APIRouter, Query
from typing import List, Optional

router = APIRouter(tags=["IIUC Academic Structure"])

FACULTIES_DATA = [
    {
        "id": "shariah",
        "name": "Faculty of Shariah and Islamic Studies",
        "departments": [
            "Qur'anic Sciences and Islamic Studies",
            "Da'wah and Islamic Studies",
            "Science of Hadith and Islamic Studies"
        ]
    },
    {
        "id": "engineering",
        "name": "Faculty of Science and Engineering",
        "departments": [
            "Computer Science and Engineering",
            "Computer and Communication Engineering",
            "Electrical and Electronic Engineering",
            "Electronic and Telecommunication Engineering",
            "Civil Engineering",
            "Pharmacy"
        ]
    },
    {
        "id": "business",
        "name": "Faculty of Business Studies",
        "departments": [
            "Business Administration",
            "Department of Finance"
        ]
    },
    {
        "id": "arts",
        "name": "Faculty of Arts and Humanities",
        "departments": [
            "English Language and Literature",
            "Arabic Language and Literature",
            "Library and Information Science"
        ]
    },
    {
        "id": "law",
        "name": "Faculty of Law",
        "departments": [
            "Department of Law"
        ]
    },
    {
        "id": "social_science",
        "name": "Faculty of Social Science",
        "departments": [
            "Economics & Banking"
        ]
    },
    {
        "id": "center",
        "name": "Center and Institute",
        "departments": [
            "Center for General Education"
        ]
    }
]

# Sample realistic courses for popular IIUC departments
SAMPLE_COURSES = [
    # CSE
    {"id": "cse-3515", "code": "CSE 3515", "name": "Operating System Concepts", "department": "Computer Science and Engineering", "semester": "5th Semester", "credits": 3.0},
    {"id": "cse-3521", "code": "CSE 3521", "name": "Database Management Systems", "department": "Computer Science and Engineering", "semester": "5th Semester", "credits": 3.0},
    {"id": "cse-4701", "code": "CSE 4701", "name": "Artificial Intelligence & Machine Learning", "department": "Computer Science and Engineering", "semester": "7th Semester", "credits": 3.0},
    {"id": "cse-2411", "code": "CSE 2411", "name": "Data Structures & Algorithms", "department": "Computer Science and Engineering", "semester": "4th Semester", "credits": 3.0},
    # EEE
    {"id": "eee-2301", "code": "EEE 2301", "name": "Electronics I: Semiconductor Devices", "department": "Electrical and Electronic Engineering", "semester": "3rd Semester", "credits": 3.0},
    {"id": "eee-3505", "code": "EEE 3505", "name": "Signals & Linear Systems", "department": "Electrical and Electronic Engineering", "semester": "5th Semester", "credits": 3.0},
    # Shariah
    {"id": "qsis-1101", "code": "QSIS 1101", "name": "Principles of Qur'anic Exegesis (Tafsir)", "department": "Qur'anic Sciences and Islamic Studies", "semester": "1st Semester", "credits": 3.0},
    {"id": "hadith-2101", "code": "HADITH 2101", "name": "Mustalah al-Hadith (Hadith Terminology)", "department": "Science of Hadith and Islamic Studies", "semester": "3rd Semester", "credits": 3.0},
    # Law
    {"id": "law-2301", "code": "LAW 2301", "name": "Constitutional Law of Bangladesh", "department": "Department of Law", "semester": "3rd Semester", "credits": 4.0},
    {"id": "law-3501", "code": "LAW 3501", "name": "Code of Criminal Procedure (CrPC)", "department": "Department of Law", "semester": "5th Semester", "credits": 4.0},
    # Business
    {"id": "bba-2101", "code": "BBA 2101", "name": "Principles of Marketing", "department": "Business Administration", "semester": "3rd Semester", "credits": 3.0},
    {"id": "fin-3201", "code": "FIN 3201", "name": "Corporate Finance & Capital Markets", "department": "Department of Finance", "semester": "5th Semester", "credits": 3.0},
    # Pharmacy
    {"id": "phm-2301", "code": "PHM 2301", "name": "Pharmacology I & Pharmacokinetics", "department": "Pharmacy", "semester": "4th Semester", "credits": 3.0},
    # English
    {"id": "eng-1201", "code": "ENG 1201", "name": "Introduction to Linguistics", "department": "English Language and Literature", "semester": "2nd Semester", "credits": 3.0},
    # General Education
    {"id": "ged-1101", "code": "GED 1101", "name": "Islamic Studies & Human Rights", "department": "Center for General Education", "semester": "1st Semester", "credits": 2.0}
]

@router.get("/faculties")
async def get_faculties():
    """Return all configured IIUC faculties with departments."""
    return {"faculties": FACULTIES_DATA}

@router.get("/departments")
async def get_departments(faculty_name: Optional[str] = Query(None)):
    """Return list of departments optionally filtered by faculty."""
    if faculty_name:
        for f in FACULTIES_DATA:
            if f["name"].lower() == faculty_name.lower():
                return {"departments": f["departments"], "faculty": f["name"]}
    
    # Return all departments flat
    all_depts = []
    for f in FACULTIES_DATA:
        for d in f["departments"]:
            all_depts.append({"name": d, "faculty": f["name"]})
    return {"departments": all_depts}

@router.get("/courses")
async def get_courses(department: Optional[str] = Query(None), semester: Optional[str] = Query(None)):
    """Return configured course list, with student custom course addition support."""
    results = SAMPLE_COURSES
    if department:
        results = [c for c in results if c["department"].lower() == department.lower()]
    if semester:
        results = [c for c in results if c["semester"].lower() == semester.lower()]
    return {"courses": results}
