
import React, { useState } from 'react';
import { Session, User, Skill } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminProps {
  sessions: Session[];
  users: User[];
  onCancelSession: (id: string) => void;
  allSkills: Skill[];
  onDeleteSkill: (id: string) => void;
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const Admin: React.FC<AdminProps> = ({ sessions = [], users = [], onCancelSession, allSkills = [], onDeleteSkill }) => {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'sessions' | 'skills'>('stats');
  const [skillSearch, setSkillSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = [
    { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-500' },
    { label: 'Active Sessions', value: sessions.filter(s => s.status === 'Approved').length, icon: '⚡', color: 'bg-amber-500' },
    { label: 'Completed Swaps', value: sessions.filter(s => s.status === 'Completed').length, icon: '✅', color: 'bg-emerald-500' },
    { label: 'Cancelled', value: sessions.filter(s => s.status === 'Cancelled').length, icon: '🚫', color: 'bg-rose-500' },
  ];

  const chartData = [
    { name: 'Pending', count: sessions.filter(s => s.status === 'Pending').length },
    { name: 'Approved', count: sessions.filter(s => s.status === 'Approved').length },
    { name: 'Completed', count: sessions.filter(s => s.status === 'Completed').length },
    { name: 'Cancelled', count: sessions.filter(s => s.status === 'Cancelled').length },
  ];

  const COLORS = ['#F59E0B', '#6366F1', '#10B981', '#EF4444'];

  const getPartner = (id: string) => users.find(u => u.id === id);
  const getSkill = (id: string) => allSkills.find(s => s.id === id);

  const filteredSkills = allSkills.filter(s => 
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button 
          onClick={() => setActiveSubTab('stats')}
          className={`pb-4 text-sm font-bold transition-all px-2 ${activeSubTab === 'stats' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Overview Statistics
        </button>
        <button 
          onClick={() => setActiveSubTab('sessions')}
          className={`pb-4 text-sm font-bold transition-all px-2 ${activeSubTab === 'sessions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Monitor Sessions
        </button>
        <button 
          onClick={() => setActiveSubTab('skills')}
          className={`pb-4 text-sm font-bold transition-all px-2 ${activeSubTab === 'skills' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Manage Skills
        </button>
      </div>

      {activeSubTab === 'stats' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">📊 Platform Usage</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                      {chartData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">🛡️ Moderation Queue</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-xl">
                  <span className="text-2xl">🚩</span>
                  <div>
                    <p className="text-xs font-bold text-rose-900">Platform Health Alert</p>
                    <p className="text-[10px] text-rose-700">System running optimally. No flagged users today.</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">Audit Logs</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'sessions' && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800">Master Session Registry</h3>
            <span className="text-xs text-slate-400">{sessions.length} total exchanges</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participants</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map(s => {
                  const req = getPartner(s.requesterId);
                  const prov = getPartner(s.providerId);
                  const skill = getSkill(s.skillId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-700">{req?.name || 'User'} ↔ {prov?.name || 'User'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{skill?.name || 'Deleted Skill'}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700">{formatDisplayDate(s.date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'Approved' ? 'bg-indigo-100 text-indigo-700' : 
                          s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          s.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.status !== 'Cancelled' && (
                          <button onClick={() => onCancelSession(s.id)} className="text-rose-600 hover:text-rose-800 text-xs font-black uppercase tracking-widest">Terminate</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSubTab === 'skills' && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-4">
            <h3 className="font-bold text-slate-800">Global Skill Registry</h3>
            <div className="relative w-full md:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Search skills..." 
                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSkills.map(skill => {
                  const usageCount = users.filter(u => 
                    u.skillsOffered.some(s => s.id === skill.id) || 
                    u.skillsRequested.some(s => s.id === skill.id)
                  ).length;
                  const isConfirming = deletingId === skill.id;

                  return (
                    <tr key={skill.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{skill.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 uppercase font-black tracking-tighter">{skill.category}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-bold">Used by {usageCount} Users</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isConfirming ? (
                          <div className="flex gap-2 justify-end animate-in fade-in slide-in-from-right-2 duration-200">
                             <button 
                                onClick={() => { onDeleteSkill(skill.id); setDeletingId(null); }}
                                className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md"
                             >
                                Confirm
                             </button>
                             <button 
                                onClick={() => setDeletingId(null)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg"
                             >
                                Back
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeletingId(skill.id)}
                            className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                          >
                            Delete Skill
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSkills.length === 0 && (
              <div className="p-10 text-center text-slate-400 italic text-sm">No skills found.</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
