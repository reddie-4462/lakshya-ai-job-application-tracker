import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, User, Lock, 
    AlertCircle, Loader2, Mail
} from 'lucide-react';
import { loginUser } from '../services/api';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // ── Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ── UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await loginUser({ email, password });
            const response = res.data;
            
            // ── Store all auth values in localStorage
            localStorage.setItem("userId", response.userId);
            localStorage.setItem("email", response.email);
            // Store JWT token so API calls include the Authorization header
            if (response.token) {
              localStorage.setItem("token", response.token);
            }

            // ── Inform AuthContext
            login(response.userId, response.email);

            // ── Redirect to dashboard (root protected route)
            navigate('/');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.7, ease: 'easeOut' as const, staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0 }
    };

    const inputClass = 'relative w-full bg-background border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-gray-700 outline-none focus:border-primary/50 focus:bg-background/80 transition-all shadow-inner-glass';

    return (
        <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05], rotate: [0, -45, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"
                />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-xl relative z-10"
            >
                <div className="premium-card p-10 md:p-14 space-y-10 border-white/5 bg-surface-subtle/80 backdrop-blur-2xl shadow-2xl">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-5">
                        <div className="relative w-20 h-20 rounded-[2rem] bg-ai-gradient-deep p-1">
                            <div className="w-full h-full rounded-[1.8rem] bg-background flex items-center justify-center">
                                <Sparkles size={36} className="text-white shadow-glow" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tighter text-white">LAKSHYA <span className="text-gradient">AI</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Initiate Synchronization</p>
                        </div>
                    </motion.div>

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                                <AlertCircle size={18} className="text-red-400" />
                                <p className="text-xs text-red-300 font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Secure Access Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass + ' pl-14'}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className={inputClass + ' pl-14'} 
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-ai-gradient shadow-ai-glow text-white disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (
                                <span className="flex items-center justify-center gap-2">Initiate Pulse <ArrowRight size={18} /></span>
                            )}
                        </motion.button>
                    </form>

                    <div className="text-center pt-4">
                        <Link to="/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
