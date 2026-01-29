'use client';

import React from 'react';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ListItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface DetailListSectionProps {
  title: string;
  items: ListItem[];
  onItemsChange: (items: ListItem[]) => void;
  helperText?: string;
  guidanceNote?: string;
}

export default function DetailListSection({
  title,
  items,
  onItemsChange,
  helperText,
  guidanceNote,
}: DetailListSectionProps) {
  const handleAddItem = () => {
    const newItem: ListItem = {
      id: `item_${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ListItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onItemsChange(newItems);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onItemsChange(newItems);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {helperText && (
            <p className="text-sm text-gray-600 mt-1">{helperText}</p>
          )}
        </div>
        <Button
          onClick={handleAddItem}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          항목 추가
        </Button>
      </div>

      {/* 항목 리스트 */}
      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-400 mb-2">아직 추가된 항목이 없습니다</p>
          <Button
            onClick={handleAddItem}
            variant="outline"
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            첫 항목 추가하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200"
            >
              {/* 헤더: 순서 조절 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-indigo-700">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 hover:bg-indigo-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-4 h-4 text-indigo-700" />
                  </button>
                  <button
                    onClick={() => handleMoveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1.5 hover:bg-indigo-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDown className="w-4 h-4 text-indigo-700" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* 입력 필드 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    항목 제목 *
                  </label>
                  <Input
                    value={item.title}
                    onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                    placeholder="예: 곤돌라 탑승 시 알아야 할 점"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    항목 설명 *
                  </label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                    placeholder="상세한 설명을 입력하세요..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이미지 URL <span className="text-gray-400 text-xs">(선택)</span>
                  </label>
                  <Input
                    value={item.imageUrl || ''}
                    onChange={(e) => handleUpdateItem(index, 'imageUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alex의 데이터 재사용 가이드 */}
      {guidanceNote && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            ℹ️ {guidanceNote}
          </p>
        </div>
      )}
    </div>
  );
}
