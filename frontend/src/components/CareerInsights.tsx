import React from 'react';
import { motion } from 'framer-motion';
import {
    Compass,
    Briefcase,
    Code,
    LineChart,
    Cpu,
    Globe,
    Shield,
    Database
} from 'lucide-react';
import { AnalysisResult } from '../services/api';

interface CareerInsightsProps {
    result: AnalysisResult;
}

const InsightCard: React.FC<{
    icon: React.ElementType;
    title: string;
    items?: string[];
    color: string;
    delay?: number
}> = ({ icon: Icon, title, items = [], color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, duration: 0.6 }}
        className="premium-card p-6 space-y-4 bg-white/[0.02] border-white/5 group hover:border-primary/20 transition-all"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={color} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{title}</h4>
        </div>

        <div className="flex flex-wrap gap-2">
            {!items.length ? (
                <p className="text-[10px] text-gray-600 italic uppercase tracking-widest pl-1">Insufficient data for extraction.</p>
            ) : (
                items.map((item, i) => (
                    <div
                        key={i}
                        className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider hover:bg-white/10 transition-colors`}
                    >
                        {item}
                    </div>
                ))
            )}
        </div>
    </motion.div>
);

const CareerInsights: React.FC<CareerInsightsProps> = ({ result }) => {
    const recommendedRoles = result.recommended_roles || result.recommendedJobRoles || [];
    const skillDomains = result.strongestSkillDomains || [];
    const techGaps = result.missing_skills || result.missingTechnologies || [];
    const growthSuggestions = result.careerGrowthSuggestions || [];

    return (
        <section className="space-y-8 py-8 border-t border-white/5 mt-12">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
                    <Compass size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Strategic Career Intelligence</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Professional <span className="text-gradient">Trajectory</span> Breakdown</h3>
                <p className="text-xs text-gray-500 font-medium max-w-2xl leading-relaxed">
                    Based on your core competency matrix, our AI engine has modeled these high-impact career progression vectors and specialized role alignments.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skill Domains */}
                <InsightCard
                    icon={Cpu}
                    title="Strongest Skill Domains"
                    items={skillDomains}
                    color="text-blue-400"
                    delay={100}
                />

                {/* Recommended Roles */}
                <InsightCard
                    icon={Briefcase}
                    title="Role Alignment Targets"
                    items={recommendedRoles}
                    color="text-emerald-400"
                    delay={200}
                />

                {/* Missing Tech */}
                <InsightCard
                    icon={Code}
                    title="Critical Tech Gaps"
                    items={techGaps}
                    color="text-rose-400"
                    delay={300}
                />

                {/* Growth suggestions */}
                <InsightCard
                    icon={LineChart}
                    title="Growth Vector Roadmap"
                    items={growthSuggestions}
                    color="text-amber-400"
                    delay={400}
                />
            </div>

            {/* Contextual Intelligence Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="ai-panel p-8 bg-glass-gradient border-white/10"
            >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="p-5 rounded-[2.5rem] bg-ai-gradient-deep shadow-ai-glow">
                        <Globe size={32} className="text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Global Market Viability</h4>
                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Synthesizing current market demands with your detected proficiency in <span className="text-primary">{(skillDomains[0] || 'your core domains')}</span>.
                            The suggested <span className="text-white">{(recommendedRoles[0] || 'roles')}</span> signify optimal entry vectors for maximum salary leverage and career acceleration.
                        </p>
                        <div className="flex gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Database size={14} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Neural Sync Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default CareerInsights;
