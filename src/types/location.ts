// [CTO Alex의 제언] 데이터 구조의 뼈대를 정의하여 런타임 에러를 방지합니다.
export interface Country {
  id: string;
  nameKr: string;
  nameEn: string;
  isoCode: string;
  phoneCode: string;
  continent: string;
  createdAt?: any;
}

export interface City {
  id: string;
  countryId: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  timezone: string;
  lat: string;
  lng: string;
  createdAt?: any;
}

export interface Location {
  id: string;
  cityId: string;
  nameKr: string;
  nameEn: string;
  zipPrefix: string;
  createdAt?: any;
}
