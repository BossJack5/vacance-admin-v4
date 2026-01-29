'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, Droplet, UtensilsCrossed, Target, User, Home, Car, Dumbbell } from 'lucide-react';

interface GolfFacilitiesSectionProps {
  facilities: string[];
  onFacilityToggle: (facility: string) => void;
}

const GOLF_FACILITIES = [
  { id: 'pro_shop', label: '프로샵', icon: Store, color: 'blue' },
  { id: 'locker_room', label: '락커룸', icon: User, color: 'purple' },
  { id: 'shower', label: '샤워실', icon: Droplet, color: 'cyan' },
  { id: 'rest_house', label: '그늘집', icon: Home, color: 'green' },
  { id: 'restaurant', label: '레스토랑', icon: UtensilsCrossed, color: 'orange' },
  { id: 'driving_range', label: '드라이빙 레인지', icon: Target, color: 'red' },
  { id: 'putting_green', label: '퍼팅 그린', icon: Dumbbell, color: 'emerald' },
  { id: 'parking', label: '주차장', icon: Car, color: 'gray' },
];

const colorClasses = {
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
  purple: 'border-purple-300 bg-purple-50 text-purple-700',
  cyan: 'border-cyan-300 bg-cyan-50 text-cyan-700',
  green: 'border-green-300 bg-green-50 text-green-700',
  orange: 'border-orange-300 bg-orange-50 text-orange-700',
  red: 'border-red-300 bg-red-50 text-red-700',
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  gray: 'border-gray-300 bg-gray-50 text-gray-700',
};

export default function GolfFacilitiesSection({
  facilities,
  onFacilityToggle,
}: GolfFacilitiesSectionProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">부대시설</h3>
          <p className="text-sm text-gray-600">골프장에서 제공하는 시설을 선택하세요</p>
        </div>
      </div>

      {/* 시설 체크박스 그리드 (4열) */}
      <div className="grid grid-cols-4 gap-4">
        {GOLF_FACILITIES.map((facility) => {
          const Icon = facility.icon;
          const isSelected = facilities.includes(facility.id);

          return (
            <button
              key={facility.id}
              onClick={() => onFacilityToggle(facility.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `${colorClasses[facility.color as keyof typeof colorClasses]} shadow-lg ring-2 ring-offset-2 ring-${facility.color}-400`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? '' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}>
                  {facility.label}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
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

      {/* 선택된 시설 요약 */}
      {facilities.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            선택된 부대시설 ({facilities.length}개)
          </p>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facilityId) => {
              const facility = GOLF_FACILITIES.find(f => f.id === facilityId);
              if (!facility) return null;
              
              return (
                <span
                  key={facilityId}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[facility.color as keyof typeof colorClasses]}`}
                >
                  {facility.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
