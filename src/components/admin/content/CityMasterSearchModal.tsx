'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Globe, X } from 'lucide-react';
import { cityDetailService } from '@/services/cityDetailService';
import { CityMaster } from '@/types/location';
import toast from 'react-hot-toast';

interface CityMasterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: CityMaster) => void;
}

export default function CityMasterSearchModal({
  isOpen,
  onClose,
  onSelect,
}: CityMasterSearchModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<CityMaster[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // 모달이 열릴 때 초기 목록 로드
  useEffect(() => {
    if (isOpen && !isInitialLoad) {
      loadInitialCities();
    }
  }, [isOpen]);

  // 검색어 변경 시 자동 검색 (디바운스 적용)
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else if (isInitialLoad) {
        // 검색어가 비어있으면 초기 목록 다시 로드
        loadInitialCities();
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [searchKeyword, isOpen]);

  // 초기 도시 목록 로드
  const loadInitialCities = async () => {
    try {
      setIsSearching(true);
      const results = await cityDetailService.searchCityMaster('');
      setSearchResults(results);
      setIsInitialLoad(true);
    } catch (error) {
      console.error('City Master 목록 로딩 실패:', error);
      toast.error('도시 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await cityDetailService.searchCityMaster(searchKeyword);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.error('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('City Master 검색 실패:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 엔터키 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 도시 선택
  const handleSelectCity = (city: CityMaster) => {
    onSelect(city);
    onClose();
    toast.success(`${city.nameKr} (${city.cityCode})이 선택되었습니다.`);
  };

  // 모달 닫을 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchKeyword('');
      setSearchResults([]);
      setIsInitialLoad(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-6 h-6 text-indigo-600" />
            City Master 검색
          </DialogTitle>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="도시 이름, IATA 코드, 또는 초성 검색 (예: 파리, PAR, ㅍㄹ)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* 검색 결과 카운트 */}
        {searchResults.length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            {searchKeyword ? `"${searchKeyword}" 검색 결과: ` : '전체 도시: '}
            <span className="font-bold text-indigo-600">{searchResults.length}개</span>
          </div>
        )}

        {/* 검색 가이드 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 검색 팁</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>한글 이름: 파리, 도쿄, 뉴욕</li>
            <li>영문 이름: Paris, Tokyo, New York</li>
            <li>IATA 코드: PAR, TYO, NYC</li>
            <li>초성 검색: ㅍㄹ (파리), ㄷㅋ (도쿄)</li>
          </ul>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 min-h-[300px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-lg font-medium">검색 중...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <Search className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchKeyword ? '검색 결과가 없습니다' : '도시 목록을 불러오는 중...'}
              </p>
              <p className="text-sm mt-2">
                {searchKeyword ? '다른 검색어를 입력해보세요' : '잠시만 기다려주세요'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className="w-full p-4 hover:bg-indigo-50 transition-colors text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {city.nameKr}
                        <span className="text-gray-500 text-sm font-normal">
                          {city.nameEn}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        코드: <span className="font-mono font-semibold">{city.cityCode}</span>
                        {city.countryCode && (
                          <span className="ml-2">국가: {city.countryCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    선택 →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
