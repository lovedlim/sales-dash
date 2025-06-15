import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { MeetingCard as MeetingCardType, MeetingHistory } from '../types';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

export { db };

// 컬렉션 참조 - 조직 공유 데이터
const MEETINGS_COLLECTION = 'shared_meetings';

// Firestore 문서를 MeetingCard 타입으로 변환
const convertDocToMeetingCard = (doc: QueryDocumentSnapshot<DocumentData>): MeetingCardType => {
  const data = doc.data();
  
  // Timestamp를 문자열로 변환
  const convertTimestamp = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    if (typeof timestamp === 'string') return timestamp;
    return new Date().toISOString();
  };

  return {
    id: doc.id,
    client: data.client || '',
    date: data.date || new Date().toISOString().split('T')[0],
    assignee: data.assignee || '',
    summary: data.summary || '',
    actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
    stage: data.stage || 'lead',
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    estimatedValue: data.estimatedValue || 50000000,
    meetingHistory: Array.isArray(data.meetingHistory) ? data.meetingHistory : [],
    nextMeetingDate: data.nextMeetingDate || undefined,
    priority: data.priority || undefined,
    contactInfo: data.contactInfo || undefined,
    originalContent: data.originalContent || undefined,
    createdBy: data.createdBy, // 생성자 정보
    lastModifiedBy: data.lastModifiedBy // 마지막 수정자 정보
  };
};

// MeetingCard를 Firestore 문서 형태로 변환
const convertMeetingCardToDoc = (card: Omit<MeetingCardType, 'id'>) => {
  const docData: any = {
    client: card.client,
    date: card.date,
    assignee: card.assignee,
    summary: card.summary,
    actionItems: card.actionItems || [],
    stage: card.stage,
    estimatedValue: card.estimatedValue || 50000000,
    meetingHistory: card.meetingHistory || [],
    createdAt: card.createdAt ? Timestamp.fromDate(new Date(card.createdAt)) : Timestamp.now(),
    updatedAt: card.updatedAt ? Timestamp.fromDate(new Date(card.updatedAt)) : Timestamp.now(),
    createdBy: card.createdBy, // 생성자 정보
    lastModifiedBy: card.lastModifiedBy // 마지막 수정자 정보
  };

  // undefined가 아닌 값들만 추가
  if (card.nextMeetingDate) {
    docData.nextMeetingDate = card.nextMeetingDate;
  }
  if (card.priority) {
    docData.priority = card.priority;
  }
  if (card.contactInfo) {
    docData.contactInfo = card.contactInfo;
  }
  if (card.originalContent) {
    docData.originalContent = card.originalContent;
  }

  return docData;
};

// undefined 값을 필터링하는 헬퍼 함수
const filterUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  const filtered: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      filtered[key] = obj[key];
    }
  });
  
  return filtered;
};

// 조직 공유 미팅 카드 추가
export const addMeetingCard = async (card: Omit<MeetingCardType, 'id' | 'createdAt' | 'updatedAt'>, userInfo?: { uid: string; displayName?: string; email: string }): Promise<string> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    const now = new Date().toISOString();
    const createdBy = userInfo ? {
      uid: userInfo.uid,
      name: userInfo.displayName || userInfo.email,
      email: userInfo.email
    } : undefined;

    const cardWithTimestamps = {
      ...card,
      createdAt: now,
      updatedAt: now,
      estimatedValue: card.estimatedValue || 50000000,
      meetingHistory: card.meetingHistory || [],
      createdBy,
      lastModifiedBy: createdBy
    };
    
    const docRef = await addDoc(collection(db, MEETINGS_COLLECTION), convertMeetingCardToDoc(cardWithTimestamps));
    console.log('조직 공유 미팅 카드가 추가되었습니다. ID:', docRef.id, 'Created by:', createdBy?.name);
    return docRef.id;
  } catch (error) {
    console.error('미팅 카드 추가 오류:', error);
    throw new Error('미팅 카드를 추가하는 중 오류가 발생했습니다.');
  }
};

// 조직 공유 미팅 카드 업데이트
export const updateMeetingCard = async (id: string, updates: Partial<MeetingCardType>, userInfo?: { uid: string; displayName?: string; email: string }): Promise<void> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    const docRef = doc(db, MEETINGS_COLLECTION, id);
    
    // undefined 값들을 필터링
    const filteredUpdates = filterUndefinedValues(updates);
    
    const lastModifiedBy = userInfo ? {
      uid: userInfo.uid,
      name: userInfo.displayName || userInfo.email,
      email: userInfo.email
    } : undefined;

    const updateData: Record<string, any> = {
      ...filteredUpdates,
      updatedAt: Timestamp.now(),
      lastModifiedBy
    };
    
    // createdAt이 있다면 Timestamp로 변환
    if (filteredUpdates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(new Date(filteredUpdates.createdAt));
    }
    
    await updateDoc(docRef, updateData);
    console.log('조직 공유 미팅 카드가 업데이트되었습니다. ID:', id, 'Modified by:', lastModifiedBy?.name);
  } catch (error) {
    console.error('미팅 카드 업데이트 오류:', error);
    throw new Error('미팅 카드를 업데이트하는 중 오류가 발생했습니다.');
  }
};

// 조직 공유 미팅 카드 삭제
export const deleteMeetingCard = async (id: string, userInfo?: { uid: string; displayName?: string; email: string }): Promise<void> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    const docRef = doc(db, MEETINGS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log('조직 공유 미팅 카드가 삭제되었습니다. ID:', id, 'Deleted by:', userInfo?.name);
  } catch (error) {
    console.error('미팅 카드 삭제 오류:', error);
    throw new Error('미팅 카드를 삭제하는 중 오류가 발생했습니다.');
  }
};

