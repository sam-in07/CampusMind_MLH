import React, { useState, useEffect } from "react";
import { 
  User, 
  GraduationCap, 
  Cpu, 
  Database, 
  Languages, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw 
} from "lucide-react";
import { api } from "../services/api";
import { IIUC_FACULTIES, SEMESTERS } from "../data/iiucData";

export default function ProfileSettingsPage({ studentProfile, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: studentProfile?.name || "IIUC Student",
    student_id: studentProfile?.student_id || "C231001",
    email: studentProfile?.email || "student@iiuc.ac.bd",
    faculty: studentProfile?.faculty || "Faculty of Science and Engineering",
    department: studentProfile?.department || "Computer Science and Engineering",
    semester: studentProfile?.semester || "5th Semester",
    preferred_language: studentProfile?.preferred_language || "English"
  });

  const [aiHealth, setAiHealth] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [refreshingHealth, setRefreshingHealth] = useState(false);

  // Sync when prop updates
  useEffect(() => {
    if (studentProfile) {
      setFormData({
        name: studentProfile.name || "IIUC Student",
        student_id: studentProfile.student_id || "C231001",
        email: studentProfile.email || "student@iiuc.ac.bd",
        faculty: studentProfile.faculty || "Faculty of Science and Engineering",
        department: studentProfile.department || "Computer Science and Engineering",
        semester: studentProfile.semester || "5th Semester",
        preferred_language: studentProfile.preferred_language || "English"
      });
    }
  }, [studentProfile]);

  const loadHealth = async () => {
    setRefreshingHealth(true);
    try {
      const res = await api.checkAiHealth();
      setAiHealth(res);
    } catch {
      setAiHealth({ ai_engine: { status: "offline" }, database: { mode: "local" } });
    } finally {
      setRefreshingHealth(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  // Handle cascading faculty change
  const handleFacultyChange = (e) => {
    const newFacultyName = e.target.value;
    const matchedFaculty = IIUC_FACULTIES.find((f) => f.name === newFacultyName);
    const newDepts = matchedFaculty ? matchedFaculty.departments : [];
    
    setFormData((prev) => ({
      ...prev,
      faculty: newFacultyName,
      department: newDepts.length > 0 ? newDepts[0] : ""
    }));
  };

  // Get currently available departments for selected faculty
  const currentFacultyObj = IIUC_FACULTIES.find((f) => f.name === formData.faculty);
  const availableDepartments = currentFacultyObj ? currentFacultyObj.departments : [];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await api.updateProfile(formData);
      if (onProfileUpdate) {
        onProfileUpdate(res.profile || formData);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          Student Profile & University Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your department curriculum, response language, and verify live AI engine status.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Academic Settings Card with Cascading Selector */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            IIUC Cascading Faculty & Department Structure
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Cascading Faculty */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Faculty
              </label>
              <select
                value={formData.faculty}
                onChange={handleFacultyChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {IIUC_FACULTIES.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cascading Department */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Current Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                Default AI Response Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="English">English</option>
                <option value="Bangla">বাংলা (Bangla)</option>
              </select>
            </div>

          </div>

          {/* Student Personal Info */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Student Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Student Matrix ID</label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">IIUC Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Backend & Model Health Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Connected Infrastructure Status
            </h2>
            <button
              type="button"
              onClick={loadHealth}
              disabled={refreshingHealth}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingHealth ? "animate-spin" : ""}`} /> Check Connection
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Ollama Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Local AI Model</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  aiHealth?.ai_engine?.status === "online"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {aiHealth?.ai_engine?.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-slate-400">Model: <strong className="text-cyan-300">{aiHealth?.ai_engine?.configured_model || "gemma4:12b"}</strong></p>
              <p className="text-slate-400">URL: {aiHealth?.ai_engine?.ollama_url || "http://localhost:11434"}</p>
              <p className="text-[11px] text-slate-500">{aiHealth?.ai_engine?.message}</p>
            </div>

            {/* Database Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Database Mode</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {aiHealth?.database?.mode === "mongodb_atlas" ? "MongoDB Atlas" : "Local Persistent JSON"}
                </span>
              </div>
              <p className="text-slate-400">Database: <strong className="text-slate-200">{aiHealth?.database?.database || "campusmind"}</strong></p>
              <p className="text-[11px] text-slate-500">
                {aiHealth?.database?.mode === "mongodb_atlas"
                  ? "Connected directly to cloud MongoDB cluster."
                  : "Using zero-config local persistent storage for development & demo."}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved Successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-500">All changes persist across sessions.</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Profile & Settings"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
