import axios, { AxiosError } from 'axios';
import { API_BASE } from '../config/api';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const BASE_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000, // 120 s — OpenAI API response time
});

// Attach JWT if present
// Request logger and JWT attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Diagnostic Logging
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Redirect to /login on 401 and handle global errors
// Response logger and error handler
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const data = error.response?.data;

    console.error(`🚨 [API Error] ${status || 'Network Error'} ${url}`, {
      message: error.message,
      data: data
    });

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    // Enhance error message for the UI
    if (!error.response) {
      error.message = `Connection Failed: ${error.message}. Ensure backend is running at ${API_BASE}`;
    } else if (data && typeof data === 'object' && (data as any).message) {
      error.message = (data as any).message;
    }

    return Promise.reject(error);
  }
);

// ─── Typed API helpers ──────────────────────────────────────────────────────────

// Auth
export interface AuthPayload {
  userId: string;
  name: string;
  email: string;
  message: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const loginUser = (data: LoginRequest) =>
  api.post<AuthPayload>(`/auth/login`, data);

export const registerUser = (data: RegisterRequest) =>
  api.post<AuthPayload>(`/auth/register`, data);

export interface DashboardStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  avgMatchScore: number;
  // Legacy fields (optional)
  applied?: number;
  interview?: number;
  offer?: number;
  rejected?: number;
}

export interface ApplicationModel {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobDescription?: string;
  extractedSkills?: string[];
  matchScore?: number;
  missingSkills?: string[];
  status: 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  createdAt: string;
}

export interface AnalysisResult {
  match_score?: number;
  ats_compatibility?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  strengths?: string[];
  improvements?: string[];
  recommended_roles?: string[];
  interview_probability?: string;
  summary?: string;
  // Legacy fields (optional)
  matchScore?: number;
  atsScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  skillGapAnalysis?: string;
  improvementSuggestions?: string;
  interviewProbability?: string;
  strongestSkillDomains?: string[];
  recommendedJobRoles?: string[];
  missingTechnologies?: string[];
  careerGrowthSuggestions?: string[];
  to_add?: string[];
  to_remove?: string[];
  candidate_level?: string;
}

export interface ResumeModel {
  id: string;
  userId: string;
  rawText: string;
  parsedSkills: string[];
  uploadDate: string;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

// Dashboard
export const fetchDashboardStats = (userId: string = localStorage.getItem('userId') || '') =>
  api.get<DashboardStats>(`/dashboard/stats`, { params: { userId } });

export const fetchRecentApplications = (userId: string = localStorage.getItem('userId') || '') =>
  api.get<ApplicationModel[]>(`/dashboard/recent`, { params: { userId } });

export const fetchActivityData = (userId: string = localStorage.getItem('userId') || '') =>
  api.get<ActivityPoint[]>(`/dashboard/activity`, { params: { userId } });

// Applications
export const fetchApplications = (userId: string = localStorage.getItem('userId') || '') =>
  api.get<ApplicationModel[]>(`/applications`, { params: { userId } });

export const fetchResumes = (userId: string = localStorage.getItem('userId') || '') =>
  api.get<ResumeModel[]>(`/resumes`, { params: { userId } });

export const createApplication = (payload: Partial<ApplicationModel>) => {
  const userId = localStorage.getItem('userId') || '';
  return api.post<ApplicationModel>(`/applications`, { ...payload, userId });
};

export const updateApplicationStatus = (id: string, status: string) =>
  api.patch<ApplicationModel>(`/applications/${id}/status`, { status });

export const deleteApplication = (id: string) =>
  api.delete(`/applications/${id}`);

export const deleteResume = (id: string) =>
  api.delete(`/resumes/${id}`);

// Resume upload (stores in MongoDB)
export const uploadResume = (file: File, userId: string = localStorage.getItem('userId') || '') => {
  const form = new FormData();
  form.append('file', file);
  return api.post<ResumeModel>(`/resumes/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { userId },
  });
};

// AI analysis
export const matchResume = (resumeText: string, jobDescription: string) => {
  const userId = localStorage.getItem('userId') || '';
  return api.post<AnalysisResult>(`/ai/match`, { resumeText, jobDescription, userId });
};

export const optimizeResume = (resumeText: string) => {
  const userId = localStorage.getItem('userId') || '';
  return api.post<AnalysisResult>(`/ai/optimize`, { resumeText, userId });
};

export const analyzeResume = (
  resumeText: string,
  jobDescription: string,
  extras?: { company?: string; role?: string; userId?: string }
) => {
  const userId = extras?.userId || localStorage.getItem('userId') || '';
  return api.post<AnalysisResult>(`/ai/analyze`, {
    resumeText,
    jobDescription,
    ...extras,
    userId,
  });
};

// Global AI Chat Assistant
export const aiChat = (prompt: string) =>
  api.post<{ response: string }>(`/ai/chat`, { prompt });

export const deleteAppApi = (id: string) =>
  api.delete(`/applications/${id}`);

export default api;
