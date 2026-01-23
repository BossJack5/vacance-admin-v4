import "./globals.css";

// [CTO Alex] 모든 외부 라이브러리 의존성을 제거한 '생존용' 레이아웃입니다.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}