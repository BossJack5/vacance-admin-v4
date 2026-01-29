'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Share2, Bookmark, FileDown, Eye } from 'lucide-react';

interface AdminStatsSectionProps {
  likes: number;
  shares: number;
  saves: number;
  pdfDownloads: number;
  views: number;
  onStatsChange: (field: string, value: number) => void;
}

export default function AdminStatsSection({
  likes,
  shares,
  saves,
  pdfDownloads,
  views,
  onStatsChange,
}: AdminStatsSectionProps) {
  const stats = [
    { id: 'likes', label: '찜', value: likes, icon: Heart, color: 'red' },
    { id: 'shares', label: '공유', value: shares, icon: Share2, color: 'blue' },
    { id: 'saves', label: '저장', value: saves, icon: Bookmark, color: 'amber' },
    { id: 'pdfDownloads', label: 'PDF 다운', value: pdfDownloads, icon: FileDown, color: 'green' },
    { id: 'views', label: '조회수', value: views, icon: Eye, color: 'purple' },
  ];

  return (
    <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">사용자 통계 (수동 입력)</h3>
      <div className="space-y-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 text-${stat.color}-600`} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">{stat.label}</label>
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) => onStatsChange(stat.id, parseInt(e.target.value) || 0)}
                  min={0}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        💡 운영 데이터 보정용 입력 필드
      </p>
    </Card>
  );
}
