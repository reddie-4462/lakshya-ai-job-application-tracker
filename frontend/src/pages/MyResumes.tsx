import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Loader2,
    Upload,
    Trash2,
    Eye,
    AlertTriangle,
    CheckCircle2,
    RefreshCcw,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadResume, fetchResumes, deleteResume, ResumeModel } from '../services/api';

const MyResumes = () => {
    const { user } = useAuth();
    const userId: string = user?.id || '';

    const [resumes, setResumes] = useState<ResumeModel[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [viewResume, setViewResume] = useState<ResumeModel | null>(null);

    const loadResumes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchResumes(userId);
            setResumes(res.data);
        } catch (err: any) {
            if (err?.response?.status !== 404) {
                setError('Could not load saved resumes.');
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadResumes(); }, [loadResumes]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadSuccess(null);
        setError(null);
        setUploading(true);
        try {
            const res = await uploadResume(file, userId);
            setResumes(prev => [res.data, ...prev]);
            setUploadSuccess(`"${file.name}" uploaded successfully!`);
            setTimeout(() => setUploadSuccess(null), 4000);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Upload failed.');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteResume(id);
            setResumes(prev => prev.filter(r => r.id !== id));
            setUploadSuccess('Resume deleted successfully.');
            setTimeout(() => setUploadSuccess(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to delete resume.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <FileText size={14} className="shadow-glow" />
                        </div>
                        Knowledge Base • Repository v2.0
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        Digital <span className="text-gradient">Assets</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm max-w-xl leading-relaxed">
                        Manage your professional documents and extracted skill profiles.
                        Your repository for AI-enhanced application strategy.
                    </p>
                </div>
                <button
                    onClick={loadResumes}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-all pr-2"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Sync Store
                </button>
            </div>

            {/* Feedback messages */}
            <AnimatePresence>
                {uploadSuccess && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-4 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-widest shadow-glow mb-6"
                    >
                        <CheckCircle2 size={18} /> {uploadSuccess}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-4 px-6 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest shadow-glow mb-6"
                    >
                        <AlertTriangle size={18} /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {/* Upload card */}
                <motion.label
                    variants={itemVariants}
                    className="group relative h-72 rounded-3xl overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center"
                >
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx"
                        disabled={uploading}
                    />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {uploading ? (
                        <div className="relative flex flex-col items-center gap-4 text-primary">
                            <Loader2 size={40} className="animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Analyzing Payload…</span>
                        </div>
                    ) : (
                        <div className="relative flex flex-col items-center gap-5">
                            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                                <Upload size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Import Source</h3>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 px-4 leading-relaxed line-clamp-2">
                                    PDF, DOCX formats supported • V2 Extraction
                                </p>
                            </div>
                        </div>
                    )}
                </motion.label>

                {/* Resume cards */}
                {loading ? (
                    [...Array(2)].map((_, i) => (
                        <div key={i} className="premium-card h-72 animate-pulse bg-white/[0.01] border-white/5" />
                    ))
                ) : (
                    resumes.map((resume) => (
                        <motion.div
                            key={resume.id}
                            variants={itemVariants}
                            layout
                            className="premium-card p-8 h-72 flex flex-col justify-between group overflow-hidden border-white/5"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-primary group-hover:scale-105 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-inner-glass">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Created</p>
                                        <p className="text-[11px] font-black text-white uppercase tracking-tighter">
                                            {new Date(resume.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                                        Resume Node
                                        <span className="ml-2 text-gray-700">/{resume.id.slice(-4).toUpperCase()}</span>
                                    </h3>
                                    {resume.parsedSkills?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest">
                                                {resume.parsedSkills.length} SKILLS INDEXED
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => setViewResume(resume)}
                                    className="btn-secondary flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <Eye size={14} /> Inspect
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this resume permanently?')) {
                                            handleDelete(resume.id);
                                        }
                                    }}
                                    className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-xl transition-all"
                                    title="Delete resume"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Decorative Background Element */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* View Modal */}
            <AnimatePresence>
                {viewResume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        onClick={() => setViewResume(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="premium-card w-full max-w-3xl max-h-[85vh] flex flex-col bg-surface-subtle border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-8 border-b border-white/5">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Node Inspection</div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Extracted Intelligence</h2>
                                </div>
                                <button
                                    onClick={() => setViewResume(null)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
                                {viewResume.parsedSkills?.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Detected Skill Vectors</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewResume.parsedSkills.map(s => (
                                                <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Raw Data Stream</h4>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-background/50 rounded-2xl blur-sm" />
                                        <pre className="relative p-6 bg-background/80 border border-white/5 rounded-2xl text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed font-mono shadow-inner-glass border-l-2 border-l-primary/30">
                                            {viewResume.rawText}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyResumes;
