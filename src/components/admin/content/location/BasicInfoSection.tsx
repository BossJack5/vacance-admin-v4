'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';

interface BasicInfoSectionProps {
  nameKr: string;
  nameEn: string;
  summary: string;
  coreInfo: string;
  detailInfo: string;
  advancedInfo: string;
  onFieldChange: (field: string, value: string) => void;
  type?: 'landmark' | 'museum' | 'restaurant';
}

export default function BasicInfoSection({
  nameKr,
  nameEn,
  summary,
  coreInfo,
  detailInfo,
  advancedInfo,
  onFieldChange,
  type = 'landmark',
}: BasicInfoSectionProps) {
  const coreLabel = type === 'museum' 
    ? '핵심정보 - 역사적 배경, 주요 컬렉션, 관람 포인트'
    : '핵심정보 - 역사적 배경, 주요 특징, 관람 포인트';

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Info className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">기본 정보 및 상세 설명</h2>
          <p className="text-sm text-gray-600">이름과 설명을 입력하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 이름 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름 (한글) <span className="text-red-500">*</span>
            </label>
            <Input
              value={nameKr}
              onChange={(e) => onFieldChange('nameKr', e.target.value)}
              placeholder={type === 'museum' ? '루브르 박물관' : '에펠탑'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름 (영문)
            </label>
            <Input
              value={nameEn}
              onChange={(e) => onFieldChange('nameEn', e.target.value)}
              placeholder={type === 'museum' ? 'Louvre Museum' : 'Eiffel Tower'}
            />
          </div>
        </div>

        {/* 3줄 요약 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            3줄 요약
            <span className="text-xs text-gray-500 ml-2">(최대 3줄로 간단하게 요약)</span>
          </label>
          <Textarea
            value={summary}
            onChange={(e) => onFieldChange('summary', e.target.value)}
            placeholder="핵심 내용을 3줄로 요약해주세요"
            className="h-24"
          />
        </div>

        {/* 3단계 정보 탭 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">상세 정보 (3단계)</h3>
          
          {/* Tab 1: 핵심정보 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <label className="text-sm font-semibold text-gray-700">
                {coreLabel}
              </label>
            </div>
            <Textarea
              value={coreInfo}
              onChange={(e) => onFieldChange('coreInfo', e.target.value)}
              placeholder={type === 'museum' ? '역사적 배경, 주요 컬렉션, 관람 포인트를 입력하세요' : '역사적 배경, 주요 특징, 관람 포인트를 입력하세요'}
              className="min-h-[200px]"
            />
          </div>

          {/* Tab 2: 상세정보 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <label className="text-sm font-semibold text-gray-700">
                상세정보 - 관람 팁, 교통 정보, 추천 루트
              </label>
            </div>
            <Textarea
              value={detailInfo}
              onChange={(e) => onFieldChange('detailInfo', e.target.value)}
              placeholder="관람 팁, 교통 정보, 추천 루트를 입력하세요"
              className="min-h-[200px]"
            />
          </div>

          {/* Tab 3: 심화정보 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <label className="text-sm font-semibold text-gray-700">
                심화정보 - 건축 양식, 숨겨진 이야기, 매니아 정보
              </label>
            </div>
            <Textarea
              value={advancedInfo}
              onChange={(e) => onFieldChange('advancedInfo', e.target.value)}
              placeholder="건축 양식, 숨겨진 이야기, 매니아/심층 정보를 입력하세요"
              className="min-h-[200px]"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
