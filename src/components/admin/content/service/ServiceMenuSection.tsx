'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Scissors, Plus, X, Clock, DollarSign, Info } from 'lucide-react';

interface ServiceMenuItem {
  id: string;
  name: string;
  duration: number | null;
  price: number;
  currency: 'EUR' | 'USD' | 'KRW';
  description: string;
}

interface ServiceMenuSectionProps {
  serviceMenus: ServiceMenuItem[];
  onMenuAdd: () => void;
  onMenuRemove: (id: string) => void;
  onMenuUpdate: (id: string, field: keyof ServiceMenuItem, value: any) => void;
}

export default function ServiceMenuSection({
  serviceMenus,
  onMenuAdd,
  onMenuRemove,
  onMenuUpdate,
}: ServiceMenuSectionProps) {
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'KRW': return '₩';
      default: return '€';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">서비스 메뉴 관리</h3>
            <p className="text-sm text-gray-600">제공하는 서비스와 가격을 등록하세요</p>
          </div>
        </div>
        <Button
          onClick={onMenuAdd}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          메뉴 추가
        </Button>
      </div>

      {/* Alex의 설계 원칙 안내 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-300">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-900">
            <p className="font-semibold mb-1">💡 Alex의 설계 원칙</p>
            <p>"입력하면 보여주고, 비워두면 숨긴다"</p>
            <p className="text-xs mt-1 text-purple-700">
              서비스 시간이나 설명을 비워두면 사용자 앱에서 자동으로 숨겨집니다
            </p>
          </div>
        </div>
      </div>

      {/* 서비스 메뉴 리스트 */}
      <div className="space-y-4">
        {serviceMenus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-purple-300">
            <Scissors className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">등록된 서비스가 없습니다</p>
            <Button
              onClick={onMenuAdd}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 서비스 추가하기
            </Button>
          </div>
        ) : (
          serviceMenus.map((menu, index) => (
            <div
              key={menu.id}
              className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* 순서 번호 */}
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  {index + 1}
                </div>

                {/* 입력 필드들 */}
                <div className="flex-1 space-y-4">
                  {/* 서비스명 (필수) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      서비스명 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={menu.name}
                      onChange={(e) => onMenuUpdate(menu.id, 'name', e.target.value)}
                      placeholder="예: 아로마 마사지"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>

                  {/* 서비스 시간 & 금액 (2열 레이아웃) */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 서비스 시간 (선택) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        서비스 시간 (선택)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={menu.duration || ''}
                          onChange={(e) => onMenuUpdate(menu.id, 'duration', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="60"
                          min={0}
                          className="pl-10 border-purple-200 focus:border-purple-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          분
                        </span>
                      </div>
                    </div>

                    {/* 금액 (필수) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        금액 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="number"
                            value={menu.price}
                            onChange={(e) => onMenuUpdate(menu.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="100"
                            min={0}
                            step={0.01}
                            className="pl-10 border-purple-200 focus:border-purple-500"
                          />
                        </div>
                        <select
                          value={menu.currency}
                          onChange={(e) => onMenuUpdate(menu.id, 'currency', e.target.value)}
                          className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                          <option value="KRW">KRW (₩)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 서비스 설명 (선택) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      서비스 설명 (선택)
                    </label>
                    <Textarea
                      value={menu.description}
                      onChange={(e) => onMenuUpdate(menu.id, 'description', e.target.value)}
                      placeholder="서비스에 대한 간단한 설명..."
                      className="min-h-[80px] border-purple-200 focus:border-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      비워두면 사용자 앱에서 숨겨집니다
                    </p>
                  </div>

                  {/* 미리보기 */}
                  {menu.name && menu.price > 0 && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-medium text-purple-900 mb-2">
                        📱 앱 노출 미리보기
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{menu.name}</p>
                        <div className="flex items-center gap-3 text-gray-600 mt-1">
                          {menu.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {menu.duration}분
                            </span>
                          )}
                          <span className="font-bold text-purple-700">
                            {getCurrencySymbol(menu.currency)}{menu.price.toLocaleString()}
                          </span>
                        </div>
                        {menu.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {menu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 삭제 버튼 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMenuRemove(menu.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 요약 정보 */}
      {serviceMenus.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                총 {serviceMenus.length}개 서비스 등록
              </p>
              <p className="text-xs text-gray-500 mt-1">
                필수 입력: 서비스명, 금액 | 선택 입력: 시간, 설명
              </p>
            </div>
            <Button
              onClick={onMenuAdd}
              variant="outline"
              size="sm"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
