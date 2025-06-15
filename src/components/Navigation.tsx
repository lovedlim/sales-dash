import React from 'react';
import { BarChart3, Kanban, Settings, Home, Calendar, Users, TrendingUp } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { User } from '../types';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user?: User | null;
  onShowAuth?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  user, 
  onShowAuth 
}) => {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: Home, description: '전체 현황 및 분석' },
    { id: 'pipeline', label: '영업 파이프라인', icon: Kanban, description: '기회 관리 및 진행' },
    { id: 'analytics', label: '분석 리포트', icon: TrendingUp, description: '성과 분석 및 인사이트' },
    { id: 'settings', label: '설정', icon: Settings, description: '시스템 설정 및 관리' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sales CRM</h1>
              <p className="text-sm text-gray-500">통합 영업 관리 시스템</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 네비게이션 메뉴 */}
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 사용자 프로필 또는 로그인 버튼 */}
            {user ? (
              <UserProfile user={user} />
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                <Users className="w-4 h-4" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};