import { MeetingCard, StageConfig } from '../types';

export const stageConfigs: StageConfig[] = [
  {
    id: 'lead',
    title: '리드발굴',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: '잠재 고객 발굴 및 초기 접촉'
  },
  {
    id: 'consultation',
    title: '상담진행',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: '고객 니즈 파악 및 상담 진행'
  },
  {
    id: 'proposal',
    title: '제안요청',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: '견적서 및 제안서 요청'
  },
  {
    id: 'contract',
    title: '계약진행',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: '계약 협상 및 최종 검토'
  },
  {
    id: 'completed',
    title: '완료/보류',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: '계약 완료 또는 보류'
  }
];

// 샘플 데이터 제거 - 빈 배열로 시작
export const mockCards: MeetingCard[] = [];