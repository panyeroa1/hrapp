
export interface StreamState {
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
  volume: number; // 0-1 for visualization
}

export type LiveConfig = {
  model: string;
  systemInstruction: string;
  voiceName: string;
};

export interface ApplicantData {
  id: string; // Added ID for tracking
  name: string;
  email: string;
  role: string;
  experience: string;
  timestamp: number;
}

export interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface InterviewReport {
  applicantId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  score: number; // 1-100
  recommendation: 'HIRE' | 'CONSIDER' | 'PASS';
  transcript: TranscriptItem[];
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements: string[];
  salaryRange: string;
  status: 'Active' | 'Closed' | 'Draft';
  postedAt: number;
}

export type AppStep = 'landing' | 'login' | 'admin' | 'applicant-form' | 'interview' | 'thank-you';
