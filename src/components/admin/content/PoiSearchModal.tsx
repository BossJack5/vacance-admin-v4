'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Star, MapPin, Check } from 'lucide-react';

interface PoiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityCode: string;
  selectedPoiIds: string[];
  onAddPoi: (poiId: string) => void;
}

interface MockPoi {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
}

export default function PoiSearchModal({
  isOpen,
  onClose,
  cityCode,
  selectedPoiIds,
  onAddPoi,
}: PoiSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock POI 데이터 (실제로는 Firestore에서 가져와야 함)
  const mockPois: MockPoi[] = [
    {
      id: 'POI_001',
      name: '에펠탑',
      category: '랜드마크',
      thumbnail: 'https://via.placeholder.com/80',
      rating: 4.8,
      reviewCount: 25432,
    },
    {
      id: 'POI_002',
      name: '루브르 박물관',
      category: '박물관',
      thumbnail: 'https://via.placeholder.com/80',
      rating: 4.9,
      reviewCount: 18765,
    },
    {
      id: 'POI_003',
      name: '노트르담 대성당',
      category: '종교시설',
      thumbnail: 'https://via.placeholder.com/80',
      rating: 4.7,
      reviewCount: 12543,
    },
    {
      id: 'POI_004',
      name: '개선문',
      category: '랜드마크',
      thumbnail: 'https://via.placeholder.com/80',
      rating: 4.6,
      reviewCount: 9876,
    },
    {
      id: 'POI_005',
      name: '샹젤리제 거리',
      category: '명소',
      thumbnail: 'https://via.placeholder.com/80',
      rating: 4.5,
      reviewCount: 8765,
    },
  ];

  const filteredPois = mockPois.filter((poi) =>
    poi.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPoi = (poiId: string) => {
    onAddPoi(poiId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            명소 검색 및 추가
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            도시 코드: <span className="font-semibold text-orange-600">{cityCode || '(도시 선택 필요)'}</span>
          </p>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="명소 이름으로 검색..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* POI 리스트 */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3">
          {!cityCode ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">먼저 도시를 선택해주세요</p>
            </div>
          ) : filteredPois.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          ) : (
            filteredPois.map((poi) => {
              const isSelected = selectedPoiIds.includes(poi.id);
              return (
                <div
                  key={poi.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  {/* 썸네일 */}
                  <img
                    src={poi.thumbnail}
                    alt={poi.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                        {poi.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800">{poi.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">ID: {poi.id}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{poi.rating}</span>
                      </div>
                      <span>리뷰 {poi.reviewCount.toLocaleString()}개</span>
                    </div>
                  </div>

                  {/* 추가 버튼 */}
                  <Button
                    onClick={() => handleAddPoi(poi.id)}
                    disabled={isSelected}
                    className={
                      isSelected
                        ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        추가됨
                      </>
                    ) : (
                      '추가'
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> 선택한 명소는 사용자 앱 최상단에 고정 노출됩니다. 10~15개의 핵심 명소를 선별하세요.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
