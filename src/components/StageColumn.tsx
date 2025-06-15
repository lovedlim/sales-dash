import React from 'react';
import { MeetingCard } from './MeetingCard';
import { MeetingCard as MeetingCardType, StageConfig } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StageColumnProps {
  stage: StageConfig;
  cards: MeetingCardType[];
  onEditCard: (card: MeetingCardType) => void;
  onDeleteCard: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
  onShowMeetingHistory?: (card: MeetingCardType) => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  cards,
  onEditCard,
  onDeleteCard,
  onStageChange,
  onShowMeetingHistory
}) => {
  // 가상의 트렌드 데이터 (실제로는 이전 기간과 비교)
  const getTrendIcon = () => {
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable';
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getEstimatedValue = () => {
    // 단계별 예상 가치 계산
    const totalValue = cards.reduce((sum, card) => sum + (card.estimatedValue || 50000000), 0);
    return totalValue;
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000000) {
      return `${(value / 10000000).toFixed(0)}천만원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    } else {
      return `${value.toLocaleString()}원`;
    }
  };

  return (
    <div className="flex-1 min-w-72">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-gray-900 text-lg">{stage.title}</h2>
            {getTrendIcon()}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stage.bgColor} ${stage.color}`}>
              {cards.length}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
        
        {/* 예상 가치 표시 */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">예상 가치</span>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(getEstimatedValue())}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${stage.bgColor.replace('bg-', 'bg-').replace('-100', '-500')} transition-all duration-500`}
              style={{ 
                width: `${Math.min((cards.length / 10) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>
      
      <div 
        className="space-y-3 min-h-96 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200"
        style={{ minHeight: '500px' }}
      >
        {cards.map((card) => (
          <MeetingCard
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onStageChange={onStageChange}
            onShowHistory={onShowMeetingHistory}
            compact={true}
          />
        ))}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <div className={`w-16 h-16 ${stage.bgColor} rounded-2xl flex items-center justify-center mb-3 opacity-50`}>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm font-medium">기회가 없습니다</p>
            <p className="text-xs mt-1">새로운 기회를 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
};