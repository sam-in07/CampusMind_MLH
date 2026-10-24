import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";
import { 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Clock 
} from "lucide-react";
import { api } from "../services/api";

export default function AcademicProgressPage({ studentProfile }) {
  const [progressData, setProgressData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const [prog, assess] = await Promise.all([
          api.getProgress(),
          api.listAssessments()
        ]);
        setProgressData(prog);
        setAssessments(assess.assessments || []);
      } catch (err) {
        console.error("Progress data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const chartData = progressData?.subjects?.map((s) => ({
    name: s.course_name.split(" ")[0] || s.course_name,
    fullName: s.course_name,
    "Syllabus Completion %": s.syllabus_completion_pct,
    "Quiz Mastery %": s.avg_assessment_pct,
    "Exam Readiness %": s.exam_readiness_pct,
  })) || [];

  const radarData = progressData?.subjects?.map((s) => ({
    subject: s.course_name.split(" ")[0] || s.course_name,
    Readiness: s.exam_readiness_pct,
    Syllabus: s.syllabus_completion_pct,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          Academic Progress & Examination Readiness
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous academic tracking distinguishing curriculum coverage from tested mastery and estimated readiness.
        </p>
      </div>

      {/* Transparent Definition Callout Box — Master Prompt Requirement */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Understanding Your 3 Academic Indicators</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="font-semibold text-white">1. Syllabus Completion</p>
            <p className="text-slate-400 mt-1 text-[11px]">
              Percentage of course lecture topics studied or marked done. (E.g. 8 of 12 topics = 66.7%).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="font-semibold text-white">2. Assessment Performance</p>
            <p className="text-slate-400 mt-1 text-[11px]">
              Actual average score earned in practice quizzes and mock evaluations. (E.g. 8/10 score = 80%).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="font-semibold text-white">3. Exam Readiness</p>
            <p className="text-slate-400 mt-1 text-[11px]">
              Estimated indicator derived from: (50% Syllabus Coverage) + (35% Assessment Score) + (15% Revision Activity).
            </p>
          </div>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Comparative Metrics by Course (%)
          </h2>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="Syllabus Completion %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quiz Mastery %" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Exam Readiness %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart for Balance */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Curriculum Balance
          </h2>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Readiness" dataKey="Readiness" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Balanced shape indicates well-rounded preparation across course modules.
          </p>
        </div>

      </div>

      {/* Detailed Subject Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Subject-Level Topic Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">Course Name</th>
                <th className="pb-3 font-semibold">Syllabus Covered</th>
                <th className="pb-3 font-semibold">Avg Test Score</th>
                <th className="pb-3 font-semibold">Estimated Readiness</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {progressData?.subjects?.map((s, idx) => {
                const isReady = s.exam_readiness_pct >= 70;
                return (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 font-bold text-white">{s.course_name}</td>
                    <td className="py-3.5 text-slate-300">
                      {s.completed_topics} / {s.total_topics} ({s.syllabus_completion_pct}%)
                    </td>
                    <td className="py-3.5 text-emerald-400 font-semibold">{s.avg_assessment_pct}%</td>
                    <td className="py-3.5">
                      <span className="font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
                        {s.exam_readiness_pct}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Needs Revision
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
