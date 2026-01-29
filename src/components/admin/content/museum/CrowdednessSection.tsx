'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart3 } from 'lucide-react';

interface CrowdednessData {
  [key: string]: number; // 0-100
}

interface CrowdednessSectionProps {
  crowdedness: CrowdednessData;
  onCrowdednessUpdate: (hour: string, value: number) => void;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const getCrowdednessColor = (value: number) => {
  if (value >= 80) return 'bg-red-500';
  if (value >= 60) return 'bg-orange-500';
  if (value >= 40) return 'bg-yellow-500';
  if (value >= 20) return 'bg-green-500';
  return 'bg-gray-300';
};

const getCrowdednessLabel = (value: number) => {
  if (value >= 80) return '매우 혼잡';
  if (value >= 60) return '혼잡';
  if (value >= 40) return '보통';
  if (value >= 20) return '여유';
  return '한산';
};

export default function CrowdednessSection({
  crowdedness,
  onCrowdednessUpdate,
}: CrowdednessSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">시간별 혼잡도 관리</h2>
          <p className="text-sm text-gray-600">시간대별 예상 혼잡도를 0~100 사이 값으로 입력하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 혼잡도 범례 */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-semibold text-gray-700">범례:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-600">0-19: 한산</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">20-39: 여유</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600">40-59: 보통</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-xs text-gray-600">60-79: 혼잡</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">80-100: 매우 혼잡</span>
          </div>
        </div>

        {/* 시간대별 입력 */}
        <div className="grid grid-cols-2 gap-4">
          {timeSlots.map(slot => {
            const value = crowdedness[slot] || 0;
            return (
              <div key={slot} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    {slot}
                  </label>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    value >= 80 ? 'bg-red-100 text-red-700' :
                    value >= 60 ? 'bg-orange-100 text-orange-700' :
                    value >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    value >= 20 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getCrowdednessLabel(value)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onCrowdednessUpdate(slot, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20"
                  />
                  {/* 시각적 바 */}
                  <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getCrowdednessColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8">
                    {value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
