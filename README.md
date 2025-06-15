# Sales Pipeline Dashboard

AI 기반 영업 파이프라인 관리 시스템입니다. Firebase Firestore를 사용하여 실시간 데이터 동기화를 지원합니다.

## 🚀 주요 기능

### 📊 **대시보드**
- 실시간 영업 현황 분석
- 단계별 기회 분포 시각화
- 담당자별 성과 추적
- 월별 트렌드 분석

### 🎯 **영업 파이프라인**
- 칸반 보드 및 리스트 뷰
- 드래그 앤 드롭으로 단계 이동
- 고급 필터링 및 검색
- 단계별 예상 가치 계산

### 🤖 **AI 미팅 분석**
- OpenAI GPT-4o-mini 기반 회의 내용 자동 요약
- 액션 아이템 자동 추출
- 영업 단계 자동 분류

### 📅 **미팅 히스토리**
- 다차 미팅 기록 관리
- 미팅별 상세 정보 추적
- 참석자 및 결과 기록

### 🔥 **Firebase 연동**
- 실시간 데이터 동기화
- 자동 백업 및 복구
- 오프라인 모드 지원

## 🛠️ 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 다음 정보를 입력하세요:

#### OpenAI API 설정
```env
VITE_OPENAI_API_KEY=sk-proj-your_actual_openai_api_key_here
```

#### Firebase 설정
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. **Firestore Database** 생성 (테스트 모드로 시작)
3. **웹 앱 추가** 후 구성 정보를 `.env` 파일에 복사
4. Firestore 보안 규칙 설정 (선택사항):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meetings/{document} {
      allow read, write: if true; // 개발용 - 실제 운영시 보안 규칙 적용 필요
    }
  }
}
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 📱 사용 방법

### 🔧 **초기 설정**
1. 애플리케이션 실행 시 Firebase 연결 상태 확인
2. Firebase 연결 시 기존 Mock 데이터가 자동으로 마이그레이션됨
3. 상단의 연결 상태 표시줄에서 현재 상태 확인 가능

### 📝 **새 영업 기회 추가**
1. "새 기회 추가" 버튼 클릭
2. 고객사명, 담당자, 미팅 날짜 입력
3. 회의 내용 상세 입력 (AI가 자동 분석)
4. 저장 시 Firebase에 실시간 저장

### 🔄 **단계 관리**
1. 파이프라인 페이지에서 "단계 관리" 클릭
2. 기존 단계 편집 또는 새 단계 추가
3. 색상 및 설명 커스터마이징

### 📊 **미팅 히스토리**
1. 카드 메뉴(⋯)에서 "미팅 히스토리" 선택
2. 새 미팅 추가로 후속 미팅 기록
3. 미팅별 참석자, 결과, 다음 단계 관리

## 🔧 기술 스택

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Firebase Firestore
- **AI**: OpenAI GPT-4o-mini
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 주요 의존성

```json
{
  "firebase": "^10.7.1",
  "openai": "^4.28.0",
  "react": "^18.3.1",
  "lucide-react": "^0.344.0"
}
```

## 🚨 문제 해결

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정 정보 확인
- Firebase 프로젝트에서 웹 앱이 등록되었는지 확인
- Firestore Database가 생성되었는지 확인

### OpenAI API 오류
- API 키가 올바른지 확인 (`sk-proj-`로 시작)
- OpenAI 계정에 충분한 크레딧이 있는지 확인

### 오프라인 모드
- Firebase 연결이 안될 경우 자동으로 로컬 데이터 사용
- 연결 복구 시 데이터 동기화 필요

## 🔒 보안 고려사항

- 실제 운영 환경에서는 Firestore 보안 규칙 설정 필수
- API 키는 환경변수로 관리하고 버전 관리에서 제외
- 사용자 인증 시스템 추가 권장

## 📈 향후 개발 계획

- [ ] 사용자 인증 시스템
- [ ] 고급 분석 리포트
- [ ] 이메일 알림 기능
- [ ] 모바일 앱 지원
- [ ] 팀 협업 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.