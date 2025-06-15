import React, { useState } from 'react';
import { Download, FileText, Database, Loader2 } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';

interface DataExportButtonProps {
  cards: MeetingCardType[];
}

export const DataExportButton: React.FC<DataExportButtonProps> = ({ cards }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString() + '원';
  };

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // CSV 헤더
      const headers = [
        'ID',
        '고객사명',
        '미팅날짜',
        '담당자',
        '영업단계',
        '요약',
        '액션아이템',
        '예상가치',
        '생성일',
        '수정일',
        '담당자이름',
        '담당자이메일',
        '담당자연락처',
        '담당자직책',
        '회의내용원문',
        '미팅횟수'
      ];

      // CSV 데이터
      const csvData = cards.map(card => {
        const contactInfo = card.contactInfo || {};
        const meetingCount = (card.meetingHistory?.length || 0) + 1;
        
        return [
          card.id,
          card.client,
          formatDate(card.date),
          card.assignee,
          getStageLabel(card.stage),
          `"${card.summary.replace(/"/g, '""')}"`, // CSV 이스케이프
          `"${card.actionItems.join('; ').replace(/"/g, '""')}"`,
          card.estimatedValue || 50000000,
          formatDate(card.createdAt),
          formatDate(card.updatedAt),
          contactInfo.name || '',
          contactInfo.email || '',
          contactInfo.phone || '',
          contactInfo.position || '',
          `"${(card.originalContent || '').replace(/"/g, '""')}"`,
          meetingCount
        ];
      });

      // CSV 문자열 생성
      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 다운로드
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `영업데이터_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('CSV 내보내기 오류:', error);
      alert('데이터 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    try {
      // JSON 데이터 준비
      const exportData = {
        exportDate: new Date().toISOString(),
        totalCards: cards.length,
        data: cards.map(card => ({
          ...card,
          meetingCount: (card.meetingHistory?.length || 0) + 1,
          stageLabel: getStageLabel(card.stage)
        }))
      };

      // JSON 문자열 생성
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // 다운로드
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `영업데이터_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('JSON 내보내기 오류:', error);
      alert('데이터 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
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

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
        disabled={isExporting || cards.length === 0}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>내보내는 중...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>데이터 내보내기</span>
          </>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <button
          onClick={exportToCSV}
          disabled={isExporting || cards.length === 0}
          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 text-green-600" />
          <div className="text-left">
            <div className="font-medium">CSV 파일</div>
            <div className="text-xs text-gray-500">Excel에서 열기 가능</div>
          </div>
        </button>
        
        <button
          onClick={exportToJSON}
          disabled={isExporting || cards.length === 0}
          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database className="w-4 h-4 text-blue-600" />
          <div className="text-left">
            <div className="font-medium">JSON 파일</div>
            <div className="text-xs text-gray-500">완전한 데이터 백업</div>
          </div>
        </button>

        <div className="border-t border-gray-200 mt-2 pt-2 px-4">
          <div className="text-xs text-gray-500">
            총 {cards.length}개의 영업 기회
          </div>
          <div className="text-xs text-gray-500">
            연락처 정보 및 원문 포함
          </div>
        </div>
      </div>
    </div>
  );
};