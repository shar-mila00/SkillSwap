
import React from 'react';
import { User, Session, SessionStatus, Skill } from '../types';

interface SessionsProps {
  currentUser: User;
  sessions: Session[];
  onUpdateStatus: (id: string, status: SessionStatus) => void;
  onOpenReview: (session: Session) => void;
  allSkills: Skill[];
  allUsers: User[];
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const Sessions: React.FC<SessionsProps> = ({ currentUser, sessions, onUpdateStatus, onOpenReview, allSkills, allUsers }) => {
  const mySessions = sessions.filter(s => s.requesterId === currentUser.id || s.providerId === currentUser.id);

  const getPartner = (session: Session) => {
    const partnerId = session.requesterId === currentUser.id ? session.providerId : session.requesterId;
    return allUsers.find(u => u.id === partnerId);
  };

  const getSkill = (id: string) => allSkills.find(s => s.id === id);

  const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
    const colors = {
      Pending: 'bg-amber-100 text-amber-700',
      Approved: 'bg-indigo-100 text-indigo-700',
      Completed: 'bg-emerald-100 text-emerald-700',
      Cancelled: 'bg-rose-100 text-rose-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Learning Sessions</h3>
      </div>

      <div className="space-y-4">
        {mySessions.length > 0 ? (
          mySessions.map((session) => {
            const partner = getPartner(session);
            const skill = getSkill(session.skillId);
            const isRequester = session.requesterId === currentUser.id;
            const hasReviewed = isRequester ? session.requesterReviewed : session.providerReviewed;

            return (
              <div key={session.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <img src={partner?.avatar} className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-50 shadow-sm" alt={partner?.name} />
                  <div>
                    <h4 className="font-bold text-slate-900">{partner?.name}</h4>
                    <p className="text-slate-500 text-xs">
                      {isRequester ? `Learning ${skill?.name} from ${partner?.name}` : `Teaching ${skill?.name} to ${partner?.name}`}
                    </p>
                  </div>
                </div>

                <div className="md:px-10 border-slate-100 md:border-x">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-semibold text-sm">
                      {formatDisplayDate(session.date)}
                    </span>
                    <span className="text-indigo-600 font-bold text-xs">
                      {session.time} — {session.endTime || 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <StatusBadge status={session.status} />
                  
                  <div className="flex gap-2">
                    {session.status === 'Pending' && !isRequester && (
                      <button
                        onClick={() => onUpdateStatus(session.id, 'Approved')}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
                      >
                        Accept
                      </button>
                    )}
                    
                    {(session.status === 'Pending' || session.status === 'Approved') && (
                      <button
                        onClick={() => onUpdateStatus(session.id, 'Cancelled')}
                        className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-rose-50 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {session.status === 'Approved' && (
                      <button
                        onClick={() => onUpdateStatus(session.id, 'Completed')}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        Complete
                      </button>
                    )}

                    {session.status === 'Completed' && !hasReviewed && (
                      <button
                        onClick={() => onOpenReview(session)}
                        className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 shadow-sm transition-all flex items-center gap-2"
                      >
                        ⭐ Rate Partner
                      </button>
                    )}

                    {session.status === 'Completed' && hasReviewed && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase italic px-4 py-2">
                        Review Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">No sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
