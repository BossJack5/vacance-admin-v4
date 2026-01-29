'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChefHat, Plus, Trash2, GripVertical } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  allergyInfo: string;
}

interface MenuCategory {
  id: string;
  category: string;
  items: MenuItem[];
}

interface MenuManagementSectionProps {
  menuCategories: MenuCategory[];
  onCategoryAdd: () => void;
  onCategoryRemove: (categoryId: string) => void;
  onCategoryUpdate: (categoryId: string, field: string, value: string) => void;
  onItemAdd: (categoryId: string) => void;
  onItemRemove: (categoryId: string, itemId: string) => void;
  onItemUpdate: (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => void;
}

export default function MenuManagementSection({
  menuCategories,
  onCategoryAdd,
  onCategoryRemove,
  onCategoryUpdate,
  onItemAdd,
  onItemRemove,
  onItemUpdate,
}: MenuManagementSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <ChefHat className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">메뉴 관리</h2>
          <p className="text-sm text-gray-600">카테고리별로 메뉴를 등록하고 관리하세요</p>
        </div>
        <Button
          onClick={onCategoryAdd}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          카테고리 추가
        </Button>
      </div>

      <div className="space-y-6">
        {menuCategories.map((category, categoryIndex) => (
          <div
            key={category.id}
            className="border-2 border-green-200 rounded-xl bg-green-50 p-5"
          >
            {/* 카테고리 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <GripVertical className="w-5 h-5 text-green-600 cursor-move" />
              <div className="flex-1">
                <Input
                  value={category.category}
                  onChange={(e) => onCategoryUpdate(category.id, 'category', e.target.value)}
                  placeholder="카테고리명 (예: 시그니처, 메인 디시, 디저트)"
                  className="bg-white font-semibold"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onItemAdd(category.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  메뉴 추가
                </Button>
                {menuCategories.length > 1 && (
                  <Button
                    onClick={() => onCategoryRemove(category.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 메뉴 아이템 리스트 */}
            <div className="space-y-3">
              {category.items.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                  <ChefHat className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">메뉴가 없습니다. [메뉴 추가] 버튼을 클릭하세요.</p>
                </div>
              ) : (
                category.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-green-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-12 gap-3">
                      {/* 메뉴명 */}
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          메뉴명
                        </label>
                        <Input
                          value={item.name}
                          onChange={(e) => onItemUpdate(category.id, item.id, 'name', e.target.value)}
                          placeholder="예: 트러플 파스타"
                        />
                      </div>

                      {/* 가격 */}
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          가격 (원)
                        </label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => onItemUpdate(category.id, item.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="25000"
                        />
                      </div>

                      {/* 알레르기 정보 */}
                      <div className="col-span-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          알레르기 정보
                        </label>
                        <Input
                          value={item.allergyInfo}
                          onChange={(e) => onItemUpdate(category.id, item.id, 'allergyInfo', e.target.value)}
                          placeholder="견과류, 유제품, 갑각류 등"
                        />
                      </div>

                      {/* 삭제 버튼 */}
                      <div className="col-span-1 flex items-end">
                        <Button
                          onClick={() => onItemRemove(category.id, item.id)}
                          size="icon"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* 설명 */}
                      <div className="col-span-12">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          메뉴 설명
                        </label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => onItemUpdate(category.id, item.id, 'description', e.target.value)}
                          placeholder="재료, 조리법, 특징 등을 간단히 입력하세요"
                          className="h-20"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {menuCategories.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">메뉴 카테고리가 없습니다</p>
            <Button
              onClick={onCategoryAdd}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 카테고리 추가
            </Button>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 <strong>알레르기 정보 입력의 중요성:</strong> 유럽 현지 법규에 따라 알레르기 유발 식재료 정보 제공이 의무화되어 있습니다. 
            견과류, 유제품, 갑각류, 글루텐 등을 미리 입력하면 사용자 만족도가 크게 향상됩니다.
          </p>
        </div>
      </div>
    </Card>
  );
}
