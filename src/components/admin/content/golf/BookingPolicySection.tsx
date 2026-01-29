'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Info } from 'lucide-react';

interface BookingPolicySectionProps {
  openDays: number;
  depositRequired: boolean;
  refundPolicy: string;
  onOpenDaysChange: (value: number) => void;
  onDepositToggle: () => void;
  onRefundPolicyChange: (value: string) => void;
}

export default function BookingPolicySection({
  openDays,
  depositRequired,
  refundPolicy,
  onOpenDaysChange,
  onDepositToggle,
  onRefundPolicyChange,
}: BookingPolicySectionProps) {
  // Alex의 제언: 실시간 날짜 미리보기
  const bookingStartDate = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - openDays);
    
    return targetDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [openDays]);

  const exampleDate = useMemo(() => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + openDays);
    
    return futureDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [openDays]);

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">예약 정책</h3>
          <p className="text-sm text-gray-600">예약 오픈 일수와 취소 규정을 설정하세요</p>
        </div>
      </div>

      {/* Alex의 제언: 실시간 날짜 미리보기 안내 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-300">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-indigo-900">
            <p className="font-semibold mb-1">💡 Alex의 운영 팁</p>
            <p>"실시간 날짜 미리보기로 운영 실수를 0%로 줄입니다"</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* 예약 오픈 일수 & 예약금 (2열) */}
        <div className="grid grid-cols-2 gap-4">
          {/* 예약 오픈 일수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예약 오픈 (며칠 전) *
            </label>
            <Input
              type="number"
              value={openDays}
              onChange={(e) => onOpenDaysChange(parseInt(e.target.value) || 0)}
              placeholder="7"
              min={0}
              max={365}
              className="border-indigo-300 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              방문일 기준 며칠 전부터 예약 가능한지 설정
            </p>

            {/* Alex의 제언: 실시간 날짜 미리보기 */}
            {openDays > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs font-medium text-indigo-900 mb-2">
                  📅 실시간 계산 예시
                </p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>
                    • 오늘({new Date().toLocaleDateString('ko-KR')}) 입력 시
                  </p>
                  <p className="font-semibold text-indigo-700">
                    → {bookingStartDate}부터 예약 가능
                  </p>
                  <p className="text-gray-500 mt-2">
                    ({openDays}일 후 날짜: {exampleDate})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 예약금 필요 여부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예약금 설정
            </label>
            <div className="h-10 flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={depositRequired}
                  onChange={onDepositToggle}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-base font-medium text-gray-900">
                  예약금 필요
                </span>
              </label>
            </div>
            {depositRequired && (
              <div className="mt-2 p-2 bg-indigo-100 rounded text-xs text-indigo-800">
                ✅ 예약 시 예약금이 필요합니다
              </div>
            )}
          </div>
        </div>

        {/* 취소 규정 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            취소 규정 *
          </label>
          <Textarea
            value={refundPolicy}
            onChange={(e) => onRefundPolicyChange(e.target.value)}
            placeholder="예시:
• 방문일 7일 전: 100% 환불
• 방문일 3일 전: 50% 환불
• 방문일 1일 전: 환불 불가"
            className="min-h-[150px] border-indigo-300 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            골퍼들이 이해하기 쉽도록 명확하게 작성해주세요
          </p>
        </div>

        {/* 예약 정책 요약 */}
        {openDays > 0 && refundPolicy && (
          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              📋 예약 정책 요약
            </p>
            <div className="space-y-2 text-sm text-gray-900">
              <p>• 예약 오픈: 방문일 {openDays}일 전</p>
              <p>• 예약금: {depositRequired ? '필요' : '불필요'}</p>
              <p>• 취소 규정: {refundPolicy.length > 50 ? refundPolicy.substring(0, 50) + '...' : refundPolicy}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
