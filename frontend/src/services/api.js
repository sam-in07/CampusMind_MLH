const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // System Health
  checkHealth: () => request("/health"),
  checkAiHealth: () => request("/health/ai"),

  // Academic Structure
  getFaculties: () => request("/faculties"),
  getDepartments: (faculty) => request(`/departments${faculty ? `?faculty_name=${encodeURIComponent(faculty)}` : ""}`),
  getCourses: (department, semester) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (semester) params.append("semester", semester);
    return request(`/courses?${params.toString()}`);
  },

  // AI Study Features
  summarizeLecture: (data) => request("/summarize", { method: "POST", body: JSON.stringify(data) }),
  generateQuiz: (data) => request("/generate-quiz", { method: "POST", body: JSON.stringify(data) }),
  explainTopic: (data) => request("/explain", { method: "POST", body: JSON.stringify(data) }),
  getRecommendations: () => request("/recommendations", { method: "POST" }),

  // Document & Voice Uploads
  extractDocument: (formData) => request("/documents/extract", { method: "POST", body: formData }),
  transcribeAudio: (formData) => request("/transcribe", { method: "POST", body: formData }),
  voiceExplain: (data) => request("/voice/explain", { method: "POST", body: JSON.stringify(data) }),

  // Study Materials
  saveMaterial: (data) => request("/materials", { method: "POST", body: JSON.stringify(data) }),
  listMaterials: (course, type) => {
    const params = new URLSearchParams();
    if (course) params.append("course", course);
    if (type) params.append("material_type", type);
    return request(`/materials?${params.toString()}`);
  },
  getMaterial: (id) => request(`/materials/${id}`),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: "DELETE" }),

  // Assessments & Progress
  recordAssessment: (data) => request("/assessments", { method: "POST", body: JSON.stringify(data) }),
  listAssessments: (course) => request(`/assessments${course ? `?course=${encodeURIComponent(course)}` : ""}`),
  getProgress: () => request("/progress"),
  getHistory: () => request("/history"),

  // CGPA Calculator
  getGradingScale: () => request("/cgpa/scale"),
  calculateCgpa: (data) => request("/cgpa/calculate", { method: "POST", body: JSON.stringify(data) }),
  projectCgpa: (data) => request("/cgpa/project", { method: "POST", body: JSON.stringify(data) }),

  // Profile
  getProfile: () => request("/profile"),
  updateProfile: (data) => request("/profile", { method: "PUT", body: JSON.stringify(data) }),
};
