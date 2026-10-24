import io
import logging
from typing import Tuple, Dict, Any
from pypdf import PdfReader
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB limit for university lecture slides

class DocumentService:
    @staticmethod
    async def extract_text(file: UploadFile) -> Dict[str, Any]:
        """
        Extract text from uploaded .txt or .pdf files.
        Handles encrypted PDFs with empty passwords, layout variations, and scanned PDFs.
        Returns: Dict with filename, page_count, char_count, extracted_text, has_text.
        """
        filename = file.filename or "uploaded_document"
        content_bytes = await file.read()

        if len(content_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large ({len(content_bytes)/(1024*1024):.1f}MB). Maximum allowed size is 25MB."
            )

        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")

        ext = filename.lower().split(".")[-1]

        if ext == "txt":
            for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
                try:
                    text = content_bytes.decode(encoding).strip()
                    if text:
                        return {
                            "filename": filename,
                            "page_count": 1,
                            "char_count": len(text),
                            "extracted_text": text,
                            "has_text": True
                        }
                except UnicodeDecodeError:
                    continue
            raise HTTPException(status_code=400, detail="Could not decode text file using UTF-8 or Latin-1.")

        elif ext == "pdf":
            try:
                pdf_stream = io.BytesIO(content_bytes)
                reader = PdfReader(pdf_stream, strict=False)

                # Attempt decrypt with empty password if encrypted
                if reader.is_encrypted:
                    try:
                        reader.decrypt("")
                    except Exception as dec_err:
                        logger.warning(f"Failed to decrypt with empty password: {dec_err}")

                num_pages = len(reader.pages)
                extracted_pages = []

                for i, page in enumerate(reader.pages):
                    page_text = ""
                    # Primary extraction
                    try:
                        page_text = page.extract_text() or ""
                    except Exception:
                        pass
                    
                    # Fallback extraction mode if empty
                    if not page_text.strip():
                        try:
                            page_text = page.extract_text(extraction_mode="layout") or ""
                        except Exception:
                            pass

                    if page_text.strip():
                        extracted_pages.append(f"--- Page {i+1} ---\n{page_text.strip()}")

                full_text = "\n\n".join(extracted_pages).strip()

                if not full_text:
                    # Provide informative structured response rather than 422 crash
                    return {
                        "filename": filename,
                        "page_count": num_pages,
                        "char_count": 0,
                        "extracted_text": "",
                        "has_text": False,
                        "message": (
                            f"The uploaded PDF '{filename}' contains {num_pages} pages, but no extractable text layer was found. "
                            "It appears to be a scanned image or presentation slides without selectable text. "
                            "Please paste your notes or type the lecture topic directly."
                        )
                    }

                return {
                    "filename": filename,
                    "page_count": num_pages,
                    "char_count": len(full_text),
                    "extracted_text": full_text,
                    "has_text": True,
                    "message": f"Successfully extracted text from {len(extracted_pages)} of {num_pages} pages."
                }

            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"PDF extraction error: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {str(e)}")
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format '.{ext}'. Supported formats are: .txt, .pdf"
            )
