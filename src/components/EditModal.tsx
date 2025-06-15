import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';

interface EditModalProps {
  isOpen: boolean;
  card: MeetingCardType | null;
  onClose: () => void;
  onSave: (card: MeetingCardType) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, card, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client: '',
    date: '',
    assignee: '',
    summary: '',
    actionItems: [''],
    stage: 'lead' as const
  });

  useEffect(() => {
    if (card) {
      setFormData({
        client: card.client,
        date: card.date,
        assignee: card.assignee,
        summary: card.summary,
        actionItems: card.actionItems.length > 0 ? card.actionItems : [''],
        stage: card.stage
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    const updatedCard = {
      ...card,
      client: formData.client,
      date: formData.date,
      assignee: formData.assignee,
      summary: formData.summary,
      actionItems: formData.actionItems.filter(item => item.trim() !== ''),
      stage: formData.stage,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedCard);
    onClose();
  };

  const addActionItem = () => {
    setFormData({
      ...formData,
      actionItems: [...formData.actionItems, '']
    });
  };

  const removeActionItem = (index: number) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.filter((_, i) => i !== index)
    });
  };

  const updateActionItem = (index: number, value: string) => {
    const newActionItems = [...formData.actionItems];
    newActionItems[index] = value;
    setFormData({
      ...formData,
      actionItems: newActionItems
    });
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">카드 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객사명
              </label>
              <input
                type="text"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미팅 날짜
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자
              </label>
              <input
                type="text"
                required
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                영업 단계
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="lead">리드발굴</option>
                <option value="consultation">상담진행</option>
                <option value="proposal">제안요청</option>
                <option value="contract">계약진행</option>
                <option value="completed">완료/보류</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요약
            </label>
            <textarea
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              액션 아이템
            </label>
            <div className="space-y-2">
              {formData.actionItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateActionItem(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="액션 아이템을 입력하세요"
                  />
                  {formData.actionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActionItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addActionItem}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + 액션 아이템 추가
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};