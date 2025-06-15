import { useState, useEffect } from 'react';
import { MeetingCard as MeetingCardType, MeetingHistory } from '../types';
import { 
  addMeetingCard, 
  updateMeetingCard, 
  deleteMeetingCard, 
  subscribeMeetingCards,
  addMeetingHistory,
  checkFirebaseConnection,
  getAllMeetingCards,
  testFirebaseConnection
} from '../services/firebase';

export const useMeetingCards = (user?: { uid: string; displayName?: string; email: string } | null) => {
  const [cards, setCards] = useState<MeetingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Firebase 연결 상태 확인
        const firebaseConnected = checkFirebaseConnection();
        setIsFirebaseConnected(firebaseConnected);
        
        if (firebaseConnected) {
          console.log('Firebase 연결됨 - 조직 공유 데이터 로딩 시작');
          
          // Firebase 연결 테스트
          await testFirebaseConnection();
          
          // 먼저 기존 데이터를 한 번 가져오기
          try {
            const existingCards = await getAllMeetingCards();
            console.log('조직 공유 기존 데이터 로딩 완료:', existingCards.length, '개');
            setCards(existingCards);
          } catch (loadError) {
            console.error('조직 공유 기존 데이터 로딩 실패:', loadError);
          }
          
          // 실시간 데이터 구독 시작
          const unsubscribe = subscribeMeetingCards((firebaseCards) => {
            console.log('조직 공유 실시간 데이터 업데이트:', firebaseCards.length, '개');
            setCards(firebaseCards);
            setLoading(false);
          });
          
          // 컴포넌트 언마운트 시 구독 해제
          return () => {
            console.log('조직 공유 Firebase 구독 해제');
            unsubscribe();
          };
        } else {
          // Firebase 연결 안됨 - 빈 배열로 시작
          console.log('Firebase 연결 안됨 - 오프라인 모드');
          setCards([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('데이터 초기화 오류:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
        setCards([]); // 오류 시 빈 배열
        setLoading(false);
      }
    };

    initializeData();
  }, []); // user 의존성 제거 - 조직 공유 모드에서는 사용자와 무관

  const handleAddCard = async (newCard: Omit<MeetingCardType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isFirebaseConnected) {
        console.log('Firebase에 조직 공유 카드 추가:', newCard.client, 'User:', user?.displayName || user?.email);
        await addMeetingCard(newCard, user || undefined);
        // 실시간 구독으로 자동 업데이트됨
      } else {
        // Firebase 연결 안됨 - 로컬 상태만 업데이트
        const card: MeetingCardType = {
          ...newCard,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimatedValue: newCard.estimatedValue || 50000000,
          meetingHistory: newCard.meetingHistory || [],
          createdBy: user ? {
            uid: user.uid,
            name: user.displayName || user.email,
            email: user.email
          } : undefined
        };
        setCards(prev => [...prev, card]);
      }
    } catch (err) {
      console.error('카드 추가 오류:', err);
      setError(err instanceof Error ? err.message : '카드를 추가하는 중 오류가 발생했습니다.');
    }
  };

  const handleEditCard = async (updatedCard: MeetingCardType) => {
    try {
      if (isFirebaseConnected) {
        console.log('Firebase에서 조직 공유 카드 수정:', updatedCard.id, 'User:', user?.displayName || user?.email);
        await updateMeetingCard(updatedCard.id, {
          ...updatedCard,
          updatedAt: new Date().toISOString()
        }, user || undefined);
        // 실시간 구독으로 자동 업데이트됨
      } else {
        // Firebase 연결 안됨 - 로컬 상태만 업데이트
        setCards(prev => prev.map(card => 
          card.id === updatedCard.id ? updatedCard : card
        ));
      }
    } catch (err) {
      console.error('카드 수정 오류:', err);
      setError(err instanceof Error ? err.message : '카드를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      if (isFirebaseConnected) {
        console.log('Firebase에서 조직 공유 카드 삭제:', id, 'User:', user?.displayName || user?.email);
        await deleteMeetingCard(id, user || undefined);
        // 실시간 구독으로 자동 업데이트됨
      } else {
        // Firebase 연결 안됨 - 로컬 상태만 업데이트
        setCards(prev => prev.filter(card => card.id !== id));
      }
    } catch (err) {
      console.error('카드 삭제 오류:', err);
      setError(err instanceof Error ? err.message : '카드를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const handleStageChange = async (id: string, newStage: string) => {
    try {
      if (isFirebaseConnected) {
        console.log('Firebase에서 조직 공유 단계 변경:', id, newStage, 'User:', user?.displayName || user?.email);
        await updateMeetingCard(id, {
          stage: newStage as any,
          updatedAt: new Date().toISOString()
        }, user || undefined);
        // 실시간 구독으로 자동 업데이트됨
      } else {
        // Firebase 연결 안됨 - 로컬 상태만 업데이트
        setCards(prev => prev.map(card => 
          card.id === id 
            ? { ...card, stage: newStage as any, updatedAt: new Date().toISOString() }
            : card
        ));
      }
    } catch (err) {
      console.error('단계 변경 오류:', err);
      setError(err instanceof Error ? err.message : '단계를 변경하는 중 오류가 발생했습니다.');
    }
  };

  const handleAddMeeting = async (cardId: string, meeting: Omit<MeetingHistory, 'id'>) => {
    try {
      if (isFirebaseConnected) {
        console.log('Firebase에 조직 공유 미팅 히스토리 추가:', cardId, 'User:', user?.displayName || user?.email);
        await addMeetingHistory(cardId, meeting, user || undefined);
        // 실시간 구독으로 자동 업데이트됨
      } else {
        // Firebase 연결 안됨 - 로컬 상태만 업데이트
        const newMeeting: MeetingHistory = {
          ...meeting,
          id: Date.now().toString()
        };

        setCards(prev => prev.map(card => {
          if (card.id === cardId) {
            const updatedHistory = [...(card.meetingHistory || []), newMeeting];
            return {
              ...card,
              meetingHistory: updatedHistory,
              updatedAt: new Date().toISOString()
            };
          }
          return card;
        }));
      }
    } catch (err) {
      console.error('미팅 히스토리 추가 오류:', err);
      setError(err instanceof Error ? err.message : '미팅 히스토리를 추가하는 중 오류가 발생했습니다.');
    }
  };

  return {
    cards,
    loading,
    error,
    isFirebaseConnected,
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
    handleStageChange,
    handleAddMeeting,
    clearError: () => setError(null)
  };
};