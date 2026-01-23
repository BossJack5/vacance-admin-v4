// [CTO Alex] 비즈니스 로직 전담 서비스 레이어입니다.
import { db } from "@/lib/firebase";
import { 
  collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, 
  doc, serverTimestamp, where, getDocs, writeBatch,
  getCountFromServer
} from "firebase/firestore";
import { Country, City, Location } from "@/types/location";
import * as XLSX from 'xlsx';


// --- 국가(Country) 관련 서비스 ---
export const subscribeCountries = (callback: (data: Country[]) => void) => {
  const q = query(collection(db, "countries"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Country));
    callback(data.sort((a, b) => a.nameKr.localeCompare(b.nameKr)));
  });
};

export const saveCountry = async (form: Omit<Country, 'id' | 'createdAt'>, id?: string) => {
  if (id) {
    return await updateDoc(doc(db, "countries", id), { ...form });
  } else {
    return await addDoc(collection(db, "countries"), { ...form, createdAt: serverTimestamp() });
  }
};

// --- 도시(City) 관련 서비스 ---
export const subscribeCities = (countryId: string, callback: (data: City[]) => void) => {
  const q = query(collection(db, "cities"), where("countryId", "==", countryId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as City));
    callback(data.sort((a, b) => a.nameKr.localeCompare(b.nameKr)));
  });
};

export const saveCity = async (form: Omit<City, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      return await updateDoc(doc(db, "cities", id), { ...form });
    } else {
      return await addDoc(collection(db, "cities"), { ...form, createdAt: serverTimestamp() });
    }
};

// --- 지역(Location) 관련 서비스 ---
export const subscribeLocations = (cityId: string, callback: (data: Location[]) => void) => {
    const q = query(collection(db, "locations"), where("cityId", "==", cityId));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Location));
      callback(data.sort((a, b) => a.nameKr.localeCompare(b.nameKr)));
    });
};

export const saveLocation = async (form: Omit<Location, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
        return await updateDoc(doc(db, "locations", id), { ...form });
    } else {
        return await addDoc(collection(db, "locations"), { ...form, createdAt: serverTimestamp() });
    }
};

export const deleteLocation = async (id: string) => {
    return await deleteDoc(doc(db, "locations", id));
};

// --- [핵심] 연쇄 삭제 서비스 (Cascading Delete) ---
export const deleteCountryWithSubData = async (countryId: string) => {
  const batch = writeBatch(db);
  const citiesQ = query(collection(db, "cities"), where("countryId", "==", countryId));
  const citiesSnaps = await getDocs(citiesQ);

  for (const cityDoc of citiesSnaps.docs) {
    const locsQ = query(collection(db, "locations"), where("cityId", "==", cityDoc.id));
    const locsSnaps = await getDocs(locsQ);
    locsSnaps.forEach(ldoc => batch.delete(ldoc.ref));
    batch.delete(cityDoc.ref);
  }
  batch.delete(doc(db, "countries", countryId));
  return await batch.commit();
};

export const deleteCityWithSubData = async (cityId: string) => {
    const batch = writeBatch(db);
    const locsQ = query(collection(db, "locations"), where("cityId", "==", cityId));
    const locsSnaps = await getDocs(locsQ);
    locsSnaps.forEach(ldoc => batch.delete(ldoc.ref));
    batch.delete(doc(db, "cities", cityId));
    return await batch.commit();
};

// [CTO Alex] 전체 문서를 읽지 않고 '개수'만 가져와서 비용을 절감합니다.
export const getLocationStats = async () => {
  const colls = ['countries', 'cities', 'locations'];
  
  // 3개 컬렉션의 개수를 병렬로 호출하여 속도를 최적화합니다.
  const counts = await Promise.all(colls.map(async (name) => {
    const snapshot = await getCountFromServer(collection(db, name));
    return snapshot.data().count;
  }));

  return {
    countries: counts[0],
    cities: counts[1],
    locations: counts[2]
  };
};

// [CTO Alex] 엑셀 데이터에 국가명을 추가하여 식별력을 높였습니다.
export const getCitiesForExport = async (countryId: string, countryName: string) => {
  const q = query(collection(db, "cities"), where("countryId", "==", countryId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      '국가명': countryName, // 참조용 국가명 추가
      '도시명(한글)': data.nameKr,
      '도시명(영문)': data.nameEn,
      'IATA코드': data.cityCode,
      '타임존': data.timezone,
      '위도': data.lat,
      '경도': data.lng
    };
  });
};

// [CTO Alex] writeBatch를 사용하여 대량의 도시 데이터를 효율적으로 한 번에 저장합니다.
export const importCitiesBatch = async (countryId: string, cities: Omit<City, 'id' | 'countryId' | 'createdAt'>[]) => {
  const batch = writeBatch(db);
  const citiesColRef = collection(db, "cities");

  cities.forEach(cityData => {
    const docRef = doc(citiesColRef); // Firestore auto-generates an ID
    batch.set(docRef, { 
      ...cityData, 
      countryId: countryId, 
      createdAt: serverTimestamp() 
    });
  });

  return await batch.commit();
};

// [CTO Alex] 관리자가 데이터 입력을 시작할 수 있도록 표준 양식을 생성합니다.
export const downloadCityTemplate = (countryName: string) => {
  // 표준 헤더 정의 (순서와 명칭이 중요합니다)
  const templateData = [
    {
      '국가명': countryName, // 현재 선택된 국가를 기본값으로 제공
      '도시명(한글)': '',
      '도시명(영문)': '',
      'IATA코드': '',
      '타임존': '',
      '위도': '',
      '경도': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "도시_업로드_양식");
  
  // 파일 다운로드 실행
  XLSX.writeFile(workbook, `바캉스_도시업로드_양식_${countryName}.xlsx`);
};