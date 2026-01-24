import { db } from '@/lib/firebase';
import { 
  collection, getDocs, query, where, orderBy, 
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { Country, City, Region } from '@/types/location';

export const locationService = {
  // 국가/도시 로직은 기존과 동일... (생략하지 않고 전체 유지 권장)
  getCountries: async () => {
    const q = query(collection(db, 'countries'), orderBy('nameKr', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Country[];
  },
  getCities: async (countryId: string) => {
    const q = query(collection(db, 'cities'), where('countryId', '==', countryId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as City[];
  },
  
  // locationService.ts 내 getRegions 임시 수정
getRegions: async (cityId: string) => {
  console.log("--- 데이터 정합성 검사 시작 ---");
  const q = query(collection(db, 'regions')); // 조건 없이 전체 호출
  const snap = await getDocs(q);
  
  const allRegions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("DB 내 전체 지역 데이터:", allRegions);

  // 현재 클릭한 cityId("PAR")와 일치하는 데이터가 있는지 필터링 테스트
  const filtered = allRegions.filter((r: any) => r.cityId === cityId);
  console.log(`'${cityId}'와 매칭되는 지역 결과:`, filtered);

  return filtered as Region[];
},

  // CRUD 함수들
  createCountry: async (data: any) => addDoc(collection(db, 'countries'), { ...data, createdAt: serverTimestamp() }),
  updateCountry: async (id: string, data: any) => updateDoc(doc(db, 'countries', id), { ...data, updatedAt: serverTimestamp() }),
  deleteCountry: async (id: string) => deleteDoc(doc(db, 'countries', id)),

  createCity: async (data: any) => addDoc(collection(db, 'cities'), { ...data, createdAt: serverTimestamp() }),
  updateCity: async (id: string, data: any) => updateDoc(doc(db, 'cities', id), { ...data, updatedAt: serverTimestamp() }),
  deleteCity: async (id: string) => deleteDoc(doc(db, 'cities', id)),

  // [중요] 지역 CRUD - zipPrefix와 tags 반영
  createRegion: async (data: any) => addDoc(collection(db, 'regions'), { ...data, createdAt: serverTimestamp() }),
  updateRegion: async (id: string, data: any) => updateDoc(doc(db, 'regions', id), { ...data, updatedAt: serverTimestamp() }),
  deleteRegion: async (id: string) => deleteDoc(doc(db, 'regions', id)),
};