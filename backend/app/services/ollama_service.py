import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    @classmethod
    async def check_health(cls) -> Dict[str, Any]:
        """Check if Ollama server is running and if the configured model is installed."""
        url = f"{settings.OLLAMA_BASE_URL}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    # Check if model or model:tag is present
                    target_model = settings.OLLAMA_MODEL
                    is_model_present = any(
                        target_model in m or m.startswith(target_model.split(":")[0]) 
                        for m in models
                    )
                    return {
                        "status": "online",
                        "ollama_url": settings.OLLAMA_BASE_URL,
                        "configured_model": target_model,
                        "model_installed": is_model_present,
                        "installed_models": models,
                        "message": "Ollama is ready and model is verified." if is_model_present else f"Ollama is running, but {target_model} was not found."
                    }
                else:
                    return {
                        "status": "error",
                        "ollama_url": settings.OLLAMA_BASE_URL,
                        "configured_model": settings.OLLAMA_MODEL,
                        "model_installed": False,
                        "installed_models": [],
                        "message": f"Ollama returned HTTP {res.status_code}"
                    }
        except httpx.ConnectError:
            return {
                "status": "offline",
                "ollama_url": settings.OLLAMA_BASE_URL,
                "configured_model": settings.OLLAMA_MODEL,
                "model_installed": False,
                "installed_models": [],
                "message": f"Cannot connect to Ollama at {settings.OLLAMA_BASE_URL}. Run 'ollama serve' in terminal."
            }
        except Exception as e:
            return {
                "status": "error",
                "ollama_url": settings.OLLAMA_BASE_URL,
                "configured_model": settings.OLLAMA_MODEL,
                "model_installed": False,
                "installed_models": [],
                "message": f"Connection check failed: {str(e)}"
            }

    @classmethod
    async def generate(cls, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.3) -> str:
        """Call Ollama generate endpoint."""
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
                else:
                    raise RuntimeError(f"Ollama error (HTTP {res.status_code}): {res.text}")
        except httpx.ConnectError:
            raise RuntimeError(f"Cannot reach Ollama at {settings.OLLAMA_BASE_URL}. Ensure Ollama is running.")
        except httpx.ReadTimeout:
            raise RuntimeError(f"Ollama model ({settings.OLLAMA_MODEL}) took too long to respond (timeout {settings.OLLAMA_TIMEOUT}s).")
        except Exception as e:
            raise RuntimeError(f"Ollama generation failure: {str(e)}")

    @classmethod
    async def summarize_lecture(cls, content: str, language: str = "English", focus_area: Optional[str] = None) -> Dict[str, Any]:
        """Generate a structured lecture summary."""
        lang_instruction = "Respond entirely in standard Bangla (বাংলা) with academic terminology." if language.lower() == "bangla" else "Respond in clear, academic English."
        
        system_prompt = (
            f"You are CampusMind's AI academic study specialist for IIUC university students.\n"
            f"{lang_instruction}\n"
            "Format the response cleanly using the following markdown sections:\n"
            "### 📌 Executive Overview\n"
            "### 🔑 Key Definitions & Terminology\n"
            "### 🧠 Core Concepts & In-Depth Explanation\n"
            "### 📝 Quick Revision Points & Formulae\n"
            "### 🎯 Potential Exam Questions & Hints\n"
            "Be precise, accurate, and pedagogical. Do not fabricate facts."
        )

        prompt = f"Study Material Content:\n\n{content}\n\n"
        if focus_area:
            prompt += f"Special focus requested on: {focus_area}\n"
        prompt += "\nPlease produce a thorough, high-yield study summary according to the specified structure."

        raw_summary = await cls.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.2)
        return {
            "summary_text": raw_summary,
            "language": language,
            "model_used": settings.OLLAMA_MODEL
        }

    @classmethod
    async def generate_quiz(
        cls, 
        content: str, 
        num_questions: int = 5, 
        difficulty: str = "Medium", 
        language: str = "English"
    ) -> List[Dict[str, Any]]:
        """Generate structured quiz questions as validated JSON list."""
        lang_instruction = "Output all question text, options, and explanations in Bangla (বাংলা)." if language.lower() == "bangla" else "Output all question text, options, and explanations in English."

        system_prompt = (
            f"You are an academic exam creator for university-level coursework at IIUC.\n"
            f"{lang_instruction}\n"
            f"You MUST reply with ONLY a valid, parseable JSON array. Do NOT wrap with commentary or markdown conversational text.\n"
            f"Schema for each question object:\n"
            "{\n"
            '  "id": 1,\n'
            '  "question": "string",\n'
            '  "type": "mcq",\n'
            '  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],\n'
            '  "correct_answer": "A",\n'
            '  "explanation": "Detailed explanation of why this answer is correct."\n'
            "}\n"
            f"Generate exactly {num_questions} questions at {difficulty} difficulty."
        )

        prompt = f"Content for Quiz Generation:\n{content[:4000]}\n\nReturn the JSON array of {num_questions} questions now."

        raw_response = await cls.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.3)
        
        # Clean potential markdown fences ```json ... ```
        cleaned = raw_response.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0].strip()

        try:
            questions = json.loads(cleaned)
            if isinstance(questions, list) and len(questions) > 0:
                return questions
            elif isinstance(questions, dict) and "questions" in questions:
                return questions["questions"]
        except Exception as json_err:
            logger.warning(f"Failed to parse model JSON: {json_err}. Raw was: {raw_response[:200]}")
            # Fallback graceful extraction or retry
            raise ValueError(f"AI produced non-standard format. Model response: {raw_response[:300]}")

    @classmethod
    async def explain_topic(
        cls, 
        topic: str, 
        faculty: str, 
        department: str, 
        course: str = "", 
        difficulty: str = "Undergraduate", 
        language: str = "English",
        context_notes: Optional[str] = None
    ) -> str:
        """Interactive AI study tutor tailored to the student's department."""
        lang_instruction = "Respond in natural, fluent academic Bangla (বাংলা)." if language.lower() == "bangla" else "Respond in clear English."

        specialized_disclaimer = ""
        if "Shariah" in faculty or "Islamic" in department:
            specialized_disclaimer = (
                "NOTE FOR RELIGIOUS/ISLAMIC TOPICS: Cite traditional scholarly consensus and primary texts (Qur'an, Hadith) where relevant, "
                "distinguishing educational explanation from formal fatwa."
            )
        elif "Law" in faculty or "Law" in department:
            specialized_disclaimer = "NOTE FOR LEGAL TOPICS: Clarify educational principles and reference Bangladeshi statutory/case law where applicable."

        system_prompt = (
            f"You are CampusMind, the personalized AI Study Tutor for International Islamic University Chittagong (IIUC).\n"
            f"Student Faculty: {faculty}\n"
            f"Department: {department}\n"
            f"Course: {course or 'General Department Course'}\n"
            f"Target Level: {difficulty}\n"
            f"{lang_instruction}\n"
            f"{specialized_disclaimer}\n"
            "Explain concepts with intuitive analogies, structured step-by-step breakdowns, practical academic examples, "
            "and end with 2 quick self-check questions for the student."
        )

        user_prompt = f"Topic to Explain: {topic}\n"
        if context_notes:
            user_prompt += f"\nLecture Notes Provided by Student:\n{context_notes}\n"

        return await cls.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.4)
