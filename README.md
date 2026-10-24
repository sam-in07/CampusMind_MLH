# CampusMind — AI-Powered Student Study Assistant for IIUC

> **Tagline:** *Your Department. Your Studies. Your AI.*  
> **University:** International Islamic University Chittagong (IIUC), Bangladesh  
> **Target Audience:** Undergraduate and Graduate Students across all 7 IIUC Faculties & Centers  

---

## 1. Project Overview & Student Problem Solved

At **International Islamic University Chittagong (IIUC)**, students manage demanding academic workloads across diverse disciplines—ranging from Shariah and Islamic Studies to Computer Science, Electrical Engineering, Law, and Business Administration. 

Students often struggle with:
1. **Synthesizing Extensive Course Materials:** Processing long textbook chapters and lecture notes into concise, actionable revision summaries before exams.
2. **Quality Self-Assessment:** Practicing relevant, level-appropriate exam questions without having to rely on generic questions from the internet.
3. **Subject-Specific Explanations:** Needing an academic tutor that understands their specific faculty context, whether it's the 4 Pillars of Qiyas in Shariah or Demand Paging in Operating Systems.
4. **Accessible Voice Queries:** Asking complex academic questions hands-free using voice in both English and Bangla.
5. **Separating Realistic Metrics:** Disentangling pure syllabus checklists from actual test performance and transparent exam readiness.
6. **Determining CGPA Goals:** Accurately calculating cumulative CGPA and modeling future semester scenarios to reach graduation targets.

**CampusMind** solves these challenges by providing a full-stack, responsive study companion powered by local **Gemma 4 12B** running on Ollama, backed by **FastAPI**, **React + Vite**, and **MongoDB Atlas** (with automatic zero-config persistent local storage fallback).

---

## 2. System Architecture & Request Flow

```
+-------------------------------------------------------------------------+
|                         React Frontend (Vite)                           |
|       Tailwind CSS • Recharts • Audio Recording • Cascading Selectors   |
+------------------------------------+------------------------------------+
                                     | HTTP Requests (JSON / FormData)
                                     v
+------------------------------------+------------------------------------+
|                         FastAPI Backend                                 |
|          Pydantic Validation • CORS • PDF Text Extraction (PyPDF)       |
|          Deterministic CGPA Math • Multi-Factor Readiness Algorithm     |
+-------------------+-------------------------------+---------------------+
                    |                               |
    Ollama HTTP API |                               | PyMongo / Fallback
 (http://localhost:11434)                           |
                    v                               v
+-------------------+-------------+   +-------------+---------------------+
|         Ollama Runtime          |   |       Database Layer              |
|        Gemma 4 12B Model        |   | • MongoDB Atlas Cluster (Primary) |
|   (Summarization, MCQs, Tutor)  |   | • Local Persistent JSON (Fallback)|
+---------------------------------+   +-----------------------------------+
```

### Request Flow Security & Privacy:
* Browser-side React **never** directly accesses Ollama, whisper, or MongoDB credentials.
* All prompts, data validation, and database operations are executed strictly within the backend.
* Environment variables keep sensitive Atlas connection strings isolated on the server.

---

## 3. Technology Baseline

| Component | Technology | Version / Specification |
|:---|:---|:---|
| **Frontend** | React 19 + Vite | Tailwind CSS v4, Lucide React, Recharts |
| **Backend** | Python + FastAPI | Uvicorn ASGI, Pydantic v2, PyPDF |
| **Open-Weight AI** | Gemma 4 12B | Runtime: Ollama (`http://localhost:11434`) |
| **Voice Input** | Web Audio / SpeechRecognition | Browser Recording + FastAPI Transcription |
| **Speech Output** | Web Speech Synthesis | Built-in browser TTS with rate/pitch control |
| **Database** | MongoDB Atlas | PyMongo with automatic zero-config persistent fallback |

---

## 4. Main Features & Supported Workflows

