'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>시스템 엔진 복구 완료</h2>
        <p style={{ color: '#64748b' }}>이제 정상적으로 서비스를 이용할 수 있습니다.</p>
        <button 
          onClick={() => reset()}
          style={{ padding: '12px 24px', background: '#000', color: '#fff', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
        >
          서비스 다시 시작
        </button>
      </body>
    </html>
  );
}
