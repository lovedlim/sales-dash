import React, { useState } from 'react';
import { Calendar, User, CheckSquare, MoreHorizontal, Edit2, Trash2, Clock, DollarSign, History, Plus, UserCheck } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';

interface MeetingCardProps {
  card: MeetingCardType;
  onEdit: (card: MeetingCardType) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
  onShowHistory?: (card: MeetingCardType) => void;
  compact?: boolean;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ 
  card, 
  onEdit, 
  onDelete, 
  onStageChange, 
  onShowHistory,
  compact = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStageColor = (stage: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800 border-blue-200',
      consultation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      proposal: 'bg-purple-100 text-purple-800 border-purple-200',
      contract: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPriorityColor = () => {
    const daysSinceUpdate = Math.ceil((new Date().getTime() - new Date(card.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 7) return 'border-red-200 bg-red-50';
    if (daysSinceUpdate > 3) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억`;
    } else if (value >= 10000000) {
      return `${(value / 10000000).toFixed(0)}천만`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만`;
    } else {
      return `${value.toLocaleString()}`;
    }
  };

  const estimatedValue = card.estimatedValue || 50000000;
  const meetingCount = (card.meetingHistory?.length || 0) + 1; // 초기 미팅 포함

  if (compact) {
    return (
      <div className={`rounded-xl shadow-sm border p-4 hover:shadow-md transition-all duration-200 cursor-pointer group ${getPriorityColor()}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {card.client.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{card.client}</h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStageColor(card.stage)}`}>
                {getStageLabel(card.stage)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded-lg"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(card);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>수정</span>
                </button>
                {onShowHistory && (
                  <button
                    onClick={() => {
                      onShowHistory(card);
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <History className="w-3 h-3" />
                    <span>미팅 히스토리</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(card.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(card.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{card.assignee}</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600 font-medium">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(estimatedValue)}원</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckSquare className="w-3 h-3" />
            <span>{card.actionItems.length}개</span>
          </div>
        </div>

        {/* 미팅 횟수 표시 */}
        {meetingCount > 1 && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium mb-2">
            <History className="w-3 h-3" />
            <span>{meetingCount}차 미팅</span>
          </div>
        )}

        {/* 요약 */}
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 mb-2">{card.summary}</p>

        {/* 액션 아이템 미리보기 */}
        {card.actionItems.length > 0 && (
          <div className="border-t border-gray-100 pt-2">
            <div className="text-xs text-gray-500 mb-1">다음 액션</div>
            <div className="text-xs text-gray-700 line-clamp-1">
              • {card.actionItems[0]}
            </div>
            {card.actionItems.length > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                +{card.actionItems.length - 1}개 더...
              </div>
            )}
          </div>
        )}

        {/* 생성자/수정자 정보 */}
        {(card.createdBy || card.lastModifiedBy) && (
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {card.createdBy && (
                <div className="flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>생성: {card.createdBy.name}</span>
                </div>
              )}
              {card.lastModifiedBy && card.lastModifiedBy.uid !== card.createdBy?.uid && (
                <div className="flex items-center space-x-1">
                  <Edit2 className="w-3 h-3" />
                  <span>수정: {card.lastModifiedBy.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 다음 미팅 일정 */}
        {card.nextMeetingDate && (
          <div className="border-t border-gray-100 pt-2 mt-2">
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Plus className="w-3 h-3" />
              <span>다음 미팅: {formatDate(card.nextMeetingDate)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 기존 큰 카드 디자인
  return (
    <div className={`rounded-2xl shadow-sm border-2 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group ${getPriorityColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {card.client.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{card.client}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStageColor(card.stage)}`}>
                {getStageLabel(card.stage)}
              </span>
              {meetingCount > 1 && (
                <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  {meetingCount}차 미팅
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-xl"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  onEdit(card);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-3 h-3" />
                <span>수정</span>
              </button>
              {onShowHistory && (
                <button
                  onClick={() => {
                    onShowHistory(card);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <History className="w-3 h-3" />
                  <span>미팅 히스토리</span>
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(card.id);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>삭제</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(card.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{card.assignee}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>업데이트: {formatDate(card.updatedAt)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(estimatedValue)}원</span>
        </div>
      </div>

      {/* 요약 */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{card.summary}</p>
      </div>

      {/* 액션 아이템 */}
      {card.actionItems.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckSquare className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">액션 아이템</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {card.actionItems.length}
            </span>
          </div>
          <ul className="space-y-2">
            {card.actionItems.slice(0, 3).map((item, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {card.actionItems.length > 3 && (
              <li className="text-xs text-gray-500 pl-3.5">
                +{card.actionItems.length - 3}개 더...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 생성자/수정자 정보 */}
      {(card.createdBy || card.lastModifiedBy) && (
        <div className="border-t border-gray-100 pt-3 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {card.createdBy && (
              <div className="flex items-center space-x-1">
                <UserCheck className="w-3 h-3" />
                <span>생성자: {card.createdBy.name}</span>
              </div>
            )}
            {card.lastModifiedBy && card.lastModifiedBy.uid !== card.createdBy?.uid && (
              <div className="flex items-center space-x-1">
                <Edit2 className="w-3 h-3" />
                <span>수정자: {card.lastModifiedBy.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 다음 미팅 일정 */}
      {card.nextMeetingDate && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium">
            <Plus className="w-4 h-4" />
            <span>다음 미팅: {formatDate(card.nextMeetingDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};