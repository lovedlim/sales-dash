import React, { useState } from 'react';
import { User, LogOut, Settings, Building, Briefcase, Mail, ChevronDown } from 'lucide-react';
import { logOut } from '../services/auth';
import { User as UserType } from '../types';

interface UserProfileProps {
  user: UserType;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logOut();
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setIsLoggingOut(false);
      setShowDropdown(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {getInitials(user.displayName || '')}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-gray-900">
            {user.displayName || '사용자'}
          </div>
          <div className="text-xs text-gray-500">
            {user.company || user.email}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 py-4 z-50">
          {/* 사용자 정보 */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {getInitials(user.displayName || '')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {user.displayName || '사용자'}
                </h3>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.company && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{user.company}</span>
                    </div>
                  )}
                  {user.position && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{user.position}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                // TODO: 프로필 설정 모달 열기
              }}
              className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>프로필 설정</span>
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</span>
            </button>
          </div>

          {/* 계정 정보 */}
          <div className="px-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>계정 ID: {user.uid.slice(0, 8)}...</div>
              <div className="mt-1">개인 데이터는 안전하게 보호됩니다</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};