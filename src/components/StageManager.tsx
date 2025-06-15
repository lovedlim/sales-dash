import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, GripVertical } from 'lucide-react';
import { StageConfig, SalesStage } from '../types';
import { stageConfigs } from '../data/mockData';

interface StageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StageManager: React.FC<StageManagerProps> = ({ isOpen, onClose }) => {
  const [stages, setStages] = useState<StageConfig[]>(stageConfigs);
  const [editingStage, setEditingStage] = useState<StageConfig | null>(null);
  const [newStage, setNewStage] = useState({
    title: '',
    description: '',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  });

  const colorOptions = [
    { color: 'text-blue-700', bgColor: 'bg-blue-100', label: '파란색' },
    { color: 'text-green-700', bgColor: 'bg-green-100', label: '초록색' },
    { color: 'text-purple-700', bgColor: 'bg-purple-100', label: '보라색' },
    { color: 'text-orange-700', bgColor: 'bg-orange-100', label: '주황색' },
    { color: 'text-red-700', bgColor: 'bg-red-100', label: '빨간색' },
    { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: '노란색' },
    { color: 'text-pink-700', bgColor: 'bg-pink-100', label: '분홍색' },
    { color: 'text-indigo-700', bgColor: 'bg-indigo-100', label: '인디고' }
  ];

  const handleSaveStage = () => {
    if (editingStage) {
      setStages(stages.map(stage => 
        stage.id === editingStage.id ? editingStage : stage
      ));
      setEditingStage(null);
    }
  };

  const handleAddStage = () => {
    if (newStage.title && newStage.description) {
      const id = `custom_${Date.now()}` as SalesStage;
      const stage: StageConfig = {
        id,
        title: newStage.title,
        description: newStage.description,
        color: newStage.color,
        bgColor: newStage.bgColor,
        editable: true
      };
      setStages([...stages, stage]);
      setNewStage({
        title: '',
        description: '',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100'
      });
    }
  };

  const handleDeleteStage = (stageId: SalesStage) => {
    setStages(stages.filter(stage => stage.id !== stageId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">영업 단계 관리</h2>
            <p className="text-sm text-gray-500 mt-1">영업 프로세스에 맞게 단계를 커스터마이징하세요</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {/* 기존 단계 목록 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">현재 영업 단계</h3>
            <div className="space-y-3">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="cursor-move">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className={`px-3 py-1 rounded-lg ${stage.bgColor} ${stage.color} font-medium`}>
                    {stage.title}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{stage.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingStage(stage)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {stage.editable && (
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 새 단계 추가 */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 단계 추가</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  단계 이름
                </label>
                <input
                  type="text"
                  value={newStage.title}
                  onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 계약 검토"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상 선택
                </label>
                <select
                  value={`${newStage.color}|${newStage.bgColor}`}
                  onChange={(e) => {
                    const [color, bgColor] = e.target.value.split('|');
                    setNewStage({ ...newStage, color, bgColor });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {colorOptions.map((option) => (
                    <option key={option.label} value={`${option.color}|${option.bgColor}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={newStage.description}
                onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="이 단계에 대한 설명을 입력하세요"
              />
            </div>
            <button
              onClick={handleAddStage}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>단계 추가</span>
            </button>
          </div>
        </div>

        {/* 편집 모달 */}
        {editingStage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">단계 편집</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    단계 이름
                  </label>
                  <input
                    type="text"
                    value={editingStage.title}
                    onChange={(e) => setEditingStage({ ...editingStage, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={editingStage.description}
                    onChange={(e) => setEditingStage({ ...editingStage, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    색상
                  </label>
                  <select
                    value={`${editingStage.color}|${editingStage.bgColor}`}
                    onChange={(e) => {
                      const [color, bgColor] = e.target.value.split('|');
                      setEditingStage({ ...editingStage, color, bgColor });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.label} value={`${option.color}|${option.bgColor}`}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingStage(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveStage}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>저장</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};