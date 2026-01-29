'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, Wifi, ParkingCircle, Utensils, ShoppingBag, User, Baby, Accessibility, Camera } from 'lucide-react';

interface OperatingHours {
  [key: string]: {
    isClosed: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface FacilitySectionProps {
  facilities: string[];
  operatingHours: OperatingHours;
  regularClosedDays: string;
  onFacilityToggle: (facility: string) => void;
  onOperatingHoursUpdate: (day: string, field: string, value: any) => void;
  onRegularClosedDaysChange: (value: string) => void;
}

const facilityOptions = [
  { value: 'wifi', label: '무료 Wi-Fi', icon: Wifi },
  { value: 'parking', label: '주차장', icon: ParkingCircle },
  { value: 'restaurant', label: '레스토랑', icon: Utensils },
  { value: 'gift_shop', label: '기념품점', icon: ShoppingBag },
  { value: 'locker', label: '물품보관함', icon: User },
  { value: 'baby_room', label: '수유실', icon: Baby },
  { value: 'wheelchair', label: '휠체어 접근', icon: Accessibility },
  { value: 'photo_spot', label: '사진촬영 명소', icon: Camera }
];

const weekDays = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
  { key: 'saturday', label: '토요일' },
  { key: 'sunday', label: '일요일' }
];

export default function FacilitySection({
  facilities,
  operatingHours,
  regularClosedDays,
  onFacilityToggle,
  onOperatingHoursUpdate,
  onRegularClosedDaysChange,
}: FacilitySectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Clock className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">시설 정보 및 운영 정보</h2>
          <p className="text-sm text-gray-600">편의시설과 운영 시간을 설정하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 시설 아이콘 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            시설 정보 (다중 선택 가능)
          </label>
          <div className="grid grid-cols-4 gap-3">
            {facilityOptions.map(facility => {
              const Icon = facility.icon;
              return (
                <button
                  key={facility.value}
                  onClick={() => onFacilityToggle(facility.value)}
                  className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    facilities.includes(facility.value)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {facility.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 영업시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            영업시간 (요일별 설정)
          </label>
          <div className="space-y-3">
            {weekDays.map(day => (
              <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="w-24 font-semibold text-gray-700">
                  {day.label}
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={operatingHours[day.key].isClosed}
                    onChange={(e) => onOperatingHoursUpdate(day.key, 'isClosed', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">휴무</span>
                </label>

                {!operatingHours[day.key].isClosed && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">오픈</span>
                      <Input
                        type="time"
                        value={operatingHours[day.key].openTime}
                        onChange={(e) => onOperatingHoursUpdate(day.key, 'openTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">마감</span>
                      <Input
                        type="time"
                        value={operatingHours[day.key].closeTime}
                        onChange={(e) => onOperatingHoursUpdate(day.key, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 정기 휴무 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            정기 휴무 안내
          </label>
          <Input
            value={regularClosedDays}
            onChange={(e) => onRegularClosedDaysChange(e.target.value)}
            placeholder="예: 매월 첫째 월요일, 1월 1일, 12월 25일"
          />
        </div>
      </div>
    </Card>
  );
}
