'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Library, Clock } from 'lucide-react';

interface LibraryObject {
  id: string;
  countryTag?: string;
  targetName?: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  updatedAt: any;
  type?: string;
  typeName?: string;
}

interface LibrarySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (libraryObject: LibraryObject) => void;
  libraryObjects: LibraryObject[];
}

export default function LibrarySearchModal({
  isOpen,
  onClose,
  onSelect,
  libraryObjects = [],
}: LibrarySearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredObjects, setFilteredObjects] = useState<LibraryObject[]>([]);

  useEffect(() => {
    if (!Array.isArray(libraryObjects)) {
      setFilteredObjects([]);
      return;
    }

    if (searchTerm.trim()) {
      const filtered = libraryObjects.filter(obj => {
        const searchLower = searchTerm.toLowerCase();
        return (
          obj.countryTag?.toLowerCase().includes(searchLower) ||
          obj.targetName?.toLowerCase().includes(searchLower) ||
          obj.title?.toLowerCase().includes(searchLower) ||
          obj.tagline?.toLowerCase().includes(searchLower) ||
          obj.description?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects(libraryObjects);
    }
  }, [searchTerm, libraryObjects]);

  const handleSelect = (obj: LibraryObject) => {
    onSelect(obj);
    setSearchTerm('');
    onClose();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ko-KR');
    } catch {
      return '-';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Library className="w-6 h-6 text-blue-600" />
            라이브러리에서 검색
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="국가명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredObjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Library className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">검색 결과가 없습니다</p>
              <p className="text-sm mt-1">다른 검색어를 입력해보세요</p>
            </div>
          ) : (
            filteredObjects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => handleSelect(obj)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {obj.typeName && (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          {obj.typeName}
                        </span>
                      )}
                      {(obj.countryTag || obj.targetName) && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {obj.countryTag || obj.targetName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600">
                      {obj.title}
                    </h3>
                    {(obj.subtitle || obj.tagline) && (
                      <p className="text-sm text-gray-600 mb-2">{obj.subtitle || obj.tagline}</p>
                    )}
                    {obj.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{obj.description}</p>
                    )}
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(obj.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
