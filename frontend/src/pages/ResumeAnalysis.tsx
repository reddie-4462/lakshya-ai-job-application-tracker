import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  RefreshCcw,
  Upload,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadResume, analyzeResume, AnalysisResult } from '../services/api';
import { AISkeleton } from '../components/ai/AIComponents';
import AnalysisDashboard from '../components/AnalysisDashboard';

const ResumeAnalysis = () => {
  const { user } = useAuth();
  const userId: string = user?.id || '';

  // ── Form state ─────────────────────────────────────────────────────────────
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [inputsOpen, setInputsOpen] = useState(true);

  // ── Operation state ────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = await uploadResume(file, userId);
      setResumeText(res.data.rawText ?? '');
    } catch (err: any) {
      setUploadError(
        err?.response?.data?.message ?? 'Upload failed. Ensure the file is a valid PDF or DOCX.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Analyze handler ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setAnalyzeError('Provide both resume text and a job description first.');
      return;
    }
    setAnalyzeError(null);
    setAnalyzing(true);
    setResult(null);
    setInputsOpen(false);

    try {
      console.log("Initiating AI Analysis matrix...");
      const res = await analyzeResume(resumeText, jobDescription, {
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        userId,
      });

      if (!res.data || Object.keys(res.data).length === 0) {
        throw new Error("Empty response received from analysis engine.");
      }

      setResult(res.data);
      // Auto-scroll to results after a short delay for smooth transition
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 500);
    } catch (err: any) {
      console.error("AI Analysis System Failure:", err);
      const errorMessage = err?.response?.data?.message || err?.message || 'AI analysis failed. Ensure the AI service is operational.';
      setAnalyzeError(errorMessage);
      setInputsOpen(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnalyzeError(null);
    setUploadError(null);
    setInputsOpen(true);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-10 pb-20"
    >

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 text-primary font-black tracking-[0.2em] uppercase text-[10px]"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles size={14} className="animate-pulse shadow-glow" />
            </div>
            Gemma AI Integration • V1.4
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Resume <span className="text-gradient">Optimizer</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm max-w-xl leading-relaxed">
            Harnessing state-of-the-art LLMs to dissect requirements and refine your professional narrative.
            Upload, analyze, and transcend the ATS barrier.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <AnimatePresence>
            {result && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleReset}
                className="btn-secondary px-6 flex items-center gap-3 text-xs font-black uppercase tracking-widest"
              >
                <RefreshCcw size={16} /> Reset
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={analyzing || uploading}
            className="btn-primary px-8 flex items-center gap-3 disabled:opacity-50 shadow-ai-glow text-xs font-black uppercase tracking-[0.15em]"
          >
            {analyzing
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing Intelligence…</>
              : <><Sparkles size={16} /> Run Analysis Matrix</>}
          </motion.button>
        </div>
      </div>

      {/* ── Input section ──────────────── */}
      <motion.div
        layout
        className="premium-card overflow-hidden bg-surface-subtle border-white/5"
      >
        {/* Collapse toggle header */}
        <button
          onClick={() => setInputsOpen(o => !o)}
          className="w-full flex items-center justify-between px-8 py-6 hover:bg-white/[0.02] transition-all"
        >
          <span className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white">
            <div className={`p-2 rounded-xl border transition-all ${resumeText ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-primary'}`}>
              <FileText size={18} />
            </div>
            Configure Analysis Payload
            {resumeText && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black ml-4 shadow-glow"
              >
                Data Loaded
              </motion.span>
            )}
          </span>
          {inputsOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>

        <AnimatePresence>
          {inputsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 pb-10 space-y-8 border-t border-white/5 pt-8"
            >
              {/* Upload Area */}
              <div className="flex flex-wrap items-center gap-5">
                <label className="group relative flex items-center gap-3 px-8 py-3.5 bg-background border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] hover:border-primary/40 hover:bg-white/[0.02] cursor-pointer transition-all shadow-inner-glass overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {uploading
                    ? <><Loader2 size={16} className="animate-spin text-primary" /> Deconstructing File…</>
                    : <><Upload size={16} className="text-primary" /> Inject PDF / DOCX SOURCE</>}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    disabled={uploading}
                  />
                </label>
                {uploadError && (
                  <p className="flex items-center gap-3 text-[11px] text-rose-400 font-black uppercase tracking-widest pl-2">
                    <AlertCircle size={16} /> Systems Error: {uploadError}
                  </p>
                )}
              </div>

              {/* Advanced Textareas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1">
                    Resume Context
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-white/5 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <textarea
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Input resume string or use extraction engine above…"
                      className="relative w-full h-64 bg-background border border-white/10 rounded-2xl p-6 text-sm text-gray-300 font-medium placeholder:text-gray-700 focus:border-primary/40 focus:bg-background/80 outline-none resize-none transition-all shadow-inner-glass"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1">
                    Target Job Description
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-white/5 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <textarea
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      placeholder="Paste target job specification details here…"
                      className="relative w-full h-64 bg-background border border-white/10 rounded-2xl p-6 text-sm text-gray-300 font-medium placeholder:text-gray-700 focus:border-primary/40 focus:bg-background/80 outline-none resize-none transition-all shadow-inner-glass"
                    />
                  </div>
                </div>
              </div>

              {/* Tracking metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1 flex items-center justify-between">
                    <span className="flex items-center gap-2 tracking-[0.2em]"><Building2 size={14} className="text-primary" /> Target Entity</span>
                    <span className="text-[9px] text-gray-600 tracking-normal">(Persistence Enabled)</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Corporate Identifier (e.g. OpenAI)"
                    className="w-full bg-background border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white outline-none focus:border-primary/40 focus:bg-background/80 transition-all shadow-inner-glass"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1 flex items-center gap-2">
                    <Briefcase size={14} className="text-primary" /> Targeted Designation
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="Position Title (e.g. Lead OS Developer)"
                    className="w-full bg-background border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white outline-none focus:border-primary/40 focus:bg-background/80 transition-all shadow-inner-glass"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Persistent Error Display (Visible even if inputs are collapsed) */}
      <AnimatePresence>
        {analyzeError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl"
          >
            <div className="p-3 rounded-2xl bg-rose-500/20">
              <AlertCircle size={24} className="text-rose-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-rose-500/60 font-black uppercase tracking-[0.2em]">System Fault Detected</p>
              <p className="text-xs text-rose-400 font-black uppercase tracking-widest leading-relaxed">{analyzeError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Results Interface ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="ai-panel p-16"
          >
            <AISkeleton />
          </motion.div>
        )}

        {result && !analyzing && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <AnalysisDashboard result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeAnalysis;
