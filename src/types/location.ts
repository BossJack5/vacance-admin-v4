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
    safetyLevel?: string;
    safetyTips?: string;
  };
  
  // Override flags (도시별 특화 정보 사용 여부)
  overrides?: {
    visaInfo?: boolean;
    currency?: boolean;
    voltage?: boolean;
    language?: boolean;
    safetyLevel?: boolean;
    safetyTips?: boolean;
  };
  
  // Overridden values (override가 true일 때 사용)
  customData?: {
    visaInfo?: string;
    currency?: string;
    voltage?: string;
    language?: string;
    safetyLevel?: 'safe' | 'moderate' | 'caution' | 'danger';
    safetyTips?: string;
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
  
  // Media Archive (미디어 아카이브)
  mediaArchive?: string[]; // 도시 대표 이미지 모음 (최대 10장)
  
  // Storytelling Library Reference
  storytellingLibraryId?: string | null; // 도시 스토리텔링 라이브러리 참조
  
  // Practical Info Library References
  transportationLibraryId?: string | null; // 교통 정보 라이브러리 참조
  financeLibraryId?: string | null; // 금융 정보 라이브러리 참조
  emergencyLibraryId?: string | null; // 긴급 연락처 라이브러리 참조
  
  // Navigation Tabs
  navigation?: {
    flights?: { customUrl: string; isEnabled: boolean };
    accommodations?: { customUrl: string; isEnabled: boolean };
    tours?: { customUrl: string; isEnabled: boolean };
    pickup?: { customUrl: string; isEnabled: boolean };
    rental?: { customUrl: string; isEnabled: boolean };
    dining?: { customUrl: string; isEnabled: boolean };
    shopping?: { customUrl: string; isEnabled: boolean };
    maps?: { customUrl: string; isEnabled: boolean };
  };
  
  // Culture Specials
  cultureSpecials?: {
    id: string;
    category: string;
    title: string;
    description: string;
    productIds: string[];
  }[];
  
  // Districts & Contents Mapping
  districts?: {
    id: string;
    name: string;
    description: string;
    contents?: {
      attractions?: string[];    // 명소/박물관 POI IDs
      dining?: string[];         // 레스토랑/카페/바 POI IDs
      shopping?: string[];       // 쇼핑 POI IDs
      services?: string[];       // 라이프스타일 서비스 POI IDs
      accommodation?: string[];  // 숙소 POI IDs
    };
  }[];
  
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