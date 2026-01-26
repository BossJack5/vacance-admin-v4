import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export interface CountryDetail {
  id: string;
  nameKr: string;
  nameEn: string;
  code: string;
  continent: string;
  status: string;
  description?: string;
  cityCount?: number;
  
  // 이미지
  flagIconUrl?: string;
  heroImageUrl?: string;
  
  // 통계 데이터
  favorites?: number;      // 찜 횟수
  shares?: number;         // 공유 수
  saves?: number;          // 저장 횟수
  pdfDownloads?: number;   // PDF 다운로드 수
  views?: number;          // 조회 수
  
  // 기본 정보 (Rich Text HTML)
  geographyContent?: string;
  politicsContent?: string;
  economyContent?: string;
  societyContent?: string;
  
  // 탭별 이미지 배열
  geographyImages?: string[];
  politicsImages?: string[];
  economyImages?: string[];
  societyImages?: string[];
  
  createdAt: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'countryDetails';

export const countryDetailService = {
  // 국가 상세 목록 조회
  getCountryDetails: async (): Promise<CountryDetail[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CountryDetail[];
  },

  // 국가 상세 생성
  createCountryDetail: async (data: Omit<CountryDetail, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // 국가 상세 수정
  updateCountryDetail: async (id: string, data: Partial<CountryDetail>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  // 국가 상세 삭제
  deleteCountryDetail: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },
};
