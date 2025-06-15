import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Firebase Auth 초기화
export const auth = getAuth();

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  company?: string;
  position?: string;
  createdAt: string;
  lastLoginAt: string;
}

// 회원가입
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 프로필 업데이트
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Firestore에 사용자 프로필 저장
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('사용자 프로필 생성 완료:', user.uid);

    return user;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

// 로그인
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 마지막 로그인 시간 업데이트
    await updateLastLoginTime(user.uid);
    console.log('로그인 성공:', user.uid);

    return user;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 로그아웃
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('로그아웃 완료');
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('사용자 프로필 가져오기 오류:', error);
    return null;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
    console.log('사용자 프로필 업데이트 완료:', uid);
  } catch (error) {
    console.error('사용자 프로필 업데이트 오류:', error);
    throw error;
  }
};

// 마지막 로그인 시간 업데이트
const updateLastLoginTime = async (uid: string): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('마지막 로그인 시간 업데이트 오류:', error);
  }
};

// 인증 상태 변화 감지
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// 현재 사용자 가져오기
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 이메일 형식 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검증
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }
  
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: '비밀번호는 영문과 숫자를 포함해야 합니다.' };
  }
  
  return { isValid: true, message: '사용 가능한 비밀번호입니다.' };
};

// Firebase Auth 오류 메시지 한국어 변환
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다.',
    'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/invalid-credential': '인증 정보가 올바르지 않습니다.'
  };
  
  return errorMessages[errorCode] || '알 수 없는 오류가 발생했습니다.';
};