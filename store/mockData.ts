
import { User, Skill, Session } from "../types";

export const MOCK_SKILLS: Skill[] = [
  { id: 's1', name: 'React Development', category: 'Programming' },
  { id: 's2', name: 'Python Basics', category: 'Programming' },
  { id: 's3', name: 'UI Design', category: 'Design' },
  { id: 's4', name: 'Acoustic Guitar', category: 'Music' },
  { id: 's5', name: 'Digital Marketing', category: 'Marketing' },
  { id: 's6', name: 'French Level B2', category: 'Languages' },
  { id: 's7', name: 'Sushi Making', category: 'Cooking' },
  { id: 's8', name: 'Project Management', category: 'Business' },
  { id: 's9', name: 'TypeScript', category: 'Programming' },
  { id: 's10', name: 'Logo Design', category: 'Design' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
    location: 'San Francisco, CA',
    bio: 'Full-stack developer looking to pick up some acoustic guitar skills and improve my conversational French for my next trip to Paris.',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    skillsOffered: [MOCK_SKILLS[0], MOCK_SKILLS[1], MOCK_SKILLS[8]],
    skillsRequested: [MOCK_SKILLS[3], MOCK_SKILLS[5]],
    rating: 4.8,
    reviewCount: 12
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: 'password123',
    location: 'Vancouver, BC',
    bio: 'Passionate UI designer and hobbyist sushi chef. I want to learn React to bring my design visions to life independently.',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skillsOffered: [MOCK_SKILLS[2], MOCK_SKILLS[6], MOCK_SKILLS[9]],
    skillsRequested: [MOCK_SKILLS[0]],
    rating: 4.9,
    reviewCount: 8
  },
  {
    id: 'u3',
    name: 'Marc Dubois',
    email: 'marc@example.com',
    password: 'password123',
    location: 'Paris, FR',
    bio: 'Native French speaker and digital marketing expert. Looking to pick up some sushi making tips and basic coding skills.',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marc',
    skillsOffered: [MOCK_SKILLS[5], MOCK_SKILLS[4]],
    skillsRequested: [MOCK_SKILLS[6], MOCK_SKILLS[1]],
    rating: 4.5,
    reviewCount: 5
  },
  {
    id: 'admin1',
    name: 'Platform Admin',
    email: 'admin@skillswap.com',
    password: 'admin',
    location: 'Remote',
    bio: 'Official SkillSwap Pro Administrator. Monitoring the platform for quality and safety.',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    skillsOffered: [],
    skillsRequested: [],
    rating: 5.0,
    reviewCount: 0
  }
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess1',
    requesterId: 'u2',
    providerId: 'u1',
    skillId: 's1',
    date: '2023-12-01',
    time: '14:00',
    endTime: '15:20',
    status: 'Completed',
    notes: 'Great introduction to React functional components and hooks.'
  },
  {
    id: 'sess2',
    requesterId: 'u1',
    providerId: 'u3',
    skillId: 's5',
    date: '2023-12-15',
    time: '10:00',
    endTime: '11:20',
    status: 'Approved',
  }
];
