'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Shirt, Watch, Sparkles, Gem, Briefcase, Footprints, Heart } from 'lucide-react';

interface ProductCategorySectionProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: '패션', icon: Shirt, color: 'pink' },
  { id: 'accessory', label: '액세서리', icon: Sparkles, color: 'purple' },
  { id: 'cosmetic', label: '화장품', icon: Heart, color: 'rose' },
  { id: 'perfume', label: '향수', icon: Sparkles, color: 'violet' },
  { id: 'watch', label: '시계', icon: Watch, color: 'blue' },
  { id: 'jewelry', label: '보석', icon: Gem, color: 'amber' },
  { id: 'bag', label: '가방', icon: Briefcase, color: 'orange' },
  { id: 'shoes', label: '신발', icon: Footprints, color: 'green' },
  { id: 'luxury', label: '명품 잡화', icon: ShoppingBag, color: 'indigo' },
];

const colorClasses = {
  pink: 'border-pink-300 bg-pink-50 text-pink-700',
  purple: 'border-purple-300 bg-purple-50 text-purple-700',
  rose: 'border-rose-300 bg-rose-50 text-rose-700',
  violet: 'border-violet-300 bg-violet-50 text-violet-700',
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
  amber: 'border-amber-300 bg-amber-50 text-amber-700',
  orange: 'border-orange-300 bg-orange-50 text-orange-700',
  green: 'border-green-300 bg-green-50 text-green-700',
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-700',
};

export default function ProductCategorySection({
  selectedCategories,
  onCategoryToggle,
}: ProductCategorySectionProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">상품 카테고리</h3>
          <p className="text-sm text-gray-600">취급하는 상품 종류를 모두 선택하세요 (다중 선택 가능)</p>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-3 gap-4">
        {PRODUCT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategories.includes(category.id);

          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `${colorClasses[category.color as keyof typeof colorClasses]} shadow-lg scale-105 ring-2 ring-offset-2 ring-${category.color}-400`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-8 h-8 ${isSelected ? '' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                  {category.label}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 카테고리 요약 */}
      {selectedCategories.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            선택된 카테고리 ({selectedCategories.length}개)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
              if (!category) return null;
              
              return (
                <span
                  key={categoryId}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[category.color as keyof typeof colorClasses]}`}
                >
                  {category.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {selectedCategories.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ 최소 1개 이상의 카테고리를 선택해주세요
          </p>
        </div>
      )}
    </Card>
  );
}
