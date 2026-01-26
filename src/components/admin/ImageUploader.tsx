'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { uploadTabImage } from '@/lib/storageService';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  maxImages?: number;
  onImagesChange: (images: string[]) => void;
  aspectRatio?: string;
  placeholder?: string;
  showUrlInput?: boolean;
  id?: string;
  tabName?: string; // 탭별 Storage 경로를 위한 prop
}

// 이미지 URL 유효성 검증 Regex
const isValidImageUrl = (url: string): boolean => {
  // URL 형식 체크
  const urlPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
  if (!urlPattern.test(url)) return false;

  // 이미지 확장자 체크
  const imageExtPattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
  return imageExtPattern.test(url);
};

export default function ImageUploader({
  images,
  maxImages = 3,
  onImagesChange,
  aspectRatio = 'aspect-video',
  placeholder = '이미지를 추가하세요',
  showUrlInput = true,
  id = 'image-uploader',
  tabName = 'general',
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // URL 추가
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) {
      toast.error('이미지 URL을 입력하세요.');
      return;
    }

    if (!isValidImageUrl(url)) {
      toast.error('유효한 이미지 URL이 아닙니다. (jpg, png, gif, webp 등)');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`최대 ${maxImages}장까지만 등록 가능합니다.`);
      return;
    }

    onImagesChange([...images, url]);
    setUrlInput('');
    toast.success('이미지가 추가되었습니다.');
  };

  // 파일 업로드 및 WebP 변환 처리
  const handleFileUpload = async (file: File) => {
    if (images.length >= maxImages) {
      toast.error(`최대 ${maxImages}장까지만 등록 가능합니다.`);
      return;
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp, bmp)');
      return;
    }

    // 파일 크기 제한 (5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`파일 크기가 너무 큽니다. (${sizeInMB}MB / 최대 5MB)`);
      return;
    }

    try {
      setIsUploading(true);
      toast.loading('이미지를 WebP로 변환 및 업로드 중...', { id: 'upload' });

      // WebP 변환 및 Firebase Storage 업로드
      const downloadURL = await uploadTabImage(file, tabName);

      onImagesChange([...images, downloadURL]);
      toast.success('이미지가 업로드되었습니다.', { id: 'upload' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('이미지 업로드에 실패했습니다.', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 드롭 처리
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // 여러 파일이 드롭된 경우 첫 번째 파일만 처리
    if (files.length > 1) {
      toast('여러 파일이 감지되었습니다. 첫 번째 파일만 업로드됩니다.', {
        icon: '📎',
        duration: 3000,
      });
    }

    const file = files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 여러 파일이 선택된 경우 첫 번째 파일만 처리
    if (files.length > 1) {
      toast('여러 파일이 선택되었습니다. 첫 번째 파일만 업로드됩니다.', {
        icon: '📎',
        duration: 3000,
      });
    }

    const file = files[0];
    if (file) {
      await handleFileUpload(file);
    }
    e.target.value = '';
  };

  // 이미지 제거
  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    toast.success('이미지가 제거되었습니다.');
  };

  return (
    <div>
      {/* URL 입력 */}
      {showUrlInput && (
        <div className="flex gap-2 mb-4">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            placeholder="이미지 URL을 입력하세요 (또는 파일 업로드)"
            className="flex-1 bg-white border-gray-300"
            disabled={images.length >= maxImages || isUploading}
          />
          <Button
            type="button"
            onClick={handleAddUrl}
            disabled={images.length >= maxImages || isUploading}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            + 추가
          </Button>
        </div>
      )}

      {/* 드롭존 / 이미지 리스트 */}
      <input
        type="file"
        id={id}
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={images.length >= maxImages || isUploading}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (images.length < maxImages && !isUploading) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          images.length >= maxImages || isUploading
            ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed'
            : isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer'
        }`}
      >
        {images.length === 0 ? (
          <label
            htmlFor={id}
            className={`flex flex-col items-center justify-center py-8 ${
              isUploading ? 'cursor-wait' : 'cursor-pointer'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-semibold text-gray-700 mb-1">{placeholder}</p>
            <p className="text-xs text-gray-500">클릭하거나 파일을 드래그하여 업로드</p>
            <p className="text-xs text-amber-600 mt-2">자동으로 WebP로 변환 및 압축됩니다</p>
            <p className="text-xs text-gray-400 mt-1">지원 형식: jpg, png, gif, webp, bmp (최대 5MB)</p>
          </label>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className={`relative ${aspectRatio} rounded-lg overflow-hidden border border-gray-200 group`}
              >
                <img
                  src={imgUrl}
                  alt={`이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={isUploading}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < maxImages && (
              <label
                htmlFor={id}
                className={`${aspectRatio} rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center ${
                  isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/20'
                } transition-all`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">추가</span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
