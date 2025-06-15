export interface MeetingCard {
  id: string;
  client: string;
  date: string;
  assignee: string;
  summary: string;
  actionItems: string[];
  stage: SalesStage;
  createdAt: string;
  updatedAt: string;
  estimatedValue?: number;
  meetingHistory?: MeetingHistory[];
  nextMeetingDate?: string;
  priority?: 'high' | 'medium' | 'low';
  // 새로 추가된 필드들
  contactInfo?: ContactInfo;
  originalContent?: string; // 회의 내용 원문
  // 조직 공유를 위한 사용자 정보
  createdBy?: UserInfo;
  lastModifiedBy?: UserInfo;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
}

export interface UserInfo {
  uid: string;
  name: string;
  email: string;
}

export interface MeetingHistory {
  id: string;
  date: string;
  type: 'initial' | 'follow-up' | 'proposal' | 'negotiation' | 'closing';
  summary: string;
  actionItems: string[];
  attendees: string[];
  outcome: 'positive' | 'neutral' | 'negative';
  nextSteps: string[];
  originalContent?: string; // 미팅 히스토리에도 원문 저장
}

export type SalesStage = 'lead' | 'consultation' | 'proposal' | 'contract' | 'completed';

export interface StageConfig {
  id: SalesStage;
  title: string;
  color: string;
  bgColor: string;
  description: string;
  editable?: boolean;
}

export interface CustomStage {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  description: string;
  order: number;
}

// 사용자 관련 타입 추가
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  company?: string;
  position?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}