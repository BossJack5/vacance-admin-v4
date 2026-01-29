'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Shirt } from 'lucide-react';

interface RestaurantSpecialsSectionProps {
  michelinStars: number;
  dressCode: string;
  hasCourseMenu: boolean;
  onMichelinStarsChange: (stars: number) => void;
  onDressCodeChange: (code: string) => void;
  onCourseMenuToggle: () => void;
}

export default function RestaurantSpecialsSection({
  michelinStars,
  dressCode,
  hasCourseMenu,
  onMichelinStarsChange,
  onDressCodeChange,
  onCourseMenuToggle,
}: RestaurantSpecialsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Star className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">미식 특화 설정</h2>
          <p className="text-sm text-gray-600">레스토랑 전용 고급 정보를 입력하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* 미슐랭 스타 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              미슐랭 가이드 등급
            </label>
            <Select
              value={michelinStars.toString()}
              onValueChange={(value) => onMichelinStarsChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">등록 안 됨</SelectItem>
                <SelectItem value="1">⭐ 1성 (매우 좋은 레스토랑)</SelectItem>
                <SelectItem value="2">⭐⭐ 2성 (뛰어난 요리)</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3성 (탁월한 요리)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 드레스 코드 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Shirt className="w-4 h-4 text-gray-600" />
              드레스 코드
            </label>
            <Input
              value={dressCode}
              onChange={(e) => onDressCodeChange(e.target.value)}
              placeholder="예: 스마트 캐주얼, 정장 필수"
            />
          </div>
        </div>

        {/* 코스 요리 여부 */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasCourseMenu}
              onChange={onCourseMenuToggle}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-semibold text-gray-700">코스 요리 제공</span>
              <p className="text-xs text-gray-500">
                정찬 코스 메뉴(프랑스식 7코스 등)를 운영하는 경우 체크하세요
              </p>
            </div>
          </label>
        </div>

        {/* 안내 메시지 */}
        {michelinStars > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-semibold">
              ⭐ 미슐랭 {michelinStars}성 레스토랑으로 표시됩니다
            </p>
            <p className="text-xs text-amber-700 mt-1">
              사용자 앱에서 특별한 배지와 함께 강조 표시되며, 검색 우선순위가 높아집니다.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
