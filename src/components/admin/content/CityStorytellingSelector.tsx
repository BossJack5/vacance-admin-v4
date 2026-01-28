'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Library, Check, Info, Sparkles } from 'lucide-react';
import LibrarySearchModal from './LibrarySearchModal';

interface LibraryObject {
  id: string;
  cityTag?: string;
  targetName?: string;
  title: string;
  subtitle?: string;
  description?: string;
  updatedAt: any;
  type?: string;
}

interface CityStorytellingSelectorProps {
  selectedLibraryId: string | null;
  onSelectLibrary: (libraryId: string | null) => void;
  libraryObjects: LibraryObject[];
  selectedCityName?: string;
}

export default function CityStorytellingSelector({
  selectedLibraryId,
  onSelectLibrary,
  libraryObjects,
  selectedCityName,
}: CityStorytellingSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<LibraryObject | null>(null);

  useEffect(() => {
    if (selectedLibraryId && libraryObjects.length > 0) {
      const found = libraryObjects.find(obj => obj.id === selectedLibraryId);
      setSelectedObject(found || null);
    } else {
      setSelectedObject(null);
    }
  }, [selectedLibraryId, libraryObjects]);

  const handleSelect = (obj: LibraryObject) => {
    setSelectedObject(obj);
    onSelectLibrary(obj.id);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="border border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/30 rounded-xl p-6">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-900">📖 7. 도시 스토리텔링</h3>
            <p className="text-sm text-orange-700/80">
              라이브러리에서 작성된 스토리텔링 콘텐츠를 참조합니다
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">✍️ Write Once, Use Everywhere</p>
              <p>
                이 섹션은 직접 텍스트를 입력받지 않고, 라이브러리에 작성된 콘텐츠를 참조합니다.
                <br />
                라이브러리에서 수정 시 모든 참조 위치에 자동으로 반영됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Empty State or Selected State */}
        {!selectedObject ? (
          // Empty State
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
            <Library className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium mb-4">
              아직 라이브러리 객체가 연결되지 않았습니다
            </p>
            <Button
              onClick={handleOpenModal}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Library className="w-4 h-4 mr-2" />
              라이브러리에서 검색
            </Button>
          </div>
        ) : (
          // Selected State
          <div className="space-y-4">
            {/* Title with Check Icon */}
            <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-0.5">선택된 스토리텔링</p>
                <h4 className="font-bold text-gray-900 text-lg">
                  {selectedObject.cityTag || selectedObject.targetName} 도시 개요
                </h4>
              </div>
            </div>

            {/* Read-only Preview Box */}
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h5 className="font-bold text-gray-900 text-lg mb-2">
                  {selectedObject.title}
                </h5>
                {selectedObject.subtitle && (
                  <p className="text-sm text-gray-600 mb-3">{selectedObject.subtitle}</p>
                )}
              </div>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div 
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: selectedObject.description || '' }}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  이 콘텐츠는 읽기 전용입니다. 수정하려면 콘텐츠 라이브러리 메뉴에서 해당 항목을 찾아 수정 버튼을 클릭하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Info Message */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">💡 자동 동기화:</span> 라이브러리에서 수정 시 
            모든 참조 위치에 자동 반영됩니다. 별도의 업데이트 작업이 필요하지 않습니다.
          </p>
        </div>
      </div>

      {/* Search Modal */}
      <LibrarySearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        libraryObjects={libraryObjects}
        placeholder="도시명으로 검색..."
      />
    </>
  );
}
