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

// HTML Sanitization 및 보안 유틸리티
import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML 콘텐츠를 정화(Sanitize)하여 XSS 공격을 방지합니다.
 * @param html - 정화할 HTML 문자열
 * @returns 정화된 안전한 HTML 문자열
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'pre', 'code',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * HTML에서 텍스트만 추출합니다.
 * @param html - HTML 문자열
 * @returns 텍스트만 추출된 문자열
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환합니다.
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}