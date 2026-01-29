'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, Plus, Trash2 } from 'lucide-react';

interface MultimediaSectionProps {
  thumbnailUrl: string;
  videoUrl: string;
  audioGuideUrl: string;
  galleryUrls: string[];
  onFieldChange: (field: string, value: string) => void;
  onGalleryAdd: () => void;
  onGalleryUpdate: (index: number, value: string) => void;
  onGalleryRemove: (index: number) => void;
}

export default function MultimediaSection({
  thumbnailUrl,
  videoUrl,
  audioGuideUrl,
  galleryUrls,
  onFieldChange,
  onGalleryAdd,
  onGalleryUpdate,
  onGalleryRemove,
}: MultimediaSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-100 rounded-lg">
          <ImageIcon className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">이미지 및 멀티미디어</h2>
          <p className="text-sm text-gray-600">이미지와 영상 자료를 추가하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 대표 이미지 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            대표 이미지 (썸네일 URL)
          </label>
          <Input
            value={thumbnailUrl}
            onChange={(e) => onFieldChange('thumbnailUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* 영상 URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            YouTube / Vimeo 영상 URL
          </label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={videoUrl}
              onChange={(e) => onFieldChange('videoUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="pl-10"
            />
          </div>
        </div>

        {/* 오디오 가이드 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            오디오 가이드 MP3 URL
          </label>
          <Input
            value={audioGuideUrl}
            onChange={(e) => onFieldChange('audioGuideUrl', e.target.value)}
            placeholder="https://example.com/audio-guide.mp3"
          />
        </div>

        {/* 고화질 갤러리 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              고화질 갤러리 이미지
              <span className="text-xs text-gray-500 ml-2">(최대 20장)</span>
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={onGalleryAdd}
              disabled={galleryUrls.length >= 20}
            >
              <Plus className="w-4 h-4 mr-2" />
              이미지 추가
            </Button>
          </div>
          <div className="space-y-3">
            {galleryUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => onGalleryUpdate(index, e.target.value)}
                  placeholder={`이미지 URL ${index + 1}`}
                />
                {galleryUrls.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onGalleryRemove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
