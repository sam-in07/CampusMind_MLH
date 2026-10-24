import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  BookOpen, 
  HelpCircle, 
  BrainCircuit, 
  Mic, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Languages,
  BookmarkCheck,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import { SAMPLE_LECTURE_NOTES, IIUC_FACULTIES } from "../data/iiucData";
import AudioRecorder from "../components/AudioRecorder";

export default function StudyWorkspacePage({ studentProfile }) {
  const [activeTab, setActiveTab] = useState("summarizer"); // "summarizer" | "quiz" | "explainer" | "voice"
  const [language, setLanguage] = useState(studentProfile?.preferred_language || "English");

  // Summarizer State
  const [summaryInput, setSummaryInput] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("Operating Systems — Virtual Memory");
  const [summaryCourse, setSummaryCourse] = useState("CSE 3515 - Operating Systems");
  const [summaryOutput, setSummaryOutput] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summarySaved, setSummarySaved] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Quiz State
  const [quizInput, setQuizInput] = useState("");
  const [quizNum, setQuizNum] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Explainer State
  const [explainerTopic, setExplainerTopic] = useState("");
  const [explainerDifficulty, setExplainerDifficulty] = useState("Undergraduate");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Assalamu Alaikum! I am CampusMind's AI Academic Tutor. Select your department, ask any course doubt in English or Bangla, and I will explain it with step-by-step clarity."
    }
  ]);
  const [explaining, setExplaining] = useState(false);

  // Global Error state
  const [errorMsg, setErrorMsg] = useState("");

  // Handler: Load sample lecture notes
  const loadSample = (key) => {
    const sample = SAMPLE_LECTURE_NOTES[key];
    if (sample) {
      setSummaryTitle(sample.title);
      setSummaryCourse(sample.course);
      setSummaryInput(sample.text);
      setQuizInput(sample.text);
    }
  };

  // Handler: Document Upload (PDF / TXT)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.extractDocument(formData);
      setSummaryInput(res.extracted_text);
      setQuizInput(res.extracted_text);
      setSummaryTitle(file.name.replace(/\.[^/.]+$/, ""));
    } catch (err) {
      setErrorMsg(`Document extraction error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handler: Generate Summary
  const handleGenerateSummary = async () => {
    if (!summaryInput.trim() || summaryInput.trim().length < 10) {
      setErrorMsg("Please enter or upload lecture notes (minimum 10 characters).");
      return;
    }
    setSummarizing(true);
    setErrorMsg("");
    setSummarySaved(false);
    try {
      const res = await api.summarizeLecture({
        content: summaryInput,
        language: language,
        title: summaryTitle,
        course: summaryCourse
      });
      setSummaryOutput(res.summary);
      setSummarySaved(true);
    } catch (err) {
      setErrorMsg(`Summarization failed: ${err.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  // Handler: Generate Quiz
  const handleGenerateQuiz = async () => {
    const content = quizInput.trim() || summaryInput.trim();
    if (!content || content.length < 10) {
      setErrorMsg("Please provide source lecture notes to generate quiz questions from.");
      return;
    }
    setGeneratingQuiz(true);
    setErrorMsg("");
    setQuizSubmitted(false);
    setUserAnswers({});
    try {
      const res = await api.generateQuiz({
        content: content,
        num_questions: Number(quizNum),
        difficulty: quizDifficulty,
        language: language,
        course: summaryCourse
      });
      setQuizQuestions(res.questions);
    } catch (err) {
      setErrorMsg(`Quiz generation failed: ${err.message}`);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Handler: Select Quiz Option
  const handleSelectOption = (questionId, optionLetter) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  // Handler: Submit Quiz & Record Score
  const handleSubmitQuiz = async () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      const selected = userAnswers[q.id];
      // Check if selected matches correct_answer (e.g. "A" or option starting with "A")
      if (selected && (selected === q.correct_answer || q.correct_answer.startsWith(selected))) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    // Trigger celebratory confetti for high scores!
    if (score / quizQuestions.length >= 0.7) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }

    // Automatically record to database assessments
    try {
      await api.recordAssessment({
        course: summaryCourse,
        topic: summaryTitle || "Practice Quiz",
        assessment_type: "quiz",
        score: score,
        max_score: quizQuestions.length,
        difficulty: quizDifficulty,
        details: { answers: userAnswers }
      });
    } catch (e) {
      console.warn("Failed to record quiz score automatically:", e);
    }
  };

  // Handler: Explainer Chat
  const handleSendExplainer = async (e) => {
    e?.preventDefault();
    if (!explainerTopic.trim()) return;

    const query = explainerTopic.trim();
    setExplainerTopic("");
    setExplaining(true);
    setErrorMsg("");

    const newHistory = [...chatHistory, { role: "user", content: query }];
    setChatHistory(newHistory);

    try {
      const res = await api.explainTopic({
        topic: query,
        faculty: studentProfile?.faculty || "Faculty of Science and Engineering",
        department: studentProfile?.department || "Computer Science and Engineering",
        course: summaryCourse,
        difficulty: explainerDifficulty,
        language: language,
        context_notes: summaryInput ? summaryInput.slice(0, 1500) : undefined
      });

      setChatHistory([...newHistory, { role: "assistant", content: res.explanation }]);
    } catch (err) {
      setErrorMsg(`AI Tutor error: ${err.message}`);
    } finally {
      setExplaining(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Workspace Header & Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            CampusMind AI Study Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department: <strong className="text-slate-200">{studentProfile?.department || "Computer Science and Engineering"}</strong> • Powered by Gemma 4 12B
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Languages className="w-4 h-4 text-cyan-400 ml-2" />
          <button
            onClick={() => setLanguage("English")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              language === "English"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("Bangla")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              language === "Bangla"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: "summarizer", label: "Smart Summarizer", icon: BookOpen, desc: "Notes to Revision Sheets" },
          { id: "quiz", label: "AI Quiz Generator", icon: HelpCircle, desc: "Interactive MCQs" },
          { id: "explainer", label: "AI Topic Explainer", icon: BrainCircuit, desc: "Chat Study Tutor" },
          { id: "voice", label: "Voice Assistant", icon: Mic, desc: "Speech Recording" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? "bg-indigo-600/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Error Banner if any */}
      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-amber-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: SMART SUMMARIZER */}
      {activeTab === "summarizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Lecture Material Input
              </h2>
              {/* Sample loader buttons */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Quick Samples:</span>
                <button
                  onClick={() => loadSample("os")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium"
                >
                  OS
                </button>
                <button
                  onClick={() => loadSample("db")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium"
                >
                  Database
                </button>
                <button
                  onClick={() => loadSample("shariah")}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium"
                >
                  Shariah
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Topic / Title</label>
                <input
                  type="text"
                  value={summaryTitle}
                  onChange={(e) => setSummaryTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Course</label>
                <input
                  type="text"
                  value={summaryCourse}
                  onChange={(e) => setSummaryCourse(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Paste Notes or Lecture Slides:</label>
                <span className="text-[11px] text-slate-500">{summaryInput.length} characters</span>
              </div>
              <textarea
                rows={10}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Paste your lecture notes, textbook excerpts, or discussion points here..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-sans"
              />
            </div>

            {/* Document Upload Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 transition">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{uploadingDoc ? "Extracting text..." : "Upload PDF / TXT Notes"}</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={uploadingDoc}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleGenerateSummary}
                disabled={summarizing || !summaryInput.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {summarizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemma Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Executive Summary & Key Points ({language})
              </h2>
              {summaryOutput && (
                <div className="flex items-center gap-2">
                  {summarySaved && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <BookmarkCheck className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(summaryOutput)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 overflow-y-auto max-h-[500px]">
              {summaryOutput ? (
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {summaryOutput}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-700" />
                  <p className="text-xs">
                    Your structured study summary will appear here. Paste notes or click one of the quick samples above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI QUIZ GENERATOR */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Questions Count:</label>
                <select
                  value={quizNum}
                  onChange={(e) => setQuizNum(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Difficulty:</label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Easy">Easy (Conceptual)</option>
                  <option value="Medium">Medium (Application)</option>
                  <option value="University-Level">University-Level (Rigorous)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Source Material:</label>
                <button
                  onClick={() => loadSample("os")}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium"
                >
                  Load Sample Notes
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-40"
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating MCQs with Gemma...</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Generate Practice Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Quiz Taking Interface */}
          {quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {/* Question list */}
              {quizQuestions.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isCorrect = userChoice && (userChoice === q.correct_answer || q.correct_answer.startsWith(userChoice));

                return (
                  <div
                    key={q.id || idx}
                    className={`glass-card rounded-2xl p-6 border transition ${
                      quizSubmitted
                        ? isCorrect
                          ? "border-emerald-500/50 bg-emerald-950/10"
                          : "border-rose-500/50 bg-rose-950/10"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-cyan-400 shrink-0 font-bold">
                          {idx + 1}
                        </span>
                        <span>{q.question}</span>
                      </h3>
                      {quizSubmitted && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {isCorrect ? "Correct (+1)" : "Incorrect (0)"}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options?.map((opt, oIdx) => {
                        const optLetter = opt.charAt(0);
                        const isSelected = userChoice === optLetter;
                        const isTheCorrectAnswer = q.correct_answer.startsWith(optLetter);

                        let optClasses = "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700";
                        if (quizSubmitted) {
                          if (isTheCorrectAnswer) {
                            optClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold";
                          } else if (isSelected && !isTheCorrectAnswer) {
                            optClasses = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold";
                          }
                        } else if (isSelected) {
                          optClasses = "bg-indigo-600/30 border-cyan-400 text-white font-semibold";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectOption(q.id, optLetter)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2 ${optClasses}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                              {optLetter}
                            </span>
                            <span>{opt.slice(3) || opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {quizSubmitted && q.explanation && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                        <span className="font-bold text-cyan-400">Explanation:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit / Retake Controls */}
              <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {quizSubmitted ? (
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-xs text-slate-400">Your Practice Score:</p>
                      <p className="text-2xl font-extrabold text-white">
                        {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      ✓ Automatically recorded to your progress metrics
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Answer all questions above and click submit to evaluate your mastery.
                  </p>
                )}

                <div className="flex items-center gap-3">
                  {quizSubmitted ? (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setUserAnswers({});
                        setQuizScore(0);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition disabled:opacity-40"
                    >
                      Submit Quiz for Grading
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-white">No Quiz Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Paste your lecture notes into the input box or click "Load Sample Notes", then press "Generate Practice Quiz".
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI TOPIC EXPLAINER */}
      {activeTab === "explainer" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                IIUC AI Study Tutor ({studentProfile?.department || "CSE"})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Specialized in {studentProfile?.faculty || "Faculty of Science and Engineering"}. Ask anything in English or Bangla.
              </p>
            </div>
            <div>
              <select
                value={explainerDifficulty}
                onChange={(e) => setExplainerDifficulty(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
              >
                <option value="Beginner">Intuitive (Beginner)</option>
                <option value="Undergraduate">Undergraduate Standard</option>
                <option value="Advanced">Advanced / Exam Deep-Dive</option>
              </select>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto p-2">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {explaining && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 pl-10">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gemma 4 12B formulating explanation...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendExplainer} className="flex gap-2 pt-2">
            <input
              type="text"
              value={explainerTopic}
              onChange={(e) => setExplainerTopic(e.target.value)}
              placeholder="Ask a question (e.g., 'What is Thrashing in Operating Systems?' or 'ব্যাখ্যা কর ডিমান্ড পেজিং কি')..."
              className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={explaining || !explainerTopic.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: VOICE STUDY ASSISTANT */}
      {activeTab === "voice" && (
        <AudioRecorder
          language={language}
          faculty={studentProfile?.faculty}
          department={studentProfile?.department}
          course={summaryCourse}
          onQuestionSubmit={(q, a) => {
            // Append to explainer chat history as well
            setChatHistory((prev) => [
              ...prev,
              { role: "user", content: `[Voice]: ${q}` },
              { role: "assistant", content: a }
            ]);
          }}
        />
      )}

    </div>
  );
}
