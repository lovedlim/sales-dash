import React, { useState, useMemo } from 'react';
import { Plus, Filter, Search, Grid, List, Eye, Calendar } from 'lucide-react';
import { StageColumn } from './StageColumn';
import { MeetingInput } from './MeetingInput';
import { EditModal } from './EditModal';
import { FilterPanel } from './FilterPanel';
import { ListView } from './ListView';
import { StageManager } from './StageManager';
import { DataExportButton } from './DataExportButton';
import { MeetingCard as MeetingCardType } from '../types';
import { stageConfigs } from '../data/mockData';

interface PipelinePageProps {
  cards: MeetingCardType[];
  onAddCard: (card: Omit<MeetingCardType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditCard: (card: MeetingCardType) => void;
  onDeleteCard: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
  onShowMeetingHistory?: (card: MeetingCardType) => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onStageChange,
  onShowMeetingHistory
}) => {
  const [showInput, setShowInput] = useState(false);
  const [editingCard, setEditingCard] = useState<MeetingCardType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // 필터링된 카드들
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = searchTerm === '' || 
        card.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.contactInfo?.name && card.contactInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.contactInfo?.email && card.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAssignee = selectedAssignee === '' || card.assignee === selectedAssignee;
      
      const matchesDateRange = (dateRange.start === '' || card.date >= dateRange.start) &&
        (dateRange.end === '' || card.date <= dateRange.end);
      
      const matchesStage = selectedStages.length === 0 || selectedStages.includes(card.stage);
      
      return matchesSearch && matchesAssignee && matchesDateRange && matchesStage;
    });
  }, [cards, searchTerm, selectedAssignee, dateRange, selectedStages]);

  const getStageCards = (stageId: string) => {
    return filteredCards.filter(card => card.stage === stageId);
  };

  const uniqueAssignees = [...new Set(cards.map(card => card.assignee))];

  const handleStageFilter = (stageId: string) => {
    setSelectedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const clearStageFilters = () => {
    setSelectedStages([]);
  };

  const stagesToDisplay = selectedStages.length > 0
    ? stageConfigs.filter(stage => selectedStages.includes(stage.id))
    : stageConfigs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">영업 파이프라인</h1>
          <p className="text-gray-600 mt-1">영업 기회를 단계별로 관리하고 추적하세요</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <DataExportButton cards={cards} />
          
          <button
            onClick={() => setShowStageManager(true)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
          >
            단계 관리
          </button>
          
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>새 기회 추가</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          dateRange={dateRange}
          setDateRange={setDateRange}
          assignees={uniqueAssignees}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Stage Filter Buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">단계별 필터</h3>
          </div>
          {selectedStages.length > 0 && (
            <button
              onClick={clearStageFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              전체 보기
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {stageConfigs.map((stage) => {
            const isSelected = selectedStages.includes(stage.id);
            const stageCount = getStageCards(stage.id).length;
            
            return (
              <button
                key={stage.id}
                onClick={() => handleStageFilter(stage.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${stage.bgColor} ${stage.color} border-current shadow-md`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{stage.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isSelected ? 'bg-white bg-opacity-30' : 'bg-gray-200'
                }`}>
                  {stageCount}
                </span>
              </button>
            );
          })}
        </div>
        
        {selectedStages.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">{selectedStages.length}개 단계</span>가 선택되었습니다. 
              총 <span className="font-bold">{filteredCards.length}개</span>의 기회가 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'kanban' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">칸반 보드</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>실시간 업데이트</span>
            </div>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {stagesToDisplay.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                cards={getStageCards(stage.id)}
                onEditCard={setEditingCard}
                onDeleteCard={onDeleteCard}
                onStageChange={onStageChange}
                onShowMeetingHistory={onShowMeetingHistory}
              />
            ))}
          </div>
        </div>
      ) : (
        <ListView
          cards={filteredCards}
          onEditCard={setEditingCard}
          onDeleteCard={onDeleteCard}
          onStageChange={onStageChange}
        />
      )}

      {/* Modals */}
      <MeetingInput
        isOpen={showInput}
        onClose={() => setShowInput(false)}
        onSave={onAddCard}
      />

      <EditModal
        isOpen={!!editingCard}
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onSave={onEditCard}
      />

      <StageManager
        isOpen={showStageManager}
        onClose={() => setShowStageManager(false)}
      />
    </div>
  );
};