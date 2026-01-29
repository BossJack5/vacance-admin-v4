'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, Clock, Users, AlertCircle } from 'lucide-react';

interface ReservationSystemSectionProps {
  restaurantType: 'restaurant' | 'cafe' | 'bar';
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  interval: 30 | 60;
  maxDaysAdvance: number;
  maxGuestsPerSlot: number;
  cancellationPolicy: string;
  operatingHours: any; // 영업시간 데이터
  onToggle: () => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onIntervalChange: (interval: 30 | 60) => void;
  onMaxDaysChange: (days: number) => void;
  onMaxGuestsChange: (guests: number) => void;
  onCancellationPolicyChange: (policy: string) => void;
}

export default function ReservationSystemSection({
  restaurantType,
  isEnabled,
  startTime,
  endTime,
  interval,
  maxDaysAdvance,
  maxGuestsPerSlot,
  cancellationPolicy,
  operatingHours,
  onToggle,
  onStartTimeChange,
  onEndTimeChange,
  onIntervalChange,
  onMaxDaysChange,
  onMaxGuestsChange,
  onCancellationPolicyChange,
}: ReservationSystemSectionProps) {
  // 예약 시간이 영업시간 내에 있는지 검증
  const isTimeValid = useMemo(() => {
    if (!operatingHours || !startTime || !endTime) return true;
    
    // 간단한 검증 로직 (실제로는 모든 요일을 체크해야 함)
    const someOperatingDay = Object.values(operatingHours).find(
      (day: any) => !day.isClosed
    ) as any;
    
    if (!someOperatingDay) return true;
    
    const reservationStart = startTime.replace(':', '');
    const reservationEnd = endTime.replace(':', '');
    const operatingStart = someOperatingDay.openTime.replace(':', '');
    const operatingEnd = someOperatingDay.closeTime.replace(':', '');
    
    return reservationStart >= operatingStart && reservationEnd <= operatingEnd;
  }, [operatingHours, startTime, endTime]);

  const sectionTitle = restaurantType === 'cafe' ? '방문 정보 설정' : '예약 시스템';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <CalendarClock className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{sectionTitle}</h2>
            <p className="text-sm text-gray-600">
              {restaurantType === 'cafe' 
                ? '좌석 현황 및 방문 가능 시간을 설정하세요' 
                : '온라인 예약 시스템을 활성화하고 설정하세요'}
            </p>
          </div>
        </div>

        {/* 활성화 토글 */}
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">
            {restaurantType === 'cafe' ? '시스템 사용' : '예약 활성화'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={onToggle}
              className="sr-only"
            />
            <div
              className={`w-14 h-7 rounded-full transition-colors ${
                isEnabled ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  isEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </label>
      </div>

      {isEnabled ? (
        <div className="space-y-6">
          {/* 시간 검증 경고 */}
          {!isTimeValid && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">예약 시간이 영업시간을 벗어났습니다</p>
                <p className="text-xs text-red-600 mt-1">
                  예약 가능 시간은 반드시 영업시간 내에 포함되어야 합니다. 
                  시설 정보 섹션에서 영업시간을 먼저 확인해주세요.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* 예약 시작 시간 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                예약 시작 시간
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
              />
            </div>

            {/* 예약 종료 시간 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                예약 종료 시간
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 예약 간격 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                예약 간격
              </label>
              <Select
                value={interval.toString()}
                onValueChange={(value) => onIntervalChange(parseInt(value) as 30 | 60)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30분</SelectItem>
                  <SelectItem value="60">60분</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 사전 예약 가능 일수 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                사전 예약 가능 일수
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                value={maxDaysAdvance}
                onChange={(e) => onMaxDaysChange(parseInt(e.target.value) || 7)}
                placeholder="7"
              />
            </div>

            {/* 테이블당 최대 인원 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                최대 인원
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={maxGuestsPerSlot}
                onChange={(e) => onMaxGuestsChange(parseInt(e.target.value) || 4)}
                placeholder="4"
              />
            </div>
          </div>

          {/* 취소 정책 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              취소 정책
            </label>
            <Textarea
              value={cancellationPolicy}
              onChange={(e) => onCancellationPolicyChange(e.target.value)}
              placeholder="예: 예약 24시간 전까지 무료 취소 가능, 이후 50% 수수료 발생"
              className="h-24"
            />
          </div>

          {/* 시간 슬롯 미리보기 */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-indigo-900 mb-2">
              생성될 예약 슬롯 미리보기
            </p>
            <div className="flex flex-wrap gap-2">
              {generateTimeSlots(startTime, endTime, interval).map((slot, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-medium text-indigo-700"
                >
                  {slot}
                </span>
              ))}
            </div>
            {generateTimeSlots(startTime, endTime, interval).length === 0 && (
              <p className="text-xs text-indigo-600">
                시작/종료 시간을 입력하면 예약 가능한 시간대가 표시됩니다
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {restaurantType === 'cafe' 
              ? '방문 정보 시스템이 비활성화되었습니다' 
              : '예약 시스템이 비활성화되었습니다'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            위의 토글을 활성화하여 설정을 시작하세요
          </p>
        </div>
      )}
    </Card>
  );
}

// 시간 슬롯 생성 함수
function generateTimeSlots(start: string, end: string, interval: number): string[] {
  if (!start || !end) return [];
  
  const slots: string[] = [];
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    currentMinutes += interval;
  }
  
  return slots;
}
