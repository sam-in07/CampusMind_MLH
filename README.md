# CampusMind

**Your Department. Your Studies. Your AI.**

CampusMind is an AI-powered study assistant for students at the International Islamic University Chittagong (IIUC), Bangladesh. It helps students summarize lecture materials, generate practice quizzes, understand difficult topics in Bangla or English, track academic progress, and calculate CGPA using an open-weight AI model.

## The problem

IIUC students across different faculties face challenges when preparing for examinations. Lecture notes and slides can be lengthy, finding relevant practice questions takes time, and difficult academic topics may require additional explanations in Bangla or English. Students also need a convenient way to monitor their subject-wise performance and plan their academic goals.

Currently, students often manage these tasks manually, use separate applications, and calculate their academic results themselves. This can make studying less organized and leave students unsure about which subjects need more attention.

## The solution

CampusMind brings essential study tools together in one web application powered by the Gemma 4 12B open-weight model through Ollama. Students can summarize lecture notes, generate interactive practice quizzes, and ask subject-related questions in Bangla or English, including through voice input where supported. A personalized dashboard tracks syllabus completion, assessment performance, and estimated exam readiness. The built-in CGPA calculator helps students calculate their current CGPA and explore hypothetical future-grade scenarios.

## How it works

- **Model used:** Gemma 4 12B, an open-weight AI model running locally through Ollama.\
  Model link: https://ollama.com/library/gemma4:12b
- **Frontend:** React, Vite, Tailwind CSS, Recharts, and Lucide React.
- **Backend:** Python, FastAPI, Uvicorn, and Pydantic.
- **Database:** MongoDB Atlas with PyMongo, with persistent local JSON storage as a fallback if enabled and implemented.
- **AI integration:** The FastAPI backend sends prompts to the local Ollama API and returns generated responses to the React frontend.
- **Document processing:** PyPDF extracts text from supported PDF documents.
- **Voice interaction:** Browser speech-recognition capabilities for voice input and browser speech synthesis for spoken responses, depending on browser support and implementation.
- **Academic analytics:** Recharts visualizes subject-wise progress, while Python performs deterministic CGPA calculations.
- **Datasets:** No external dataset is required for the core features. Students can provide their own lecture notes and study materials. Demonstration data should be fictional or appropriately authorized.

## How to run it

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Ollama installed
- Gemma 4 12B available in Ollama
- MongoDB Atlas credentials if cloud database storage is required

### 1\. Clone the repository

```
git clone https://github.com/sam-in07/CampusMind_MLH.git
cd CampusMind_MLH
```

### 2\. Install backend requirements

```
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Configure your backend environment variables using `.env.example`, if provided. Never commit secrets or database credentials to GitHub.

### 3\. Start the AI model

Check whether Gemma is already installed:

```
ollama list
```

If `gemma4:12b` is listed, you do not need to download it again. Ensure Ollama is running.

### 4\. Run the backend

From the `backend` directory, if `main.py` contains the FastAPI application instance named `app`:

```
python -m uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

Interactive API documentation: http://127.0.0.1:8000/docs

### 5\. Run the frontend

Open a second terminal from the project root:

```
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

**Note:** These commands assume the repository contains the described `backend` and `frontend` directories and dependency files. Adjust them if your actual project structure differs.

## Screenshots / demo

**Demo video:**

[CampusMind-Demo_Vedio](https://youtu.be/AgpDlIn6BKw)




## What's not done yet

- **Official IIUC course materials:** A verified, comprehensive collection of official lecture materials and past examination questions is not automatically available.
- **Exam readiness:** Readiness percentages are estimates based on available study and assessment data; they cannot guarantee examination results.
- **CGPA projections:** Accuracy depends on the correct grading scale, course grades, and credit hours.
- **Authentication:** Secure authentication and student-specific data isolation are necessary before using real student records in a multi-user deployment.
- **Voice support:** Speech recognition depends on browser compatibility and the implemented transcription workflow.
- **Scanned PDFs:** Image-only PDFs require OCR support to extract text.
- **Database availability:** MongoDB Atlas requires valid connection settings; local persistence is available only if the fallback is implemented and enabled.

Update this section to reflect the actual state of your application. Remove completed items and include any known bugs or features that remain unfinished.

## Credits

- **Google / Gemma team:** Gemma open-weight model and applicable model terms — https://ollama.com/library/gemma4:12b
- **Ollama:** Local AI model runtime — [https://ollama.com/](<https://ollama.com/>)
- **React:** [https://react.dev/](<https://react.dev/>)
- **Vite:** [https://vite.dev/](<https://vite.dev/>)
- **Tailwind CSS:** [https://tailwindcss.com/](<https://tailwindcss.com/>)
- **FastAPI:** [https://fastapi.tiangolo.com/](<https://fastapi.tiangolo.com/>)
- **MongoDB:** [https://www.mongodb.com/](<https://www.mongodb.com/>)
- **PyMongo:** [https://pymongo.readthedocs.io/](<https://pymongo.readthedocs.io/>)
- **Recharts:** [https://recharts.org/](<https://recharts.org/>)
- **PyPDF:** [https://pypdf.readthedocs.io/](<https://pypdf.readthedocs.io/>)

Additional tutorials, starter templates, code snippets, and other contributors should be credited here as applicable.

---

**CampusMind — Built for students. Designed for better learning. Powered by open-weight AI.**

