'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagInputSectionProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

export default function TagInputSection({
  label,
  tags,
  onTagsChange,
  placeholder = '입력 후 추가 버튼 클릭',
  helperText,
}: TagInputSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      return; // 중복 방지
    }
    onTagsChange([...tags, trimmed]);
    setInputValue('');
  };

  const handleRemoveTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{label}</h2>
      {helperText && (
        <p className="text-sm text-gray-600 mb-4">{helperText}</p>
      )}

      {/* 입력 영역 */}
      <div className="flex gap-2 mb-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>

      {/* 태그 표시 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(index)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && (
        <p className="text-sm text-gray-400 italic">아직 추가된 항목이 없습니다</p>
      )}
    </div>
  );
}
