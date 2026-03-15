import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Briefcase,
  Building2,
  Calendar,
  MoreVertical,
  Loader2,
  AlertTriangle,
  Trash2,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  fetchApplications,
  updateApplicationStatus,
  deleteApplication as deleteAppApi,
  ApplicationModel,
} from '../services/api';

const COLUMNS: { key: ApplicationModel['status']; label: string; color: string; border: string; bg: string; text: string }[] = [
  { key: 'APPLIED', label: 'Applied', color: 'blue', border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { key: 'INTERVIEW', label: 'Interview', color: 'amber', border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  { key: 'OFFER', label: 'Offer', color: 'emerald', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  { key: 'REJECTED', label: 'Rejected', color: 'rose', border: 'border-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-400' },
];

const KanbanBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId: string = user?.id || '';

  const [applications, setApplications] = useState<ApplicationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApplications(userId);
      setApplications(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        'Failed to load applications. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const handleStatusChange = async (id: string, newStatus: ApplicationModel['status']) => {
    setMovingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      setApplications(prev =>
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setMovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application permanently?')) return;
    setDeletingId(id);
    try {
      await deleteAppApi(id);
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getByStatus = (status: ApplicationModel['status']) =>
    filteredApplications.filter(app => app.status === status);

  if (loading) {
    return (
      <div className="flex gap-8 overflow-hidden pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 space-y-6">
            <div className="h-4 bg-white/5 rounded-full w-1/3 animate-pulse" />
            <div className="space-y-4">
              {[...Array(3)].map((__, j) => (
                <div key={j} className="premium-card h-32 bg-white/[0.02] border border-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
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
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 shadow-glow">
          <AlertTriangle size={48} className="text-rose-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Connectivity Issue</h2>
          <p className="text-gray-500 font-medium text-sm max-w-sm">{error}</p>
        </div>
        <button onClick={loadApplications} className="btn-primary flex items-center gap-3 mt-4 px-10">
          <Loader2 size={18} /> Retry Connection
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header section with Stats Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Plus size={14} className="shadow-glow" />
            </div>
            Application Core • Tracker v1.2
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Workflow <span className="text-gradient">Manager</span>
          </h1>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{applications.length}</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Cases</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400">{applications.filter(a => a.status === 'OFFER').length}</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Offers Secured</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search companies or roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            <option value="ALL">All Status</option>
            {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button
            onClick={() => navigate('/optimizer')}
            className="btn-primary px-8 flex items-center gap-3 shadow-ai-glow text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap"
          >
            <Plus size={18} /> New Application
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 premium-card bg-glass-gradient border-dashed border-2">
          <div className="p-8 rounded-full bg-primary/5 border border-primary/10 shadow-ai-glow">
            <Briefcase size={48} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Start tracking your job applications</h2>
            <p className="text-gray-500 max-w-md mx-auto font-medium italic">Your career journey begins here. Add your first application to unlock AI-powered insights and tracking.</p>
          </div>
          <button
            onClick={() => navigate('/optimizer')}
            className="btn-primary px-10 py-4 flex items-center gap-4 shadow-ai-glow text-sm font-black uppercase tracking-[0.2em]"
          >
            <Plus size={20} /> Add Application
          </button>
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide -mx-2 px-2">
          <LayoutGroup>
            {COLUMNS.map((column) => {
              const cards = getByStatus(column.key);
              return (
                <div key={column.key} className="flex-shrink-0 w-80 space-y-6">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shadow-glow ${column.bg.replace('10', '500')}`} />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                        {column.label}
                      </h3>
                      <motion.span
                        key={cards.length}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`px-2.5 py-0.5 ${column.text} ${column.bg} border ${column.border} rounded-lg text-[10px] font-black uppercase`}
                      >
                        {cards.length}
                      </motion.span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <motion.div
                    layout
                    className="space-y-4 min-h-[600px] p-2 rounded-3xl bg-white/[0.01] border border-white/[0.02]"
                  >
                    <AnimatePresence mode="popLayout">
                      {cards.map((app) => (
                        <motion.div
                          layout
                          key={app.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          className={`premium-card p-5 space-y-5 cursor-grab active:cursor-grabbing group relative
                            ${movingId === app.id || deletingId === app.id ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                        >
                          {/* Status Glow Indicator */}
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full ${column.bg.replace('10', '500')} opacity-0 group-hover:opacity-100 transition-opacity`} />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                                {app.role}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <Building2 size={12} className="text-primary/60" />
                                <span className="truncate">{app.company}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              {deletingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {app.matchScore != null && (
                                <div className={`px-2 py-1 bg-primary/5 border border-primary/20 rounded-lg shadow-inner-glass`}>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                                    {Math.round(app.matchScore)}% Precision
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-tighter">
                              <Calendar size={12} />
                              {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          {/* Smart Navigation Actions */}
                          <div className="pt-2 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                            {COLUMNS.filter(c => c.key !== column.key).map(c => (
                              <button
                                key={c.key}
                                onClick={() => handleStatusChange(app.id, c.key)}
                                className={`px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all`}
                              >
                                Move to {c.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {cards.length === 0 && (
                      <div className="h-40 border-2 border-dashed border-white/[0.03] rounded-3xl flex flex-col items-center justify-center gap-3 bg-white/[0.01]">
                        <Briefcase size={24} className="text-white/5" />
                        <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Empty Stage</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </LayoutGroup>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
