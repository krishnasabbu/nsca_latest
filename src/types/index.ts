export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'coach' | 'student' | 'support';
  age?: string;
  batch?: string;
  batchId?: string;
  fatherName?: string;
  motherName?: string;
  altPhone?: string;
  coachingType?: 'Normal' | 'Special';
  monthlyFee?: number;
  specialization?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  avatar?: string;
  skillLevel?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  fitnessLevel?: string;
  experience?: string;
  rating?: number;
  studentsCount?: number;
  permissions?: string[];
  assignedCoachId?: string;
  isFirstLogin?: boolean;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  coach: string;
  coachId: string;
  schedule: string;
  status: 'active' | 'inactive';
}

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'photo' | 'document';
  url: string;
  thumbnailUrl?: string;
  uploadDate: string;
  uploadedBy: string;
  batchId?: string;
  tags?: string[];
}

export interface Session {
  id: string;
  batchId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  coachId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Attendance {
  id: string;
  date: string;
  userId: string;
  userName?: string;
  batchId: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  remarks?: string;
}

export interface YoyoTestResult {
  id: string;
  userId: string;
  userName?: string;
  testDate: string;
  level: number;
  shuttles: number;
  distance: number;
  score: number;
  remarks?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  date: string;
  type: 'fee' | 'salary';
  status: 'paid' | 'pending' | 'overdue';
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  userid: string;
  name: string;
  phone: string;
  amount: number;
  paidType: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  date: string;
  remarks?: string;
}

export interface Analytics {
  totalRevenue: number;
  activeStudents: number;
  sessionsThisMonth: number;
  growthRate: number;
}
