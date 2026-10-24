# Project Name
CampusMind — Your campus. Your studies. One AI.

## The problem
Who faces it, and how they deal with it today.

## The solution
What your app does, in 3–4 sentences.

## AI Model

- Model: Gemma 4 12B
- Model type: Open-weight, multimodal language model
- Runtime: Ollama
- Inference: Local HTTP API
- Model page: https://ollama.com/library/gemma4:12b
- License: Apache 2.0 (Gemma 4)
- Use cases: Lecture summarization, quiz generation,
  and topic explanations in Bangla and English.

## How it works
- Model(s) used: name + link
- Tech stack: frontend, backend, tools
- Datasets (if any): name + link

## How to run it
1. Clone the repo
2. Install requirements
3. Run the app

## Screenshots / demo
Add 2–3 screenshots or a short GIF/video link.

## What's not done yet
Be honest. Known bugs, missing features.

## Credits
Libraries, tutorials, code snippets and anything else you used.



venv\Scripts\activate

uvicorn main:app --reload 

If your main.py is inside an app folder instead, the command may be:


cmd
uvicorn app.main:app --reload


python -m uvicorn app.main:app --reload



