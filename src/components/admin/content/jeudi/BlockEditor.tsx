'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trash2, Heading, Link as LinkIcon, FileText, Image as ImageIcon, List, MapPin, Plus } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import LocationSearchModal from '@/components/admin/content/jeudi/LocationSearchModal';

interface BlockEditorProps {
  blocks: Array<any>;
  cityName: string;
  onBlockAdd: (type: string) => void;
  onBlockUpdate: (index: number, data: any) => void;
  onBlockRemove: (index: number) => void;
  onBlockMove: (index: number, direction: 'up' | 'down') => void;
}

const BLOCK_TYPES = [
  { type: 'section_title', label: '구간 제목', icon: Heading, color: 'blue' },
  { type: 'content_link', label: '콘텐츠 링크', icon: LinkIcon, color: 'purple' },
  { type: 'essay', label: '에세이', icon: FileText, color: 'indigo' },
  { type: 'image', label: '이미지', icon: ImageIcon, color: 'pink' },
  { type: 'list', label: '리스트', icon: List, color: 'green' },
  { type: 'location_detail', label: '명소 상세', icon: MapPin, color: 'red' },
];

export default function BlockEditor({
  blocks,
  cityName,
  onBlockAdd,
  onBlockUpdate,
  onBlockRemove,
  onBlockMove,
}: BlockEditorProps) {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const renderBlockContent = (block: any, index: number) => {
    switch (block.type) {
      case 'section_title':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <Input
              value={block.data?.title || ''}
              onChange={(e) => onBlockUpdate(index, { ...block.data, title: e.target.value })}
              placeholder="구간 제목을 입력하세요"
            />
          </div>
        );

      case 'content_link':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">링크 제목</label>
              <Input
                value={block.data?.title || ''}
                onChange={(e) => onBlockUpdate(index, { ...block.data, title: e.target.value })}
                placeholder="링크 제목"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <Input
                value={block.data?.url || ''}
                onChange={(e) => onBlockUpdate(index, { ...block.data, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        );

      case 'essay':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">본문</label>
            <Textarea
              value={block.data?.content || ''}
              onChange={(e) => onBlockUpdate(index, { ...block.data, content: e.target.value })}
              placeholder="에세이 내용을 작성하세요..."
              className="min-h-[200px]"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 (드래그 앤 드롭 또는 URL 입력)
              </label>
              <ImageUploader
                images={block.data?.images || []}
                maxImages={10}
                onImagesChange={(images) => {
                  onBlockUpdate(index, { ...block.data, images });
                }}
                placeholder="이미지를 추가하세요 (최대 10장)"
                aspectRatio="aspect-video"
                tabName="jeudi-magazine"
              />
            </div>
            {(block.data?.images || []).map((img: string, imgIndex: number) => (
              <div key={imgIndex}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캡션 #{imgIndex + 1}
                </label>
                <Input
                  value={block.data?.captions?.[imgIndex] || ''}
                  onChange={(e) => {
                    const newCaptions = [...(block.data?.captions || [])];
                    newCaptions[imgIndex] = e.target.value;
                    onBlockUpdate(index, { ...block.data, captions: newCaptions });
                  }}
                  placeholder="이미지 캡션"
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">리스트 제목</label>
              <Input
                value={block.data?.title || ''}
                onChange={(e) => onBlockUpdate(index, { ...block.data, title: e.target.value })}
                placeholder="리스트 제목"
              />
            </div>
            {(block.data?.items || ['']).map((item: string, itemIndex: number) => (
              <div key={itemIndex} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(block.data?.items || [''])];
                    newItems[itemIndex] = e.target.value;
                    onBlockUpdate(index, { ...block.data, items: newItems });
                  }}
                  placeholder={`항목 ${itemIndex + 1}`}
                />
                {(block.data?.items || ['']).length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newItems = (block.data?.items || ['']).filter((_: any, i: number) => i !== itemIndex);
                      onBlockUpdate(index, { ...block.data, items: newItems });
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newItems = [...(block.data?.items || ['']), ''];
                onBlockUpdate(index, { ...block.data, items: newItems });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              항목 추가
            </Button>
          </div>
        );

      case 'location_detail':
        return (
          <div className="space-y-3">
            {!cityName ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ 명소를 선택하려면 먼저 <span className="font-semibold">도시명</span>을 입력해주세요.
                </p>
              </div>
            ) : block.data?.locationId ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      {block.data?.locationName}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {block.data?.locationType} · ID: {block.data?.locationId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentBlockIndex(index);
                      setLocationModalOpen(true);
                    }}
                  >
                    변경
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setCurrentBlockIndex(index);
                  setLocationModalOpen(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {cityName}의 명소 검색
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {locationModalOpen && cityName && currentBlockIndex !== null && (
        <LocationSearchModal
          cityName={cityName}
          onLocationSelect={(location) => {
            const block = blocks[currentBlockIndex];
            onBlockUpdate(currentBlockIndex, {
              ...block.data,
              locationId: location.id,
              locationName: location.name,
              locationType: location.type,
            });
          }}
          onClose={() => {
            setLocationModalOpen(false);
            setCurrentBlockIndex(null);
          }}
        />
      )}
      <div className="space-y-6">
      {/* Add Block Buttons */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-3">블록 추가</p>
        <div className="grid grid-cols-3 gap-2">
          {BLOCK_TYPES.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.type}
                onClick={() => onBlockAdd(blockType.type)}
                className={`p-3 rounded-lg border-2 border-${blockType.color}-200 bg-${blockType.color}-50 hover:bg-${blockType.color}-100 transition-colors`}
              >
                <Icon className={`w-5 h-5 text-${blockType.color}-600 mx-auto mb-1`} />
                <p className="text-xs font-medium text-gray-700">{blockType.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">블록을 추가하여 매거진을 작성하세요</p>
        </div>
      ) : (
        blocks.map((block, index) => {
          const blockType = BLOCK_TYPES.find(t => t.type === block.type);
          const Icon = blockType?.icon || FileText;

          return (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              {/* Block Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${blockType?.color}-600`} />
                  <span className="font-semibold text-gray-900">{blockType?.label}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onBlockMove(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onBlockMove(index, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onBlockRemove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Block Content */}
              {renderBlockContent(block, index)}
            </div>
          );
        })
      )}
      </div>
    </>
  );
}
