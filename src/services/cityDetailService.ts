import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { CityDetail, CityMaster } from '@/types/location';

const COLLECTION_NAME = 'cityDetails';
const CITY_MASTER_COLLECTION = 'cities';

export const cityDetailService = {
  // 도시 상세 목록 조회
  getCityDetails: async (): Promise<CityDetail[]> => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CityDetail[];
  },

  // 특정 도시 상세 조회
  getCityDetailById: async (id: string): Promise<CityDetail | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CityDetail;
    }
    return null;
  },

  // 도시 코드로 조회
  getCityDetailByCode: async (cityCode: string): Promise<CityDetail | null> => {
    const q = query(collection(db, COLLECTION_NAME), where('cityCode', '==', cityCode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CityDetail;
    }
    return null;
  },

  // 국가별 도시 목록 조회
  getCityDetailsByCountry: async (countryId: string): Promise<CityDetail[]> => {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('countryId', '==', countryId),
      orderBy('nameKr', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CityDetail[];
  },

  // City Master 검색 (자동완성용)
  searchCityMaster: async (keyword: string): Promise<CityMaster[]> => {
    console.log('[searchCityMaster] 검색 시작, keyword:', keyword);
    
    const snapshot = await getDocs(collection(db, CITY_MASTER_COLLECTION));
    console.log('[searchCityMaster] Firestore 결과:', snapshot.size, '개 문서');
    
    const allCities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CityMaster[];
    console.log('[searchCityMaster] 파싱된 도시 목록:', allCities.length, '개');
    
    if (allCities.length > 0) {
      console.log('[searchCityMaster] 첫 번째 도시 샘플:', allCities[0]);
    }
    
    // 클라이언트 사이드 필터링 (한글/영문 검색 지원)
    if (!keyword.trim()) {
      console.log('[searchCityMaster] 검색어 없음, 최대 20개 반환');
      return allCities.slice(0, 20); // 검색어 없으면 최대 20개만 반환
    }
    
    const lowerKeyword = keyword.toLowerCase();
    
    const filtered = allCities.filter(city => {
      // 한글 이름 검색
      if (city.nameKr && city.nameKr.includes(keyword)) return true;
      
      // 영문 이름 검색 (대소문자 무시)
      if (city.nameEn && city.nameEn.toLowerCase().includes(lowerKeyword)) return true;
      
      // 도시 코드 검색
      if (city.cityCode && city.cityCode.toLowerCase().includes(lowerKeyword)) return true;
      
      // 초성 검색 (간단한 구현)
      if (city.nameKr && matchesChosung(city.nameKr, keyword)) return true;
      
      return false;
    }).slice(0, 50); // 최대 50개 결과
    
    console.log('[searchCityMaster] 필터링 결과:', filtered.length, '개');
    return filtered;
  },

  // 도시 상세 생성
  createCityDetail: async (data: Omit<CityDetail, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      stats: data.stats || {
        likes: 0,
        shares: 0,
        saves: 0,
        pdfDownloads: 0,
        recentViews: 0,
      },
      vacanceRating: data.vacanceRating || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // 도시 상세 수정
  updateCityDetail: async (id: string, data: Partial<CityDetail>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  // 도시 상세 삭제
  deleteCityDetail: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },
};

// 초성 검색 헬퍼 함수 (간단한 구현)
function matchesChosung(text: string, chosung: string): boolean {
  const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  const extractChosung = (str: string): string => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i) - 0xAC00;
      if (code > -1 && code < 11172) {
        result += CHOSUNG_LIST[Math.floor(code / 588)];
      }
    }
    return result;
  };
  
  const textChosung = extractChosung(text);
  return textChosung.includes(chosung);
}
