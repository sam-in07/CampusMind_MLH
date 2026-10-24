import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  BrainCircuit, 
  BookOpen, 
  HelpCircle, 
  Mic, 
  Calculator, 
  BarChart3, 
  CheckCircle2, 
  Cpu, 
  Database, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { api } from "../services/api";

export default function LandingPage() {
  const [aiHealth, setAiHealth] = useState(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await api.checkAiHealth();
        setAiHealth(res);
      } catch (err) {
        setAiHealth({ ai_engine: { status: "offline" }, database: { mode: "local" } });
      }
    }
    loadHealth();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Smart Lecture Summarizer",
      desc: "Paste notes or upload PDFs. Gemma generates structured executive summaries, core concepts, and revision notes in Bangla or English.",
      tag: "Feature A"
    },
    {
      icon: HelpCircle,
      title: "Interactive AI Quiz Generator",
      desc: "Instant practice MCQs and short-answer questions with validated answer options, immediate grading, and comprehensive explanations.",
      tag: "Feature B"
    },
    {
      icon: BrainCircuit,
      title: "Department-Tailored AI Tutor",
      desc: "Understands IIUC faculties from Shariah & Law to CSE & Business. Explains difficult concepts with step-by-step clarity.",
      tag: "Feature C"
    },
    {
      icon: Mic,
      title: "Voice-Based Study Assistant",
      desc: "Record academic doubts via microphone. Review and edit transcriptions before submitting to Gemma, with optional speech playback.",
      tag: "Feature D"
    },
    {
      icon: BarChart3,
      title: "Academic Progress & Readiness",
      desc: "Distinct tracking for syllabus completion %, quiz mastery %, and transparent multi-factor exam readiness estimations.",
      tag: "Feature E"
    },
    {
      icon: Calculator,
      title: "Deterministic CGPA Calculator",
      desc: "Verified UGC/IIUC credit calculations and what-if future semester simulators. Discover required GPA to achieve target honors.",
      tag: "Feature F"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/20 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* University Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md text-xs font-medium text-slate-300">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>International Islamic University Chittagong (IIUC)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-semibold">Competition Edition</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="block text-white">CampusMind</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent mt-2">
              Your Department. Your Studies. Your AI.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            The complete, responsive AI-powered study companion built specifically for IIUC students.
            Understand difficult course concepts, synthesize lecture notes, practice quizzes, and simulate CGPA milestones.
          </p>

          {/* Live AI Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Model:</span>
              <span className="font-semibold text-cyan-300">Gemma 4 12B via Ollama</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Storage:</span>
              <span className="font-semibold text-emerald-300">
                {aiHealth?.database?.mode === "mongodb_atlas" ? "MongoDB Atlas Connected" : "Local Data Persistence Active"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Bangla & English Supported</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/workspace"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Launch AI Study Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 shadow-md transition flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Open Student Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Everything You Need for Academic Excellence at IIUC
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Built following the university's exact faculty structure, deterministic GPA calculations, and locally deployed Gemma 4 12B.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 bg-slate-950/70">
        <p className="font-medium text-slate-400">
          CampusMind — International Islamic University Chittagong (IIUC) Student Study Assistant
        </p>
        <p className="mt-1">
          Powered by React + Vite, FastAPI, MongoDB Atlas, and Gemma 4 12B via local Ollama.
        </p>
      </footer>
    </div>
  );
}
