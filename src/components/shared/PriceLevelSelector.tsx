'use client';

import React from 'react';

interface PriceLevelSelectorProps {
  value: 1 | 2 | 3;
  onChange: (value: 1 | 2 | 3) => void;
  currency?: string; // 기본값 '€'
  title?: string;
  description?: string;
}

export default function PriceLevelSelector({
  value,
  onChange,
  currency = '€',
  title = '가격대 설정',
  description,
}: PriceLevelSelectorProps) {
  // 화폐에 따른 가격 범위 텍스트
  const getPriceRangeText = (level: number) => {
    if (currency === '₩') {
      return [
        '저렴 (~₩50,000)',
        '보통 (₩50,000-150,000)',
        '고가 (₩150,000+)',
      ][level - 1];
    } else if (currency === '$') {
      return [
        '저렴 (~$50)',
        '보통 ($50-150)',
        '고가 ($150+)',
      ][level - 1];
    } else if (currency === '¥') {
      return [
        '저렴 (~¥5,000)',
        '보통 (¥5,000-15,000)',
        '고가 (¥15,000+)',
      ][level - 1];
    } else if (currency === '£') {
      return [
        '저렴 (~£40)',
        '보통 (£40-120)',
        '고가 (£120+)',
      ][level - 1];
    } else if (currency === 'Fr') {
      return [
        '저렴 (~Fr40)',
        '보통 (Fr40-120)',
        '고가 (Fr120+)',
      ][level - 1];
    } else {
      // 유로 (기본값)
      return [
        '저렴 (~€50)',
        '보통 (€50-150)',
        '고가 (€150+)',
      ][level - 1];
    }
  };

  const defaultDescription = `평균 가격대를 선택하세요 (최대 ${currency.repeat(3)})`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {description || defaultDescription}
      </p>

      <div className="flex gap-4">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level as 1 | 2 | 3)}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all
              ${
                value === level
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="text-2xl font-bold mb-2">
              {currency.repeat(level)}
            </div>
            <div className="text-sm text-gray-600">
              {getPriceRangeText(level)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
