'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

interface MuseumDetailGuideSectionProps {
  overview: string;
  visitGuide: string;
  visitPlan: string;
  onFieldChange: (field: string, value: string) => void;
}

export default function MuseumDetailGuideSection({
  overview,
  visitGuide,
  visitPlan,
  onFieldChange,
}: MuseumDetailGuideSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-teal-100 rounded-lg">
          <BookOpen className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">박물관 상세 가이드</h2>
          <p className="text-sm text-gray-600">방문객을 위한 상세 안내 정보를 입력하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 박물관 개요 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <label className="text-sm font-semibold text-gray-700">
              박물관 개요
              <span className="text-xs text-gray-500 ml-2">
                (역사적 배경, 주요 컬렉션, 특징)
              </span>
            </label>
          </div>
          <Textarea
            value={overview}
            onChange={(e) => onFieldChange('overview', e.target.value)}
            placeholder="박물관의 역사적 배경과 주요 컬렉션, 특별한 특징을 설명해주세요.&#10;예: 1793년 프랑스 혁명 시기에 설립된 세계 3대 박물관 중 하나로, 모나리자를 비롯한 35,000여 점의 작품을 소장하고 있습니다."
            className="min-h-[150px] resize-y"
          />
        </div>

        {/* 관람 요령 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <label className="text-sm font-semibold text-gray-700">
              관람 요령
              <span className="text-xs text-gray-500 ml-2">
                (주의사항, 예약 방법, 권장 입장 시간)
              </span>
            </label>
          </div>
          <Textarea
            value={visitGuide}
            onChange={(e) => onFieldChange('visitGuide', e.target.value)}
            placeholder="방문 시 주의사항과 예약 방법, 최적의 입장 시간을 안내해주세요.&#10;예: 온라인 예약 필수 / 대형 가방 반입 불가 / 오전 9시 개장 직후가 가장 한산함 / 수요일·금요일은 야간개장(21:45까지)"
            className="min-h-[150px] resize-y"
          />
        </div>

        {/* 관람 플랜 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <label className="text-sm font-semibold text-gray-700">
              관람 플랜
              <span className="text-xs text-gray-500 ml-2">
                (추천 루트, 전시회 일정, 특별 이벤트)
              </span>
            </label>
          </div>
          <Textarea
            value={visitPlan}
            onChange={(e) => onFieldChange('visitPlan', e.target.value)}
            placeholder="효율적인 관람 루트와 특별 전시 정보, 놓치지 말아야 할 이벤트를 공유해주세요.&#10;예: 추천 3시간 코스 - 드농관(모나리자) → 쉴리관(비너스) → 리슐리외관(함무라비법전) 순서로 이동 / 매월 첫째 일요일 무료 입장"
            className="min-h-[150px] resize-y"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-sm text-teal-700">
            <strong>💡 작성 팁:</strong> 각 섹션은 방문객의 관점에서 실용적인 정보를 제공해야 합니다. 
            역사와 예약 방법, 관람 동선을 명확히 구분하여 작성하면 사용자 경험이 크게 향상됩니다.
          </p>
        </div>
      </div>
    </Card>
  );
}
