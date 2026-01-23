
import { auth } from "@/lib/firebase"; 
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

export const login = async (email: string, pass: string) => {
  // 여기서 auth가 정상적으로 임포트되어야 로그인이 작동합니다.
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logout = async () => {
  return await signOut(auth);
};

export const subscribeAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
