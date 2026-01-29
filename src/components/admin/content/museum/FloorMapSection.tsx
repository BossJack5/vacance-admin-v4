'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Trash2 } from 'lucide-react';

interface FloorMap {
  id: string;
  floorName: string;
  imageUrl: string;
}

interface FloorMapSectionProps {
  floorMaps: FloorMap[];
  onFloorAdd: () => void;
  onFloorUpdate: (id: string, field: keyof FloorMap, value: string) => void;
  onFloorRemove: (id: string) => void;
}

export default function FloorMapSection({
  floorMaps,
  onFloorAdd,
  onFloorUpdate,
  onFloorRemove,
}: FloorMapSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-100 rounded-lg">
          <Layers className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">층별 안내도</h2>
          <p className="text-sm text-gray-600">다층 구조 박물관의 층별 안내 이미지를 관리하세요</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            층별 정보 관리
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={onFloorAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            층 추가
          </Button>
        </div>

        <div className="space-y-3">
          {floorMaps.map((floor, index) => (
            <div key={floor.id} className="flex gap-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-500 text-white rounded-lg font-bold">
                {index + 1}F
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={floor.floorName}
                  onChange={(e) => onFloorUpdate(floor.id, 'floorName', e.target.value)}
                  placeholder="층 이름 (예: 지하 1층, 1층, 전시홀 A)"
                />
                <Input
                  value={floor.imageUrl}
                  onChange={(e) => onFloorUpdate(floor.id, 'imageUrl', e.target.value)}
                  placeholder="안내도 이미지 URL"
                />
              </div>
              {floorMaps.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFloorRemove(floor.id)}
                  className="self-start"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {floorMaps.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Layers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-3">층별 안내도가 없습니다</p>
            <Button onClick={onFloorAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 층 추가
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
