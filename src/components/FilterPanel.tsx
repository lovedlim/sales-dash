import React from 'react';
import { X, Filter, Calendar, User } from 'lucide-react';

interface FilterPanelProps {
  selectedAssignee: string;
  setSelectedAssignee: (assignee: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  assignees: string[];
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedAssignee,
  setSelectedAssignee,
  dateRange,
  setDateRange,
  assignees,
  onClose
}) => {
  const handleReset = () => {
    setSelectedAssignee('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">필터 옵션</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 담당자 필터 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>담당자</span>
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">전체 담당자</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 범위 필터 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>시작 날짜</span>
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>종료 날짜</span>
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            필터를 적용하여 원하는 데이터만 확인하세요
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              초기화
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};