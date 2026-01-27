# City Detail Registration (Level 2) - Implementation Guide

## Overview
도시 상세 등록 페이지는 City Master 데이터베이스에서 도시를 검색하여 자동으로 기본 정보를 채우고, 국가로부터 실용 정보를 상속받아 도시별 상세 정보를 관리하는 Level 2 페이지입니다.

## 📁 File Structure

```
src/
├── app/admin/content/cities/new/
│   └── page.tsx                          # 도시 등록 메인 페이지
├── components/admin/content/
│   └── CityMasterSearchModal.tsx         # City Master 검색 모달
├── services/
│   ├── cityDetailService.ts              # 도시 상세 CRUD 서비스
│   ├── countryDetailService.ts           # 국가 상세 서비스 (상속 데이터 제공)
│   └── locationService.ts                # 국가/도시 기본 서비스
└── types/
    └── location.ts                       # CityDetail, CityMaster 타입 정의
```

## 🎯 Key Features

### 1. City Identity Section (도시 아이덴티티)
- **Country Select**: 검색 가능한 국가 선택 드롭다운
- **City Master Search**: 도시 마스터 DB 검색 (초성 검색 지원: ㅍㄹ → 파리)
- **Auto-fill ReadOnly Fields**:
  - City Name (KR) - 한글 도시명
  - City Name (EN) - 영문 도시명
  - City Code (IATA) - IATA 코드 (예: PAR, TYO)

### 2. Data Inheritance (데이터 상속)
선택된 국가의 실용 정보를 자동으로 상속받습니다:
- **Visa Info** (비자 정보)
- **Currency** (통화)
- **Voltage** (전압)
- **Language** (주요 언어)

**Override 토글**: 도시별로 다른 정보가 필요한 경우, Override를 활성화하여 커스텀 값 입력 가능

### 3. Media & Tagline
- **Image Uploader**: 
  - Firebase Storage 자동 업로드
  - 드래그 앤 드롭 지원
  - WebP 자동 변환 (성능 최적화)
- **Tagline**: 도시를 한 줄로 표현하는 소개 문구

### 4. Rating & Stats Management
#### Vacance Star Rating
- 5-star 시스템 (1.0 ~ 5.0)
- 0.5 단위로 조정 가능
- 시각적 별점 표시

#### Statistical Data (통계 데이터)
모든 필드는 수동 입력 가능, 초기값 0:
- **찜 횟수** (Likes) - ❤️
- **공유 횟수** (Shares) - 🔗
- **저장 횟수** (Saves) - 📌
- **PDF 다운로드** (PDF Downloads) - 📥
- **최근 조회** (Recent Views) - 👁️

## 📊 Data Structure

### CityDetail Type
```typescript
interface CityDetail {
  id: string;
  
  // Identity
  countryId: string;        // FK to countries
  cityCode: string;         // IATA 코드 (PK) - ReadOnly
  nameKr: string;           // ReadOnly (from City Master)
  nameEn: string;           // ReadOnly (from City Master)
  
  // Media
  thumbnailUrl?: string;    // Firebase Storage URL
  tagline?: string;         // 도시 소개 한 줄
  
  // Rating
  vacanceRating?: number;   // 1.0 ~ 5.0 (Step 0.5)
  
  // Statistics
  stats?: {
    likes: number;
    shares: number;
    saves: number;
    pdfDownloads: number;
    recentViews: number;
  };
  
  // Data Inheritance
  inheritedData?: {
    visaInfo?: string;
    currency?: string;
    voltage?: string;
    language?: string;
  };
  
  // Override flags
  overrides?: {
    visaInfo?: boolean;
    currency?: boolean;
    voltage?: boolean;
    language?: boolean;
  };
  
  // Custom data (when override is true)
  customData?: {
    visaInfo?: string;
    currency?: string;
    voltage?: string;
    language?: string;
  };
}
```

### CityMaster Type (검색용 마스터 DB)
```typescript
interface CityMaster {
  id: string;
  nameKr: string;           // 파리
  nameEn: string;           // Paris
  cityCode: string;         // PAR (IATA)
  countryCode?: string;     // FR
  lat?: number;             // 위도
  lng?: number;             // 경도
}
```

## 🔧 Service Methods

### cityDetailService
```typescript
// 도시 검색 (City Master)
searchCityMaster(keyword: string): Promise<CityMaster[]>
  - 한글/영문 이름 검색
  - IATA 코드 검색
  - 초성 검색 지원 (ㅍㄹ → 파리)

// CRUD Operations
createCityDetail(data): Promise<string>
getCityDetailById(id: string): Promise<CityDetail | null>
getCityDetailByCode(cityCode: string): Promise<CityDetail | null>
getCityDetailsByCountry(countryId: string): Promise<CityDetail[]>
updateCityDetail(id: string, data): Promise<void>
deleteCityDetail(id: string): Promise<void>
```

## 🚀 Usage