// 조직 공유 미팅 카드 가져오기
export const getAllMeetingCards = async (): Promise<MeetingCardType[]> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    console.log('조직 공유 Firebase 데이터 가져오기 시작...');
    const q = query(
      collection(db, MEETINGS_COLLECTION), 
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const cards: MeetingCardType[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const card = convertDocToMeetingCard(doc);
        cards.push(card);
        console.log('카드 변환 성공:', card.id, card.client);
      } catch (error) {
        console.error('카드 변환 오류:', doc.id, error);
      }
    });
    
    console.log('조직 공유 미팅 카드를 가져왔습니다. 총 개수:', cards.length);
    return cards;
  } catch (error) {
    console.error('조직 공유 미팅 카드 가져오기 오류:', error);
    throw new Error('미팅 카드를 가져오는 중 오류가 발생했습니다.');
  }
};

// 조직 공유 실시간 미팅 카드 구독
export const subscribeMeetingCards = (callback: (cards: MeetingCardType[]) => void): (() => void) => {
  if (!db) {
    console.error('Firebase가 초기화되지 않았습니다.');
    return () => {};
  }

  try {
    console.log('조직 공유 Firebase 실시간 구독 시작...');
    const q = query(
      collection(db, MEETINGS_COLLECTION), 
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('조직 공유 Firebase 실시간 업데이트 수신, 문서 수:', querySnapshot.size);
      
      const cards: MeetingCardType[] = [];
      querySnapshot.forEach((doc) => {
        try {
          const card = convertDocToMeetingCard(doc);
          cards.push(card);
          console.log('실시간 카드 변환 성공:', card.id, card.client);
        } catch (error) {
          console.error('실시간 카드 변환 오류:', doc.id, error);
        }
      });
      
      console.log('조직 공유 실시간 업데이트: 미팅 카드 개수:', cards.length);
      callback(cards);
    }, (error) => {
      console.error('조직 공유 실시간 구독 오류:', error);
      // 오류 발생 시 빈 배열로 콜백 호출
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('조직 공유 실시간 구독 설정 오류:', error);
    return () => {};
  }
};

// 조직 공유 미팅 히스토리 추가
export const addMeetingHistory = async (cardId: string, meeting: Omit<MeetingHistory, 'id'>, userInfo?: { uid: string; displayName?: string; email: string }): Promise<void> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    // 현재 카드 데이터 가져오기
    const q = query(collection(db, MEETINGS_COLLECTION));
    const cardDoc = await getDocs(q);
    const currentCard = cardDoc.docs.find(doc => doc.id === cardId);
    
    if (!currentCard) {
      throw new Error('미팅 카드를 찾을 수 없습니다.');
    }
    
    const currentData = currentCard.data();
    const currentHistory = currentData.meetingHistory || [];
    
    const newMeeting: MeetingHistory = {
      ...meeting,
      id: Date.now().toString()
    };
    
    const updatedHistory = [...currentHistory, newMeeting];
    
    const lastModifiedBy = userInfo ? {
      uid: userInfo.uid,
      name: userInfo.displayName || userInfo.email,
      email: userInfo.email
    } : undefined;

    const docRef = doc(db, MEETINGS_COLLECTION, cardId);
    await updateDoc(docRef, {
      meetingHistory: updatedHistory,
      updatedAt: Timestamp.now(),
      lastModifiedBy
    });
    
    console.log('조직 공유 미팅 히스토리가 추가되었습니다. 카드 ID:', cardId, 'Added by:', lastModifiedBy?.name);
  } catch (error) {
    console.error('미팅 히스토리 추가 오류:', error);
    throw new Error('미팅 히스토리를 추가하는 중 오류가 발생했습니다.');
  }
};

// Firebase 연결 상태 확인
export const checkFirebaseConnection = (): boolean => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Firebase 환경변수가 설정되지 않았습니다:', missingVars);
    return false;
  }
  
  if (!db) {
    console.warn('Firebase 데이터베이스가 초기화되지 않았습니다.');
    return false;
  }
  
  console.log('Firebase 연결 상태: 정상 (조직 공유 모드)');
  return true;
};

// 조직 공유 모든 데이터 삭제 (개발용)
export const clearAllData = async (): Promise<void> => {
  if (!db) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }

  try {
    console.log('조직 공유 데이터 삭제 시작...');
    const querySnapshot = await getDocs(collection(db, MEETINGS_COLLECTION));
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('조직 공유 데이터 삭제 완료!');
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    throw new Error('데이터를 삭제하는 중 오류가 발생했습니다.');
  }
};

// 테스트용 함수 - 조직 공유 Firebase 연결 및 데이터 확인
export const testFirebaseConnection = async (): Promise<void> => {
  if (!db) {
    console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
    return;
  }

  try {
    console.log('조직 공유 Firebase 연결 테스트 시작...');
    const q = query(collection(db, MEETINGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    console.log('조직 공유 Firebase 연결 성공! 문서 수:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log('문서 ID:', doc.id, '데이터:', doc.data());
    });
  } catch (error) {
    console.error('조직 공유 Firebase 연결 테스트 실패:', error);
  }
};

// 레거시 함수들 (하위 호환성을 위해 유지)
export const getUserMeetingCards = getAllMeetingCards;
export const subscribeUserMeetingCards = (userId: string, callback: (cards: MeetingCardType[]) => void) => {
  console.log('조직 공유 모드에서는 모든 사용자가 같은 데이터를 공유합니다.');
  return subscribeMeetingCards(callback);
};
export const clearUserData = clearAllData;
export const testUserFirebaseConnection = testFirebaseConnection;