'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Check, AlertCircle } from 'lucide-react';

interface NavigationTabItemProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  defaultPath: string;
  customUrl: string;
  isEnabled: boolean;
  onCustomUrlChange: (value: string) => void;
  onToggle: () => void;
  cityCode: string;
}

export default function NavigationTabItem({
  icon,
  label,
  colorClass,
  defaultPath,
  customUrl,
  isEnabled,
  onCustomUrlChange,
  onToggle,
  cityCode,
}: NavigationTabItemProps) {
  // Replace XXX with cityCode
  const computedDefaultPath = cityCode 
    ? defaultPath.replace(/XXX/g, cityCode) 
    : defaultPath;
  
  // Final URL: custom takes priority over default
  const finalUrl = customUrl.trim() || computedDefaultPath;

  return (
    <div className={`border-2 ${colorClass} rounded-lg p-4 bg-gradient-to-r from-white to-gray-50`}>
      <div className="flex items-center gap-4">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className={`w-10 h-10 ${colorClass.replace('border', 'bg').replace('200', '100')} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{label}</h4>
          </div>
        </div>

        {/* Center: URL Fields */}
        <div className="flex-1 space-y-3">
          {/* Default Path */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              자동 생성 URL (Default Path)
            </label>
            <div className="relative">
              <Input
                value={computedDefaultPath}
                readOnly
                className="bg-gray-100 text-gray-600 text-sm pr-10"
              />
              {!cityCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Custom URL Override */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              커스텀 URL 오버라이드
            </label>
            <Input
              value={customUrl}
              onChange={(e) => onCustomUrlChange(e.target.value)}
              placeholder="특정 시즌/제휴 페이지 URL 입력 (선택사항)"
              className="text-sm"
            />
          </div>

          {/* Final Applied URL */}
          <div>
            <label className="text-xs font-semibold text-green-600 mb-1 block flex items-center gap-1">
              <Check className="w-4 h-4" />
              최종 적용 URL
            </label>
            <Input
              value={finalUrl}
              readOnly
              className="bg-green-50 border-green-300 text-green-700 font-medium text-sm"
            />
          </div>
        </div>

        {/* Right: Toggle Switch */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${isEnabled ? 'text-green-700' : 'text-gray-500'}`}>
            {isEnabled ? '탭 활성화' : '비활성화'}
          </span>
        </div>
      </div>
    </div>
  );
}
