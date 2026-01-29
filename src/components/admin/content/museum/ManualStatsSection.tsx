'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart3, Heart, Share2, Bookmark, FileDown, Eye, TrendingUp } from 'lucide-react';

interface ManualStats {
  likes: number;
  shares: number;
  saves: number;
  pdfDownloads: number;
  recentViews: number;
}

interface ManualStatsSectionProps {
  stats: ManualStats;
  onStatsChange: (field: keyof ManualStats, value: number) => void;
}

export default function ManualStatsSection({
  stats,
  onStatsChange,
}: ManualStatsSectionProps) {
  // 총 인터랙션 계산
  const totalInteractions = useMemo(() => {
    return stats.likes + stats.shares + stats.saves + stats.pdfDownloads;
  }, [stats.likes, stats.shares, stats.saves, stats.pdfDownloads]);

  // 최근 인기도 계산 (가중치 적용)
  const recentPopularity = useMemo(() => {
    // 찜(3점) + 공유(2점) + 저장(2점) + PDF(1점) + 조회수(0.1점)
    const weighted = 
      (stats.likes * 3) + 
      (stats.shares * 2) + 
      (stats.saves * 2) + 
      (stats.pdfDownloads * 1) + 
      (stats.recentViews * 0.1);
    return Math.round(weighted);
  }, [stats]);

  const handleInputChange = (field: keyof ManualStats, value: string) => {
    const numValue = parseInt(value) || 0;
    onStatsChange(field, Math.max(0, numValue)); // 음수 방지
  };

  return (
    <Card className="p-6 bg-green-50 border-green-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-200 rounded-lg">
          <BarChart3 className="w-6 h-6 text-green-700" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">사용자 통계 데이터 (수동 입력)</h2>
          <p className="text-sm text-gray-600">관리자 전용 데이터 보정 및 테스트 섹션</p>
        </div>
        <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
          ADMIN ONLY
        </div>
      </div>

      <div className="space-y-6">
        {/* 입력 필드 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 찜 횟수 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              찜 횟수
            </label>
            <Input
              type="number"
              min="0"
              value={stats.likes}
              onChange={(e) => handleInputChange('likes', e.target.value)}
              placeholder="0"
              className="bg-white"
            />
          </div>

          {/* 공유 횟수 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              공유 횟수
            </label>
            <Input
              type="number"
              min="0"
              value={stats.shares}
              onChange={(e) => handleInputChange('shares', e.target.value)}
              placeholder="0"
              className="bg-white"
            />
          </div>

          {/* 저장 횟수 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Bookmark className="w-4 h-4 text-yellow-500" />
              박물관 저장 횟수
            </label>
            <Input
              type="number"
              min="0"
              value={stats.saves}
              onChange={(e) => handleInputChange('saves', e.target.value)}
              placeholder="0"
              className="bg-white"
            />
          </div>

          {/* PDF 다운로드 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileDown className="w-4 h-4 text-purple-500" />
              PDF 다운로드 횟수
            </label>
            <Input
              type="number"
              min="0"
              value={stats.pdfDownloads}
              onChange={(e) => handleInputChange('pdfDownloads', e.target.value)}
              placeholder="0"
              className="bg-white"
            />
          </div>

          {/* 최근 7일 조회수 */}
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              최근 7일 조회수
            </label>
            <Input
              type="number"
              min="0"
              value={stats.recentViews}
              onChange={(e) => handleInputChange('recentViews', e.target.value)}
              placeholder="0"
              className="bg-white"
            />
          </div>
        </div>

        {/* 자동 계산 카드 */}
        <div className="border-t-2 border-green-300 pt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            자동 계산 지표
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 총 인터랙션 */}
            <div className="bg-white border-2 border-green-300 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">총 인터랙션</div>
              <div className="text-2xl font-bold text-green-700">
                {totalInteractions.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                찜 + 공유 + 저장 + PDF
              </div>
            </div>

            {/* 최근 인기도 */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="text-xs opacity-90 mb-1">최근 인기도 스코어</div>
              <div className="text-2xl font-bold">
                {recentPopularity.toLocaleString()}
              </div>
              <div className="text-xs opacity-90 mt-1">
                가중치 적용 (찜×3 + 공유×2 + 저장×2 + PDF×1 + 조회×0.1)
              </div>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ 관리자 전용 기능:</strong> 이 섹션은 알고리즘 테스트 및 데이터 보정을 위한 수동 입력 도구입니다. 
            실제 서비스에서는 자동으로 집계되는 값이지만, 초기 운영 단계에서는 임의의 값을 설정하여 
            인기도 로직을 검증할 수 있습니다.
          </p>
        </div>
      </div>
    </Card>
  );
}
