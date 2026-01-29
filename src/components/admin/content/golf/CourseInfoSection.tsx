'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Flag, Info } from 'lucide-react';

interface CourseInfoSectionProps {
  holes: number;
  par: number;
  courseType: 'public' | 'private' | 'semi-private';
  teeGrass: string;
  fairwayGrass: string;
  greenGrass: string;
  onHolesChange: (value: number) => void;
  onParChange: (value: number) => void;
  onCourseTypeChange: (value: 'public' | 'private' | 'semi-private') => void;
  onTeeGrassChange: (value: string) => void;
  onFairwayGrassChange: (value: string) => void;
  onGreenGrassChange: (value: string) => void;
}

export default function CourseInfoSection({
  holes,
  par,
  courseType,
  teeGrass,
  fairwayGrass,
  greenGrass,
  onHolesChange,
  onParChange,
  onCourseTypeChange,
  onTeeGrassChange,
  onFairwayGrassChange,
  onGreenGrassChange,
}: CourseInfoSectionProps) {
  // 잔디 종류 자동완성 제안 (Alex의 제언 반영)
  const grassSuggestions = [
    'Bentgrass',
    'Bermuda',
    'Zoysia',
    'Kentucky Bluegrass',
    'Ryegrass',
    'Paspalum'
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
          <Flag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">코스 정보</h3>
          <p className="text-sm text-gray-600">골프 코스의 스펙과 특성을 입력하세요</p>
        </div>
      </div>

      {/* Alex의 잔디 정보 가치 강조 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">💡 Alex의 인사이트</p>
            <p>"시리어스 골퍼들에게 Bentgrass냐 Bermuda냐는 매우 중요한 정보입니다"</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* 홀 수 / 파 / 운영 형태 (3열) */}
        <div className="grid grid-cols-3 gap-4">
          {/* 홀 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              홀 수 *
            </label>
            <select
              value={holes}
              onChange={(e) => onHolesChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={9}>9홀</option>
              <option value={18}>18홀</option>
              <option value={27}>27홀</option>
              <option value={36}>36홀</option>
            </select>
          </div>

          {/* 파 (Par) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파 (Par) *
            </label>
            <select
              value={par}
              onChange={(e) => onParChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={35}>Par 35 (9홀)</option>
              <option value={36}>Par 36 (9홀)</option>
              <option value={70}>Par 70</option>
              <option value={71}>Par 71</option>
              <option value={72}>Par 72</option>
              <option value={73}>Par 73</option>
            </select>
          </div>

          {/* 운영 형태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운영 형태 *
            </label>
            <select
              value={courseType}
              onChange={(e) => onCourseTypeChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="public">퍼블릭</option>
              <option value="private">회원제</option>
              <option value="semi-private">세미 프라이빗</option>
            </select>
          </div>
        </div>

        {/* 잔디 종류 (티, 페어웨이, 그린) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            잔디 종류 (Grass Type)
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* 티 그라운드 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">티 (Tee)</label>
              <Input
                value={teeGrass}
                onChange={(e) => onTeeGrassChange(e.target.value)}
                placeholder="Bermuda"
                list="grass-suggestions"
                className="border-green-300 focus:border-green-500"
              />
            </div>

            {/* 페어웨이 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">페어웨이 (Fairway)</label>
              <Input
                value={fairwayGrass}
                onChange={(e) => onFairwayGrassChange(e.target.value)}
                placeholder="Bermuda"
                list="grass-suggestions"
                className="border-green-300 focus:border-green-500"
              />
            </div>

            {/* 그린 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">그린 (Green)</label>
              <Input
                value={greenGrass}
                onChange={(e) => onGreenGrassChange(e.target.value)}
                placeholder="Bentgrass"
                list="grass-suggestions"
                className="border-green-300 focus:border-green-500"
              />
            </div>
          </div>

          {/* 잔디 종류 자동완성 데이터리스트 (Alex의 제언) */}
          <datalist id="grass-suggestions">
            {grassSuggestions.map((grass) => (
              <option key={grass} value={grass} />
            ))}
          </datalist>

          <p className="mt-2 text-xs text-gray-500">
            💡 시리어스 골퍼를 위한 상세 정보 - 학명 입력 시 자동완성 지원
          </p>
        </div>

        {/* 코스 스펙 요약 */}
        {holes && par && (
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm font-medium text-gray-700 mb-2">📊 코스 스펙 요약</p>
            <div className="flex items-center gap-6 text-sm text-gray-900">
              <div>
                <span className="font-bold text-green-700">{holes}홀</span>
              </div>
              <div>
                <span className="font-bold text-green-700">Par {par}</span>
              </div>
              <div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {courseType === 'public' ? '퍼블릭' : courseType === 'private' ? '회원제' : '세미 프라이빗'}
                </span>
              </div>
            </div>
            {(teeGrass || fairwayGrass || greenGrass) && (
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-medium mb-1">🌱 잔디 정보:</p>
                <div className="flex gap-4">
                  {teeGrass && <span>티: {teeGrass}</span>}
                  {fairwayGrass && <span>페어웨이: {fairwayGrass}</span>}
                  {greenGrass && <span>그린: {greenGrass}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
