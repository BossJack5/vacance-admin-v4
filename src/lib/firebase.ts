
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza...", // 사용자님의 실제 키
  authDomain: "vacance-admin-v4.firebaseapp.com",
  projectId: "vacance-admin-v4",
  storageBucket: "vacance-admin-v4.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// 'app' 변수를 선언하고 초기화합니다.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// [중요] app, auth, db를 모두 내보냅니다.
export { app, auth, db };
