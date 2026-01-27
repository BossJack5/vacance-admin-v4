'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Check, LucideIcon } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

export interface TabConfig {
  key: string;
  icon: LucideIcon;
  title: string;
  titleEn: string;
  placeholder: string;
  activeStyle: string;
  inactiveStyle: string;
}

interface TabbedInfoEditorProps {
  sectionNumber: string; // e.g., "1-1", "3-1"
  sectionTitle: string; // e.g., "국가 기본 정보", "도시 기본 정보"
  sectionDescription: string;
  tabs: TabConfig[];
  basicInfo: any; // More flexible type to accept different shapes
  onBasicInfoChange: (data: any) => void;
  tabImages: any; // More flexible type to accept different shapes
  onTabImagesChange: (data: any) => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  showInheritanceBadge?: boolean;
  accordionGuideText?: string;
}

export default function TabbedInfoEditor({
  sectionNumber,
  sectionTitle,
  sectionDescription,
  tabs,
  basicInfo,
  onBasicInfoChange,
  tabImages,
  onTabImagesChange,
  isSaving = false,
  lastSaved = null,
  showInheritanceBadge = false,
  accordionGuideText,
}: TabbedInfoEditorProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) || tabs[0];
  const Icon = activeTabConfig.icon;

  return (
    <div className="border-t-2 border-zinc-200 pt-6 mt-6">
      {/* 섹션 헤더 */}
      <div className="bg-[#334155] rounded-t-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-lg font-bold text-white">
              {sectionNumber}. {sectionTitle}
            </h3>
            <p className="text-sm text-slate-300 mt-0.5">{sectionDescription}</p>
          </div>
        </div>
        {showInheritanceBadge && (
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <span className="text-xs font-semibold text-white">자동 상속됨</span>
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-x-2 border-gray-200 px-6 py-4">
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                  isActive ? tab.activeStyle : tab.inactiveStyle
                }`}
              >
                <TabIcon className="w-5 h-5" />
                {tab.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="bg-white border-2 border-t-0 border-gray-200 rounded-b-xl px-6 py-6">
        <div>
          {/* 탭 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 text-zinc-700" />
              <h4 className="text-lg font-bold text-zinc-900">
                {activeTabConfig.title}{' '}
                <span className="text-sm text-gray-500 font-normal">({activeTabConfig.titleEn})</span>
              </h4>
            </div>
            {/* 자동 저장 상태 */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                  저장 중...
                </span>
              ) : lastSaved ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {lastSaved.toLocaleTimeString()} 자동 저장됨
                </span>
              ) : null}
            </div>
          </div>

          {/* 텍스트 입력 영역 */}
          <div className="mb-6">
            <textarea
              value={basicInfo[activeTab] || ''}
              onChange={(e) =>
                onBasicInfoChange({ ...basicInfo, [activeTab]: e.target.value })
              }
              placeholder={activeTabConfig.placeholder}
              className="w-full min-h-[300px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y text-sm leading-relaxed"
            />
            <p className="text-xs text-gray-500 mt-2">
              일반 텍스트로 입력됩니다. 서식 없이 순수 텍스트만 저장됩니다.
            </p>
          </div>

          {/* 관련 이미지 업로더 */}
          <div className="mt-6">
            <h5 className="text-sm font-bold text-zinc-800 mb-3">🖼️ 관련 이미지 (최대 3장)</h5>

            <ImageUploader
              images={tabImages[activeTab] || []}
              maxImages={3}
              onImagesChange={(newImages) =>
                onTabImagesChange({ ...tabImages, [activeTab]: newImages })
              }
              aspectRatio="aspect-video"
              placeholder="관련 이미지를 추가하세요"
              showUrlInput={true}
              id={`tab-image-input-${activeTab}`}
            />

            {/* 하단 안내 박스 */}
            {accordionGuideText && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 아코디언 방식:</span> {accordionGuideText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