### Feature A: Smart Lecture Summarizer
* Paste raw lecture notes or upload `.pdf` / `.txt` lecture slides.
* Extracts document text securely on the backend with character and page validation.
* Gemma synthesizes structured study sheets:
  * 📌 Executive Overview
  * 🔑 Key Definitions & Terminology
  * 🧠 Core Concepts & In-Depth Explanation
  * 📝 Quick Revision Points & Formulae
  * 🎯 Potential Exam Hints
* Full support for both **English** and **Bangla (বাংলা)**.
* 1-Click saving to **My Materials** and instant clipboard copying.

### Feature B: Interactive AI Quiz Generator
* Converts lecture notes into customized practice quizzes.
* Configurable question count (3, 5, 8, 10) and difficulty (*Easy, Medium, University-Level*).
* Interactive quiz taking interface with instant score calculation and celebratory confetti.
* In-depth answer review with explanations for each question.
* Automatically records quiz attempts into student assessment history.

### Feature C: Department-Tailored AI Topic Explainer
* Chat study tutor specialized in IIUC academic faculties.
* Tailors answers according to student's faculty (e.g. citing primary classical sources for Shariah or statutory context for Law).
* Supports step-by-step solutions, analogies, and practice checks in English and Bangla.

### Feature D: Voice-Based Study Assistant
* Browser microphone interface with real-time waveform animation and duration timer.
* Sends recording to `/api/transcribe` for speech-to-text.
* **Editable Transcription Preview:** Students review or modify recognized text before submitting to Gemma.
* Listen to AI explanations hands-free using browser Text-to-Speech (TTS).

### Feature E: Academic Progress & Transparent Exam Readiness
* Tracks three distinct, non-interchangeable indicators:
  1. **Syllabus Completion %:** Percentage of curriculum topics marked complete.
  2. **Assessment Performance %:** Actual average score earned on quizzes and tests.
  3. **Exam Readiness %:** Multi-factor estimated indicator:
     $$\text{Readiness} = (0.50 \times \text{Syllabus}) + (0.35 \times \text{Assessments}) + (0.15 \times \text{Revision Factor})$$
* Visual subject-level comparative bar charts and curriculum balance radar chart using **Recharts**.

### Feature F: Deterministic CGPA Calculator & Scenario Simulator
* Mathematical credit-weighted calculations computed deterministically in Python (no LLM hallucination).
* Based on standard UGC/IIUC 4.00 grading scale (A+ = 4.00, A = 3.75, A- = 3.50, etc.).
* **Scenario Simulator:** Lets students enter hypothetical future semester grades to project new cumulative CGPA.
* **Target CGPA Planner:** Calculates exact required future GPA across planned credits to achieve target honors.

### Feature G: Personalized AI Study Coach
* Synthesizes recorded quiz attempts, weak topics (< 70% score), and upcoming exam dates.
* Generates actionable revision schedules and identifies priority improvement areas using Gemma.

### Feature H: My Saved Materials & History
* Filter saved summaries and quizzes by type, course, and date.
* Modal reader with search filter and item deletion.

---

## 5. IIUC University Structure Supported

CampusMind implements the exact IIUC cascading organizational structure:

1. **Faculty of Shariah and Islamic Studies**
   * Qur'anic Sciences and Islamic Studies
   * Da'wah and Islamic Studies
   * Science of Hadith and Islamic Studies
2. **Faculty of Science and Engineering**
   * Computer Science and Engineering
   * Computer and Communication Engineering
   * Electrical and Electronic Engineering
   * Electronic and Telecommunication Engineering
   * Civil Engineering
   * Pharmacy
3. **Faculty of Business Studies**
   * Business Administration
   * Department of Finance
4. **Faculty of Arts and Humanities**
   * English Language and Literature
   * Arabic Language and Literature
   * Library and Information Science
5. **Faculty of Law**
   * Department of Law
6. **Faculty of Social Science**
   * Economics & Banking
7. **Center and Institute**
   * Center for General Education

---

## 6. Installation & Running Instructions

### Prerequisites
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+)
* **Ollama** installed with `gemma4:12b` (`ollama pull gemma4:12b`)

### Step 1: Clone and Set Up Environment Variables

```bash
# Clone the repository
git clone <your-repo-url>
cd dfjvbsld

# Configure Backend Environment
cp backend/.env.example backend/.env

# Configure Frontend Environment
cp frontend/.env.example frontend/.env
```

