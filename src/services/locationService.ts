import { db } from '@/lib/firebase';
import { 
  collection, getDocs, getDoc, query, where, orderBy, 
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { Country, City, Region } from '@/types/location';

export const locationService = {
  // 1. 국가 목록 가져오기
  getCountries: async () => {
    const q = query(collection(db, 'countries'), orderBy('nameKr', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Country[];
  },

  // 1-1. 특정 국가 가져오기
  getCountryById: async (id: string) => {
    const docRef = doc(db, 'countries', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Country;
    }
    return null;
  },

  // 2. 특정 국가의 도시 목록 가져오기
  getCities: async (countryId: string) => {
    const q = query(collection(db, 'cities'), where('countryId', '==', countryId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as City[];
  },
  
  // 3. 특정 도시의 지역 목록 가져오기 (정합성 검사 로직 포함)
  getRegions: async (cityId: string) => {
    const q = query(collection(db, 'regions'), where('cityId', '==', cityId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Region[];
  },

  // [핵심 수정] 대시보드 에러 해결을 위한 통계 함수
  getLocationStats: async () => {
    const [countriesSnap, citiesSnap, regionsSnap] = await Promise.all([
      getDocs(collection(db, 'countries')),
      getDocs(collection(db, 'cities')),
      getDocs(collection(db, 'regions')),
    ]);
    
    // 대시보드(dashboard/page.tsx)에서 기대하는 필드명으로 정확히 반환합니다.
    return {
      totalCountries: countriesSnap.size,
      totalCities: citiesSnap.size,
      totalRegions: regionsSnap.size,
    };
  },

  // --- CRUD 함수들 ---
  createCountry: async (data: any) => addDoc(collection(db, 'countries'), { ...data, createdAt: serverTimestamp() }),
  updateCountry: async (id: string, data: any) => updateDoc(doc(db, 'countries', id), { ...data, updatedAt: serverTimestamp() }),
  deleteCountry: async (id: string) => deleteDoc(doc(db, 'countries', id)),

  createCity: async (data: any) => addDoc(collection(db, 'cities'), { ...data, createdAt: serverTimestamp() }),
  updateCity: async (id: string, data: any) => updateDoc(doc(db, 'cities', id), { ...data, updatedAt: serverTimestamp() }),
  deleteCity: async (id: string) => deleteDoc(doc(db, 'cities', id)),

  createRegion: async (data: any) => addDoc(collection(db, 'regions'), { ...data, createdAt: serverTimestamp() }),
  updateRegion: async (id: string, data: any) => updateDoc(doc(db, 'regions', id), { ...data, updatedAt: serverTimestamp() }),
  deleteRegion: async (id: string) => deleteDoc(doc(db, 'regions', id)),
};