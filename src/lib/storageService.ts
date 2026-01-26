import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { convertToWebP, blobToFile, formatBytes, calculateCompressionRate } from './imageOptimizer';
import toast from 'react-hot-toast';

/**
 * 이미지를 WebP로 변환 후 Firebase Storage에 업로드합니다.
 * @param file - 업로드할 이미지 파일
 * @param path - Storage 경로 (예: 'countries/flags')
 * @param maxWidth - 최대 너비
 * @param quality - 압축 품질
 * @returns 업로드된 이미지의 다운로드 URL
 */
export async function uploadImageToStorage(
  file: File,
  path: string,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<string> {
  try {
    // 원본 파일 크기
    const originalSize = file.size;

    // WebP로 변환 및 압축
    const webpBlob = await convertToWebP(file, maxWidth, quality);
    const compressedSize = webpBlob.size;

    // 압축률 계산 및 표시
    const compressionRate = calculateCompressionRate(originalSize, compressedSize);
    toast.success(
      `이미지 최적화 완료: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${compressionRate}% 절감)`,
      { duration: 3000 }
    );

    // WebP 파일로 변환
    const fileName = `${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}.webp`;
    const webpFile = blobToFile(webpBlob, fileName);

    // Firebase Storage에 업로드
    const storageRef = ref(storage, `${path}/${fileName}`);
    await uploadBytes(storageRef, webpFile, {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000', // 1년 캐싱
    });

    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

/**
 * 국기 아이콘 업로드 (작은 크기)
 * @param file - 업로드할 국기 이미지
 * @returns 다운로드 URL
 */
export async function uploadFlagIcon(file: File): Promise<string> {
  return uploadImageToStorage(file, 'countries/flags', 256, 0.9);
}

/**
 * 대표 배경 이미지 업로드 (큰 크기)
 * @param file - 업로드할 배경 이미지
 * @returns 다운로드 URL
 */
export async function uploadHeroImage(file: File): Promise<string> {
  return uploadImageToStorage(file, 'countries/heroes', 1920, 0.85);
}

/**
 * 탭별 관련 이미지 업로드 (중간 크기)
 * @param file - 업로드할 이미지
 * @param tabName - 탭 이름 (geography, politics, economy, society)
 * @returns 다운로드 URL
 */
export async function uploadTabImage(file: File, tabName: string): Promise<string> {
  return uploadImageToStorage(file, `countries/${tabName}`, 1200, 0.85);
}