### Step 2: Install Dependencies

```bash
# Install Python backend dependencies
cd backend
python -m pip install -r requirements.txt
cd ..

# Install Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Run Ollama with Gemma 4 12B

Ensure the Ollama service is active:
```bash
ollama serve
# Verify model is available
ollama list
```

### Step 4: Run the Backend & Frontend Servers

**Terminal 1 (Backend):**
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 7. MongoDB Atlas Configuration

By default, CampusMind runs in **Zero-Config Persistent Local Mode** (`backend/data/campusmind_db.json`), allowing judges and developers to test all features immediately without entering credentials.

To connect to your cloud **MongoDB Atlas** cluster:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database named `campusmind`.
3. Open `backend/.env` and paste your URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DATABASE=campusmind
   ```
4. Restart the backend. CampusMind will automatically detect the connection, log `Successfully connected to MongoDB Atlas`, and update the UI indicator badge to **Atlas DB**.

---

## 8. API Endpoint Documentation

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Backend status and database persistence mode |
| `GET` | `/api/health/ai` | Ollama connectivity & Gemma model verification |
| `GET` | `/api/faculties` | Complete list of 7 IIUC faculties and departments |
| `GET` | `/api/courses` | Available courses filtered by department/semester |
| `POST` | `/api/summarize` | Generate structured study notes from text or uploads |
| `POST` | `/api/generate-quiz` | Generate validated MCQs and explanations |
| `POST` | `/api/explain` | AI topic explainer tailored to department |
| `POST` | `/api/documents/extract` | Extract text and page counts from PDF/TXT files |
| `POST` | `/api/transcribe` | Speech-to-text audio transcription endpoint |
| `POST` | `/api/voice/explain` | Voice query explainer with TTS audio |
| `POST` | `/api/recommendations` | Generate AI study recommendations from test history |
| `POST` | `/api/materials` | Save study material or lecture notes |
| `GET` | `/api/materials` | List saved materials with filtering |
| `DELETE` | `/api/materials/{id}` | Delete a saved material |
| `POST` | `/api/assessments` | Record quiz or mock exam attempt score |
| `GET` | `/api/assessments` | Retrieve quiz attempt records |
| `GET` | `/api/progress` | Subject-wise progress, syllabus %, and exam readiness |
| `GET` | `/api/history` | Study activity audit log |
| `POST` | `/api/cgpa/calculate` | Deterministic CGPA computation |
| `POST` | `/api/cgpa/project` | Scenario projection & target required GPA analysis |
| `GET` | `/api/profile` | Retrieve student profile and preferences |
| `PUT` | `/api/profile` | Update faculty, department, semester, and language |

Interactive Swagger documentation is available at **`http://localhost:8000/docs`**.

---

## 9. Model Verification & Licensing

* **Model:** Gemma 4 12B
* **Runtime:** Ollama (Local open-weight deployment)
* **Model Identifier:** `gemma4:12b`
* **Licence:** Gemma Terms of Use (Google open model weights)
* **Official Model Library:** [https://ollama.com/library/gemma4:12b](https://ollama.com/library/gemma4:12b)

---

## 10. Known Limitations & Future Work

* **Scanned Image PDFs:** PDFs consisting entirely of scanned raster images without OCR text layers return a helpful user error recommending text-based PDFs or pasted notes.
* **University Authentication:** For this hackathon/competition demonstration, a sample student profile (`C231001`) is initialized with realistic demonstration records. Full SSO integration with IIUC student portal (e.g., student.iiuc.ac.bd) is planned for future institutional deployment.
* **Voice Cloud Quality:** Local SpeechRecognition uses standard web speech protocols; optional cloud ElevenLabs TTS can be configured via backend `.env` for ultra-realistic voice cloning.

---

## 11. Credits & Acknowledgements

* **IIUC Administration & Faculty:** For the curriculum structure and academic grading standards.
* **Google DeepMind / Gemma Team:** For the Gemma open-weight foundation models.
* **Ollama Community:** For the high-performance local inference runtime.
