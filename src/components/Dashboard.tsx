import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { DashboardPage } from './DashboardPage';
import { PipelinePage } from './PipelinePage';
import { MeetingHistoryModal } from './MeetingHistoryModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import { FirebaseStatus } from './FirebaseStatus';
import { AuthModal } from './AuthModal';
import { MeetingCard as MeetingCardType } from '../types';
import { useMeetingCards } from '../hooks/useMeetingCards';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showMeetingHistory, setShowMeetingHistory] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MeetingCardType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 인증 상태 관리 (선택적 로그인)
  const { user, loading: authLoading, error: authError, clearError: clearAuthError } = useAuth();

  // 미팅 카드 데이터 관리 (조직 공유)
  const {
    cards,
    loading: cardsLoading,
    error: cardsError,
    isFirebaseConnected,
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
    handleStageChange,
    handleAddMeeting,
    clearError: clearCardsError
  } = useMeetingCards(user);

  const handleShowMeetingHistory = (card: MeetingCardType) => {
    setSelectedCard(card);
    setShowMeetingHistory(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    console.log('인증 성공');
  };

  const renderCurrentPage = () => {
    // 카드 데이터 로딩 중
    if (cardsLoading) {
      return <LoadingSpinner />;
    }

    // 페이지 렌더링
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage cards={cards} />;
      case 'pipeline':
        return (
          <PipelinePage
            cards={cards}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onStageChange={handleStageChange}
            onShowMeetingHistory={handleShowMeetingHistory}
          />
        );
      case 'analytics':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-gray-500 font-medium">분석 리포트 페이지</p>
              <p className="text-sm text-gray-400 mt-1">곧 출시 예정입니다</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <p className="text-gray-500 font-medium">설정 페이지</p>
              <p className="text-sm text-gray-400 mt-1">곧 출시 예정입니다</p>
            </div>
          </div>
        );
      default:
        return <DashboardPage cards={cards} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        onShowAuth={() => setShowAuthModal(true)}
      />
      
      {/* Firebase 연결 상태 표시 */}
      <FirebaseStatus isConnected={isFirebaseConnected} isSharedMode={true} />
      
      {/* 오류 알림 */}
      {authError && (
        <ErrorAlert 
          message={authError} 
          onClose={clearAuthError}
        />
      )}
      
      {cardsError && (
        <ErrorAlert 
          message={cardsError} 
          onClose={clearCardsError}
        />
      )}
      
      {renderCurrentPage()}
      
      {/* 미팅 히스토리 모달 */}
      <MeetingHistoryModal
        isOpen={showMeetingHistory}
        card={selectedCard}
        onClose={() => {
          setShowMeetingHistory(false);
          setSelectedCard(null);
        }}
        onAddMeeting={handleAddMeeting}
      />

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};