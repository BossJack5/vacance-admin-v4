'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface PriceLevelSectionProps {
  priceLevel: 1 | 2 | 3;
  onPriceLevelChange: (level: 1 | 2 | 3) => void;
}

export default function PriceLevelSection({
  priceLevel,
  onPriceLevelChange,
}: PriceLevelSectionProps) {
  const levels = [
    {
      value: 1 as const,
      label: '저렴',
      range: '1만 원 이하',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    {
      value: 2 as const,
      label: '보통',
      range: '1.5만 ~ 3만 원',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      value: 3 as const,
      label: '고가',
      range: '3만 원 이상',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg">
          <DollarSign className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">가격대</h2>
          <p className="text-sm text-gray-600">1인당 평균 예상 비용을 선택하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {levels.map(level => {
          const isSelected = priceLevel === level.value;
          const dollarSigns = '$'.repeat(level.value);
          
          return (
            <button
              key={level.value}
              onClick={() => onPriceLevelChange(level.value)}
              className={`p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${level.borderColor} ${level.bgColor} shadow-lg`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`text-3xl font-bold ${
                  isSelected ? level.iconColor : 'text-gray-400'
                }`}>
                  {dollarSigns}
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${
                    isSelected ? level.textColor : 'text-gray-900'
                  }`}>
                    {level.label}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isSelected ? level.textColor : 'text-gray-500'
                  }`}>
                    {level.range}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-700">
          💡 <strong>참고:</strong> 가격대는 메인 요리 기준으로 설정됩니다. 
          음료나 디저트는 제외한 대표 메뉴의 평균 가격을 고려해주세요.
        </p>
      </div>
    </Card>
  );
}
