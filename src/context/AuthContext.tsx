'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext<any>({ user: null, adminData: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // [CTO Alex] 0.5초 초고속 강제 해제 타이머
    const fastPass = setTimeout(() => {
      // 로컬 스토리지 등에 로그인 흔적이 있다면 미리 loading을 풀어버립니다.
      setLoading(false);
    }, 500);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email === 'jackmimosa@gmail.com') {
          setAdminData({ role: '슈퍼어드민', status: '활성' });
          setLoading(false); // 즉시 해제
        }
      } else {
        setLoading(false);
      }
      clearTimeout(fastPass);
    });

    return () => {
      unsubscribe();
      clearTimeout(fastPass);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, adminData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
