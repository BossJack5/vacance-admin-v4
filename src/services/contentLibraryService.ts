import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// 1. 타입 정의
export type ContentObjectType = 
  | 'country-story' 
  | 'city-story' 
  | 'practical-finance' 
  | 'practical-emergency' 
  | 'practical-transport';

// 2. [중요] export 키워드가 반드시 붙어있어야 page.tsx에서 읽을 수 있습니다.
export const TYPE_NAME_MAP: Record<ContentObjectType, string> = {
  'country-story': '국가 스토리텔링',
  'city-story': '도시 스토리텔링',
  'practical-finance': '실용정보: 금융',
  'practical-emergency': '실용정보: 긴급연락처',
  'practical-transport': '실용정보: 교통'
};

export interface ContentObject {
  id: string;
  type: string;
  typeName: string;
  targetId: string;
  targetName?: string;
  title: string;
  tagline: string;
  description: string;
  culturalFeatures: string;
  keywords: string[];
  historicalBackground?: string;
  localTips?: string;
  guideContent?: string;
  countryId?: string;
  // 도시 스토리 필드
  culturalCharacteristics?: string;
  // 교통 정보 필드
  airportToCity?: string;
  urbanTransport?: string;
  personalMobility?: string;
  intercityTravel?: string;
  // 금융 가이드 필드
  selectedCurrency?: string;
  exchangeFee?: string;
  atmTips?: string;
  cardUsageTips?: string;
  // 비상 연락처 필드
  emergencyNumber?: string;
  police?: string;
  fire?: string;
  medical?: string;
  embassyInfo?: string;
  createdAt: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'contentLibrary';

// 3. API 객체 수출
export const contentLibraryAPI = {
  fetchContentLibraryObjects: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContentObject[];
  },

  createContentLibraryObject: async (data: Omit<ContentObject, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      referenceCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateContentLibraryObject: async (id: string, data: Partial<ContentObject>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  deleteContentLibraryObject: async (id: string) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  duplicateContentLibraryObject: async (original: ContentObject) => {
    const { id, ...data } = original;
    const duplicatedData = {
      ...data,
      title: `${data.title} (복사본)`,
      referenceCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), duplicatedData);
    return { id: docRef.id, ...duplicatedData };
  }
};