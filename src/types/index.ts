export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export interface Program {
  id: number;
  title: string;
  description: string;
  image: string;
  features: string[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  startDate: string;
  endDate?: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
}

export interface Staff {
  id: number;
  name: string;
  position: string;
  subject: string;
  image: string;
  email?: string;
}

export interface OtherContent {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

export type TabType = 'announcements' | 'programs' | 'projects' | 'activities' | 'staff' | 'others';
