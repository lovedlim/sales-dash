import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Target, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import { MeetingCard as MeetingCardType } from '../types';
import { stageConfigs } from '../data/mockData';

interface DashboardPageProps {
  cards: MeetingCardType[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ cards }) => {
  // 분석 데이터 계산
  const analytics = useMemo(() => {
    const totalCards = cards.length;
    const activeCards = cards.filter(card => card.stage !== 'completed').length;
    const completedCards = cards.filter(card => card.stage === 'completed').length;
    const conversionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
    
    // 총 예상 매출
    const totalRevenue = cards.reduce((sum, card) => {
      return sum + (card.estimatedValue || 50000000);
    }, 0);
    
    // 단계별 분포
    const stageDistribution = stageConfigs.map(stage => ({
      stage: stage.title,
      count: cards.filter(card => card.stage === stage.id).length,
      color: stage.bgColor,
      value: cards
        .filter(card => card.stage === stage.id)
        .reduce((sum, card) => sum + (card.estimatedValue || 50000000), 0)
    }));

    // 담당자별 분포
    const assigneeStats = cards.reduce((acc, card) => {
      acc[card.assignee] = (acc[card.assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 월별 트렌드 (최근 6개월)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthCards = cards.filter(card => card.date.startsWith(monthKey));
      const count = monthCards.length;
      const value = monthCards.reduce((sum, card) => sum + (card.estimatedValue || 50000000), 0);
      
      return {
        month: date.toLocaleDateString('ko-KR', { month: 'short' }),
        count,
        value
      };
    }).reverse();

    return {
      totalCards,
      activeCards,
      completedCards,
      conversionRate,
      totalRevenue,
      stageDistribution,
      assigneeStats,
      monthlyTrend
    };
  }, [cards]);

  const formatCurrency = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000000) {
      return `${(value / 10000000).toFixed(0)}천만원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    } else {
      return `${value.toLocaleString()}원`;
    }
  };

  const topPerformers = Object.entries(analytics.assigneeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const maxTrendValue = Math.max(...analytics.monthlyTrend.map(item => item.count));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 기회</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalCards}</p>
              <p className="text-sm text-green-600 mt-1">+12% 전월 대비</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">진행 중</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.activeCards}</p>
              <p className="text-sm text-blue-600 mt-1">활성 파이프라인</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">성사/완료</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.completedCards}</p>
              <p className="text-sm text-green-600 mt-1">이번 달 목표 달성</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">예상 매출</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-sm text-purple-600 mt-1">파이프라인 총액</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 월별 트렌드 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">월별 기회 생성 트렌드</h3>
          </div>
          
          <div className="flex items-end space-x-4 h-40">
            {analytics.monthlyTrend.map((item, index) => {
              const height = maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t-lg relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-sm font-bold text-gray-900">{item.count}</div>
                    <div className="text-xs text-gray-500">{item.month}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 단계별 분포 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">단계별 분포</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.stageDistribution.map((stage, index) => {
              const percentage = analytics.totalCards > 0 ? (stage.count / analytics.totalCards) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{stage.stage}</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{stage.count}개</div>
                      <div className="text-xs text-green-600">{formatCurrency(stage.value)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stage.color.replace('bg-', 'bg-').replace('-100', '-500')} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 담당자별 성과 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">담당자별 성과</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topPerformers.map(([assignee, count], index) => {
            const maxCount = Math.max(...Object.values(analytics.assigneeStats));
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {assignee.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{assignee}</div>
                    <div className="text-sm text-gray-600">{count}개 기회</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};