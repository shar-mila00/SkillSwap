
import React, { useState, useEffect, useCallback } from 'react';
import { User, Skill, SkillCategory } from '../types';
import { getSkillRecommendations } from '../services/geminiService';

interface DiscoveryProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  allSkills: Skill[];
  allUsers: User[];
}

const Discovery: React.FC<DiscoveryProps> = ({ currentUser, onSelectUser, allSkills, allUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'All'>('All');
  const [discoveryMode, setDiscoveryMode] = useState<'offering' | 'seeking'>('offering');
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [aiError, setAiError] = useState(false);

  const fetchRecs = useCallback(async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    setAiError(false);
    try {
      const recIds = await getSkillRecommendations(currentUser, allUsers);
      const recUsers = allUsers.filter(u => recIds.includes(u.id));
      setRecommendations(recUsers);
      setHasAttempted(true);
    } catch (err) {
      console.error(err);
      setAiError(true);
    } finally {
      setLoadingAI(false);
    }
  }, [currentUser, allUsers]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const filteredUsers = allUsers.filter(user => {
    if (user.id === currentUser.id || user.role === 'admin') return false;
    
    const relevantSkills = discoveryMode === 'offering' ? user.skillsOffered : user.skillsRequested;

    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relevantSkills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesLocation = 
      user.location.toLowerCase().includes(locationSearch.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'All' || 
      relevantSkills.some(s => s.category === categoryFilter);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const categories: (SkillCategory | 'All')[] = [
    'All', 'Programming', 'Music', 'Design', 'Marketing', 'Languages', 'Cooking', 'Business', 'Game', 'Art'
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto self-start">
            <button 
              onClick={() => setDiscoveryMode('offering')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${discoveryMode === 'offering' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Who Offers Skills
            </button>
            <button 
              onClick={() => setDiscoveryMode('seeking')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${discoveryMode === 'seeking' ? 'bg-white shadow-lg text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Who is Seeking
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder={`Search who is ${discoveryMode === 'offering' ? 'teaching' : 'looking for'}...`}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
              <input
                type="text"
                placeholder="Search by location..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 whitespace-nowrap ${
                categoryFilter === cat ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recommended */}
      {!searchTerm && !locationSearch && categoryFilter === 'All' && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900">Recommended Partners</h3>
              <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">Smart Match</span>
            </div>
            <button 
              onClick={fetchRecs} 
              disabled={loadingAI}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-widest disabled:opacity-50"
            >
              {loadingAI ? 'AI is Thinking...' : '↻ Refresh Recommendations'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingAI ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-72 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem]"></div>
                  <div className="w-1/2 h-4 bg-slate-100 rounded-lg"></div>
                  <div className="w-1/3 h-3 bg-slate-50 rounded-lg"></div>
                </div>
              ))
            ) : recommendations.length > 0 ? (
              recommendations.map(user => <UserCard key={user.id} user={user} onSelect={onSelectUser} mode={discoveryMode} />)
            ) : (
              <div className="col-span-3 py-16 bg-white rounded-[2.5rem] text-center border border-dashed border-slate-200 flex flex-col items-center gap-4 shadow-sm">
                <div className="text-4xl">🤖</div>
                <div>
                  <p className="text-slate-500 font-bold">
                    {aiError ? 'Smart Match Error' : hasAttempted ? 'No perfect matches yet' : 'Find your match'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                    {aiError ? 'Check your API Key or connection.' : 'Add more details to your bio to help AI find better partners!'}
                  </p>
                </div>
                {(aiError || !hasAttempted) && (
                  <button 
                    onClick={fetchRecs} 
                    className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-all"
                  >
                    Retry Match
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Browse */}
      <section>
        <h3 className="text-2xl font-black text-slate-900 mb-8">Browse All</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUsers.map(user => <UserCard key={user.id} user={user} onSelect={onSelectUser} mode={discoveryMode} />)}
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner">
            <p className="text-slate-400 font-bold">No swappers found in your area matching these criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const UserCard: React.FC<{ user: User; onSelect: (u: User) => void; mode: 'offering' | 'seeking' }> = ({ user, onSelect, mode }) => {
  const skills = mode === 'offering' ? user.skillsOffered : user.skillsRequested;
  return (
    <div className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2">
      <div className="flex items-start justify-between mb-6">
        <img src={user.avatar} className="w-20 h-20 rounded-[1.5rem] object-cover bg-slate-50 shadow-sm" alt={user.name} />
        <div className="flex flex-col items-end">
          <div className="text-amber-500 font-black text-lg leading-tight">⭐ {user.rating}</div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">({user.reviewCount})</span>
        </div>
      </div>
      <h4 className="font-black text-slate-900 text-lg mb-1">{user.name}</h4>
      <p className="text-slate-500 text-xs mb-4">📍 {user.location}</p>
      <div className="flex flex-wrap gap-1.5 mb-6 h-12 overflow-hidden">
        {skills.slice(0, 3).map(s => (
          <span key={s.id} className="text-[10px] px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-black">{s.name}</span>
        ))}
      </div>
      <button onClick={() => onSelect(user)} className="w-full py-4 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-slate-100">
        View & Request
      </button>
    </div>
  );
};

export default Discovery;
