'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Library, Check, Info, AlertCircle } from 'lucide-react';
import LibrarySearchModal from '@/components/admin/content/LibrarySearchModal';

interface LibraryObject {
  id: string;
  cityTag?: string;
  countryTag?: string;
  targetName?: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  updatedAt: any;
  type?: string;
}

interface ColorTheme {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonHover: string;
  selectedBg: string;
  selectedBorder: string;
}

interface LibraryObjectLinkerProps {
  sectionNumber: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: ColorTheme;
  selectedLibraryId: string | null;
  onSelectLibrary: (libraryId: string | null) => void;
  libraryObjects: LibraryObject[];
  categoryName: string;
  placeholder?: string;
  targetName?: string;
}

const defaultColorThemes = {
  green: {
    gradient: 'from-green-50/50 to-emerald-50/30',
    border: 'border-green-200',
    iconBg: 'from-green-500 to-emerald-500',
    iconColor: 'text-white',
    buttonBg: 'bg-green-600',
    buttonHover: 'hover:bg-green-700',
    selectedBg: 'bg-green-100',
    selectedBorder: 'border-green-200',
  },
  yellow: {
    gradient: 'from-yellow-50/50 to-amber-50/30',
    border: 'border-yellow-200',
    iconBg: 'from-yellow-500 to-amber-500',
    iconColor: 'text-white',
    buttonBg: 'bg-yellow-600',
    buttonHover: 'hover:bg-yellow-700',
    selectedBg: 'bg-yellow-100',
    selectedBorder: 'border-yellow-200',
  },
  red: {
    gradient: 'from-red-50/50 to-pink-50/30',
    border: 'border-red-200',
    iconBg: 'from-red-500 to-pink-500',
    iconColor: 'text-white',
    buttonBg: 'bg-red-600',
    buttonHover: 'hover:bg-red-700',
    selectedBg: 'bg-red-100',
    selectedBorder: 'border-red-200',
  },
  orange: {
    gradient: 'from-orange-50/50 to-amber-50/30',
    border: 'border-orange-200',
    iconBg: 'from-orange-500 to-amber-500',
    iconColor: 'text-white',
    buttonBg: 'bg-orange-600',
    buttonHover: 'hover:bg-orange-700',
    selectedBg: 'bg-orange-100',
    selectedBorder: 'border-orange-200',
  },
};

export default function LibraryObjectLinker({
  sectionNumber,
  title,
  description,
  icon,
  colorTheme,
  selectedLibraryId,
  onSelectLibrary,
  libraryObjects,
  categoryName,
  placeholder = '도시명으로 검색...',
  targetName,
}: LibraryObjectLinkerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<LibraryObject | null>(null);
  const [isObjectMissing, setIsObjectMissing] = useState(false);

  useEffect(() => {
    if (selectedLibraryId && libraryObjects.length > 0) {
      const found = libraryObjects.find(obj => obj.id === selectedLibraryId);
      if (found) {
        setSelectedObject(found);
        setIsObjectMissing(false);
      } else {
        setSelectedObject(null);
        setIsObjectMissing(true);
      }
    } else if (selectedLibraryId && libraryObjects.length === 0) {
      setSelectedObject(null);
      setIsObjectMissing(false);
    } else {
      setSelectedObject(null);
      setIsObjectMissing(false);
    }
  }, [selectedLibraryId, libraryObjects]);

  const handleSelect = (obj: LibraryObject) => {
    setSelectedObject(obj);
    onSelectLibrary(obj.id);
    setIsObjectMissing(false);
  };

  const handleRemove = () => {
    setSelectedObject(null);
    onSelectLibrary(null);
    setIsObjectMissing(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`border ${colorTheme.border} bg-gradient-to-br ${colorTheme.gradient} rounded-xl p-6`}>
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${colorTheme.iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{sectionNumber}. {title}</h3>
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>

        {/* Write Once, Reference Everywhere Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">✍️ Write Once, Reference Everywhere</p>
              <p>
                이 섹션은 직접 텍스트를 입력받지 않고, 라이브러리에 작성된 콘텐츠를 참조합니다.
                <br />
                라이브러리에서 수정 시 모든 참조 위치에 자동으로 반영됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Missing Object Warning */}
        {isObjectMissing && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-1">⚠️ 연결된 객체를 찾을 수 없습니다</p>
                <p>
                  라이브러리에서 원본 객체가 삭제되었거나 접근할 수 없습니다. 새로운 객체를 연결해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

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
              className={`${colorTheme.buttonBg} ${colorTheme.buttonHover} text-white`}
            >
              <Library className="w-4 h-4 mr-2" />
              라이브러리에서 검색
            </Button>
          </div>
        ) : (
          // Selected State
          <div className="space-y-4">
            {/* Title with Check Icon */}
            <div className={`flex items-center justify-between bg-white border ${colorTheme.selectedBorder} rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${colorTheme.selectedBg} rounded-full flex items-center justify-center`}>
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">선택된 객체</p>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {selectedObject.cityTag || selectedObject.countryTag || selectedObject.targetName || targetName} - {categoryName}
                  </h4>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                연결 해제
              </Button>
            </div>

            {/* Read-only Preview Box */}
            <div className="bg-[#F8F9FA] border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h5 className="font-bold text-gray-900 text-lg mb-2">
                  {selectedObject.title}
                </h5>
                {(selectedObject.subtitle || selectedObject.tagline) && (
                  <p className="text-sm text-gray-600 mb-3">{selectedObject.subtitle || selectedObject.tagline}</p>
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

            {/* Change Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleOpenModal}
                className="border-gray-300 hover:border-gray-400"
              >
                <Library className="w-4 h-4 mr-2" />
                다른 객체로 변경
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Info Message */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">💡 콘텐츠 라이브러리</span> [{categoryName}] 객체 참조 · 
            라이브러리에서 수정 시 모든 참조 위치에 자동 반영됩니다.
          </p>
        </div>
      </div>

      {/* Search Modal */}
      <LibrarySearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        libraryObjects={libraryObjects}
        placeholder={placeholder}
      />
    </>
  );
}

export { defaultColorThemes };
export type { ColorTheme };