### 1. 페이지 접근
```
/admin/content/cities/new
```

### 2. 등록 프로세스
1. **국가 선택** → 상속 정보 자동 로드
2. **City Master 검색** → 도시 기본 정보 자동 입력
3. **Override 필요시** → 토글 활성화 후 커스텀 값 입력
4. **이미지 업로드** → 드래그 앤 드롭 또는 파일 선택
5. **태그라인 입력** → 도시 소개 문구
6. **별점 설정** → Vacance 평가 (0.5 단위)
7. **통계 입력** → 수동으로 각 통계 데이터 입력
8. **저장** → Firebase에 저장 후 목록으로 이동

## 💡 Advanced Features

### 초성 검색 (Chosung Search)
City Master 검색에서 한글 초성으로 검색 가능:
```
ㅍㄹ → 파리
ㄷㅋ → 도쿄
ㄴㅇ → 뉴욕
```

**구현 방식**:
```typescript
function matchesChosung(text: string, chosung: string): boolean {
  const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', ...];
  const extractChosung = (str: string): string => {
    // 한글 유니코드에서 초성 추출
  };
  return extractChosung(text).includes(chosung);
}
```

### 이미지 최적화
ImageUploader 컴포넌트는 자동으로:
- **WebP 변환**: 파일 크기 최소화
- **리사이징**: Client-side에서 사전 처리
- **5MB 제한**: 업로드 전 검증
- **Drag & Drop**: 직관적인 UX

### 데이터 상속 로직
```typescript
// Override가 false인 경우
effectiveValue = inheritedData[field]

// Override가 true인 경우
effectiveValue = customData[field]
```

## 🔐 Validation Rules

### 필수 필드
- ✅ Country Selection
- ✅ City Master Selection (cityCode, nameKr, nameEn)

### 선택 필드
- Thumbnail Image
- Tagline
- Vacance Rating
- All Statistics (default: 0)
- Override custom values

## 📦 Firebase Collections

### Required Collections
```
cityDetails/           # 도시 상세 정보
  - {docId}
    - countryId
    - cityCode
    - nameKr/nameEn
    - stats
    - inheritedData
    - overrides
    - customData
    
cityMaster/            # City Master 데이터베이스
  - {docId}
    - nameKr
    - nameEn
    - cityCode (IATA)
    - countryCode
    - lat/lng
    
countryDetails/        # 국가 상세 (상속 원천)
  - {docId}
    - practicalInfo
      - visaInfo
      - currency
      - voltage
      - mainLanguage
```

## 🎨 UI/UX Highlights

### Visual Feedback
- ✅ Green checkmark: City Master 선택 완료
- ❌ Red X: 도시 미선택 상태
- 🟠 Orange badge: Override 활성화
- ⭐ Star visualization: 별점 시각화

### Color Coding
- **Indigo**: City Identity section
- **Green**: Inheritance Info section
- **Purple**: Media & Tagline
- **Yellow**: Rating
- **Varied**: Each statistic has unique color

### Responsive Design
- 그리드 레이아웃: 통계 섹션 (1/2/3 cols)
- 모바일 최적화
- Sticky bottom action bar

## 🛠️ Development Notes

### 성능 최적화
1. **City Master 검색**: 클라이언트 사이드 필터링 (최대 50개 결과)
2. **이미지 업로드**: WebP 변환 + 리사이징
3. **상속 데이터 캐싱**: countryDetail 한 번만 fetch

### 확장 가능성
- 신규 통계 필드 추가 시: `statsData` state만 확장
- 새로운 상속 필드: `inheritedData`, `overrides`, `customData`에 추가
- City Master 외부 API 연동 가능

### 에러 처리
```typescript
try {
  // City Master 검색
} catch (error) {
  console.error('검색 실패:', error);
  toast.error('검색 중 오류가 발생했습니다.');
}
```

## 📝 TODO / Future Enhancements

### 운영 관련
- [ ] City Master에 없는 신규 도시 등록 프로세스
- [ ] 관리자 권한에 따른 '직접 입력' 모드
- [ ] 대량 등록 (CSV/Excel Import)

### 검색 관련
- [x] 초성 검색 구현
- [ ] Firestore 전문 검색 (Algolia 연동 고려)
- [ ] 검색 히스토리 저장

### 데이터 관련
- [ ] 도시 상세 페이지 (수정/조회)
- [ ] 도시 목록 페이지
- [ ] 국가-도시 관계 시각화

## 🤝 Related Pages

- `/admin/content/countries/new` - 국가 상세 등록 (Level 1)
- `/admin/content/regions/new` - 지역 상세 등록 (Level 3) - 향후 구현
- `/admin/content/library` - Content Library

## 📞 Support

문의사항이나 버그 리포트는 개발팀에 문의해주세요.

---

**Last Updated**: 2026-01-27  
**Version**: 1.0.0  
**Developer**: vacance-admin-v4 Team
