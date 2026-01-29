'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Utensils, Coffee, Wine } from 'lucide-react';

interface RestaurantTypeSectionProps {
  selectedType: 'restaurant' | 'cafe' | 'bar';
  onTypeChange: (type: 'restaurant' | 'cafe' | 'bar') => void;
}

export default function RestaurantTypeSection({
  selectedType,
  onTypeChange,
}: RestaurantTypeSectionProps) {
  const types = [
    {
      value: 'restaurant' as const,
      label: '레스토랑',
      icon: Utensils,
      description: '정찬, 비스트로, 미슐랭 레스토랑 등'
    },
    {
      value: 'cafe' as const,
      label: '카페',
      icon: Coffee,
      description: '커피숍, 디저트 카페, 브런치 카페'
    },
    {
      value: 'bar' as const,
      label: '바',
      icon: Wine,
      description: '와인바, 칵테일바, 펍, 루프탑 바'
    }
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">업종 선택</h2>
        <p className="text-sm text-gray-600">등록할 매장의 유형을 선택하세요</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {types.map(type => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          
          return (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full ${
                  isSelected ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${
                    isSelected ? 'text-orange-700' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
