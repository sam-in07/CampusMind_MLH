import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Target, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { api } from "../services/api";
import { DEFAULT_GRADING_SCALE } from "../data/iiucData";

export default function CgpaCalculatorPage() {
  const [activeTab, setActiveTab] = useState("current"); // "current" | "projector"

  // Current CGPA state
  const [courses, setCourses] = useState([
    { course_name: "CSE 3515 - Operating Systems", credits: 3.0, grade: "A+" },
    { course_name: "CSE 3521 - Database Systems", credits: 3.0, grade: "A" },
    { course_name: "CSE 2411 - Data Structures", credits: 3.0, grade: "A-" },
    { course_name: "MATH 2301 - Discrete Mathematics", credits: 3.0, grade: "B+" },
  ]);
  const [currentResult, setCurrentResult] = useState(null);
  const [calculatingCurrent, setCalculatingCurrent] = useState(false);

  // Future Projection state
  const [existingCgpa, setExistingCgpa] = useState(3.62);
  const [existingCredits, setExistingCredits] = useState(60.0);
  const [targetCgpa, setTargetCgpa] = useState(3.75);
  const [futureCourses, setFutureCourses] = useState([
    { course_name: "CSE 4701 - Artificial Intelligence", credits: 3.0, expected_grade: "A+" },
    { course_name: "CSE 4711 - Computer Networks", credits: 3.0, expected_grade: "A" },
    { course_name: "CSE 4725 - Software Engineering", credits: 3.0, expected_grade: "A" },
    { course_name: "GED 4101 - Professional Ethics", credits: 2.0, expected_grade: "A+" },
  ]);
  const [projectionResult, setProjectionResult] = useState(null);
  const [projecting, setProjecting] = useState(false);

  // Calculate current CGPA
  const handleCalculateCurrent = async () => {
    setCalculatingCurrent(true);
    try {
      const res = await api.calculateCgpa({
        completed_courses: courses
      });
      setCurrentResult(res);
    } catch (err) {
      alert(`Calculation error: ${err.message}`);
    } finally {
      setCalculatingCurrent(false);
    }
  };

  // Run on mount for initial display
  useEffect(() => {
    handleCalculateCurrent();
  }, []);

  // Calculate future projection
  const handleCalculateProjection = async () => {
    setProjecting(true);
    try {
      const res = await api.projectCgpa({
        current_cgpa: Number(existingCgpa),
        completed_credits: Number(existingCredits),
        future_courses: futureCourses,
        target_cgpa: targetCgpa ? Number(targetCgpa) : undefined
      });
      setProjectionResult(res);
    } catch (err) {
      alert(`Projection error: ${err.message}`);
    } finally {
      setProjecting(false);
    }
  };

  const addCourseRow = () => {
    setCourses([...courses, { course_name: "New Course", credits: 3.0, grade: "A" }]);
  };

  const removeCourseRow = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const addFutureRow = () => {
    setFutureCourses([...futureCourses, { course_name: "Future Course", credits: 3.0, expected_grade: "A" }]);
  };

  const removeFutureRow = (index) => {
    setFutureCourses(futureCourses.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-cyan-400" />
          IIUC Deterministic CGPA Calculator & Scenario Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Precision numerical calculations based on UGC/IIUC credit weighting. No fabricated numbers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === "current"
              ? "bg-indigo-600/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>Completed Courses CGPA</span>
        </button>
        <button
          onClick={() => setActiveTab("projector")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === "projector"
              ? "bg-indigo-600/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Future Scenario & Target Estimator</span>
        </button>
      </div>

      {/* TAB 1: CURRENT CGPA CALCULATOR */}
      {activeTab === "current" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Courses Input Table */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Course Grades & Credits</h2>
              <button
                onClick={addCourseRow}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Course
              </button>
            </div>

            <div className="space-y-3">
              {courses.map((course, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <input
                    type="text"
                    value={course.course_name}
                    onChange={(e) => {
                      const updated = [...courses];
                      updated[idx].course_name = e.target.value;
                      setCourses(updated);
                    }}
                    placeholder="Course name or code"
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />

                  {/* Credits */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">Cr:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="6"
                      value={course.credits}
                      onChange={(e) => {
                        const updated = [...courses];
                        updated[idx].credits = parseFloat(e.target.value) || 0;
                        setCourses(updated);
                      }}
                      className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 text-center font-bold"
                    />
                  </div>

                  {/* Grade Select */}
                  <select
                    value={course.grade}
                    onChange={(e) => {
                      const updated = [...courses];
                      updated[idx].grade = e.target.value;
                      setCourses(updated);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-bold"
                  >
                    {Object.keys(DEFAULT_GRADING_SCALE).map((g) => (
                      <option key={g} value={g}>{g} ({DEFAULT_GRADING_SCALE[g].toFixed(2)})</option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeCourseRow(idx)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Remove course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCalculateCurrent}
                disabled={calculatingCurrent}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
              >
                {calculatingCurrent ? "Calculating..." : "Calculate Cumulative CGPA"}
              </button>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5 bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Cumulative CGPA Result
              </span>

              <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-center space-y-2">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400">
                  {currentResult?.current_cgpa?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs font-semibold text-slate-300">Out of 4.00</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Validated Credits:</span>
                  <span className="font-bold text-white">{currentResult?.total_credits || 0} Credits</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Quality Points:</span>
                  <span className="font-bold text-white">{currentResult?.total_credit_points || 0}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Grading Scale Assumption:</span>
                  <span className="font-medium text-cyan-400">UGC/IIUC 4.00</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-500 italic pt-2">
                * Note: Deterministic calculations computed in Python backend. Official transcripts are verified by IIUC Controller of Examinations.
              </p>
            </div>

            {/* Grading Scale Reference */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 text-xs space-y-3">
              <h3 className="font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                IIUC Default Grading Scale Assumption
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                {Object.entries(DEFAULT_GRADING_SCALE).map(([letter, point]) => (
                  <div key={letter} className="flex justify-between p-1.5 rounded bg-slate-950/60">
                    <span className="font-semibold text-white">{letter}</span>
                    <span className="text-emerald-400 font-bold">{point.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FUTURE SCENARIO & TARGET ESTIMATOR */}
      {activeTab === "projector" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Current Baseline Inputs */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Academic Baseline & Target
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={existingCgpa}
                    onChange={(e) => setExistingCgpa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-cyan-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Completed Credits</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="160"
                    value={existingCredits}
                    onChange={(e) => setExistingCredits(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Target Desired CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-amber-300 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Hypothetical Future Courses */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Hypothetical Future Courses</h3>
                <button
                  onClick={addFutureRow}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              <div className="space-y-3">
                {futureCourses.map((course, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <input
                      type="text"
                      value={course.course_name}
                      onChange={(e) => {
                        const updated = [...futureCourses];
                        updated[idx].course_name = e.target.value;
                        setFutureCourses(updated);
                      }}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                    />

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Cr:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="6"
                        value={course.credits}
                        onChange={(e) => {
                          const updated = [...futureCourses];
                          updated[idx].credits = parseFloat(e.target.value) || 0;
                          setFutureCourses(updated);
                        }}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 text-center font-bold"
                      />
                    </div>

                    <select
                      value={course.expected_grade}
                      onChange={(e) => {
                        const updated = [...futureCourses];
                        updated[idx].expected_grade = e.target.value;
                        setFutureCourses(updated);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-bold"
                    >
                      {Object.keys(DEFAULT_GRADING_SCALE).map((g) => (
                        <option key={g} value={g}>{g} ({DEFAULT_GRADING_SCALE[g].toFixed(2)})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeFutureRow(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCalculateProjection}
                  disabled={projecting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
                >
                  {projecting ? "Projecting Scenario..." : "Simulate Future CGPA"}
                </button>
              </div>
            </div>
          </div>

          {/* Projection Results */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 bg-gradient-to-b from-indigo-950/20 to-slate-900/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Scenario Simulation Results
              </span>

              {projectionResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <p className="text-xs text-slate-400">Projected Semester GPA:</p>
                    <p className="text-3xl font-extrabold text-cyan-400">
                      {projectionResult.projected_semester_gpa?.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2">
                    <p className="text-xs text-slate-400">New Cumulative CGPA:</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">
                        {projectionResult.projected_cumulative_cgpa?.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          projectionResult.cgpa_delta >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        ({projectionResult.cgpa_delta >= 0 ? `+${projectionResult.cgpa_delta.toFixed(2)}` : projectionResult.cgpa_delta.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Target Feasibility Advice */}
                  {projectionResult.target_analysis && (
                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        projectionResult.target_analysis.is_achievable_in_planned_credits
                          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                          : "bg-amber-950/20 border-amber-500/40 text-amber-300"
                      }`}
                    >
                      <p className="font-bold mb-1">Target Analysis for {targetCgpa}:</p>
                      <p>{projectionResult.target_analysis.advice}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800 text-center space-y-2">
                  <Target className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Click "Simulate Future CGPA" to run the mathematical scenario.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
