import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import StudyWorkspacePage from "./pages/StudyWorkspacePage";
import MaterialsPage from "./pages/MaterialsPage";
import AcademicProgressPage from "./pages/AcademicProgressPage";
import CgpaCalculatorPage from "./pages/CgpaCalculatorPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import { api } from "./services/api";

export default function App() {
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        setStudentProfile(res);
      } catch (err) {
        console.warn("Could not load initial profile from backend:", err);
      }
    }
    loadProfile();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar studentProfile={studentProfile} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage studentProfile={studentProfile} />} />
            <Route path="/workspace" element={<StudyWorkspacePage studentProfile={studentProfile} />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/progress" element={<AcademicProgressPage studentProfile={studentProfile} />} />
            <Route path="/cgpa" element={<CgpaCalculatorPage />} />
            <Route 
              path="/profile" 
              element={
                <ProfileSettingsPage 
                  studentProfile={studentProfile} 
                  onProfileUpdate={(updated) => setStudentProfile(updated)} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
