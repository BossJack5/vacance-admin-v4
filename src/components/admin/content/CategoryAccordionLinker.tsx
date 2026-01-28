'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, X, GripVertical } from 'lucide-react';

interface CategoryAccordionLinkerProps {
  title: string;
  icon: React.ReactNode;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    button: string;
  };
  linkedIds: string[];
  isOpen: boolean;
  onToggle: () => void;
  onAddClick: () => void;
  onRemove: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function CategoryAccordionLinker({
  title,
  icon,
  colorTheme,
  linkedIds,
  isOpen,
  onToggle,
  onAddClick,
  onRemove,
  onReorder,
}: CategoryAccordionLinkerProps) {
  return (
    <div className={`border-2 ${colorTheme.border} rounded-lg overflow-hidden`}>
      {/* 헤더 */}
      <button
        onClick={onToggle}
        className={`w-full ${colorTheme.bg} px-5 py-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${colorTheme.text}`}>
            {icon}
          </div>
          <div className="text-left">
            <h4 className={`text-sm font-bold ${colorTheme.text}`}>{title}</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              {linkedIds.length > 0 ? `${linkedIds.length}개 연결됨` : '연결된 콘텐츠 없음'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            size="sm"
            className={`${colorTheme.button} text-white`}
          >
            <Plus className="w-4 h-4 mr-1" />
            추가
          </Button>
          {isOpen ? (
            <ChevronUp className={`w-5 h-5 ${colorTheme.text}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${colorTheme.text}`} />
          )}
        </div>
      </button>

      {/* 콘텐츠 리스트 */}
      {isOpen && (
        <div className="bg-white p-4">
          {linkedIds.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">아직 연결된 콘텐츠가 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">
                상단의 "추가" 버튼을 클릭하여 콘텐츠를 추가하세요
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {linkedIds.map((id, index) => (
                <div
                  key={id}
                  className={`flex items-center justify-between ${colorTheme.bg} ${colorTheme.border} border rounded-lg px-4 py-3`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <span className={`text-xs font-bold ${colorTheme.text}`}>#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-700">{id}</span>
                  </div>
                  <button
                    onClick={() => onRemove(id)}
                    className="text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
