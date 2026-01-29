'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Location {
  id: string;
  name: string;
  city: string;
  type: string;
}

interface LocationSearchModalProps {
  cityName: string;
  onLocationSelect: (location: { id: string; name: string; type: string }) => void;
  onClose: () => void;
}

export default function LocationSearchModal({
  cityName,
  onLocationSelect,
  onClose,
}: LocationSearchModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (cityName) {
      fetchLocations();
    }
  }, [cityName]);

  const fetchLocations = async () => {
    if (!cityName) {
      return;
    }

    setLoading(true);
    try {
      // 여러 컬렉션에서 도시별 명소 가져오기
      const collections = [
        { name: 'landmarks', type: '명소' },
        { name: 'museums', type: '박물관' },
        { name: 'restaurants', type: '레스토랑' },
        { name: 'shopping', type: '쇼핑' },
        { name: 'services', type: '서비스' },
        { name: 'golf-courses', type: '골프장' },
      ];

      const allLocations: Location[] = [];

      for (const col of collections) {
        const q = query(
          collection(db, col.name),
          where('city', '==', cityName)
        );
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach((doc) => {
          allLocations.push({
            id: doc.id,
            name: doc.data().name || doc.data().title || '',
            city: doc.data().city || '',
            type: col.type,
          });
        });
      }

      setLocations(allLocations);
    } catch (error) {
      console.error('명소 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || loc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const locationTypes = ['all', ...Array.from(new Set(locations.map(l => l.type)))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">명소 검색</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold text-indigo-700">{cityName}</span>의 명소를 검색하세요
          </p>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="명소 이름으로 검색..."
            className="mb-3"
          />
          
          {/* 타입 필터 */}
          <div className="flex gap-2 flex-wrap">
            {locationTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? '전체' : type}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {locations.length === 0
                  ? `${cityName}에 등록된 명소가 없습니다`
                  : '검색 결과가 없습니다'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    onLocationSelect({
                      id: location.id,
                      name: location.name,
                      type: location.type,
                    });
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-indigo-700">
                        {location.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="inline-block px-2 py-0.5 bg-white rounded text-indigo-600 font-medium">
                          {location.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocationSelect({
                        id: location.id,
                        name: location.name,
                        type: location.type,
                      });
                      onClose();
                    }}
                  >
                    선택
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
