'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Sunrise, Sun, Moon } from 'lucide-react';

interface CurationSectionProps {
  category: 'major' | 'support';
  selectedThemes: string[];
  priority: number;
  recommendedTimes: string[];
  onCategoryChange: (value: 'major' | 'support') => void;
  onThemeToggle: (theme: string) => void;
  onAllThemesToggle: () => void;
  onPriorityChange: (value: number) => void;
  onTimeToggle: (time: string) => void;
}

const travelThemes = [
  '역사/문화 유적',
  '현대건축',
  '자연경관',
  '예술/미술',
  '종교시설',
  '전망대/조망',
  '공원/정원',
  '테마파크',
  '쇼핑명소',
  '음식/미식',
  '사진명소',
  '야경명소',
  '가족여행',
  '커플추천',
  '혼행추천',
  '우천대체'
];

export default function CurationSection({
  category,
  selectedThemes,
  priority,
  recommendedTimes,
  onCategoryChange,
  onThemeToggle,
  onAllThemesToggle,
  onPriorityChange,
  onTimeToggle,
}: CurationSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Globe className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">큐레이션 및 우선순위</h2>
          <p className="text-sm text-gray-600">분류와 추천 정보를 설정하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            카테고리
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onCategoryChange('major')}
              className={`flex-1 py-3 px-6 rounded-lg border-2 font-semibold transition-all ${
                category === 'major'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
              }`}
            >
              주요명소
            </button>
            <button
              onClick={() => onCategoryChange('support')}
              className={`flex-1 py-3 px-6 rounded-lg border-2 font-semibold transition-all ${
                category === 'support'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
              }`}
            >
              보조명소
            </button>
          </div>
        </div>

        {/* 여행 테마 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              여행 테마 (다중 선택 가능)
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={onAllThemesToggle}
            >
              {selectedThemes.length === travelThemes.length ? '전체 해제' : '전체 선택'}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {travelThemes.map(theme => (
              <button
                key={theme}
                onClick={() => onThemeToggle(theme)}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  selectedThemes.includes(theme)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* 우선순위 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              우선순위
              <span className="text-xs text-gray-500 ml-2">(낮을수록 우선순위 높음)</span>
            </label>
            <Input
              type="number"
              value={priority}
              onChange={(e) => onPriorityChange(parseInt(e.target.value) || 100)}
              placeholder="100"
            />
          </div>
        </div>

        {/* 권장 시간대 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            권장 시간대
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onTimeToggle('morning')}
              className={`flex-1 py-4 px-6 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-3 ${
                recommendedTimes.includes('morning')
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              <Sunrise className="w-5 h-5" />
              오전
            </button>
            <button
              onClick={() => onTimeToggle('afternoon')}
              className={`flex-1 py-4 px-6 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-3 ${
                recommendedTimes.includes('afternoon')
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-200'
              }`}
            >
              <Sun className="w-5 h-5" />
              오후
            </button>
            <button
              onClick={() => onTimeToggle('night')}
              className={`flex-1 py-4 px-6 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-3 ${
                recommendedTimes.includes('night')
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
              }`}
            >
              <Moon className="w-5 h-5" />
              야간
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
