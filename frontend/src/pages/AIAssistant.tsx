import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, MessageSquare, Trash2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChat } from '../services/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const TypingAnimation = () => (
    <div className="flex gap-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
        />
        <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-1.5 h-1.5 bg-primary/60 rounded-full"
        />
        <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-1.5 h-1.5 bg-primary/30 rounded-full"
        />
    </div>
);

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your Lakshya AI assistant. How can I help you with your career journey today? You can ask me about resume improvements, skill gaps, or interview tips.",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (e?: React.FormEvent, explicitMsg?: string) => {
        if (e) e.preventDefault();
        const userMessage = (explicitMsg || input).trim();
        if (!userMessage || loading) return;

        if (!explicitMsg) setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await aiChat(userMessage);
            setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to the AI service. Please check your OpenAI API configuration." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessageContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            let formatted = line.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part
            );

            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                    <div key={i} className="flex gap-3 ml-2 my-2">
                        <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40 shadow-glow" />
                        <span className="text-gray-300 font-medium">{formatted}</span>
                    </div>
                );
            }

            if (line.trim().startsWith('`') && line.trim().endsWith('`')) {
                return (
                    <code key={i} className="block bg-black/40 border border-white/5 px-4 py-3 rounded-xl font-mono text-[11px] my-3 text-primary/90 shadow-inner-glass">
                        {line.replace(/`/g, '')}
                    </code>
                );
            }

            return <p key={i} className={`${line.trim() === '' ? 'h-4' : 'mb-3'} text-gray-300 font-medium leading-relaxed`}>{formatted}</p>;
        });
    };

    const clearChat = () => {
        if (window.confirm('Clear chat history?')) {
            setMessages([
                {
                    role: 'assistant',
                    content: "Chat cleared. How can I help you now?",
                },
            ]);
        }
    };

    const suggestions = [
        "How can I improve my resume?",
        "What skills are missing for this job?",
        "How can I increase my match score?",
    ];

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <Brain size={14} className="shadow-glow" />
                        </div>
                        AI Cognitive Core
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">
                        Ask <span className="text-gradient">Lakshya AI</span>
                    </h1>
                </div>
                <button
                    onClick={clearChat}
                    className="p-3 text-gray-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 rounded-2xl transition-all"
                    title="Clear Chat"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner-glass
                                    ${msg.role === 'user' 
                                        ? 'bg-primary/10 border-primary/20 text-primary' 
                                        : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                                </div>
                                <div className={`p-5 rounded-3xl text-sm shadow-premium border
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-primary/20 to-indigo-500/10 border-primary/20 text-white'
                                        : 'bg-white/[0.03] border-white/5 text-gray-200'}`}>
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start pl-14"
                        >
                            <TypingAnimation />
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
                <div className="flex flex-wrap gap-3 justify-center mb-4">
                    {suggestions.map((s, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleSend(undefined, s)}
                            className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                        >
                            {s}
                        </motion.button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSend} className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-30 transition-opacity" />
                <div className="relative flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-[2.5rem] focus-within:border-primary/50 transition-all shadow-inner-glass">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your career, resume, or interview prep..."
                        className="flex-1 bg-transparent px-6 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-4 bg-primary hover:bg-indigo-500 text-white rounded-full transition-all disabled:opacity-50 disabled:grayscale shadow-ai-glow"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIAssistant;
