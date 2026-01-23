import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// 어드민 계정 타입 정의
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: '슈퍼어드민' | '콘텐츠 매니저' | '마케터';
  status: '활성' | '비활성';
  createdAt: any;
  // [CTO Alex] 메뉴별 상세 권한 매트릭스
  permissions: {
    [menuId: string]: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    }
  };
}

// Firestore에 저장/수정할 데이터 타입 (id 제외)
export type AdminAccountData = Omit<AdminAccount, 'id' | 'createdAt'>;

const ADMINS_COLLECTION = 'admins';

// 1. 모든 어드민 계정 목록 가져오기 (생성일 순 정렬)
export const getAdminAccounts = async (): Promise<AdminAccount[]> => {
  const q = query(collection(db, ADMINS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminAccount));
};

// 2. 어드민 계정 저장 (생성/수정)
export const saveAdminAccount = async (adminData: Partial<AdminAccount>): Promise<void> => {
  const { id, ...dataToSave } = adminData;
  if (id) {
    // ID가 있으면 기존 문서 업데이트
    const adminRef = doc(db, ADMINS_COLLECTION, id);
    await updateDoc(adminRef, { ...dataToSave, updatedAt: serverTimestamp() });
  } else {
    // ID가 없으면 새 문서 생성
    await addDoc(collection(db, ADMINS_COLLECTION), { 
      ...dataToSave, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// 3. 어드민 계정 삭제
export const deleteAdminAccount = async (id: string): Promise<void> => {
  if (!id) throw new Error("ID is required to delete an admin account.");
  const adminRef = doc(db, ADMINS_COLLECTION, id);
  await deleteDoc(adminRef);
};
