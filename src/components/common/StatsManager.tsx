'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Heart, Share2, Bookmark, FileDown, Eye } from 'lucide-react';

interface StatsManagerProps {
  stats: Record<string, number>;
  onChange: (field: string, value: string) => void;
  fieldMapping?: {
    likes: string;
    shares: string;
    saves: string;
    pdfDownloads: string;
    views: string;
  };
}

export default function StatsManager({ 
  stats, 
  onChange,
  fieldMapping = {
    likes: 'likes',
    shares: 'shares',
    saves: 'saves',
    pdfDownloads: 'pdfDownloads',
    views: 'recentViews',
  }
}: StatsManagerProps) {
  const statFields = [
    { 
      key: fieldMapping.likes, 
      label: '찜 횟수', 
      icon: Heart, 
      color: 'pink',
      borderColor: 'hover:border-pink-300',
      iconColor: 'text-pink-500',
    },
    { 
      key: fieldMapping.shares, 
      label: '공유 횟수', 
      icon: Share2, 
      color: 'blue',
      borderColor: 'hover:border-blue-300',
      iconColor: 'text-blue-500',
    },
    { 
      key: fieldMapping.saves, 
      label: '저장 횟수', 
      icon: Bookmark, 
      color: 'green',
      borderColor: 'hover:border-green-300',
      iconColor: 'text-green-500',
    },
    { 
      key: fieldMapping.pdfDownloads, 
      label: 'PDF 다운로드', 
      icon: FileDown, 
      color: 'purple',
      borderColor: 'hover:border-purple-300',
      iconColor: 'text-purple-500',
    },
    { 
      key: fieldMapping.views, 
      label: '최근 조회', 
      icon: Eye, 
      color: 'orange',
      borderColor: 'hover:border-orange-300',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">통계 데이터 관리</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statFields.map(({ key, label, icon: Icon, borderColor, iconColor }) => (
          <div
            key={key}
            className={`p-4 border border-gray-200 rounded-lg transition-colors ${borderColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <label className="text-sm font-semibold text-gray-700">
                {label}
              </label>
            </div>
            <Input
              type="number"
              min="0"
              value={stats[key] || 0}
              onChange={(e) => onChange(key, e.target.value)}
              className="text-lg font-bold"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        💡 모든 통계는 수동으로 입력 가능하며, 초기값은 0입니다
      </p>
    </div>
  );
}
