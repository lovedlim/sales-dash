import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser, getUserProfile } from '../services/auth';
import { AuthState } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      try {
        if (firebaseUser) {
          // 사용자 프로필 정보 가져오기
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          const user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userProfile?.displayName || '',
            company: userProfile?.company || '',
            position: userProfile?.position || ''
          };

          setAuthState({
            user,
            loading: false,
            error: null
          });

          console.log('사용자 로그인 상태:', user);
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
          console.log('사용자 로그아웃 상태');
        }
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : '인증 오류가 발생했습니다.'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    clearError,
    isAuthenticated: !!authState.user
  };
};