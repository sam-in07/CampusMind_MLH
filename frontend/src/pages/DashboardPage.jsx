import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  BrainCircuit, 
  Calculator, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  RefreshCw,
  Clock,
  Layers,
  GraduationCap
} from "lucide-react";
import { api } from "../services/api";

export default function DashboardPage({ studentProfile }) {
  const [progressData, setProgressData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoadingDashboard(true);
      try {
        const [prog, hist] = await Promise.all([
          api.getProgress(),
          api.getHistory()
        ]);
        setProgressData(prog);
        setHistoryData(hist.history || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoadingDashboard(false);
      }
    }
    loadData();
  }, []);

  const handleFetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await api.getRecommendations();
      setRecommendations(res);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const upcomingExams = [
    { course: "Operating Systems (CSE 3515)", date: "Nov 15, 2026", daysLeft: 22, focus: "Demand Paging & Page Replacement" },
    { course: "Database Systems (CSE 3521)", date: "Nov 22, 2026", daysLeft: 29, focus: "3NF Normalization & Transactions" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>IIUC Academic Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {studentProfile?.name || "IIUC Student"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {studentProfile?.faculty || "Faculty of Science and Engineering"} • {studentProfile?.department || "Computer Science and Engineering"} ({studentProfile?.semester || "5th Semester"})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/workspace"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Start AI Study Session</span>
          </Link>
          <Link
            to="/cgpa"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>CGPA Estimator</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards — 3 Separate Transparent Indicators as requested by Master Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Syllabus Completion */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              1. Syllabus Completion
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progressData ? `${progressData.overall_syllabus_completion_pct}%` : "62.5%"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Curriculum topics marked complete across registered courses.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressData?.overall_syllabus_completion_pct || 62.5}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: Assessment Mastery */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              2. Assessment Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progressData ? `${progressData.overall_assessment_avg_pct}%` : "75.0%"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Average test score from quizzes & mock exam attempts.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressData?.overall_assessment_avg_pct || 75.0}%` }} 
            />
          </div>
        </div>

        {/* Metric 3: Estimated Exam Readiness */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              3. Exam Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-300">
            {progressData ? `${progressData.overall_exam_readiness_pct}%` : "68.2%"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Multi-factor estimate (50% topics + 35% tests + 15% revision).
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressData?.overall_exam_readiness_pct || 68.2}%` }} 
            />
          </div>
        </div>

        {/* Metric 4: Target CGPA Milestone */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Target Honors CGPA
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-300">
            3.75 <span className="text-xs font-normal text-slate-400">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Dean's List Target (First Class Honours requirement).
          </p>
          <Link to="/cgpa" className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-3">
            Simulate future scenarios <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* Main Grid: Subject Progress & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Subject-wise Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Subject-Wise Progress & Readiness
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown by curriculum coverage vs practical test score.
                </p>
              </div>
              <Link to="/progress" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                View Charts <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {progressData?.subjects?.map((subj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{subj.course_name}</span>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                      Readiness: {subj.exam_readiness_pct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-1">
                    <div>
                      <span>Syllabus: {subj.completed_topics}/{subj.total_topics} topics</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${subj.syllabus_completion_pct}%` }} />
                      </div>
                    </div>
                    <div>
                      <span>Quiz Mastery: {subj.avg_assessment_pct}%</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${subj.avg_assessment_pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Study Activity */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Academic Activity
            </h3>
            {historyData.length > 0 ? (
              <div className="space-y-3">
                {historyData.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{item.title}</p>
                      <p className="text-slate-400 text-[11px]">{item.course}</p>
                    </div>
                    {item.score && (
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {item.score}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No study history recorded yet. Complete your first quiz or summary!</p>
            )}
          </div>
        </div>

        {/* Right 1 Column: AI Study Recommendations & Upcoming Deadlines */}
        <div className="space-y-6">
          
          {/* Personalized AI Recommendations */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI Study Coach
              </h3>
              <button
                onClick={handleFetchRecommendations}
                disabled={loadingRecs}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50"
                title="Generate fresh recommendations"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Personalized recommendations synthesized by Gemma 4 12B based on your recorded scores and upcoming tests.
            </p>

            {recommendations ? (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {recommendations.recommendation_text}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Ready to analyze your academic strengths and weak areas with Gemma 4 12B.
                </p>
                <button
                  onClick={handleFetchRecommendations}
                  disabled={loadingRecs}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {loadingRecs ? "Synthesizing with Gemma..." : "Generate AI Advice"}
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Examinations */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Upcoming Examinations
            </h3>
            <div className="space-y-3">
              {upcomingExams.map((exam, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{exam.course}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      In {exam.daysLeft} days
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Date: {exam.date}</p>
                  <p className="text-[11px] text-cyan-400">Focus: {exam.focus}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
