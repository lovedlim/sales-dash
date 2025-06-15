import React from 'react';
import { X, TrendingUp, Users, Calendar, Target, BarChart3, PieChart } from 'lucide-react';

interface AnalyticsData {
  totalCards: number;
  activeCards: number;
  completedCards: number;
  conversionRate: number;
  stageDistribution: Array<{ stage: string; count: number; color: string }>;
  assigneeStats: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

interface AnalyticsPanelProps {
  analytics: AnalyticsData;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics, onClose }) => {
  const maxTrendValue = Math.max(...analytics.monthlyTrend.map(item => item.count));
  const topPerformers = Object.entries(analytics.assigneeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">비즈니스 인텔리전스</h2>
              <p className="text-sm text-gray-500">실시간 영업 성과 분석</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 월별 트렌드 */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">월별 기회 생성 트렌드</h3>
            </div>
            
            <div className="flex items-end space-x-3 h-32">
              {analytics.monthlyTrend.map((item, index) => {
                const height = maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-200 rounded-t-lg relative" style={{ height: '100px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-medium text-gray-900">{item.count}</div>
                      <div className="text-xs text-gray-500">{item.month}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 단계별 분포 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">단계별 분포</h3>
            </div>
            
            <div className="space-y-3">
              {analytics.stageDistribution.map((stage, index) => {
                const percentage = analytics.totalCards > 0 ? (stage.count / analytics.totalCards) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{stage.stage}</span>
                      <span className="font-medium text-gray-900">{stage.count}개</span>
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

          {/* 담당자별 성과 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">담당자별 성과</h3>
            </div>
            
            <div className="space-y-3">
              {topPerformers.map(([assignee, count], index) => {
                const maxCount = Math.max(...Object.values(analytics.assigneeStats));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {assignee.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{assignee}</span>
                        <span className="font-medium text-gray-900">{count}개</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 핵심 지표 */}
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">핵심 성과 지표 (KPI)</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{analytics.conversionRate}%</div>
                <div className="text-sm text-gray-600 mt-1">전환율</div>
                <div className="text-xs text-green-600 mt-1">+5% 목표 대비</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{analytics.activeCards}</div>
                <div className="text-sm text-gray-600 mt-1">활성 기회</div>
                <div className="text-xs text-blue-600 mt-1">파이프라인</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">{analytics.completedCards}</div>
                <div className="text-sm text-gray-600 mt-1">성사 건수</div>
                <div className="text-xs text-green-600 mt-1">이번 달</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(analytics.assigneeStats).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">활성 담당자</div>
                <div className="text-xs text-purple-600 mt-1">팀 규모</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};