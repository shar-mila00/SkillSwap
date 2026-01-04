
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added password field
  location: string;
  bio: string;
  role: UserRole;
  avatar: string;
  skillsOffered: Skill[];
  skillsRequested: Skill[];
  rating: number;
  reviewCount: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export type SkillCategory = 
  | 'Programming' 
  | 'Music' 
  | 'Design' 
  | 'Marketing' 
  | 'Languages' 
  | 'Cooking' 
  | 'Business'
  | 'Game'
  | 'Art';

export type SessionStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

export interface Session {
  id: string;
  requesterId: string;
  providerId: string;
  skillId: string;
  date: string;
  time: string; 
  endTime: string;
  status: SessionStatus;
  notes?: string;
  requesterReviewed?: boolean;
  providerReviewed?: boolean;
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Review {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'session' | 'system';
  read: boolean;
  timestamp: number;
  metadata?: {
    partnerId?: string;
  };
}
