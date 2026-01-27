'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Utensils, 
  Wine, 
  Landmark, 
  Palette, 
  Building2, 
  Construction,
  BookOpen,
  Music,
  Film,
  MapPin,
  Plus,
  X,
  Info
} from 'lucide-react';

type CategoryKey = 'cuisine' | 'wine' | 'history' | 'art' | 'museum' | 'architecture' | 'literature' | 'music' | 'cinema' | 'unesco';

interface CategoryConfig {
  id: CategoryKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  titleKr: string;
  titleEn: string;
}

interface CultureCategoryData {
  description: string;
  images: string[];
  isEnabled?: boolean;
}

interface CultureSpecialSectionProps {
  cultureData: Record<CategoryKey, CultureCategoryData>;
  onCultureDataChange: (data: Record<CategoryKey, CultureCategoryData>) => void;
  selectedCountryName?: string;
}

const CULTURE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cuisine',
    label: '요리',
    icon: Utensils,
    placeholder: '프랑스 요리의 특징, 대표 음식, 식사 문화 등을 작성하세요...',
    titleKr: '요리',
    titleEn: 'Cuisine',
  },
  {
    id: 'wine',
    label: '와인',
    icon: Wine,
    placeholder: '와인 문화, 대표 와인 지역, 특징 등을 작성하세요...',
    titleKr: '와인',
    titleEn: 'Wine',
  },
  {
    id: 'history',
    label: '역사',
    icon: Landmark,
    placeholder: '주요 역사적 사건, 시대별 특징 등을 작성하세요...',
    titleKr: '역사',
    titleEn: 'History',
  },
  {
    id: 'art',
    label: '미술',
    icon: Palette,
    placeholder: '대표 화가, 미술 사조, 주요 작품 등을 작성하세요...',
    titleKr: '미술',
    titleEn: 'Art',
  },
  {
    id: 'museum',
    label: '박물관',
    icon: Building2,
    placeholder: '주요 박물관, 소장품, 관람 정보 등을 작성하세요...',
    titleKr: '박물관',
    titleEn: 'Museum',
  },
  {
    id: 'architecture',
    label: '건축',
    icon: Construction,
    placeholder: '건축 양식, 대표 건축물, 특징 등을 작성하세요...',
    titleKr: '건축',
    titleEn: 'Architecture',
  },
  {
    id: 'literature',
    label: '문학',
    icon: BookOpen,
    placeholder: '대표 작가, 문학 작품, 문학적 전통 등을 작성하세요...',
    titleKr: '문학',
    titleEn: 'Literature',
  },
  {
    id: 'music',
    label: '음악',
    icon: Music,
    placeholder: '음악 장르, 대표 음악가, 음악 문화 등을 작성하세요...',
    titleKr: '음악',
    titleEn: 'Music',
  },
  {
    id: 'cinema',
    label: '영화',
    icon: Film,
    placeholder: '영화 산업, 대표 감독/배우, 유명 작품 등을 작성하세요...',
    titleKr: '영화',
    titleEn: 'Cinema',
  },
  {
    id: 'unesco',
    label: '유네스코',
    icon: MapPin,
    placeholder: '유네스코 세계문화유산, 등재 연도, 특징 등을 작성하세요...',
    titleKr: '유네스코',
    titleEn: 'UNESCO',
  },
];

export default function CultureSpecialSection({
  cultureData,
  onCultureDataChange,
  selectedCountryName,
}: CultureSpecialSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('cuisine');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const currentConfig = CULTURE_CATEGORIES.find(cat => cat.id === activeCategory)!;
  const currentData = cultureData[activeCategory] || { description: '', images: [], isEnabled: true };

  const updateCategory = (categoryId: CategoryKey, updates: Partial<CultureCategoryData>) => {
    onCultureDataChange({
      ...cultureData,
      [categoryId]: {
        ...cultureData[categoryId],
        ...updates,
      },
    });
  };

  const handleDescriptionChange = (value: string) => {
    updateCategory(activeCategory, { description: value });
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    
    const currentImages = currentData.images || [];
    if (currentImages.length >= 3) {
      alert('이미지는 최대 3장까지 추가할 수 있습니다.');
      return;
    }

    updateCategory(activeCategory, {
      images: [...currentImages, imageUrlInput.trim()],
    });
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentData.images.filter((_, i) => i !== index);
    updateCategory(activeCategory, { images: newImages });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const url = e.dataTransfer.getData('text/plain');
    if (url && url.trim()) {
      const currentImages = currentData.images || [];
      if (currentImages.length >= 3) {
        alert('이미지는 최대 3장까지 추가할 수 있습니다.');
        return;
      }
      updateCategory(activeCategory, {
        images: [...currentImages, url.trim()],
      });
    }
  };

  const Icon = currentConfig.icon;

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden" style={{ backgroundColor: '#FFF8E7' }}>
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🎨 1-4. 국가 문화 스페셜</h3>
            <p className="text-sm text-orange-50">
              10가지 문화 카테고리별로 세부 정보를 입력합니다
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">📂 아코디언 방식</p>
              <p>
                상단 버튼을 클릭하여 원하는 문화 카테고리를 선택하세요. 
                선택된 항목만 펼쳐져서 집중적으로 작성할 수 있습니다. 
                다른 탭을 클릭해도 이전에 입력한 내용은 자동으로 보존됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            문화 카테고리 선택
          </label>
          <div className="grid grid-cols-5 gap-3">
            {CULTURE_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <CategoryIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-7 h-7 text-orange-600" />
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {currentConfig.titleKr} <span className="text-sm text-gray-500 font-normal">({currentConfig.titleEn})</span>
              </h4>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              설명
            </label>
            <Textarea
              value={currentData.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={currentConfig.placeholder}
              className="min-h-[200px] bg-gray-50 border-gray-200 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              관련 이미지 (최대 3장)
            </label>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="이미지 URL을 입력하거나, 브라우저에서 이미지를 드래그하여 아래 영역에 드롭하세요"
                className="flex-1 bg-gray-50 border-gray-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddImage}
                disabled={currentData.images?.length >= 3}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mb-4 border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <p className="text-sm text-gray-600">
                {isDragging ? (
                  <span className="text-orange-600 font-semibold">여기에 드롭하세요</span>
                ) : (
                  <>
                    💡 브라우저에서 이미지를 드래그하여 이곳에 드롭하거나, 위 입력창에 URL을 입력하세요
                  </>
                )}
              </p>
            </div>

            {currentData.images && currentData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {currentData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imageUrl}
                      alt={`${currentConfig.label} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(!currentData.images || currentData.images.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Icon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">아직 추가된 이미지가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">💡 데이터 보존:</span> 다른 카테고리로 이동해도 
            입력한 내용은 자동으로 저장됩니다. 모든 카테고리를 작성할 필요는 없으며, 
            필요한 항목만 선택적으로 작성하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
