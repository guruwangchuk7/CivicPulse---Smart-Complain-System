export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type ReportCategory = 'POTHOLE' | 'TRASH' | 'HAZARD' | 'OTHER';

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
  created_at: string;
  updated_at?: string;
}

export interface Vote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}
