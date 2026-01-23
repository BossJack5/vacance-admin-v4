import { z } from 'zod';

// [CTO Alex] 국가 데이터 검증 스키마
export const countrySchema = z.object({
  nameKr: z.string().min(1, "국가명(한글)은 필수입니다."),
  nameEn: z.string().min(1, "국가명(영문)은 필수입니다."),
  isoCode: z.string()
    .length(2, "ISO 코드는 반드시 2자리여야 합니다.")
    .transform(val => val.toUpperCase()), // 자동 대문자 변환
  phoneCode: z.string()
    .regex(/^\+/, "국가번호는 '+'로 시작해야 합니다.")
    .min(2, "올바른 국가번호를 입력하세요."),
  continent: z.string().min(1, "대륙 선택은 필수입니다."),
});

// [CTO Alex] 도시 데이터 검증 스키마
export const citySchema = z.object({
  countryId: z.string().min(1),
  nameKr: z.string().min(1, "도시명은 필수입니다."),
  cityCode: z.string().length(3, "IATA 코드는 3자리여야 합니다.").transform(v => v.toUpperCase()),
  timezone: z.string().min(1, "타임존을 입력하세요."),
  lat: z.string().refine(val => !isNaN(Number(val)), "위도는 숫자여야 합니다."),
  lng: z.string().refine(val => !isNaN(Number(val)), "경도는 숫자여야 합니다."),
});

// [CTO Alex] 지역(상세 위치) 데이터 검증 스키마
export const locationSchema = z.object({
  cityId: z.string().min(1),
  nameKr: z.string().min(1, "지역명(한글)은 필수입니다."),
  nameEn: z.string().min(1, "지역명(영문)은 필수입니다."),
  zipPrefix: z.string().optional(),
});