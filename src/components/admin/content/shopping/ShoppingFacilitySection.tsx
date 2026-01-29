'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Package, Plane, ShoppingCart } from 'lucide-react';

interface ShoppingFacilitySectionProps {
  hasLuggageStorage: boolean;
  hasInternationalShipping: boolean;
  onLuggageStorageToggle: () => void;
  onInternationalShippingToggle: () => void;
}

export default function ShoppingFacilitySection({
  hasLuggageStorage,
  hasInternationalShipping,
  onLuggageStorageToggle,
  onInternationalShippingToggle,
}: ShoppingFacilitySectionProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">쇼핑 편의 시설</h3>
          <p className="text-sm text-gray-600">여행자를 위한 추가 서비스를 선택하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 수하물 보관 */}
        <button
          onClick={onLuggageStorageToggle}
          className={`
            p-6 rounded-xl border-2 transition-all duration-200 text-left
            ${hasLuggageStorage 
              ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-offset-2 ring-green-400' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${hasLuggageStorage ? 'bg-green-600' : 'bg-gray-200'}
            `}>
              <Package className={`w-6 h-6 ${hasLuggageStorage ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${hasLuggageStorage ? 'text-green-900' : 'text-gray-700'}`}>
                수하물 보관
              </h4>
              <p className={`text-sm ${hasLuggageStorage ? 'text-green-700' : 'text-gray-500'}`}>
                무거운 짐을 맡기고 편하게 쇼핑
              </p>
              {hasLuggageStorage && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  제공
                </div>
              )}
            </div>
          </div>
        </button>

        {/* 국제 배송 */}
        <button
          onClick={onInternationalShippingToggle}
          className={`
            p-6 rounded-xl border-2 transition-all duration-200 text-left
            ${hasInternationalShipping 
              ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-offset-2 ring-blue-400' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${hasInternationalShipping ? 'bg-blue-600' : 'bg-gray-200'}
            `}>
              <Plane className={`w-6 h-6 ${hasInternationalShipping ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${hasInternationalShipping ? 'text-blue-900' : 'text-gray-700'}`}>
                국제 배송
              </h4>
              <p className={`text-sm ${hasInternationalShipping ? 'text-blue-700' : 'text-gray-500'}`}>
                본국으로 직접 배송 가능
              </p>
              {hasInternationalShipping && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  제공
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* 안내 메시지 */}
      {(hasLuggageStorage || hasInternationalShipping) && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-900 mb-2">
            ✅ 제공 중인 서비스
          </p>
          <ul className="space-y-1 text-sm text-green-700">
            {hasLuggageStorage && (
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                수하물 보관 서비스
              </li>
            )}
            {hasInternationalShipping && (
              <li className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                국제 배송 서비스
              </li>
            )}
          </ul>
        </div>
      )}
    </Card>
  );
}
