import React from 'react';
import { Cloud, CloudOff, Database, Shield, Users } from 'lucide-react';

interface FirebaseStatusProps {
  isConnected: boolean;
  isSharedMode?: boolean;
}

export const FirebaseStatus: React.FC<FirebaseStatusProps> = ({ isConnected, isSharedMode = false }) => {
  return (
    <div className={`px-4 py-2 text-sm ${
      isConnected 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
    } border-b`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Cloud className="w-4 h-4" />
              <span className="font-medium">Firebase 연결됨</span>
              <span>- 실시간 동기화 활성화</span>
              {isSharedMode && (
                <div className="flex items-center space-x-1 ml-4">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">조직 공유 모드</span>
                </div>
              )}
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4" />
              <span className="font-medium">오프라인 모드</span>
              <span>- 로컬 데이터 사용 중</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-1 text-xs">
          <Database className="w-3 h-3" />
          <span>
            {isConnected 
              ? (isSharedMode ? 'Firestore (조직 공유)' : 'Firestore') 
              : 'Local Storage'
            }
          </span>
        </div>
      </div>
    </div>
  );
};