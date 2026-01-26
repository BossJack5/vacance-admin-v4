# 국가 상세 정보 페이지 개선 사항

## 설치 필요한 패키지

Rich Text Editor 및 HTML Sanitization 기능을 사용하기 위해 다음 패키지를 설치해야 합니다:

```bash
npm install react-quill isomorphic-dompurify
npm install --save-dev @types/react-quill @types/dompurify
```

## 구현된 기능

### 1. Rich Text Editor (RichTextEditor.tsx)
- **도입 이유**: 볼드, 리스트, 링크 등 서식이 포함된 콘텐츠 작성 가능
- **사용자 앱 가독성 향상**: HTML 포맷으로 저장되어 프론트엔드에서 바로 렌더링 가능
- **기능**:
  - 헤더 (H1, H2, H3)
  - 볼드, 이탤릭, 밑줄, 취소선
  - 순서/비순서 목록
  - 들여쓰기
  - 링크 삽입
  - 텍스트 정렬
  - SSR 대응 (dynamic import with ssr: false)
  
### 2. 보안 강화
- **HTML Sanitization**: DOMPurify를 사용하여 XSS 공격 방지
  - 허용된 태그만 저장 (p, strong, em, u, h1-h6, ul, ol, li, a 등)
  - 위험한 속성 제거 (onclick, onerror 등)
  - 저장 전 자동으로 sanitize 처리
  
- **이미지 Base64 차단**: 
  - 에디터에 이미지 직접 붙여넣기 차단
  - 툴바에서 이미지 버튼 숨김
  - 별도 이미지 업로더 섹션 사용 강제
  - Firebase Storage 업로드 후 URL 사용 권장

### 3. 자동 저장 (Auto-save)
- **3초 디바운스**: 입력 후 3초 뒤 자동으로 localStorage에 저장
- **데이터 유실 방지**: 브라우저 종료, 새로고침 시에도 데이터 복원 가능
- **복원 알림**: 24시간 이내 저장된 드래프트 자동 감지 및 복원 옵션 제공
- **저장 상태 표시**: "저장 중..." / "자동 저장됨" 실시간 피드백
- **등록 완료 시 드래프트 삭제**: 정상 등록 시 임시 저장 데이터 자동 삭제

### 4. 데이터 관리 개선
- **통합 상태 관리**: 모든 폼 데이터를 하나의 객체로 localStorage 저장
- **타임스탬프 추가**: 마지막 수정 시간 표시
- **탭 이동 시 데이터 보존**: 모든 탭의 내용과 이미지가 자동으로 유지됨

### 5. 확장된 데이터베이스 스키마
CountryDetail 인터페이스에 추가된 필드:
```typescript
// 이미지
flagIconUrl?: string;
heroImageUrl?: string;

// 기본 정보 (Rich Text HTML - Sanitized)
geographyContent?: string;
politicsContent?: string;
economyContent?: string;
societyContent?: string;

// 탭별 이미지 배열
geographyImages?: string[];
politicsImages?: string[];
economyImages?: string[];
societyImages?: string[];
```

## 보안 고려사항

### XSS 방지
1. 모든 HTML 콘텐츠는 저장 전 `sanitizeHtml()` 함수로 정화
2. 허용된 태그와 속성만 허용
3. script, iframe, embed 등 위험한 태그 차단

### 이미지 처리
1. Base64 이미지 차단으로 DB 용량 절약
2. 별도 이미지 업로더로 Firebase Storage 사용 권장
3. URL 유효성 검증 (이미지 확장자 체크)

## 사용 방법

1. 패키지 설치 후 개발 서버 재시작
2. 국가 선택 후 내용 작성 시 자동으로 3초마다 저장됨
3. 페이지 새로고침 시 자동으로 복원 여부 확인
4. Rich Text Editor의 툴바로 서식 적용 가능
5. 이미지는 하단의 "관련 이미지" 섹션에서만 추가 가능

## 주의사항

- `react-quill` 스타일시트가 자동으로 로드됩니다
- 프로덕션 환경에서는 localStorage 대신 서버 API로 임시 저장 권장
- 24시간 이상 지난 드래프트는 자동으로 삭제됩니다
- 이미지는 에디터에 직접 붙여넣기 불가 (Base64 방지)
- Firebase Storage 이미지 업로드 로직은 별도 구현 필요
