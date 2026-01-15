import React, { useEffect, useState, useMemo } from 'react';
import { User, UserProgress } from '../types';
import { db } from '../services/database';
import { CURRICULUM } from '../constants';
import { Users, Mail, TrendingUp, Award, Search, RefreshCw, AlertCircle, GitMerge, User as UserIcon } from 'lucide-react';

interface Downline extends User {
  progress: UserProgress;
  level?: string;
  uplineName?: string;
}

interface ManagerDashboardProps {
  user: User;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  const [downlines, setDownlines] = useState<Downline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const totalLessonsCount = useMemo(() => 
    CURRICULUM.reduce((acc, m) => acc + m.lessons.length, 0), 
  []);

  useEffect(() => {
    const fetchDownlines = async () => {
      setLoading(true);
      try {
        const data = await db.getDownlines(user.id);
        setDownlines(data);
      } catch (error) {
        console.error("Failed to fetch downlines", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDownlines();
  }, [user.id, refreshKey]);

  const filteredDownlines = useMemo(() => {
    if (!searchQuery.trim()) return downlines;
    const query = searchQuery.toLowerCase();
    return downlines.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.email.toLowerCase().includes(query) ||
        (d.uplineName && d.uplineName.toLowerCase().includes(query))
    );
  }, [downlines, searchQuery]);

  const stats = useMemo(() => {
    const totalRecruits = downlines.length;
    const activeRecruits = downlines.filter(d => d.progress.completedLessonIds.length > 0).length;
    const totalCompletedLessons = downlines.reduce((acc, d) => acc + d.progress.completedLessonIds.length, 0);
    const avgCompletion = totalRecruits > 0 
        ? Math.round((totalCompletedLessons / (totalRecruits * totalLessonsCount)) * 100) 
        : 0;
    return { totalRecruits, activeRecruits, avgCompletion };
  }, [downlines, totalLessonsCount]);

  const getCompletionPercentage = (completedCount: number) => {
    return Math.round((completedCount / totalLessonsCount) * 100);
  };

  const getRoleAcronym = (title?: string) => {
    if (!title) return 'FWP';
    const t = title.toLowerCase();
    if (t.includes('branch manager')) return 'FWBM';
    if (t.includes('director')) return 'FWD';
    if (t.includes('agency partner')) return 'AP';
    if (t.includes('unit manager') || t === 'financial wealth manager') return 'FWM';
    return 'FWP';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Team Dashboard</h2>
          <p className="text-gray-500 mt-1">Monitor the training progress of your entire downline hierarchy.</p>
        </div>
        <button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-corporate-500 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-corporate-50 rounded-lg text-corporate-500"><Users className="w-8 h-8" /></div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Hierarchy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRecruits}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600"><TrendingUp className="w-8 h-8" /></div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Learners</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeRecruits}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Award className="w-8 h-8" /></div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg. Completion</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgCompletion}%</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-lg text-gray-900">Advisors List</h3>
            <div className="relative w-full sm:w-64">
                <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-corporate-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Advisor Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Hierarchy</th>
                        <th className="px-6 py-4">Reporting To</th>
                        <th className="px-6 py-4">Progress</th>
                        <th className="px-6 py-4 text-right">Avg Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Loading hierarchy...</td></tr>
                    ) : filteredDownlines.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No advisors found.</td></tr>
                    ) : (
                        filteredDownlines.map((recruit) => {
                            const percent = getCompletionPercentage(recruit.progress.completedLessonIds.length);
                            const scores = Object.values(recruit.progress.quizScores || {}) as number[];
                            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
                            const acronym = getRoleAcronym(recruit.title);
                            return (
                                <tr key={recruit.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-corporate-100 flex items-center justify-center text-corporate-600 font-bold text-xs shrink-0"><UserIcon className="w-4 h-4" /></div>
                                            <div>
                                                <p className="font-bold text-gray-900">{recruit.name}</p>
                                                <div className="flex items-center gap-1 text-gray-400 text-xs"><Mail className="w-3 h-3" />{recruit.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-bold border bg-gray-100 text-gray-600 border-gray-200">{acronym}</span></td>
                                    <td className="px-6 py-4"><span className="text-xs font-medium text-gray-600">{recruit.level || 'Direct'}</span></td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{recruit.uplineName || 'You'}</td>
                                    <td className="px-6 py-4 w-1/5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-corporate-500 rounded-full" style={{ width: `${percent}%` }} /></div>
                                            <span className="text-xs font-bold text-gray-600">{percent}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">{scores.length > 0 ? avgScore : '-'}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;