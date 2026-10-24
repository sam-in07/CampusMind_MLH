import io
from typing import Tuple
from pypdf import PdfReader
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class DocumentService:
    @staticmethod
    async def extract_text(file: UploadFile) -> Tuple[str, int]:
        """
        Extract text from uploaded .txt or .pdf files.
        Returns: (extracted_text, page_count)
        """
        filename = file.filename or "uploaded_file"
        content_bytes = await file.read()

        if len(content_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large ({len(content_bytes)/(1024*1024):.1f}MB). Maximum allowed size is 10MB."
            )

        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        ext = filename.lower().split(".")[-1]

        if ext == "txt":
            try:
                text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    text = content_bytes.decode("latin-1")
                except Exception:
                    raise HTTPException(status_code=400, detail="Could not decode text file using UTF-8 or Latin-1.")
            return text.strip(), 1

        elif ext == "pdf":
            try:
                pdf_stream = io.BytesIO(content_bytes)
                reader = PdfReader(pdf_stream)
                num_pages = len(reader.pages)
                
                extracted_pages = []
                for i, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        extracted_pages.append(f"--- Page {i+1} ---\n{page_text.strip()}")

                full_text = "\n\n".join(extracted_pages).strip()

                if not full_text:
                    raise HTTPException(
                        status_code=422,
                        detail="The uploaded PDF contains no extractable text. It may be a scanned image or protected PDF."
                    )
                return full_text, num_pages
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to read PDF document: {str(e)}")
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format '.{ext}'. Supported formats are: .txt, .pdf"
            )
