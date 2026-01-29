'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3, FileText, Image, List, MapPin, Link as LinkIcon } from 'lucide-react';

interface ContentAnalysisProps {
  blocks: Array<{ type: string }>;
}

export default function ContentAnalysis({ blocks }: ContentAnalysisProps) {
  const blockTypeMap = {
    'section_title': { label: '구간 제목', icon: FileText, color: 'blue' },
    'content_link': { label: '콘텐츠 링크', icon: LinkIcon, color: 'purple' },
    'essay': { label: '에세이', icon: FileText, color: 'indigo' },
    'image': { label: '이미지', icon: Image, color: 'pink' },
    'list': { label: '리스트', icon: List, color: 'green' },
    'location_detail': { label: '명소 상세', icon: MapPin, color: 'red' },
  };

  const blockCounts = blocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">콘텐츠 분석</h3>
      </div>

      {/* 총 블록 수 */}
      <div className="mb-4 p-3 bg-white rounded-lg">
        <p className="text-xs text-gray-600">총 블록 수</p>
        <p className="text-2xl font-bold text-blue-600">{blocks.length}</p>
      </div>

      {/* 타입별 분포 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 mb-2">타입별 분포</p>
        {Object.entries(blockCounts).map(([type, count]) => {
          const typeInfo = blockTypeMap[type as keyof typeof blockTypeMap];
          if (!typeInfo) return null;
          
          const Icon = typeInfo.icon;
          return (
            <div key={type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className={`w-3 h-3 text-${typeInfo.color}-600`} />
                <span className="text-gray-700">{typeInfo.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{count}</span>
            </div>
          );
        })}
      </div>

      {blocks.length === 0 && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          아직 블록이 없습니다
        </p>
      )}
    </Card>
  );
}
