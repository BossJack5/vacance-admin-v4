'use client';

import React, { useState } from 'react';
import { Package, Search, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductConnectionSectionProps {
  connectedProductIds: string[];
  onProductsChange: (productIds: string[]) => void;
}

// 실제 구현 시 Firebase에서 가져올 상품 데이터 타입
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
}

export default function ProductConnectionSection({
  connectedProductIds,
  onProductsChange,
}: ProductConnectionSectionProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 임시 Mock 데이터 (실제로는 Firebase에서 가져옴)
  const mockProducts: Product[] = [
    { id: 'prod_001', name: '베네치아 곤돌라 탑승권', category: '액티비티', price: 80, currency: 'EUR' },
    { id: 'prod_002', name: '두칼레 궁전 입장권', category: '문화', price: 28, currency: 'EUR' },
    { id: 'prod_003', name: '산마르코 대성당 가이드 투어', category: '투어', price: 45, currency: 'EUR' },
    { id: 'prod_004', name: '베네치아 글라스 공방 체험', category: '체험', price: 120, currency: 'EUR' },
  ];

  const connectedProducts = mockProducts.filter((p) =>
    connectedProductIds.includes(p.id)
  );

  const availableProducts = mockProducts.filter(
    (p) => !connectedProductIds.includes(p.id)
  );

  const filteredProducts = availableProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (productId: string) => {
    onProductsChange([...connectedProductIds, productId]);
    setSearchQuery('');
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(connectedProductIds.filter((id) => id !== productId));
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            연결 상품 관리
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            리스트 페이지에서 <span className="font-semibold text-purple-700">연결 상품 수</span>로 표시됩니다
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-700">
            {connectedProductIds.length}
          </div>
          <div className="text-xs text-gray-500">연결된 상품</div>
        </div>
      </div>

      {/* 연결된 상품 목록 */}
      {connectedProducts.length > 0 && (
        <div className="space-y-2 mb-4">
          {connectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {product.category} · {product.price} {product.currency}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveProduct(product.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 상품 검색 */}
      <div className="border-t border-purple-200 pt-4">
        <Button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          variant="outline"
          className="w-full border-purple-300 hover:bg-purple-50"
        >
          <Search className="w-4 h-4 mr-2" />
          상품 검색 및 연결
        </Button>

        {isSearchOpen && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품명으로 검색..."
              className="mb-3"
            />

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {searchQuery ? '검색 결과가 없습니다' : '연결 가능한 상품을 검색하세요'}
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.category} · {product.price} {product.currency}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddProduct(product.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      연결
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alex의 권장 알림 */}
      {connectedProductIds.length === 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            💡 <span className="font-semibold">커머스 전환을 위해 상품 연결을 권장합니다.</span> 연결된 상품이 없으면 리스트 페이지에서 전환율이 낮아질 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
