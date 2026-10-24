#### CampusMind

Your Department. Your Studies. Your AI.

CampusMind is an AI-powered study assistant for students at International Islamic University Chittagong (IIUC), Bangladesh. It helps students summarize lecture materials, generate practice quizzes, understand difficult subjects in Bangla or English, track academic progress, and calculate CGPA.

## The problem

IIUC students across different faculties face challenges when preparing for examinations. Lecture notes and slides can be lengthy, finding suitable practice questions takes time, and difficult academic topics may require additional explanations in Bangla or English. Students also need a convenient way to track their subject-wise performance and understand their academic progress.

Today, students often handle these tasks manually, switch between different tools, and calculate their academic results themselves. CampusMind aims to bring these study activities together in one accessible application.

## The solution

CampusMind provides a web-based AI study assistant powered by Gemma 4 12B through Ollama. Students can summarize lecture notes, generate interactive practice quizzes, and ask subject-related questions in Bangla or English. Voice input makes it easier to ask study questions, while the academic dashboard tracks syllabus completion, assessment performance, and estimated exam readiness. A deterministic CGPA calculator also helps students calculate their current CGPA and explore hypothetical future-grade scenarios.

How it works

Model used: Gemma 4 12B — an open-weight AI model served locally through Ollama.
Model link: https://ollama.com/library/gemma4:12b
Frontend: React, Vite, Tailwind CSS, Recharts, and Lucide React.
Backend: Python, FastAPI, Uvicorn, and Pydantic.
Database: MongoDB Atlas using PyMongo, with persistent local JSON storage as a fallback if implemented and enabled in the application.
AI integration: The FastAPI backend sends study prompts to the local Ollama API, receives model responses, and returns them to the React frontend.
Document processing: PyPDF for extracting text from supported PDF documents.
Voice interaction: Browser microphone and speech-recognition capabilities, with browser speech synthesis for spoken answers, depending on browser support and the implemented workflow.
Academic analytics: Recharts for visualizing subject-wise progress and Python for deterministic CGPA calculations.
Datasets: No external dataset is required for the core features. Students can supply their own lecture notes and study materials. Any demonstration records should be fictional or otherwise appropriately authorized.

**How to run it**
Prerequisites
Python 3.10 or later.
Node.js and npm.
Ollama installed on your computer.
Gemma 4 12B available in Ollama.
MongoDB Atlas credentials if cloud database storage is required.
1. Clone the repository
git clone <[CampusMind-URL](https://github.com/sam-in07/CampusMind_MLH)>

cd CampusMind


Replace the repository URL with your actual public GitHub repository URL.

2. Set up the backend

Open a terminal in the backend directory:

cd backend
python -m venv venv


Activate the virtual environment on Windows PowerShell:

.\venv\Scripts\Activate.ps1


Install the backend dependencies:

python -m pip install -r requirements.txt


Configure your environment variables using the provided .env.example, if available. Keep secrets out of GitHub.

3. Start Ollama

Check that the model is installed:

ollama list


The expected model identifier is:

gemma4:12b


If the model is already installed, you do not need to download it again. Start or open Ollama and ensure its local service is available.

4. Run the backend

From the backend directory, if main.py contains the FastAPI instance named app, run:

python -m uvicorn main:app --reload


If the application starts successfully, open the interactive API documentation:

http://127.0.0.1:8000/docs

5. Run the frontend

Open a second terminal:

cd frontend
npm install
npm run dev


Open the local URL printed by Vite, typically:

http://localhost:5173

Note: These commands assume your repository contains the described files and that the dependencies and endpoints have been implemented. Adjust the commands to match your actual project structure.

Screenshots / demo

Add screenshots or a short demo video showing the actual working application.

Recommended screenshots:

Student Dashboard: Faculty and department selection, subject-wise progress, and exam-readiness indicators.
AI Study Workspace: A generated lecture summary, interactive quiz, or Bangla/English topic explanation.
Academic Progress: Assessment results, syllabus completion, or the CGPA calculator.

Demo video: <ADD-YOUR-DEMO-VIDEO-LINK>

Screenshots and video links should be added after capturing the actual application. Do not use mockups as evidence of features that are not implemented.

## What's not done yet

The following items should be updated to reflect the actual state of the submitted application:

Official IIUC course materials and past examination questions are not automatically available unless a verified collection has been integrated.
Exam-readiness indicators are estimates based on available study and assessment data; they do not guarantee examination results.
CGPA projections depend on correct credit hours and a verified grading scale.
Authentication and secure multi-student data isolation require appropriate implementation before real student records are used.
Voice recognition depends on the supported browser capabilities and the configured speech-recognition workflow.
Scanned PDFs without extractable text require OCR support, which may not be implemented.
Cloud MongoDB persistence depends on valid configuration and a successful database connection.

Remove any items that have been completed, and add actual known bugs or missing features before submission.

## Credits
Google DeepMind / Google: Gemma open-weight model and applicable model terms — https://ollama.com/library/gemma4:12b

Ollama: Local model runtime and API — https://ollama.com/

React: https://react.dev/

Vite: https://vite.dev/

Tailwind CSS: https://tailwindcss.com/

FastAPI: https://fastapi.tiangolo.com/

MongoDB: https://www.mongodb.com/

PyMongo: https://pymongo.readthedocs.io/

Recharts: https://recharts.org/

PyPDF: https://pypdf.readthedocs.io/

Additional tutorials, starter templates, code snippets, and contributors should be credited here as applicable.