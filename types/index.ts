export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type ReportCategory = 'POTHOLE' | 'TRASH' | 'HAZARD' | 'OTHER';

export type Department = 'ROADS' | 'SANITATION' | 'EMERGENCY' | 'GENERAL';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  category: ReportCategory;
  description: string;
  lat: number;
  lng: number;
  photo_url: string | null;
  status: ReportStatus;
  department?: Department;
  priority_score?: number;
  vote_count?: number;
  assigned_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Vote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  reports: number;
  votes_received: number;
  rank?: number;
}

export interface AnalyticsSummary {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  avg_resolution_hours: number | null;
  by_category: { category: string; count: number }[];
}
