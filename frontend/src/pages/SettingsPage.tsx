import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertTriangle,
    Loader2,
    User,
    Mail,
    Shield,
    LogOut,
    Save,
    Settings,
    Cpu
} from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
    const { user, logout, login } = useAuth();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            try {
                await api.patch('/user/profile', { name, email });
            } catch (e: any) {
                if (e?.response?.status !== 404) throw e;
            }
            login(user?.id || "", email, localStorage.getItem('token') || "");
            setSuccess('Profile configuration persistent.');
            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 pb-20 max-w-4xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <Settings size={14} className="shadow-glow" />
                        </div>
                        System Preferences • Core v1.4
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        User <span className="text-gradient">Control</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm max-w-xl leading-relaxed">
                        Configure your professional identity and system interactions.
                        Adjust your profile to optimize AI-driven resume synchronization.
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-4 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-widest shadow-glow"
                    >
                        <CheckCircle2 size={18} /> {success}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-4 px-6 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest shadow-glow"
                    >
                        <AlertTriangle size={18} /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <div className="premium-card p-10 flex flex-col items-center text-center gap-6 border-white/5">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-ai-gradient rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-28 h-28 rounded-[2rem] bg-ai-gradient-deep p-1">
                                <div className="w-full h-full rounded-[1.8rem] bg-background flex items-center justify-center text-white text-4xl font-black select-none shadow-premium">
                                    {name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-background border border-white/10 rounded-xl shadow-glow">
                                <Cpu size={14} className="text-primary" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white uppercase tracking-tight">{name || 'Node Profile'}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">{email || 'unidentified@entity.io'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-inner-glass"
                    >
                        <LogOut size={16} /> Terminate Session
                    </button>
                </div>

                <div className="lg:col-span-2">
                    <div className="premium-card p-10 space-y-10 border-white/5">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 flex items-center gap-3 pl-1">
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10"><User size={12} className="text-primary" /></div>
                                    Identity Handle
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-white/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="relative w-full bg-background border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 focus:bg-background/80 transition-all font-medium text-white shadow-inner-glass"
                                        placeholder="Enter your full identifier"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 flex items-center gap-3 pl-1">
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10"><Mail size={12} className="text-primary" /></div>
                                    Communication Endpoint
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-white/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="relative w-full bg-background border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 focus:bg-background/80 transition-all font-medium text-white shadow-inner-glass"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl">
                                <Shield size={18} className="text-primary shrink-0" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Persistence Protocol</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    Session encryption is handled locally. Multi-node cloud authentication is currently in private beta for early access users.
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-3 disabled:opacity-60 shadow-ai-glow text-xs font-black uppercase tracking-widest"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Compiling Changes…' : 'Sync Profile Node'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
