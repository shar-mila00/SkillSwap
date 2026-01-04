
import React, { useState } from 'react';
import { User, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  onNotificationClick: (notif: Notification) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isMaximized: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, user, onLogout, activeTab, setActiveTab, 
  notifications, onNotificationClick, 
  onGoBack, onGoForward, onMinimize, onMaximize,
  canGoBack, canGoForward, isMaximized
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'discover', label: 'Discovery', icon: '🔍' },
    { id: 'sessions', label: 'My Sessions', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Dashboard', icon: '🛡️' });
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-[1000] w-screen h-screen' : ''}`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-64 bg-white border-r border-slate-200 flex flex-col fixed md:sticky bottom-0 md:top-0 h-16 md:h-screen z-50`}>
        <div className="hidden md:flex p-6 border-b border-slate-100 items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">SkillSwap</h1>
        </div>
        <nav className="flex-1 flex md:flex-col items-center justify-around md:justify-start py-2 md:py-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 md:px-6 py-2 md:py-3 transition-colors ${activeTab === tab.id ? 'text-indigo-600 bg-indigo-50 border-indigo-600 md:border-r-4' : 'text-slate-500 hover:text-slate-900'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] md:text-sm font-medium">{tab.label}</span>
            </button>
          ))}
          <button onClick={onLogout} className="hidden md:flex mt-auto p-6 text-sm text-slate-500 hover:text-red-600 transition-colors items-center gap-2">🚪 Sign Out</button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto max-w-7xl mx-auto w-full relative">
        <header className="hidden md:flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-sm">Welcome back, {user?.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Controls Clusters - Rightmost Corner */}
            <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-200 shadow-sm mr-4">
              <button 
                onClick={onGoBack} 
                disabled={!canGoBack}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${canGoBack ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-200 cursor-not-allowed'}`}
                title="Go Back"
              >
                ←
              </button>
              <button 
                onClick={onGoForward} 
                disabled={!canGoForward}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${canGoForward ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-200 cursor-not-allowed'}`}
                title="Go Forward"
              >
                →
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button onClick={onMinimize} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-amber-50 text-amber-600 transition-all font-bold" title="Minimize">
                _
              </button>
              <button onClick={onMaximize} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-indigo-50 text-indigo-600 transition-all font-bold" title="Maximize">
                {isMaximized ? '❐' : '□'}
              </button>
              <button onClick={onLogout} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-rose-50 text-rose-600 transition-all font-bold" title="Close / Logout">
                ✕
              </button>
            </div>

            <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 text-slate-400 hover:text-slate-600 relative">
              🔔 {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            {showNotifs && (
              <div className="absolute top-12 right-0 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  <button onClick={() => setShowNotifs(false)} className="text-[10px] text-indigo-600 font-bold">Close</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(n => (
                    <button 
                      key={n.id} 
                      onClick={() => { onNotificationClick(n); setShowNotifs(false); }}
                      className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                    </button>
                  )) : <p className="p-8 text-center text-xs text-slate-400">No new notifications</p>}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <img src={user?.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover" />
              <div className="hidden lg:block">
                <p className="text-xs font-semibold leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-1 uppercase tracking-tighter">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
