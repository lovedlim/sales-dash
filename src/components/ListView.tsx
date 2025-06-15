import React from 'react';
import { Calendar, User, DollarSign, CheckSquare, Edit2, Trash2, Clock } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';

interface ListViewProps {
  cards: MeetingCardType[];
  onEditCard: (card: MeetingCardType) => void;
  onDeleteCard: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ cards, onEditCard, onDeleteCard, onStageChange }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStageColor = (stage: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      consultation: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      lead: '리드발굴',
      consultation: '상담진행',
      proposal: '제안요청',
      contract: '계약진행',
      completed: '완료/보류'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getEstimatedValue = (stage: string) => {
    const baseValue = 50000000;
    const stageMultiplier = {
      lead: 0.1,
      consultation: 0.3,
      proposal: 0.5,
      contract: 0.8,
      completed: 1.0
    };
    return Math.round(baseValue * (stageMultiplier[stage as keyof typeof stageMultiplier] || 0.1));
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억`;
    } else if (value >= 10000000) {
      return `${(value / 10000000).toFixed(0)}천만`;
    } else {
      return `${(value / 10000).toFixed(0)}만`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">영업 기회 목록</h2>
        <p className="text-sm text-gray-500 mt-1">총 {cards.length}개의 기회</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">고객사</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">단계</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">담당자</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">날짜</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">예상가치</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">액션</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {card.client.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{card.client}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{card.summary}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(card.stage)}`}>
                    {getStageLabel(card.stage)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{card.assignee}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(card.date)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{formatCurrency(getEstimatedValue(card.stage))}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{card.actionItems.length}개</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-500 font-medium">표시할 기회가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">필터를 조정하거나 새로운 기회를 추가해보세요</p>
        </div>
      )}
    </div>
  );
};