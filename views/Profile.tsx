
import React, { useState, useEffect } from 'react';
import { User, Skill, SkillCategory, Review } from '../types';

interface ProfileProps {
  user: User;
  allSkills: Skill[];
  onUpdate: (updatedUser: User) => void;
  reviews: Review[];
  allUsers: User[];
  onAddGlobalSkill: (skill: Skill) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, allSkills, onUpdate, reviews, allUsers, onAddGlobalSkill }) => {
  const [formData, setFormData] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState<SkillCategory>('Programming');
  
  const [showSecurity, setShowSecurity] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [securityError, setSecurityError] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...user,
      password: prev.password || user.password 
    }));
  }, [user]);

  const categories: SkillCategory[] = [
    'Programming', 'Music', 'Design', 'Marketing', 'Languages', 'Cooking', 'Business', 'Game', 'Art'
  ];

  const toggleSkill = (skill: Skill, type: 'offered' | 'requested') => {
    const field = type === 'offered' ? 'skillsOffered' : 'skillsRequested';
    const list = [...formData[field]];
    const exists = list.some(s => s.id === skill.id);
    const newList = exists ? list.filter(s => s.id !== skill.id) : [...list, skill];
    setFormData({ ...formData, [field]: newList });
  };

  const handleAddNewSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `custom-${Date.now()}`,
      name: newSkillName,
      category: newSkillCat
    };
    onAddGlobalSkill(newSkill);
    setNewSkillName('');
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handlePasswordUpdate = () => {
    setSecurityError('');
    if (currentPass !== formData.password) {
      setSecurityError('Incorrect current password.');
      return;
    }
    if (newPass.length < 4) {
      setSecurityError('New password must be at least 4 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setSecurityError('Passwords do not match.');
      return;
    }

    const updated = { ...formData, password: newPass };
    setFormData(updated);
    onUpdate(updated);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setShowSecurity(false);
    alert('Password updated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="h-48 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700"></div>
        <div className="p-10 -mt-20 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 flex-1">
              <img src={formData.avatar} className="w-36 h-36 rounded-[2rem] object-cover ring-8 ring-white shadow-2xl bg-white" alt="" />
              <div className="text-center md:text-left flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      className="text-2xl font-black text-slate-900 bg-slate-50 border-b-2 border-indigo-500 outline-none w-full p-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input 
                      type="text"
                      className="text-slate-500 text-sm bg-slate-50 border-b border-slate-300 outline-none w-full p-2"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-black text-slate-900 truncate">{formData.name}</h3>
                    <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                      <p className="text-slate-500 text-sm">📍 {formData.location}</p>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                        <span className="text-amber-500 text-sm font-bold">⭐ {formData.rating}</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase">({formData.reviewCount} Reviews)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowSecurity(!showSecurity)} className="px-6 py-3.5 font-bold rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">🔒 Security</button>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                className={`px-8 py-3.5 font-bold rounded-2xl shadow-xl transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}
              >
                {isEditing ? '✓ Save Changes' : '✎ Edit Profile'}
              </button>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Me</h4>
            {isEditing ? (
              <textarea 
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-700 text-sm h-32 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100 italic">"{formData.bio}"</p>
            )}
          </div>

          {showSecurity && (
            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white animate-in slide-in-from-top duration-300">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Change Password</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="password" placeholder="Current Password" className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
                <input type="password" placeholder="New Password" className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                <input type="password" placeholder="Confirm New" className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              </div>
              {securityError && <p className="text-rose-400 text-xs font-bold mt-4">{securityError}</p>}
              <button onClick={handlePasswordUpdate} className="mt-8 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl">Update Password</button>
            </div>
          )}

          {isEditing && (
            <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem]">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">Propose New Global Skill</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Skill Name" className="flex-1 p-3.5 bg-white border border-indigo-200 rounded-xl text-sm outline-none" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} />
                <select className="p-3.5 bg-white border border-indigo-200 rounded-xl text-sm" value={newSkillCat} onChange={(e) => setNewSkillCat(e.target.value as any)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={handleAddNewSkill} className="px-6 py-3.5 bg-indigo-600 rounded-xl font-bold text-white shadow-lg">Submit Skill</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            {['offered', 'requested'].map((type) => (
              <section key={type} className="flex flex-col">
                <h4 className="text-xl font-black text-slate-900 mb-6 capitalize">Skills I {type === 'offered' ? 'Teach' : 'Request'}</h4>
                
                {isEditing ? (
                  <div className="space-y-8 max-h-[500px] overflow-y-auto p-2 scrollbar-hide">
                    {categories.map(cat => {
                      const skillsInCat = allSkills.filter(s => s.category === cat);
                      if (skillsInCat.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</p>
                          <div className="flex flex-wrap gap-2">
                            {skillsInCat.map(skill => {
                              const isSelected = formData[type === 'offered' ? 'skillsOffered' : 'skillsRequested'].some(s => s.id === skill.id);
                              return (
                                <button 
                                  key={skill.id}
                                  onClick={() => toggleSkill(skill, type as any)} 
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                >
                                  {skill.name}
                                  {isSelected && <span className="ml-2">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {(type === 'offered' ? formData.skillsOffered : formData.skillsRequested).length > 0 ? (
                      (type === 'offered' ? formData.skillsOffered : formData.skillsRequested).map(s => (
                        <div key={s.id} className="px-5 py-3 rounded-2xl text-xs font-bold border bg-slate-50 border-slate-100 text-slate-700" title={s.category}>{s.name}</div>
                      ))
                    ) : <p className="text-slate-400 text-sm italic">No skills selected.</p>}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
          Partner Feedback
          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{reviews.length} total</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length > 0 ? reviews.map(review => {
            const fromUser = allUsers.find(u => u.id === review.fromUserId);
            return (
              <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-5">
                <img src={fromUser?.avatar} className="w-12 h-12 rounded-xl object-cover bg-slate-50" alt="" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{fromUser?.name || 'Partner'}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Swap</p>
                    </div>
                    <div className="flex gap-0.5 text-xs">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'grayscale-0' : 'grayscale opacity-30'}>⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">"{review.comment}"</p>
                  <p className="text-[10px] text-slate-400 mt-4">{new Date(review.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-2 py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 italic font-medium">No reviews yet. Complete sessions to build your reputation!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
