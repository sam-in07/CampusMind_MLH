import os
import io
import tempfile
import logging
from typing import Dict, Any, Optional
import speech_recognition as sr
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

class SpeechService:
    @staticmethod
    async def transcribe_audio(file: UploadFile, language: str = "en-US") -> Dict[str, Any]:
        """
        Transcribe uploaded audio file into text.
        Supports language codes: 'en-US' for English, 'bn-BD' for Bangla.
        """
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty audio recording submitted.")

        recognizer = sr.Recognizer()
        
        # Determine language code
        lang_code = "bn-BD" if "bangla" in language.lower() or "bn" in language.lower() else "en-US"

        # Write to temporary file for recognizer processing
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_path = temp_audio.name
            temp_audio.write(content)

        try:
            with sr.AudioFile(temp_path) as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = recognizer.record(source)
                
            text = recognizer.recognize_google(audio_data, language=lang_code)
            return {
                "success": True,
                "text": text,
                "language_used": lang_code,
                "confidence": 0.95
            }
        except sr.UnknownValueError:
            raise HTTPException(
                status_code=422, 
                detail="Speech recognition could not understand audio. Please speak clearly into your microphone."
            )
        except sr.RequestError as e:
            # Fallback if network-restricted or offline
            logger.warning(f"Speech recognition service error: {e}")
            raise HTTPException(
                status_code=503, 
                detail=f"Speech recognition service unavailable: {str(e)}"
            )
        except Exception as ex:
            logger.error(f"Error processing audio: {ex}")
            raise HTTPException(status_code=400, detail=f"Audio processing error: {str(ex)}")
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
