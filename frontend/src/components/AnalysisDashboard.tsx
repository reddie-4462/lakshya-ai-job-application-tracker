import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Brain,
    Zap,
    Target,
    TrendingUp,
    Layers,
    FileSearch,
    Star,
    BookOpen,
    UserCheck,
    Hash,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchScoreRing from './MatchScoreRing';
import { AIStreamer } from './ai/AIComponents';
import { AnalysisResult } from '../services/api';
import CareerInsights from './CareerInsights';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const probabilityMeta = (p?: string) => {
    const lc = (p ?? '').toLowerCase();
    if (lc === 'high') return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 85 };
    if (lc === 'medium') return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 50 };
    return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', bar: 20 };
};

const splitPoints = (text?: string): string[] => {
    if (!text) return [];
    const lines = text
        .split(/\n|\.(?=\s+[A-Z])|;\s/)
        .map(l => l.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(l => l.length > 12);
    return lines.length >= 2 ? lines : [text];
};

const deriveSubScores = (result: AnalysisResult) => {
    const score = result.match_score ?? result.matchScore ?? 0;
    const ats = result.ats_compatibility ?? result.atsScore ?? 0;
    const matching = result.matched_skills ?? result.matchingSkills ?? [];
    const missing = result.missing_skills ?? result.missingSkills ?? [];

    return {
        keywordMatch: Math.min(Math.round(score * 0.95 + Math.random() * 5), 100),
        skillCoverage: Math.round(
            matching.length /
            Math.max(matching.length + missing.length, 1) * 100
        ),
        atsScore: Math.round(ats),
        resumeScore: Math.round(score),
    };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnimatedBar: React.FC<{ value: number; color: string; delay?: number }> = ({
    value, color, delay = 0,
}) => {
    return (
        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden shadow-inner-glass border border-white/5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, delay: delay / 1000, ease: "circOut" }}
                className={`h-full rounded-full ${color} shadow-glow relative overflow-hidden`}
            >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
        </div>
    );
};

interface SubScoreRowProps {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
    barColor: string;
    delay?: number;
}
const SubScoreRow: React.FC<SubScoreRowProps> = ({ icon: Icon, label, value, color, barColor, delay }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                <Icon size={16} className={color} />
                {label}
            </span>
            <span className={`text-sm font-black ${color} tracking-tight`}>{value}%</span>
        </div>
        <AnimatedBar value={value} color={barColor} delay={delay} />
    </div>
);

