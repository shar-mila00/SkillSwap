
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';

interface ChatProps {
  currentUser: User;
  allUsers: User[];
  messageStore: Record<string, Message[]>;
  activePartnerId?: string | null;
  onSendMessage: (partnerId: string, text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ currentUser, allUsers, messageStore, activePartnerId: externalPartnerId, onSendMessage }) => {
  const [activePartnerId, setActivePartnerId] = useState<string | null>(externalPartnerId || null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalPartnerId) setActivePartnerId(externalPartnerId);
  }, [externalPartnerId]);

  // Include admins in the chat list so users can reach support
  const partners = allUsers.filter(u => u.id !== currentUser.id);
  
  const threadKey = activePartnerId ? [currentUser.id, activePartnerId].sort().join('-') : '';
  const activeMessages = threadKey ? (messageStore[threadKey] || []) : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activePartnerId) return;
    onSendMessage(activePartnerId, inputText);
    setInputText('');
  };

  const getPartnerName = (id: string) => {
    const u = allUsers.find(u => u.id === id);
    if (u?.role === 'admin') return `🛡️ Platform Support (${u.name})`;
    return u?.name || 'Partner';
  };
  
  const getPartnerAvatar = (id: string) => allUsers.find(u => u.id === id)?.avatar;

  return (
    <div className="h-[calc(100vh-16rem)] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl flex overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Partner List */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-8 border-b border-slate-100 bg-white">
          <h3 className="text-xl font-black text-slate-900">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {partners.map(partner => {
            const tk = [currentUser.id, partner.id].sort().join('-');
            const thread = messageStore[tk] || [];
            const lastMsg = thread[thread.length - 1];
            const isAdmin = partner.role === 'admin';

            return (
              <button 
                key={partner.id} 
                onClick={() => setActivePartnerId(partner.id)}
                className={`w-full p-5 flex items-center gap-4 transition-all relative group ${
                  activePartnerId === partner.id ? 'bg-white shadow-lg z-10 scale-100' : 'hover:bg-white/50 opacity-70 hover:opacity-100'
                } ${isAdmin ? 'border-l-4 border-indigo-500 bg-indigo-50/20' : ''}`}
              >
                <div className="relative">
                  <img src={partner.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt="" />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className={`font-bold truncate text-sm ${isAdmin ? 'text-indigo-700' : 'text-slate-900'}`}>
                    {isAdmin ? 'Support' : partner.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{lastMsg?.text || (isAdmin ? 'Contact support' : 'No messages')}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Thread Area */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {activePartnerId ? (
          <>
            <div className="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={getPartnerAvatar(activePartnerId)} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{getPartnerName(activePartnerId)}</h4>
                  {allUsers.find(u => u.id === activePartnerId)?.role === 'admin' && (
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Platform Moderator</span>
                  )}
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm ${
                      msg.senderId === currentUser.id 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-900 rounded-bl-none border border-slate-100'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {activeMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                   <p className="text-sm font-bold">Start your conversation with {getPartnerName(activePartnerId)}!</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 py-4 px-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              />
              <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all">✈️</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <span className="text-6xl opacity-20">💬</span>
            <p className="font-medium">Select a contact to begin chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
