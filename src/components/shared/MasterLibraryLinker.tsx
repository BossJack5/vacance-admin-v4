'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookOpen, DollarSign, Phone, Plane, Library, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface LibraryItem {
  id: string;
  type: string;
  targetId: string;
  title?: string;
  tagline?: string;
  [key: string]: any;
}

interface LibrarySection {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  color: {
    light: string;
    border: string;
    text: string;
    badge: string;
  };
}

interface MasterLibraryLinkerProps {
  targetId: string | null;
  targetName?: string;
  sections: LibrarySection[];
  onLinked: (type: string, libraryId: string | null) => void;
  linkedIds: Record<string, string | null>;
}

export default function MasterLibraryLinker({
  targetId,
  targetName = '대상',
  sections,
  onLinked,
  linkedIds,
}: MasterLibraryLinkerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<Record<string, LibraryItem[]>>({});
  const [showCandidates, setShowCandidates] = useState<Record<string, boolean>>({});
  const [autoLinked, setAutoLinked] = useState<Record<string, boolean>>({});

  // 자동 연동 실행
  useEffect(() => {
    if (!targetId) {
      // targetId가 없으면 초기화
      setCandidates({});
      setShowCandidates({});
      setAutoLinked({});
      return;
    }

    const fetchMasterData = async () => {
      console.log('🚀 [MasterLibraryLinker] 자동 연동 시작 - targetId:', targetId);
      setIsLoading(true);

      try {
        const libraryRef = collection(db, 'contentLibrary');
        const newCandidates: Record<string, LibraryItem[]> = {};
        const newAutoLinked: Record<string, boolean> = {};
        const newShowCandidates: Record<string, boolean> = {};
        let totalFound = 0;

        // 각 섹션별로 쿼리 실행
        for (const section of sections) {
          console.log(`🔍 [${section.label}] 검색 시작 - type: ${section.type}`);

          const q = query(
            libraryRef,
            where('type', '==', section.type),
            where('targetId', '==', targetId)
          );

          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as LibraryItem));

          console.log(`📊 [${section.label}] 검색 결과:`, docs.length, '개', 
            docs.map((d: any) => ({ id: d.id, type: d.type, targetId: d.targetId })));

          newCandidates[section.type] = docs;
          totalFound += docs.length;

          if (docs.length === 1) {
            // 1개 → 자동 연결
            onLinked(section.type, docs[0].id);
            newAutoLinked[section.type] = true;
            newShowCandidates[section.type] = false;
            console.log(`✅ [${section.label}] 자동 연동 완료:`, docs[0].id);
          } else if (docs.length > 1) {
            // N개 → 선택 UI 표시
            onLinked(section.type, null);
            newAutoLinked[section.type] = false;
            newShowCandidates[section.type] = true;
            console.log(`🔍 [${section.label}] ${docs.length}개 발견 → 선택 필요`);
          } else {
            // 0개
            onLinked(section.type, null);
            newAutoLinked[section.type] = false;
            newShowCandidates[section.type] = false;
          }
        }

        setCandidates(newCandidates);
        setAutoLinked(newAutoLinked);
        setShowCandidates(newShowCandidates);

        console.log('✅ [MasterLibraryLinker] 자동 연동 완료 - 총', totalFound, '개 발견');

        if (totalFound === 0) {
          toast.error(`⚠️ ${targetName}의 마스터 데이터가 없습니다`);
        } else if (Object.values(newAutoLinked).every(v => v)) {
          toast.success(`✅ 마스터 데이터 자동 연동 완료 (${totalFound}개)`);
        } else {
          toast.success(`🔍 마스터 데이터 ${totalFound}개 발견`);
        }
      } catch (error) {
        console.error('❌ [MasterLibraryLinker] 자동 연동 실패:', error);
        toast.error('자동 연동 중 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, [targetId]);

  // 섹션별 렌더링
  const renderSection = (section: LibrarySection) => {
    const linkedId = linkedIds[section.type];
    const isAutoLinked = autoLinked[section.type];
    const sectionCandidates = candidates[section.type] || [];
    const showSelection = showCandidates[section.type];
    const Icon = section.icon;

    return (
      <div
        key={section.type}
        className={`rounded-lg p-6 ${
          linkedId
            ? 'bg-green-50 border-2 border-green-300'
            : section.color.light + ' border-2 ' + section.color.border
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${section.color.text}`} />
            <h3 className="font-bold text-gray-800">{section.label}</h3>
            {isAutoLinked && linkedId && (
              <span className="px-2 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
                🤖 자동 연동됨
              </span>
            )}
            {linkedId && !isAutoLinked && (
              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                ✓ 수동 연결됨
              </span>
            )}
          </div>
          {linkedId && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onLinked(section.type, null);
                setAutoLinked(prev => ({ ...prev, [section.type]: false }));
                if (sectionCandidates.length > 0) {
                  setShowCandidates(prev => ({ ...prev, [section.type]: true }));
                }
                toast.success(`${section.label} 연결 해제`);
              }}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              해제
            </Button>
          )}
        </div>

        {/* 후보 선택 UI */}
        {showSelection && sectionCandidates.length > 0 && !linkedId && (
          <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <p className="text-sm font-semibold text-purple-800 mb-3">
              🔍 {sectionCandidates.length}개의 {section.label}이(가) 발견되었습니다. 하나를 선택하세요:
            </p>
            <div className="space-y-2">
              {sectionCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 p-3 bg-white border border-purple-200 rounded hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all"
                  onClick={() => {
                    onLinked(section.type, candidate.id);
                    setAutoLinked(prev => ({ ...prev, [section.type]: false }));
                    setShowCandidates(prev => ({ ...prev, [section.type]: false }));
                    toast.success(`선택됨: ${candidate.title || candidate.id}`);
                  }}
                >
                  <input
                    type="radio"
                    name={`${section.type}-candidate`}
                    checked={false}
                    onChange={() => {}}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">
                      {candidate.title || '제목 없음'}
                    </p>
                    <p className="text-xs text-gray-500">ID: {candidate.id}</p>
                    {candidate.tagline && (
                      <p className="text-xs text-gray-600 mt-1 italic">"{candidate.tagline}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowCandidates(prev => ({ ...prev, [section.type]: false }))}
              variant="outline"
              className="mt-3 w-full"
            >
              취소
            </Button>
          </div>
        )}

        {/* 데이터 없음 경고 */}
        {targetId && !linkedId && !showSelection && sectionCandidates.length === 0 && !isLoading && (
          <div className="mb-3 p-3 bg-amber-100 border border-amber-300 rounded text-sm text-amber-800">
            ⚠️ <strong>{targetName}</strong>의 {section.label} 마스터 데이터가 없습니다.
            <p className="text-xs mt-1 text-amber-700">
              contentLibrary에서 type='{section.type}', targetId='{targetId}' 문서를 확인하세요
            </p>
          </div>
        )}

        {/* 연결됨 표시 */}
        {linkedId && (
          <div className="text-sm text-green-700 bg-white rounded p-3 border border-green-200">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Check className="w-4 h-4" />
              연결된 ID: {linkedId}
            </p>
            {isAutoLinked && (
              <p className="text-xs text-green-600">자동으로 매칭되었습니다</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!targetId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Library className="w-12 h-12 mx-auto mb-3 text-blue-400" />
        <p className="text-blue-700 font-semibold">상단에서 대상을 먼저 선택하세요</p>
        <p className="text-sm text-blue-600 mt-1">선택 즉시 관련 마스터 데이터를 자동으로 검색합니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Library className="w-8 h-8 text-purple-600 animate-pulse" />
        </div>
        <p className="text-purple-800 font-bold text-lg">🔍 자동 연동 중...</p>
        <p className="text-sm text-purple-600 mt-2">
          contentLibrary에서 {targetName}({targetId})의 마스터 데이터를 검색하고 있습니다
        </p>
        <p className="text-xs text-purple-500 mt-3">콘솔(F12)에서 실시간 로그를 확인하세요</p>
      </div>
    );
  }

  return <div className="space-y-6">{sections.map(renderSection)}</div>;
}
