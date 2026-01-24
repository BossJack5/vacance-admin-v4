export interface Country {
  id: string;
  nameKr: string;
  nameEn: string;
  isoCode: string;
  phoneCode: string;
  continent: string;
  isActive?: boolean;
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