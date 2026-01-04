
import React, { useState, useEffect, useMemo } from 'react';
import { User, Session, SessionStatus, Notification, Message, Skill, Review } from './types';
import Layout from './components/Layout';
import Discovery from './views/Discovery';
import Sessions from './views/Sessions';
import Profile from './views/Profile';
import Chat from './views/Chat';
import Admin from './views/Admin';
import { MOCK_USERS, MOCK_SKILLS, MOCK_SESSIONS } from './store/mockData';

const API_URL = 'http://localhost/SkillSwap/api.php';


const calculateEndTime = (startTime: string): string => {
  if (!startTime) return '00:00';
  const [hours, minutes] = startTime.split(':').map(Number);
  let endMinutes = minutes + 20;
  let endHours = hours + 1;
  if (endMinutes >= 60) {
    endMinutes -= 60;
    endHours += 1;
  }
  const h = endHours % 24;
  return `${h < 10 ? '0' + h : h}:${endMinutes < 10 ? '0' + endMinutes : endMinutes}`;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [tabHistory, setTabHistory] = useState<string[]>(['discover']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const [schedDate, setSchedDate] = useState<string>('');
  const [schedTime, setSchedTime] = useState<string>('09:00');
  const [schedulingSkill, setSchedulingSkill] = useState<Skill | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reviewingSession, setReviewingSession] = useState<Session | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const loadData = async () => {
    try {
      const response = await fetch(`${API_URL}?action=init`);
      if (!response.ok) throw new Error("Backend Offline");
      const data = await response.json();
      
      setAllUsers(data.users || []);
      setAllSkills(data.skills || []);
      setSessions(data.sessions || []);
      setMessages(data.messages || []);
      setReviews(data.reviews || []);
      setIsOffline(false);
    } catch (err) {
      console.warn("Backend connection failed. Demo mode active.");
      setIsOffline(true);
      setAllUsers(MOCK_USERS);
      setAllSkills(MOCK_SKILLS);
      setSessions(MOCK_SESSIONS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const checkOverlap = (date: string, startTime: string, endTime: string): boolean => {
    if (!currentUser) return false;
    return sessions.some(s => {
      if (s.date !== date) return false;
      if (s.status === 'Cancelled' || s.status === 'Completed') return false;
      if (s.requesterId !== currentUser.id && s.providerId !== currentUser.id) return false;
      return (startTime < s.endTime && endTime > s.time);
    });
  };

  const handleRequestSwap = async () => {
    if (!selectedUser || !schedulingSkill || !schedDate || !currentUser) return;
    setErrorMessage(null);
    const newEndTime = calculateEndTime(schedTime);
    if (checkOverlap(schedDate, schedTime, newEndTime)) {
      setErrorMessage("Scheduling conflict! You already have a session during this time.");
      return;
    }
    const newSession: Session = {
      id: `sess-${Date.now()}`, requesterId: currentUser.id, providerId: selectedUser.id,
      skillId: schedulingSkill.id, date: schedDate, time: schedTime, endTime: newEndTime, status: 'Pending'
    };
    if (!isOffline) {
      try {
        const response = await fetch(`${API_URL}?action=save_session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSession)
        });
        if (!response.ok) {
          const err = await response.json();
          setErrorMessage(err.error || "Server error");
          return;
        }
      } catch (e) {
        setErrorMessage("Connection error.");
        return;
      }
    }
    setSessions(prev => [...prev, newSession]);
    addNotification(selectedUser.id, "New Session Request", `${currentUser.name} wants to learn ${schedulingSkill.name}.`, 'session');
    setSelectedUser(null);
    setSchedulingSkill(null);
    setSchedDate('');
    navigateToTab('sessions');
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !reviewingSession) return;

    const isRequester = reviewingSession.requesterId === currentUser.id;
    const partnerId = isRequester ? reviewingSession.providerId : reviewingSession.requesterId;
    const partner = allUsers.find(u => u.id === partnerId);

    if (!partner) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      sessionId: reviewingSession.id,
      fromUserId: currentUser.id,
      toUserId: partnerId,
      rating: reviewRating,
      comment: reviewComment,
      timestamp: Date.now()
    };

    const oldRating = partner.rating || 0;
    const oldCount = partner.reviewCount || 0;
    const newCount = oldCount + 1;
    const newAvgRating = Number(((oldRating * oldCount + reviewRating) / newCount).toFixed(1));

    setAllUsers(prev => prev.map(u => {
      if (u.id === partnerId) {
        return { ...u, rating: newAvgRating, reviewCount: newCount };
      }
      return u;
    }));

    setReviews(prev => [...prev, newReview]);
    setSessions(prev => prev.map(s => {
      if (s.id === reviewingSession.id) {
        return isRequester ? { ...s, requesterReviewed: true } : { ...s, providerReviewed: true };
      }
      return s;
    }));

    if (!isOffline) {
      await fetch(`${API_URL}?action=save_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      }).catch(e => console.error("Review Sync Error", e));
    }

    addNotification(partnerId, "New Review Received!", `${currentUser.name} gave you ${reviewRating} stars.`, 'system');
    setReviewingSession(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const addNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId, title, message, type, read: false, timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (!isOffline) {
      await fetch(`${API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(e => console.error("Profile Sync Error", e));
    }
  };

  const handleAddGlobalSkill = async (newSkill: Skill) => {
    setAllSkills(prev => [...prev, newSkill]);
    if (!isOffline) {
      await fetch(`${API_URL}?action=add_skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill)
      }).catch(e => console.error("Skill Addition Error", e));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    if (isOffline) {
      const user = allUsers.find(u => u.email === email && u.password === password);
      if (user) setCurrentUser(user);
      else alert("DEMO MODE: Invalid credentials.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        alert("Login failed. Check your credentials.");
      }
    } catch (err) {
      alert("API Connection Error.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const bio = (form.elements.namedItem('bio') as HTMLTextAreaElement).value;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      password,
      location: 'New Member',
      bio,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      skillsOffered: [],
      skillsRequested: [],
      rating: 5.0,
      reviewCount: 0
    };

    if (isOffline) {
      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsRegistering(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setIsRegistering(false);
      } else {
        const err = await response.json();
        alert(err.error || "Registration failed.");
      }
    } catch (err) {
      alert("API Connection Error.");
    }
  };

  const handleSendMessage = async (partnerId: string, text: string) => {
    if (!currentUser) return;
    const threadKey = [currentUser.id, partnerId].sort().join('-');
    const newMessage: Message = { id: `msg-${Date.now()}`, sessionId: threadKey, senderId: currentUser.id, text, timestamp: Date.now() };
    setMessages(prev => [...prev, newMessage]);
    addNotification(partnerId, `New message from ${currentUser.name}`, text, 'message');
    if (!isOffline) {
      fetch(`${API_URL}?action=send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      }).catch(e => console.error("Msg Sync Error", e));
    }
  };

  const messageStore = useMemo(() => {
    const store: Record<string, Message[]> = {};
    messages.forEach(msg => {
      if (!store[msg.sessionId]) store[msg.sessionId] = [];
      store[msg.sessionId].push(msg);
    });
    return store;
  }, [messages]);

  const handleUpdateSession = async (id: string, status: SessionStatus) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const partnerId = s.requesterId === currentUser?.id ? s.providerId : s.requesterId;
        addNotification(partnerId, `Session ${status}`, `Your session on ${s.date} is now ${status}.`, 'session');
        return { ...s, status };
      }
      return s;
    }));
    if (!isOffline) {
      await fetch(`${API_URL}?action=update_session_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      }).catch(e => console.error("Update Sync Error", e));
    }
  };

  const navigateToTab = (tab: string, skipHistory = false) => {
    setActiveTab(tab);
    if (!skipHistory) {
      const newHistory = tabHistory.slice(0, historyIndex + 1);
      newHistory.push(tab);
      setTabHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleGoBack = () => { if (historyIndex > 0) { const idx = historyIndex - 1; setHistoryIndex(idx); setActiveTab(tabHistory[idx]); } };
  const handleGoForward = () => { if (historyIndex < tabHistory.length - 1) { const idx = historyIndex + 1; setHistoryIndex(idx); setActiveTab(tabHistory[idx]); } };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        {isOffline && (
           <div className="mb-6 px-6 py-2 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-lg backdrop-blur-md">
             Offline Demo Mode Active
           </div>
        )}
        <div className="max-w-md w-full bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl border border-slate-700/50">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 mx-auto">S</div>
          <h1 className="text-3xl font-black mb-2 text-white">SkillSwap Pro</h1>
          <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">Exchange Wisdom</p>
          
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email</label>
                 <input required name="email" type="email" placeholder="alex@example.com" className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password</label>
                 <input required name="password" type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
               </div>
               <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl mt-4 uppercase tracking-widest text-xs">Sign In</button>
               <button type="button" onClick={() => setIsRegistering(true)} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all">Create Account</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
                 <input required name="name" type="text" placeholder="John Doe" className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email Address</label>
                 <input required name="email" type="email" placeholder="john@example.com" className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Create Password</label>
                 <input required name="password" type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Short Bio</label>
                 <textarea required name="bio" placeholder="Tell us what you can teach..." className="w-full px-5 py-4 bg-slate-700/30 border border-slate-600 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none" />
               </div>
               <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl mt-4 uppercase tracking-widest text-xs">Join SkillSwap</button>
               <button type="button" onClick={() => setIsRegistering(false)} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all">Back to Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} onLogout={() => setCurrentUser(null)} activeTab={activeTab} setActiveTab={navigateToTab}
      notifications={notifications.filter(n => n.userId === currentUser.id)} onNotificationClick={(n) => {
        setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
        if (n.type === 'message') navigateToTab('messages');
        else if (n.type === 'session') navigateToTab('sessions');
      }}
      onGoBack={handleGoBack} onGoForward={handleGoForward} onMinimize={() => {}} onMaximize={() => setIsMaximized(!isMaximized)}
      canGoBack={historyIndex > 0} canGoForward={historyIndex < tabHistory.length - 1} isMaximized={isMaximized}
    >
      {activeTab === 'discover' && <Discovery currentUser={currentUser} allUsers={allUsers} onSelectUser={setSelectedUser} allSkills={allSkills} />}
      {activeTab === 'sessions' && <Sessions currentUser={currentUser} sessions={sessions} onUpdateStatus={handleUpdateSession} onOpenReview={setReviewingSession} allSkills={allSkills} allUsers={allUsers} />}
      {activeTab === 'profile' && <Profile user={allUsers.find(u => u.id === currentUser.id) || currentUser} allSkills={allSkills} onUpdate={handleUpdateProfile} reviews={reviews.filter(r => r.toUserId === currentUser.id)} allUsers={allUsers} onAddGlobalSkill={handleAddGlobalSkill} />}
      {activeTab === 'admin' && currentUser.role === 'admin' && <Admin sessions={sessions} users={allUsers} onCancelSession={(id) => handleUpdateSession(id, 'Cancelled')} allSkills={allSkills} onDeleteSkill={()=>{}} />}
      {activeTab === 'messages' && <Chat currentUser={currentUser} allUsers={allUsers} messageStore={messageStore} onSendMessage={handleSendMessage} />}
      
      {/* Swap Request Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button onClick={() => { setSelectedUser(null); setErrorMessage(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold">✕</button>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Request Swap</h3>
              <p className="text-slate-500 text-sm mb-6">Schedule with <b>{selectedUser.name}</b></p>
              <div className="space-y-6">
                 {errorMessage && <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">⚠️ {errorMessage}</div>}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Skill to Learn</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedUser.skillsOffered.map(skill => (
                            <button key={skill.id} onClick={() => setSchedulingSkill(skill)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${schedulingSkill?.id === skill.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                      <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" value={schedDate} onChange={e => setSchedDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                      <input type="time" className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
                    </div>
                 </div>
                 <button disabled={!schedulingSkill || !schedDate} onClick={handleRequestSwap} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">Send Swap Request</button>
              </div>
           </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setReviewingSession(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold">✕</button>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Rate Experience</h3>
            <p className="text-slate-500 text-sm mb-8">How was your session?</p>
            <div className="space-y-8">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className={`text-4xl transition-all hover:scale-125 ${reviewRating >= star ? 'grayscale-0' : 'grayscale opacity-30'}`}>⭐</button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback</label>
                <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-32 focus:ring-2 focus:ring-amber-500 outline-none" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
              </div>
              <button onClick={handleSubmitReview} className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl hover:bg-amber-600 transition-all uppercase tracking-widest text-xs">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
