import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Cpu, 
  Database, 
  BookOpen, 
  BrainCircuit, 
  BarChart3, 
  Calculator, 
  FolderKanban, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { api } from "../services/api";

export default function Navbar({ studentProfile }) {
  const location = useLocation();
  const [aiStatus, setAiStatus] = useState({ online: false, model: "gemma4:12b", checking: true });
  const [dbStatus, setDbStatus] = useState({ mode: "local", connected: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.checkAiHealth();
        setAiStatus({
          online: res.ai_engine?.status === "online" && res.ai_engine?.model_installed,
          model: res.ai_engine?.configured_model || "gemma4:12b",
          checking: false
        });
        setDbStatus({
          mode: res.database?.mode === "mongodb_atlas" ? "Atlas DB" : "Local DB",
          connected: res.database?.connected
        });
      } catch {
        setAiStatus({ online: false, model: "gemma4:12b", checking: false });
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/workspace", label: "AI Study Workspace", icon: BrainCircuit, badge: "AI" },
    { to: "/materials", label: "My Materials", icon: FolderKanban },
    { to: "/progress", label: "Academic Progress", icon: BookOpen },
    { to: "/cgpa", label: "CGPA Calculator", icon: Calculator },
    { to: "/profile", label: "Profile & Settings", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CampusMind
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IIUC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Your Department. Your Studies. Your AI.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="hidden md:flex items-center gap-3">
            {/* Ollama Status Pill */}
            <div 
              title={aiStatus.online ? `Ollama Active (${aiStatus.model})` : "Ollama connection issue"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                aiStatus.online
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span>{aiStatus.online ? "Gemma 4 12B" : "AI Offline"}</span>
            </div>

            {/* DB Status Pill */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
              title="Database Persistence"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{dbStatus.mode}</span>
            </div>

            {/* Profile Avatar & Dept Pill */}
            {studentProfile && (
              <Link 
                to="/profile"
                className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {studentProfile.name ? studentProfile.name.charAt(0) : "S"}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{studentProfile.department?.split(" ")[0] || "CSE"}</p>
                  <p className="text-[10px] text-slate-400">{studentProfile.semester || "5th Sem"}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              {aiStatus.online ? "Ollama Active" : "Ollama Offline"}
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              {dbStatus.mode}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