interface SkillCellProps { skill: string; matched: boolean }
const SkillCell: React.FC<SkillCellProps> = ({ skill, matched }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        className={`relative group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm
      ${matched
                ? 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/50'
                : 'bg-rose-500/8 border-rose-500/25 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/50'
            }`}
    >
        {matched
            ? <CheckCircle2 size={13} className="shrink-0" />
            : <XCircle size={13} className="shrink-0" />}
        <span className="truncate">{skill}</span>
        {/* Pro Tooltip */}
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap
      opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none shadow-premium scale-90 group-hover:scale-100
      ${matched ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {matched ? 'Verified' : 'Action Required'}
        </div>
    </motion.div>
);

interface SuggestionCardProps {
    icon: React.ElementType;
    category: string;
    color: string;
    bg: string;
    border: string;
    points: string[];
    delay?: number;
}
const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon: Icon, category, color, bg, border, points, delay = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    if (!points.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay / 1000 }}
            className={`premium-card ${bg} border ${border} rounded-3xl overflow-hidden`}
        >
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
            >
                <span className={`flex items-center gap-3 font-black text-xs uppercase tracking-[0.15em] ${color}`}>
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/5`}>
                        <Icon size={18} />
                    </div>
                    {category}
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${bg} border ${border} ml-2`}>
                        {points.length}
                    </span>
                </span>
                {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 space-y-4 border-t border-white/5 pt-5"
                    >
                        {points.map((pt, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                                <span className={`${color} font-black text-[10px] mt-1 shrink-0 w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center uppercase tracking-tighter`}>{i + 1}</span>
                                <p className="text-xs text-gray-300 leading-relaxed font-medium">{pt}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface AnalysisDashboardProps {
    result: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
    if (!result) {
        console.error("AnalysisDashboard: No result provided");
        return (
            <div className="ai-panel p-16 text-center space-y-4">
                <AlertCircle size={48} className="text-rose-400 mx-auto opacity-50" />
                <p className="text-gray-400 font-black uppercase tracking-widest italic">No AI analysis available yet.</p>
            </div>
        );
    }

    const subScores = deriveSubScores(result);
    const interviewProbability = result.interview_probability || result.interviewProbability || 'Medium';
    const probMeta = probabilityMeta(interviewProbability);

    const matchingSkills = result.matched_skills ?? result.matchingSkills ?? [];
    const missingSkills = result.missing_skills ?? result.missingSkills ?? [];
    const strengths = result.strengths ?? [];
    const itemsToAdd = result.to_add ?? [];
    const itemsToRemove = result.to_remove ?? [];

    const allSkills = [
        ...matchingSkills.map((s: string) => ({ skill: s, matched: true })),
        ...missingSkills.map((s: string) => ({ skill: s, matched: false })),
    ];

    const rawSuggestions = result.summary || result.improvements?.join('\n') || result.improvementSuggestions || '';
    const rawGap = result.skillGapAnalysis || '';
    const allPoints = splitPoints(rawSuggestions);

    const bucket = (keywords: string[]) =>
        allPoints.filter(p => keywords.some(kw => p.toLowerCase().includes(kw)));

    const skillPoints = bucket(['skill', 'learn', 'certif', 'tool', 'language', 'framework', 'technolog']);
    const experiencePoints = bucket(['experience', 'project', 'role', 'position', 'achiev', 'impact', 'metric', 'result']);
    const structurePoints = bucket(['format', 'section', 'layout', 'bullet', 'summar', 'header', 'structur', 'length', 'clear']);
    const keywordPoints = bucket(['keyword', 'ats', 'phrase', 'term', 'word', 'match', 'tailor', 'descri']);

    const bucketed = new Set([...skillPoints, ...experiencePoints, ...structurePoints, ...keywordPoints]);
    const generalPoints = allPoints.filter(p => !bucketed.has(p));
    const gapPoints = splitPoints(rawGap);

    return (
        <div className="space-y-10">
            {/* Top Analysis Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Score Ring */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="premium-card p-10 flex flex-col items-center justify-center bg-glass-gradient"
                >
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-2">
                            <Target size={14} /> AI Analysis Engine
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Match Precision</h2>
                    </div>
                    <MatchScoreRing score={result.match_score ?? result.matchScore ?? 0} />
                    <div className="mt-8 flex gap-4 w-full">
                        <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-bold text-emerald-400">OPTIMIZED</p>
                        </div>
                        <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Level</p>
                            <p className="text-xs font-bold text-primary uppercase">{result.candidate_level || 'MID'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Skill Gap Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 premium-card p-10 space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                <Brain size={24} className="text-primary" />
                                Skill Gap Analysis
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">Detailed breakdown of your technical compatibility</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Zap size={20} className="shadow-glow" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <SubScoreRow
                            icon={Layers}
                            label="Keyword Precision"
                            value={subScores.keywordMatch}
                            color="text-indigo-400"
                            barColor="bg-indigo-500"
                            delay={100}
                        />
                        <SubScoreRow
                            icon={Target}
                            label="Skill Coverage"
                            value={subScores.skillCoverage}
                            color="text-emerald-400"
                            barColor="bg-emerald-500"
                            delay={200}
                        />
                        <SubScoreRow
                            icon={FileSearch}
                            label="ATS Score"
                            value={subScores.atsScore}
                            color="text-amber-400"
                            barColor="bg-amber-500"
                            delay={300}
                        />
                        <SubScoreRow
                            icon={TrendingUp}
                            label="Resume Score"
                            value={subScores.resumeScore}
                            color="text-rose-400"
                            barColor="bg-rose-500"
                            delay={400}
                        />
                    </div>
                    
                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">
                            Engine version: <span className="text-primary">Gemma-V3</span> • Analysis refreshed locally.
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Probability Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className={`ai-panel p-8 flex flex-col justify-between border-2 bg-gradient-to-br from-surface-subtle to-background ${probMeta.border}`}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">
                                Predictive Insights
                            </h3>
                            <TrendingUp size={16} className={probMeta.color} />
                        </div>

                        <div className="space-y-1">
                            <p className={`text-6xl font-black tracking-tighter ${probMeta.color}`}>
                                {interviewProbability}
                            </p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/50">Engagement Probability</p>
                        </div>

                        <p className="text-xs text-gray-500 font-medium leading-relaxed pt-2">
                            Real-time modeling suggests a <span className="text-white">{interviewProbability}</span> likelihood of recruiter interest for this role.
                        </p>
                    </div>

                    {/* Pro Probability bar */}
                    <div className="space-y-3 mt-8">
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner-glass border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probMeta.bar}%` }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 1 }}
                                className={`h-full rounded-full ${probMeta.bar > 70 ? 'bg-emerald-500' : probMeta.bar > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">
                            <span>Unlikely</span><span>Neutral</span><span>Optimal</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                            <p className={`text-2xl font-black ${probMeta.color}`}>{matchingSkills.length}</p>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Matched</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-rose-500">{missingSkills.length}</p>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Gaps</p>
                        </div>
                    </div>
                </motion.div>

                {/* Heatmap Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black flex items-center gap-3 text-white">
                                <Brain size={24} className="text-blue-400" />
                                Skill Synergy Matrix
                            </h3>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Interactive Skills Breakdown</p>
                        </div>
                        <div className="flex items-center gap-6 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
                            <span className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow" /> Present
                            </span>
                            <span className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow" /> Missing
                            </span>
                        </div>
                    </div>

                    <div className="premium-card p-10 bg-glass-gradient ring-1 ring-white/10">
                        {!allSkills?.length ? (
                            <p className="text-xs text-gray-600 text-center py-8 italic uppercase tracking-widest">
                                No data captured.
                            </p>
                        ) : (
                            <motion.div
                                className="flex flex-wrap gap-3.5"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
                                }}
                            >
                                {allSkills.map((s, i) => (
                                    <motion.div key={i} variants={{ hidden: { scale: 0.8, opacity: 0 }, show: { scale: 1, opacity: 1 } }}>
                                        <SkillCell skill={s.skill} matched={s.matched} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {gapPoints?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="ai-panel p-6 space-y-4 bg-primary/5"
                        >
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2.5">
                                <Sparkles size={14} /> AI Contextual Synthesis
                            </p>
                            <div className="text-xs text-gray-300 leading-bold">
                                <AIStreamer text={gapPoints.join('. ')} speed={8} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* AI Recommendations Row */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-black flex items-center gap-3 text-white">
                        <Zap size={24} className="text-primary" />
                        Optimization Roadmap
                    </h3>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Strategic AI-driven improvements</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SuggestionCard
                        icon={Sparkles}
                        category="Recommended to Add"
                        color="text-emerald-400"
                        bg="bg-emerald-500/5"
                        border="border-emerald-500/20"
                        delay={600}
                        points={itemsToAdd.length ? itemsToAdd : [`No extra sections identified to add currently.`]}
                    />
                    <SuggestionCard
                        icon={XCircle}
                        category="Recommended to Remove"
                        color="text-rose-400"
                        bg="bg-rose-500/5"
                        border="border-rose-500/20"
                        delay={700}
                        points={itemsToRemove.length ? itemsToRemove : [`No redundant information identified to remove.`]}
                    />
                    <SuggestionCard
                        icon={Star}
                        category="Hard & Soft Skills"
                        color="text-purple-400"
                        bg="bg-purple-500/5"
                        border="border-purple-500/20"
                        delay={800}
                        points={skillPoints.length ? skillPoints : (missingSkills.length ? [`Critical priority: Acquire ${missingSkills.join(', ')}.`] : [])}
                    />
                    <SuggestionCard
                        icon={UserCheck}
                        category="Impact & Experience"
                        color="text-amber-400"
                        bg="bg-amber-500/5"
                        border="border-amber-500/20"
                        delay={900}
                        points={experiencePoints}
                    />
                </div>
            </section>

            {/* Career Intelligence Dashboard Section */}
            <CareerInsights result={result} />
        </div>
    );
};

export default AnalysisDashboard;
