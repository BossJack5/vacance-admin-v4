/**
 * 이미지 최적화 유틸리티
 * - WebP 포맷 변환
 * - 압축 및 리사이징
 * - Firebase Storage 업로드
 */

/**
 * 이미지 파일을 WebP 포맷으로 변환하고 압축합니다.
 * @param file - 원본 이미지 파일
 * @param maxWidth - 최대 너비 (기본값: 1920)
 * @param quality - 압축 품질 0-1 (기본값: 0.85)
 * @returns WebP 포맷의 Blob 객체
 */
export async function convertToWebP(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        // Canvas 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        // 비율 유지하면서 리사이징
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // WebP로 변환
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP 변환에 실패했습니다.'));
            }
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Blob을 File 객체로 변환합니다.
 * @param blob - Blob 객체
 * @param fileName - 파일 이름
 * @returns File 객체
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환합니다.
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 이미지 파일의 압축률을 계산합니다.
 * @param originalSize - 원본 크기
 * @param compressedSize - 압축 후 크기
 * @returns 압축률 퍼센트
 */
export function calculateCompressionRate(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
