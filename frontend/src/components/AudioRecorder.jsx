import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, RotateCcw, AlertCircle, Sparkles, Loader2, Play, Square } from "lucide-react";
import { api } from "../services/api";

export default function AudioRecorder({ onQuestionSubmit, language = "English", faculty, department, course }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg("");
    setTranscribedText("");
    setAiAnswer("");
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Automatically attempt transcription
        autoTranscribeAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access error:", err);
      // Fallback: Web Speech API if getUserMedia is denied or not supported
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        startBrowserSpeechRecognition();
      } else {
        setErrorMsg("Microphone permission denied or not supported. You can type your question directly below.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const startBrowserSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Web speech recognition is not supported in this browser. Please type your question.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language.toLowerCase() === "bangla" ? "bn-BD" : "en-US";
    recognition.interimResults = false;

    setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
      setIsRecording(false);
    };
    recognition.onerror = (e) => {
      setErrorMsg(`Browser speech recognition error: ${e.error}`);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.start();
  };

  const autoTranscribeAudio = async (blob) => {
    setIsTranscribing(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");
      formData.append("language", language.toLowerCase() === "bangla" ? "bn-BD" : "en-US");

      const res = await api.transcribeAudio(formData);
      if (res.text) {
        setTranscribedText(res.text);
      } else {
        setErrorMsg("No clear speech detected. Please speak closer to the microphone.");
      }
    } catch (err) {
      console.warn("Backend speech recognition error:", err);
      // Fallback prompt for user
      setErrorMsg("Backend audio recognition encountered an issue. You can review or type your question below.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAskAI = async () => {
    if (!transcribedText.trim()) {
      setErrorMsg("Please record audio or enter a question first.");
      return;
    }

    setIsAnswering(true);
    setErrorMsg("");
    try {
      const res = await api.explainTopic({
        topic: transcribedText,
        faculty: faculty || "Faculty of Science and Engineering",
        department: department || "Computer Science and Engineering",
        course: course || "",
        language: language,
        difficulty: "Undergraduate"
      });
      setAiAnswer(res.explanation);
      if (onQuestionSubmit) {
        onQuestionSubmit(transcribedText, res.explanation);
      }
    } catch (err) {
      setErrorMsg(`AI Tutor error: ${err.message}`);
    } finally {
      setIsAnswering(false);
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.toLowerCase() === "bangla" ? "bn-BD" : "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl bg-slate-900/60">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            Voice-Based Academic Study Assistant
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask any study doubt using your microphone. Transcribes speech and asks Gemma 4 12B.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            Language: <strong className="text-cyan-400">{language}</strong>
          </span>
        </div>
      </div>

      {/* Recording Control Center */}
      <div className="my-6 flex flex-col items-center justify-center p-8 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {isRecording ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 h-10">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-red-500 to-rose-400 rounded-full wave-bar"
                  style={{
                    height: `${Math.max(12, Math.sin(i * 0.8) * 32)}px`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              Recording... {formatSeconds(recordingDuration)}
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={startRecording}
              disabled={isTranscribing || isAnswering}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 transition transform hover:scale-110 active:scale-95 disabled:opacity-50"
            >
              <Mic className="w-7 h-7" />
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Click to start speaking in {language}
            </p>
          </div>
        )}

        {/* Audio Player if recorded */}
        {audioUrl && !isRecording && (
          <div className="mt-4 flex items-center gap-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
            <audio controls src={audioUrl} className="h-8 max-w-xs" />
            <button
              onClick={() => autoTranscribeAudio(audioBlob)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-2 py-1 bg-slate-800 rounded"
              title="Re-transcribe"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-transcribe
            </button>
          </div>
        )}

        {isTranscribing && (
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Transcribing speech to text...
          </div>
        )}
      </div>

      {/* Editable Transcribed Text Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Recognized Question (Review or edit before submitting):
          </label>
          {transcribedText && (
            <button
              onClick={() => setTranscribedText("")}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          placeholder="Speak into your microphone or type your question here directly (e.g. 'Explain Demand Paging in Operating Systems')..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition resize-none"
        />

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleAskAI}
            disabled={!transcribedText.trim() || isAnswering}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition disabled:opacity-40"
          >
            {isAnswering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemma 4 12B Thinking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ask Study Tutor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Answer Display */}
      {aiAnswer && (
        <div className="mt-6 p-5 rounded-xl bg-slate-950/90 border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Gemma 4 12B Study Explanation
              </span>
            </div>
            <button
              onClick={() => speakText(aiAnswer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isSpeaking
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSpeaking ? "Stop Voice" : "Listen (TTS)"}</span>
            </button>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {aiAnswer}
          </div>
        </div>
      )}
    </div>
  );
}
