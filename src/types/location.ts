export interface Country {
  id: string;
  nameKr: string;
  nameEn: string;
  isoCode: string;
  phoneCode: string;
  continent: string;
  isActive?: boolean;
}

// City Master (검색용 데이터베이스)
export interface CityMaster {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string; // IATA 코드 (예: PAR, TYO)
  countryCode?: string;
  lat?: number;
  lng?: number;
}

// City Detail (레벨 2 상세 정보)
export interface CityDetail {
  id: string;
  
  // Identity
  countryId: string; // FK to countries
  cityCode: string; // IATA 코드 (PK) - ReadOnly
  nameKr: string; // ReadOnly (from City Master)
  nameEn: string; // ReadOnly (from City Master)
  
  // Media
  thumbnailUrl?: string; // Firebase Storage URL
  tagline?: string; // 도시 소개 한 줄
  
  // Status
  status?: 'draft' | 'published'; // 상태 관리
  
  // Rating
  vacanceRating?: number; // 0.0 ~ 3.0 (Step 0.5)
  
  // Statistics (수동 입력 가능)
  stats?: {
    likes: number; // 찜 횟수
    shares: number; // 공유 횟수
    saves: number; // 저장 횟수
    pdfDownloads: number; // PDF 다운로드
    recentViews: number; // 최근 조회
  };
  
  // Data Inheritance (국가로부터 상속 가능)
  inheritedData?: {
    visaInfo?: string;
    currency?: string;
    voltage?: string;
    language?: string;
  };
  
  // Override flags (도시별 특화 정보 사용 여부)
  overrides?: {
    visaInfo?: boolean;
    currency?: boolean;
    voltage?: boolean;
    language?: boolean;
  };
  
  // Overridden values (override가 true일 때 사용)
  customData?: {
    visaInfo?: string;
    currency?: string;
    voltage?: string;
    language?: string;
  };
  
  // Basic Info (도시 기본 정보)
  basicInfo?: {
    geography?: string; // 지리 정보
    climate?: string; // 기후 정보
    society?: string; // 사회 정보
  };
  
  // Tab Images (탭별 이미지)
  tabImages?: {
    geography?: string[]; // 지리 관련 이미지 (최대 3장)
    climate?: string[]; // 기후 관련 이미지 (최대 3장)
    society?: string[]; // 사회 관련 이미지 (최대 3장)
  };
  
  createdAt?: any;
  updatedAt?: any;
}

export interface City {
  id: string;
  countryId: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  lat: number;   // 위도 추가
  lng: number;   // 경도 추가
}

export interface Region {
  id: string;
  cityId: string;
  nameKr: string;
  nameEn: string;
  zipPrefix: string;
  tags?: string[]; // [수정] 있어도 되고 없어도 되는 선택 항목!
}