import React, { useState, useEffect, useCallback } from 'react';
import {
    Briefcase,
    Users,
    CheckCircle,
    Clock,
    ArrowUpRight,
    TrendingUp,
    Calendar,
    ChevronRight,
    Sparkles,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    fetchDashboardStats,
    fetchRecentApplications,
    fetchActivityData,
    DashboardStats,
    ApplicationModel,
    ActivityPoint,
} from '../services/api';

const getDayLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return labels;
};

const statusColors: Record<string, string> = {
    APPLIED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    INTERVIEW: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    OFFER: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;
        let totalMiliseconds = 800;
        let incrementTime = (totalMiliseconds / end) > 40 ? (totalMiliseconds / end) : 40;
        let timer = setInterval(() => {
            start += Math.ceil(end / 20);
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value]);
    return <>{displayValue}</>;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentApps, setRecentApps] = useState<ApplicationModel[]>([]);
    const [activity, setActivity] = useState<ActivityPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId: string = user?.id || '';
    const dayLabels = getDayLabels();

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, recentRes, activityRes] = await Promise.all([
                fetchDashboardStats(userId),
                fetchRecentApplications(userId),
                fetchActivityData(userId),
            ]);
            setStats(statsRes.data);
            setRecentApps(recentRes.data);
            setActivity(activityRes.data);
        } catch (err: any) {
            console.error('Dashboard fetch failed:', err);
            setError(err.message || 'An unexpected error occurred while loading the dashboard.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            loadDashboard();
        }
    }, [userId, loadDashboard]);

    // ── Loading skeleton ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-10">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
                        <div className="h-10 bg-white/5 rounded-xl w-64 animate-pulse" />
                    </div>
                    <div className="h-12 bg-white/5 rounded-xl w-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-80 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
                    <div className="h-80 bg-white/5 border border-white/5 rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[500px] gap-6"
            >
                <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-2xl">
                    <AlertTriangle size={48} className="text-rose-400" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connection Error</h2>
                    <p className="text-gray-400 max-w-sm mx-auto">{error}</p>
                </div>
                <button onClick={loadDashboard} className="btn-primary flex items-center gap-2 mt-4 px-8">
                    <Loader2 size={18} /> Reconnect
                </button>
            </motion.div>
        );
    }
    const statCards = [
        {
            label: 'Total Applications',
            value: stats?.totalApplications ?? stats?.applied ?? 0,
            icon: Briefcase,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            trend: '+12% this month'
        },
        {
            label: 'Offers Received',
            value: stats?.offers ?? stats?.offer ?? 0,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            trend: 'Conversion rate'
        },
        {
            label: 'Rejections',
            value: stats?.rejections ?? stats?.rejected ?? 0,
            icon: Users,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            trend: 'Market feedback'
        },
        {
            label: 'Average Match Score',
            value: stats?.avgMatchScore ?? 78,
            icon: Sparkles,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            trend: 'AI Insights',
            isPercent: true
        },
    ];

    const activityCounts = activity.map(p => p.count);
    const maxActivity = Math.max(...activityCounts, 1);
    const today = new Date();

    return (
        <div className="space-y-10">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Workspace Overview</p>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Welcome back, <span className="text-gradient font-black">{user?.name?.split(' ')[0] ?? 'Explorer'}</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        You have <span className="text-white font-bold">{stats?.totalApplications ?? 0}</span> tracked applications and <span className="text-white font-bold">{stats?.interviews ?? 0}</span> interviews scheduled.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-400 shadow-inner-glass">
                        <Calendar size={16} className="text-primary" />
                        {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => navigate('/applications')}
                        className="btn-primary flex items-center gap-2.5 px-6 shadow-ai-glow"
                    >
                        <TrendingUp size={18} />
                        View Applications
                    </button>
                </motion.div>
            </div>

            {/* Stats Grid with Staggered Fade */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="premium-card p-6 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl rounded-full -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-50`} />

                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-white/5 shadow-inner-glass`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.trend}</div>
                        </div>

                        <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter">
                                    <AnimatedNumber value={stat.value} />
                                    {stat.isPercent && '%'}
                                </span>
                                {idx === 0 && <ArrowUpRight size={16} className="text-emerald-400" />}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Chart Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 premium-card p-8 bg-glass-gradient"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black flex items-center gap-2.5 text-white">
                                <TrendingUp size={22} className="text-primary" />
                                Application Activity
                            </h2>
                            <p className="text-xs text-gray-500 font-medium tracking-tight">Daily tracking of your job hunt progress</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency 92%</span>
                        </div>
                    </div>

                    <div className="h-56 flex items-end justify-between gap-5 px-2">
                        {activity.map((point, i) => {
                            const count = point.count;
                            const heightPct = Math.max((count / maxActivity) * 100, 6);
                            const label = new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' });
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative">
                                    <AnimatePresence>
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-elevated border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-premium pointer-events-none transition-all duration-300 scale-90 group-hover:scale-100 z-10 whitespace-nowrap">
                                            {count} APPS
                                        </div>
                                    </AnimatePresence>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPct}%` }}
                                        transition={{ delay: 0.6 + (i * 0.05), duration: 0.8, ease: "circOut" }}
                                        className={`w-full max-w-[40px] min-h-[8px] rounded-t-xl transition-all duration-300 relative overflow-hidden group-hover:shadow-ai-glow ${i === activity.length - 1
                                            ? 'bg-gradient-to-t from-primary to-indigo-400 shadow-ai-glow'
                                            : 'bg-white/20 group-hover:bg-white/30 shadow-inner-glass'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors" />
                                    </motion.div>
                                    <span className={`text-[10px] font-black tracking-widest uppercase ${i === activity.length - 1 ? 'text-white' : 'text-gray-600'
                                        }`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Status Column */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="premium-card p-8 bg-surface-subtle"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-md text-white">Recent Updates</h3>
                        <button
                            onClick={() => navigate('/applications')}
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                            <ArrowUpRight size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {recentApps.length > 0 ? (
                            <AnimatePresence>
                                {recentApps.map((app, idx) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + (idx * 0.1) }}
                                        className="flex items-center gap-4 p-4 rounded-3xl border border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                                        onClick={() => navigate('/applications')}
                                    >
                                        <div className="w-11 h-11 rounded-2xl bg-surface-elevated border border-white/5 flex items-center justify-center shrink-0 shadow-inner-glass">
                                            <Briefcase size={20} className="text-primary/70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate leading-tight mb-0.5">{app.role}</p>
                                            <p className="text-[11px] text-gray-500 truncate font-semibold">{app.company}</p>
                                        </div>
                                        <div className={`text-[9px] font-black px-2.5 py-1.5 rounded-full border shadow-sm ${statusColors[app.status] ?? 'text-gray-400 bg-card border-white/5'}`}>
                                            {app.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-10 opacity-30">
                                <Briefcase size={32} className="mx-auto mb-3" />
                                <p className="text-xs font-bold uppercase tracking-widest">Empty pipeline</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <button
                            onClick={() => navigate('/optimizer')}
                            className="w-full group relative flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all overflow-hidden"
                        >
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-ai-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                            <Sparkles size={16} className="text-primary" />
                            <span>Analyze Resume</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
