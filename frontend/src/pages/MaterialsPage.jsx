import React, { useState, useEffect } from "react";
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Eye, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  AlertCircle 
} from "lucide-react";
import { api } from "../services/api";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.listMaterials();
      setMaterials(res.materials || []);
    } catch (err) {
      setErrorMsg(`Failed to load materials: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this study material?")) return;

    try {
      await api.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (selectedMaterial?.id === id) setSelectedMaterial(null);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const copyContent = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesType = filterType === "all" || m.type === filterType;
    const matchesSearch =
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.course && m.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.content && m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            My Saved Study Materials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your lecture summaries, revision sheets, and practice quizzes anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            Total Saved: <strong className="text-cyan-400">{materials.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-800">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "All Items" },
            { id: "summary", label: "Summaries" },
            { id: "notes", label: "Notes" },
            { id: "quiz", label: "Quizzes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, course, or topic..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => setSelectedMaterial(mat)}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-cyan-400 border border-indigo-500/20">
                    {mat.type}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {mat.created_at ? new Date(mat.created_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {mat.course || "General Coursework"}
                </p>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {mat.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMaterial(mat);
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Read Full
                </button>

                <button
                  onClick={(e) => handleDelete(mat.id, e)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete material"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-white">No Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No study items matched your search query."
              : "You haven't saved any materials yet. Generate a summary in the Study Workspace to save it here!"}
          </p>
        </div>
      )}

      {/* Read Material Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-3xl w-full max-h-[85vh] rounded-2xl p-6 border border-slate-700 bg-slate-950 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-cyan-400">
                  {selectedMaterial.type}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedMaterial.title}</h2>
                <p className="text-xs text-slate-400">{selectedMaterial.course}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyContent(selectedMaterial.content)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                  title="Copy text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {selectedMaterial.content}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
