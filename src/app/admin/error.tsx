
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-20">
      <h2 className="text-red-500 font-black text-2xl">시스템 런타임 에러 발생</h2>
      <pre className="bg-slate-100 p-4 mt-4 rounded-xl text-xs">{error.message}</pre>
      <button onClick={() => reset()} className="mt-4 bg-black text-white px-4 py-2 rounded-lg">다시 시도</button>
    </div>
  );
}
