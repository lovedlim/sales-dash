import React, { useState } from 'react';
import { X, Plus, Calendar, Users, FileText, TrendingUp, MessageSquare, Sparkles, Brain, Loader2, AlertCircle } from 'lucide-react';
import { MeetingCard as MeetingCardType, MeetingHistory } from '../types';
import { summarizeMeeting, validateApiKey } from '../services/openai';

interface MeetingHistoryModalProps {
  isOpen: boolean;
  card: MeetingCardType | null;
  onClose: () => void;
  onAddMeeting: (cardId: string, meeting: Omit<MeetingHistory, 'id'>) => void;
}

export const MeetingHistoryModal: React.FC<MeetingHistoryModalProps> = ({
  isOpen,
  card,
  onClose,
  onAddMeeting
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [useAiAnalysis, setUseAiAnalysis] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [meetingContent, setMeetingContent] = useState('');
  
  const [newMeeting, setNewMeeting] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'follow-up' as const,
    summary: '',
    actionItems: [''],
    attendees: [''],
    outcome: 'neutral' as const,
    nextSteps: ['']
  });

  const meetingTypes = {
    'initial': '초기 미팅',
    'follow-up': '후속 미팅',
    'proposal': '제안 미팅',
    'negotiation': '협상 미팅',
    'closing': '클로징 미팅'
  };

  const outcomeColors = {
    'positive': 'bg-green-100 text-green-800',
    'neutral': 'bg-yellow-100 text-yellow-800',
    'negative': 'bg-red-100 text-red-800'
  };

  const outcomeLabels = {
    'positive': '긍정적',
    'neutral': '보통',
    'negative': '부정적'
  };

  const handleAiAnalysis = async () => {
    if (!meetingContent.trim() || !card) return;
    
    if (!validateApiKey()) {
      setAiError('OpenAI API 키가 설정되지 않았거나 올바르지 않습니다.');
      return;
    }

    setIsProcessingAi(true);
    setAiError(null);

    try {
      const result = await summarizeMeeting(
        meetingContent,
        card.client,
        card.assignee
      );

      // AI 분석 결과를 폼에 적용
      setNewMeeting(prev => ({
        ...prev,
        summary: result.summary,
        actionItems: result.actionItems.length > 0 ? result.actionItems : [''],
        nextSteps: result.actionItems.length > 0 ? [result.actionItems[0]] : ['']
      }));

      console.log('AI 분석 완료:', result);
    } catch (error) {
      console.error('AI 분석 오류:', error);
      setAiError(error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleAddMeeting = () => {
    if (!card || (!newMeeting.summary && !meetingContent)) return;

    const meeting = {
      ...newMeeting,
      actionItems: newMeeting.actionItems.filter(item => item.trim() !== ''),
      attendees: newMeeting.attendees.filter(attendee => attendee.trim() !== ''),
      nextSteps: newMeeting.nextSteps.filter(step => step.trim() !== ''),
      originalContent: useAiAnalysis ? meetingContent : undefined // 원문 저장
    };

    onAddMeeting(card.id, meeting);
    
    // 폼 초기화
    resetForm();
  };

  const addArrayItem = (field: 'actionItems' | 'attendees' | 'nextSteps') => {
    setNewMeeting({
      ...newMeeting,
      [field]: [...newMeeting[field], '']
    });
  };

  const updateArrayItem = (field: 'actionItems' | 'attendees' | 'nextSteps', index: number, value: string) => {
    const newArray = [...newMeeting[field]];
    newArray[index] = value;
    setNewMeeting({
      ...newMeeting,
      [field]: newArray
    });
  };

  const removeArrayItem = (field: 'actionItems' | 'attendees' | 'nextSteps', index: number) => {
    setNewMeeting({
      ...newMeeting,
      [field]: newMeeting[field].filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setShowAddForm(false);
    setUseAiAnalysis(false);
    setMeetingContent('');
    setAiError(null);
    setNewMeeting({
      date: new Date().toISOString().split('T')[0],
      type: 'follow-up',
      summary: '',
      actionItems: [''],
      attendees: [''],
      outcome: 'neutral',
      nextSteps: ['']
    });
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{card.client} - 미팅 히스토리</h2>
            <p className="text-sm text-gray-500 mt-1">모든 미팅 기록과 진행 상황을 확인하세요</p>
            
            {/* 연락처 정보 표시 */}
            {card.contactInfo && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex flex-wrap gap-4 text-sm">
                  {card.contactInfo.name && (
                    <span className="text-green-800">
                      <strong>담당자:</strong> {card.contactInfo.name}
                    </span>
                  )}
                  {card.contactInfo.position && (
                    <span className="text-green-800">
                      <strong>직책:</strong> {card.contactInfo.position}
                    </span>
                  )}
                  {card.contactInfo.email && (
                    <span className="text-green-800">
                      <strong>이메일:</strong> {card.contactInfo.email}
                    </span>
                  )}
                  {card.contactInfo.phone && (
                    <span className="text-green-800">
                      <strong>연락처:</strong> {card.contactInfo.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8">
          {/* 초기 미팅 정보 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">초기 미팅 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">미팅 날짜:</span>
                <span className="ml-2 text-blue-700">{new Date(card.date).toLocaleDateString('ko-KR')}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">담당자:</span>
                <span className="ml-2 text-blue-700">{card.assignee}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-blue-800">요약:</span>
                <p className="mt-1 text-blue-700">{card.summary}</p>
              </div>
              {card.originalContent && (
                <div className="md:col-span-2">
                  <details className="mt-2">
                    <summary className="font-medium text-blue-800 cursor-pointer hover:text-blue-900">
                      회의 내용 원문 보기
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{card.originalContent}</p>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* 미팅 히스토리 타임라인 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">미팅 타임라인</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>새 미팅 추가</span>
              </button>
            </div>

            {card.meetingHistory && card.meetingHistory.length > 0 ? (
              <div className="space-y-6">
                {card.meetingHistory.map((meeting, index) => (
                  <div key={meeting.id} className="relative">
                    {index !== card.meetingHistory!.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-900">
                              {meetingTypes[meeting.type]}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${outcomeColors[meeting.outcome]}`}>
                              {outcomeLabels[meeting.outcome]}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(meeting.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{meeting.summary}</p>
                        
                        {/* 원문 보기 */}
                        {meeting.originalContent && (
                          <details className="mb-4">
                            <summary className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                              회의 내용 원문 보기
                            </summary>
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.originalContent}</p>
                            </div>
                          </details>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {meeting.attendees.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                참석자
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {meeting.attendees.map((attendee, i) => (
                                  <li key={i}>• {attendee}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {meeting.actionItems.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                액션 아이템
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {meeting.actionItems.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {meeting.nextSteps.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                다음 단계
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {meeting.nextSteps.map((step, i) => (
                                  <li key={i}>• {step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">아직 미팅 기록이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">첫 번째 미팅을 추가해보세요</p>
              </div>
            )}
          </div>

          {/* 새 미팅 추가 폼 */}
          {showAddForm && (
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">새 미팅 추가</h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AI 분석 옵션 */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900">AI 미팅 분석</h4>
                    <p className="text-sm text-blue-700">회의 내용을 입력하면 AI가 자동으로 요약과 액션 아이템을 생성합니다</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={useAiAnalysis}
                      onChange={(e) => setUseAiAnalysis(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-900">
                      AI 분석 사용하기
                    </span>
                  </label>

                  {useAiAnalysis && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          회의 내용 *
                        </label>
                        <textarea
                          value={meetingContent}
                          onChange={(e) => setMeetingContent(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="회의에서 논의된 주요 내용을 자세히 입력해주세요..."
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          💾 입력한 회의 내용 원문이 함께 저장됩니다
                        </p>
                      </div>

                      {aiError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-800 font-medium">AI 분석 오류</p>
                            <p className="text-sm text-red-700 mt-1">{aiError}</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleAiAnalysis}
                        disabled={!meetingContent.trim() || isProcessingAi}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessingAi ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>AI 분석 중...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            <span>AI 분석 실행</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    미팅 날짜
                  </label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    미팅 유형
                  </label>
                  <select
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(meetingTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    미팅 결과
                  </label>
                  <select
                    value={newMeeting.outcome}
                    onChange={(e) => setNewMeeting({ ...newMeeting, outcome: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(outcomeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미팅 요약 {useAiAnalysis && <span className="text-blue-600">(AI 자동 생성)</span>}
                </label>
                <textarea
                  value={newMeeting.summary}
                  onChange={(e) => setNewMeeting({ ...newMeeting, summary: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={useAiAnalysis ? "AI가 자동으로 생성합니다" : "미팅에서 논의된 주요 내용을 입력하세요"}
                  readOnly={useAiAnalysis && isProcessingAi}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* 참석자 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    참석자
                  </label>
                  <div className="space-y-2">
                    {newMeeting.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={attendee}
                          onChange={(e) => updateArrayItem('attendees', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="참석자 이름"
                        />
                        {newMeeting.attendees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('attendees', index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('attendees')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + 참석자 추가
                    </button>
                  </div>
                </div>
                
                {/* 액션 아이템 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    액션 아이템 {useAiAnalysis && <span className="text-blue-600">(AI 자동 생성)</span>}
                  </label>
                  <div className="space-y-2">
                    {newMeeting.actionItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateArrayItem('actionItems', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="액션 아이템"
                          readOnly={useAiAnalysis && isProcessingAi}
                        />
                        {newMeeting.actionItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('actionItems', index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('actionItems')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + 액션 아이템 추가
                    </button>
                  </div>
                </div>
                
                {/* 다음 단계 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다음 단계
                  </label>
                  <div className="space-y-2">
                    {newMeeting.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateArrayItem('nextSteps', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="다음 단계"
                        />
                        {newMeeting.nextSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('nextSteps', index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('nextSteps')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + 다음 단계 추가
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddMeeting}
                  disabled={!newMeeting.summary && !meetingContent}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  미팅 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};