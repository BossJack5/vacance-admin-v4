'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, X, Info } from 'lucide-react';

interface PriceItem {
  id: string;
  item: string;
  price: number;
  currency: 'EUR' | 'USD' | 'KRW';
}

interface PriceTableSectionProps {
  priceTable: PriceItem[];
  onPriceAdd: () => void;
  onPriceRemove: (id: string) => void;
  onPriceUpdate: (id: string, field: keyof PriceItem, value: any) => void;
}

export default function PriceTableSection({
  priceTable,
  onPriceAdd,
  onPriceRemove,
  onPriceUpdate,
}: PriceTableSectionProps) {
  // Alex의 제언: 비용 항목 프리셋
  const pricePresets = [
    { value: 'green_fee', label: '그린피 (Green Fee)' },
    { value: 'cart_fee', label: '카트피 (Cart Fee)' },
    { value: 'caddy_fee', label: '캐디피 (Caddy Fee)' },
    { value: 'club_rental', label: '클럽 대여' },
    { value: 'shoe_rental', label: '골프화 대여' },
    { value: 'locker', label: '라커 이용료' },
    { value: 'custom', label: '직접 입력' }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">비용 체계</h3>
            <p className="text-sm text-gray-600">그린피, 카트피, 캐디피 등 비용 정보</p>
          </div>
        </div>
        <Button
          onClick={onPriceAdd}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          비용 추가
        </Button>
      </div>

      {/* Alex의 제언: 프리셋 활용 안내 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-300">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">💡 Alex의 데이터 전략</p>
            <p>"프리셋 항목을 사용하면 통계 추출 시 훨씬 유리합니다"</p>
          </div>
        </div>
      </div>

      {/* 비용 항목 리스트 */}
      <div className="space-y-4">
        {priceTable.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-amber-300">
            <DollarSign className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">등록된 비용 항목이 없습니다</p>
            <Button
              onClick={onPriceAdd}
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 비용 항목 추가하기
            </Button>
          </div>
        ) : (
          priceTable.map((price, index) => (
            <div
              key={price.id}
              className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* 순서 번호 */}
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  {index + 1}
                </div>

                {/* 입력 필드들 */}
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {/* 항목명 (프리셋 선택) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      항목명 *
                    </label>
                    <select
                      value={price.item}
                      onChange={(e) => onPriceUpdate(price.id, 'item', e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">선택하세요</option>
                      {pricePresets.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    {price.item === 'custom' && (
                      <Input
                        value={price.item}
                        onChange={(e) => onPriceUpdate(price.id, 'item', e.target.value)}
                        placeholder="직접 입력"
                        className="mt-2 border-amber-300"
                      />
                    )}
                  </div>

                  {/* 가격 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가격 *
                    </label>
                    <Input
                      type="number"
                      value={price.price}
                      onChange={(e) => onPriceUpdate(price.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="150"
                      min={0}
                      step={1}
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>

                  {/* 통화 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      통화
                    </label>
                    <select
                      value={price.currency}
                      onChange={(e) => onPriceUpdate(price.id, 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="KRW">KRW (₩)</option>
                    </select>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPriceRemove(price.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 미리보기 */}
              {price.item && price.price > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm">
                  <span className="font-medium text-gray-900">
                    {pricePresets.find(p => p.value === price.item)?.label || price.item}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="font-bold text-amber-700">
                    {price.currency === 'EUR' ? '€' : price.currency === 'USD' ? '$' : '₩'}
                    {price.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 요약 */}
      {priceTable.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            💰 총 {priceTable.length}개 비용 항목
          </p>
          <div className="flex flex-wrap gap-2">
            {priceTable.filter(p => p.item && p.price > 0).map((price) => (
              <span
                key={price.id}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
              >
                {pricePresets.find(p => p.value === price.item)?.label || price.item}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
