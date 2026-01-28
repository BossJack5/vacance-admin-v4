'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Star, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkContentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation';
  categoryLabel: string;
  cityCode: string;
  alreadyLinkedIds: string[];
  onBulkAdd: (selectedIds: string[]) => void;
}

interface MockContent {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
}

const categoryThemes = {
  attractions: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
  dining: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' },
  shopping: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', button: 'bg-pink-600 hover:bg-pink-700' },
  services: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
  accommodation: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' },
};

export default function BulkContentSearchModal({
  isOpen,
  onClose,
  category,
  categoryLabel,
  cityCode,
  alreadyLinkedIds,
  onBulkAdd,
}: BulkContentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const theme = categoryThemes[category];

  // Mock 데이터 (실제로는 Firestore에서 category별로 필터링해서 가져와야 함)
  const mockContents: MockContent[] = [
    { id: 'CONTENT_001', name: '에펠탑', category: '랜드마크', thumbnail: 'https://via.placeholder.com/80', rating: 4.8, reviewCount: 25432 },
    { id: 'CONTENT_002', name: '루브르 박물관', category: '박물관', thumbnail: 'https://via.placeholder.com/80', rating: 4.9, reviewCount: 18765 },
    { id: 'CONTENT_003', name: '르 쥘 베른', category: '미슐랭', thumbnail: 'https://via.placeholder.com/80', rating: 4.7, reviewCount: 8543 },
    { id: 'CONTENT_004', name: '라파예트 백화점', category: '쇼핑몰', thumbnail: 'https://via.placeholder.com/80', rating: 4.6, reviewCount: 12345 },
    { id: 'CONTENT_005', name: '샹젤리제 호텔', category: '호텔', thumbnail: 'https://via.placeholder.com/80', rating: 4.5, reviewCount: 6789 },
  ];

  const filteredContents = mockContents.filter((content) =>
    content.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (contentId: string) => {
    if (selectedIds.includes(contentId)) {
      setSelectedIds(selectedIds.filter((id) => id !== contentId));
    } else {
      setSelectedIds([...selectedIds, contentId]);
    }
  };

  const handleBulkAdd = () => {
    if (selectedIds.length === 0) {
      toast.error('선택된 콘텐츠가 없습니다.');
      return;
    }
    onBulkAdd(selectedIds);
    setSelectedIds([]);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className={`w-5 h-5 ${theme.text}`} />
            {categoryLabel} 콘텐츠 일괄 추가
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            도시 코드: <span className={`font-semibold ${theme.text}`}>{cityCode || '(도시 선택 필요)'}</span>
          </p>
        </DialogHeader>

        {/* 검색 입력 */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="콘텐츠 이름으로 검색..."
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

        {/* 선택 상태 표시 */}
        {selectedIds.length > 0 && (
          <div className={`${theme.bg} ${theme.border} border-2 rounded-lg p-3 flex items-center justify-between`}>
            <span className={`text-sm font-semibold ${theme.text}`}>
              {selectedIds.length}개의 콘텐츠가 선택되었습니다
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              선택 해제
            </button>
          </div>
        )}

        {/* 콘텐츠 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {!cityCode ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">먼저 도시를 선택해주세요</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          ) : (
            filteredContents.map((content) => {
              const isAlreadyLinked = alreadyLinkedIds.includes(content.id);
              const isSelected = selectedIds.includes(content.id);

              return (
                <div
                  key={content.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isAlreadyLinked
                      ? 'border-gray-300 bg-gray-100 opacity-60'
                      : isSelected
                      ? `${theme.border} ${theme.bg}`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isAlreadyLinked}
                    onChange={() => handleToggleSelect(content.id)}
                    className={`w-5 h-5 rounded cursor-pointer ${
                      isAlreadyLinked ? 'cursor-not-allowed' : ''
                    }`}
                  />

                  {/* 썸네일 */}
                  <img
                    src={content.thumbnail}
                    alt={content.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} font-medium`}>
                        {content.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800">{content.name}</h4>
                      {isAlreadyLinked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          연결됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">ID: {content.id}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{content.rating}</span>
                      </div>
                      <span>리뷰 {content.reviewCount.toLocaleString()}개</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            onClick={handleBulkAdd}
            disabled={selectedIds.length === 0}
            className={`flex-1 ${theme.button} text-white`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {selectedIds.length > 0 ? `${selectedIds.length}개 일괄 추가` : '일괄 추가'}
          </Button>
        </div>

        {/* 안내 문구 */}
        <div className={`${theme.bg} ${theme.border} border rounded-lg p-3`}>
          <p className={`text-xs ${theme.text}`}>
            💡 <strong>Tip:</strong> 체크박스로 여러 콘텐츠를 선택한 후 일괄 추가할 수 있습니다. 이미 연결된 콘텐츠는 자동으로 비활성화됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
