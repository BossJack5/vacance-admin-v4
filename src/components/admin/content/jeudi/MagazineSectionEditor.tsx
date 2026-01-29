'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockEditor from './BlockEditor';
import CountryCitySelector from '@/components/admin/content/common/CountryCitySelector';

interface MagazineSection {
  id: string;
  countryId: string;
  countryName: string;
  cityId: string;
  cityName: string;
  subtitle: string;
  blocks: Array<{ type: string; data: any }>;
  isExpanded: boolean;
}

interface MagazineSectionEditorProps {
  sections: MagazineSection[];
  onSectionsChange: (sections: MagazineSection[]) => void;
}

export default function MagazineSectionEditor({
  sections,
  onSectionsChange,
}: MagazineSectionEditorProps) {

  const handleAddSection = () => {
    const newSection: MagazineSection = {
      id: `section_${Date.now()}`,
      countryId: '',
      countryName: '',
      cityId: '',
      cityName: '',
      subtitle: '',
      blocks: [],
      isExpanded: true,
    };
    onSectionsChange([...sections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    onSectionsChange(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onSectionsChange(newSections);
  };

  const handleCountryChange = (index: number, countryId: string, countryName: string) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      countryId,
      countryName,
      cityId: '',
      cityName: '',
    };
    onSectionsChange(newSections);
  };

  const handleCityChange = (index: number, cityId: string, cityName: string) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      cityId,
      cityName,
    };
    onSectionsChange(newSections);
  };

  const handleBlockAdd = (sectionIndex: number, type: string) => {
    const newSections = [...sections];
    const newBlock = {
      type,
      data: type === 'image' ? { images: [], captions: [] } : type === 'list' ? { title: '', items: [''] } : {}
    };
    newSections[sectionIndex].blocks.push(newBlock);
    onSectionsChange(newSections);
  };

  const handleBlockUpdate = (sectionIndex: number, blockIndex: number, data: any) => {
    const newSections = [...sections];
    newSections[sectionIndex].blocks[blockIndex] = {
      ...newSections[sectionIndex].blocks[blockIndex],
      data,
    };
    onSectionsChange(newSections);
  };

  const handleBlockRemove = (sectionIndex: number, blockIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].blocks = newSections[sectionIndex].blocks.filter(
      (_, i) => i !== blockIndex
    );
    onSectionsChange(newSections);
  };

  const handleBlockMove = (sectionIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const blocks = newSections[sectionIndex].blocks;
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    [blocks[blockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[blockIndex]];
    onSectionsChange(newSections);
  };

  const toggleSectionExpand = (index: number) => {
    const newSections = [...sections];
    newSections[index].isExpanded = !newSections[index].isExpanded;
    onSectionsChange(newSections);
  };

  return (
    <div className="space-y-6">
      {/* 섹션 추가 버튼 */}
      <Button
        onClick={handleAddSection}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        새 섹션 추가
      </Button>

      {/* 섹션 목록 */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600">섹션을 추가하여 매거진을 구성하세요</p>
        </div>
      ) : (
        sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="bg-white rounded-xl border-2 border-indigo-200 shadow-lg overflow-hidden"
          >
            {/* 섹션 헤더 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-indigo-900">
                    섹션 #{sectionIndex + 1}
                  </span>
                  {section.countryName && section.cityName && (
                    <span className="text-sm text-indigo-600">
                      {section.countryName} · {section.cityName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionExpand(sectionIndex)}
                  >
                    {section.isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSection(sectionIndex)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 섹션 내용 */}
            {section.isExpanded && (
              <div className="p-6 space-y-6">
                {/* 국가/도시 선택 */}
                <CountryCitySelector
                  countryId={section.countryId}
                  cityId={section.cityId}
                  onCountryChange={(countryId, countryName) =>
                    handleCountryChange(sectionIndex, countryId, countryName)
                  }
                  onCityChange={(cityId, cityName) =>
                    handleCityChange(sectionIndex, cityId, cityName)
                  }
                  required
                />

                {/* 부제 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부제
                  </label>
                  <Input
                    value={section.subtitle}
                    onChange={(e) => handleUpdateSection(sectionIndex, 'subtitle', e.target.value)}
                    placeholder="섹션 부제 (선택)"
                  />
                </div>

                {/* 블록 에디터 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">블록 추가</h3>
                  <BlockEditor
                    blocks={section.blocks}
                    cityName={section.cityName}
                    onBlockAdd={(type) => handleBlockAdd(sectionIndex, type)}
                    onBlockUpdate={(blockIndex, data) =>
                      handleBlockUpdate(sectionIndex, blockIndex, data)
                    }
                    onBlockRemove={(blockIndex) => handleBlockRemove(sectionIndex, blockIndex)}
                    onBlockMove={(blockIndex, direction) =>
                      handleBlockMove(sectionIndex, blockIndex, direction)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
