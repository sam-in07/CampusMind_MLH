import json
import re
import logging
from typing import Any, List, Dict, Optional

logger = logging.getLogger(__name__)

def repair_and_parse_json(raw_text: str) -> Any:
    """
    Robust JSON parser for LLM responses.
    Handles:
    - Markdown code fences
    - LaTeX and single backslashes (e.g. \\times, \\mu, \\frac)
    - Trailing commas
    - Text before/after JSON
    - Fallback regex extraction for quiz questions
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Empty response received from AI model.")

    cleaned = raw_text.strip()

    # 1. Strip markdown fences
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    # 2. Extract substring between outermost brackets [ ... ] or { ... }
    first_bracket = cleaned.find('[')
    last_bracket = cleaned.rfind(']')
    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')

    target_str = cleaned
    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        target_str = cleaned[first_bracket:last_bracket+1]
    elif first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        target_str = cleaned[first_brace:last_brace+1]

    # 3. Direct attempt with strict=False
    try:
        return json.loads(target_str, strict=False)
    except Exception:
        pass

    # 4. Repair unescaped backslashes (common in LaTeX, math, physics, CS)
    # Valid JSON escape sequences are: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    repaired = re.sub(r'\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', target_str)
    try:
        return json.loads(repaired, strict=False)
    except Exception:
        pass

    # 5. Remove trailing commas before closing ] or }
    repaired = re.sub(r',\s*([\]}])', r'\1', repaired)
    try:
        return json.loads(repaired, strict=False)
    except Exception:
        pass

    # 6. Fallback: Parse individual question objects using regex
    questions = _extract_questions_with_regex(raw_text)
    if questions and len(questions) > 0:
        logger.info(f"Successfully recovered {len(questions)} quiz questions using regex parser.")
        return questions

    raise ValueError(f"Could not parse valid JSON from AI output: {raw_text[:200]}")


def _extract_questions_with_regex(text: str) -> List[Dict[str, Any]]:
    """
    Emergency extraction of quiz questions if JSON parsing fails completely.
    Works on both malformed JSON and semi-structured text questions.
    """
    questions = []

    # Try matching individual JSON-like question blocks
    block_pattern = re.compile(
        r'\{\s*"id"\s*:\s*(\d+).*?"question"\s*:\s*"(.*?)".*?"options"\s*:\s*\[(.*?)\]'
        r'.*?"correct_answer"\s*:\s*"(.*?)".*?"explanation"\s*:\s*"(.*?)"\s*\}',
        re.DOTALL
    )

    matches = block_pattern.findall(text)
    if matches:
        for idx, (qid, q_text, opts_str, ans, exp) in enumerate(matches):
            # Parse options
            opts = re.findall(r'"(.*?)"', opts_str)
            if not opts:
                opts = ["A) Option A", "B) Option B", "C) Option C", "D) Option D"]
            questions.append({
                "id": int(qid) if qid.isdigit() else idx + 1,
                "question": q_text.replace('\\"', '"').replace('\\n', ' ').strip(),
                "type": "mcq",
                "options": [o.replace('\\"', '"').strip() for o in opts],
                "correct_answer": ans.strip(),
                "explanation": exp.replace('\\"', '"').strip()
            })
        return questions

    # Fallback 2: Match numbered questions from plain text output (e.g. 1. What is ... A) ... B) ... )
    lines = text.splitlines()
    current_q = None
    for line in lines:
        line_s = line.strip()
        # Look for question start: "1. " or "Question 1:"
        q_start = re.match(r'^(?:\d+[\.\)]|Question\s+\d+:?)\s+(.*)', line_s, re.IGNORECASE)
        if q_start:
            if current_q and len(current_q.get("options", [])) >= 2:
                questions.append(current_q)
            current_q = {
                "id": len(questions) + 1,
                "question": q_start.group(1),
                "type": "mcq",
                "options": [],
                "correct_answer": "A",
                "explanation": "Derived from study material."
            }
            continue

        if current_q:
            # Look for options: A) or [A] or A.
            opt_match = re.match(r'^([A-D])[\)\.\:]\s*(.*)', line_s, re.IGNORECASE)
            if opt_match:
                letter = opt_match.group(1).upper()
                opt_content = opt_match.group(2).strip()
                current_q["options"].append(f"{letter}) {opt_content}")
                continue

            # Look for Correct Answer:
            ans_match = re.match(r'^(?:Correct\s*Answer|Answer|Ans):\s*([A-D])', line_s, re.IGNORECASE)
            if ans_match:
                current_q["correct_answer"] = ans_match.group(1).upper()
                continue

            # Look for Explanation:
            exp_match = re.match(r'^(?:Explanation|Reason):\s*(.*)', line_s, re.IGNORECASE)
            if exp_match:
                current_q["explanation"] = exp_match.group(1).strip()
                continue

    if current_q and len(current_q.get("options", [])) >= 2:
        questions.append(current_q)

    return questions
