'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, Euro, Percent } from 'lucide-react';

interface TaxRefundSectionProps {
  hasTaxRefund: boolean;
  refundLocation: string;
  minPurchase: number;
  refundRate: number;
  onToggle: () => void;
  onRefundLocationChange: (value: string) => void;
  onMinPurchaseChange: (value: number) => void;
  onRefundRateChange: (value: number) => void;
}

export default function TaxRefundSection({
  hasTaxRefund,
  refundLocation,
  minPurchase,
  refundRate,
  onToggle,
  onRefundLocationChange,
  onMinPurchaseChange,
  onRefundRateChange,
}: TaxRefundSectionProps) {
  const handleMinPurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onMinPurchaseChange(value);
  };

  const handleRefundRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || 0;
    // 0-100 범위로 제한
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    onRefundRateChange(value);
  };

  // 예상 환급액 계산 예시 함수
  const calculateRefundExample = (price: number) => {
    if (price >= minPurchase && refundRate > 0) {
      return (price * refundRate / 100).toFixed(2);
    }
    return '0.00';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">택스 리펀 정보</h3>
          <p className="text-sm text-gray-600">세금 환급 서비스 정보를 입력하세요</p>
        </div>
      </div>

      {/* 택스 리펀 활성화 체크박스 */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasTaxRefund}
            onChange={onToggle}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-base font-medium text-gray-900">
            택스 리펀 가능
          </span>
        </label>
        {hasTaxRefund && (
          <p className="mt-2 ml-8 text-sm text-blue-700 bg-blue-100 p-2 rounded">
            ✅ 이 매장은 세금 환급이 가능합니다
          </p>
        )}
      </div>

      {/* 상세 필드 (활성화 시 노출) */}
      {hasTaxRefund && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* 환급 장소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환급 장소 *
            </label>
            <Textarea
              value={refundLocation}
              onChange={(e) => onRefundLocationChange(e.target.value)}
              placeholder="예: 매장 내, 공항, 데탁스 데스크"
              className="min-h-[80px]"
            />
            <p className="mt-1 text-xs text-gray-500">
              고객이 어디서 환급받을 수 있는지 안내해주세요
            </p>
          </div>

          {/* 최소 구매 금액 & 환급율 (2열 레이아웃) */}
          <div className="grid grid-cols-2 gap-4">
            {/* 최소 구매 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 구매 금액 (€) *
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  value={minPurchase}
                  onChange={handleMinPurchaseChange}
                  min={0}
                  step={1}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                환급 가능 최소 금액
              </p>
            </div>

            {/* 환급율 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환급율 (%) *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  value={refundRate}
                  onChange={handleRefundRateChange}
                  min={0}
                  max={100}
                  step={0.1}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                0 ~ 100% 범위로 입력
              </p>
            </div>
          </div>

          {/* 환급액 자동 계산 가이드 */}
          {minPurchase > 0 && refundRate > 0 && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg border border-blue-300">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                💡 환급액 자동 계산 예시
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  • €{minPurchase} 이상 구매 시 환급율 {refundRate}% 적용
                </p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white p-2 rounded text-center">
                    <div className="text-xs text-gray-600">€100 구매</div>
                    <div className="font-bold text-blue-700">
                      €{calculateRefundExample(100)} 환급
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <div className="text-xs text-gray-600">€500 구매</div>
                    <div className="font-bold text-blue-700">
                      €{calculateRefundExample(500)} 환급
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded text-center">
                    <div className="text-xs text-gray-600">€1000 구매</div>
                    <div className="font-bold text-blue-700">
                      €{calculateRefundExample(1000)} 환급
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-700 bg-white p-2 rounded">
                <strong>계산 공식:</strong> E = P × (R / 100), if P ≥ M
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
