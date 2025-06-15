import React, { useState } from 'react';
import { X, Plus, FileText, Loader2, AlertCircle, Sparkles, Brain, User, Mail, Phone, Building } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';
import { summarizeMeeting, validateApiKey } from '../services/openai';

interface MeetingInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<MeetingCardType, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const MeetingInput: React.FC<MeetingInputProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    assignee: '',
    content: '',
    stage: 'lead' as const,
    // 연락처 정보
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactPosition: '',
    contactCompany: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAiStage, setUseAiStage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // API 키 유효성 검사
    if (!validateApiKey()) {
      setError('OpenAI API 키가 설정되지 않았거나 올바르지 않습니다. .env 파일을 확인해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('AI 분석 시작 - 사용자 선택 단계:', formData.stage, '| AI 단계 사용:', useAiStage);
      
      // OpenAI API를 사용하여 실제 요약 생성
      const result = await summarizeMeeting(
        formData.content,
        formData.client,
        formData.assignee
      );

      console.log('AI 분석 완료:', result);

      // 사용자 설정에 따라 단계 결정
      const finalStage = useAiStage ? (result.stage || formData.stage) : formData.stage;
      
      console.log('최종 단계 결정:', {
        userSelected: formData.stage,
        aiSuggested: result.stage,
        useAiStage: useAiStage,
        final: finalStage
      });

      // 연락처 정보 구성
      const contactInfo = {
        name: formData.contactName || undefined,
        email: formData.contactEmail || undefined,
        phone: formData.contactPhone || undefined,
        position: formData.contactPosition || undefined,
        company: formData.contactCompany || formData.client
      };

      // 빈 값들 제거
      const cleanContactInfo = Object.fromEntries(
        Object.entries(contactInfo).filter(([_, value]) => value && value.trim() !== '')
      );

      const card = {
        client: formData.client,
        date: formData.date,
        assignee: formData.assignee,
        summary: result.summary,
        actionItems: result.actionItems,
        stage: finalStage as any,
        originalContent: formData.content, // 원문 저장
        contactInfo: Object.keys(cleanContactInfo).length > 0 ? cleanContactInfo : undefined
      };

      console.log('저장할 카드 데이터:', card);
      onSave(card);
      
      // 폼 초기화
      setFormData({
        client: '',
        date: new Date().toISOString().split('T')[0],
        assignee: '',
        content: '',
        stage: 'lead',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactPosition: '',
        contactCompany: ''
      });
      setUseAiStage(false);
      
      onClose();
    } catch (error) {
      console.error('요약 생성 오류:', error);
      setError(error instanceof Error ? error.message : '요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setUseAiStage(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">새로운 영업 기회 추가</h2>
              <p className="text-sm text-gray-500 mt-1">AI가 회의 내용을 분석하여 자동으로 요약합니다</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-8 mt-6 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-semibold">오류가 발생했습니다</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('API 키') && (
                <div className="mt-3 p-3 bg-red-100 rounded-xl text-xs text-red-600">
                  <p className="font-medium mb-1">해결 방법:</p>
                  <p>1. 프로젝트 루트의 .env 파일을 확인하세요</p>
                  <p>2. VITE_OPENAI_API_KEY=sk-... 형식으로 API 키를 입력하세요</p>
                  <p>3. 페이지를 새로고침하세요</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                고객사명 *
              </label>
              <input
                type="text"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="㈜가나다테크"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                미팅 날짜 *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                담당자 *
              </label>
              <input
                type="text"
                required
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="김영업"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                영업 단계 *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              >
                <option value="lead">리드발굴</option>
                <option value="consultation">상담진행</option>
                <option value="proposal">제안요청</option>
                <option value="contract">계약진행</option>
                <option value="completed">완료/보류</option>
              </select>
              
              {/* AI 단계 자동 분류 옵션 */}
              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useAiStage}
                    onChange={(e) => setUseAiStage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    AI가 회의 내용을 분석하여 단계를 자동으로 결정하도록 허용
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  {useAiStage 
                    ? "AI가 회의 내용을 분석하여 가장 적절한 단계를 선택합니다" 
                    : "위에서 선택한 단계가 그대로 사용됩니다"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">담당자 연락처 정보</h3>
                <p className="text-sm text-green-700">고객사 담당자의 연락처 정보를 입력하세요 (선택사항)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  담당자 이름
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  직책/부서
                </label>
                <input
                  type="text"
                  value={formData.contactPosition}
                  onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="IT팀 팀장"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  연락처
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="010-1234-5678"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              회의 내용 *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-lg"
              placeholder="회의에서 논의된 주요 내용을 자세히 입력해주세요. 고객의 요구사항, 예산, 일정, 의사결정자 정보 등을 포함하면 더 정확한 분석이 가능합니다..."
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">AI 분석 기능</p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  OpenAI GPT-4o-mini가 입력한 회의 내용을 분석하여:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• 핵심 내용을 간결하게 요약</li>
                  <li>• 구체적인 액션 아이템 추출</li>
                  <li>• 비즈니스 기회 우선순위 평가</li>
                  {useAiStage && <li>• 적절한 영업 단계 자동 분류</li>}
                </ul>
                <div className="mt-3 p-3 bg-blue-100 rounded-xl">
                  <p className="text-xs text-blue-800 font-medium">
                    {useAiStage 
                      ? "🤖 AI가 회의 내용을 분석하여 영업 단계를 자동으로 결정합니다"
                      : "👤 사용자가 선택한 영업 단계가 그대로 적용됩니다"
                    }
                  </p>
                </div>
                <div className="mt-2 p-3 bg-yellow-100 rounded-xl">
                  <p className="text-xs text-yellow-800 font-medium">
                    💾 회의 내용 원문과 연락처 정보가 함께 저장되어 나중에 참조할 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-4 text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>영업 기회 생성</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};