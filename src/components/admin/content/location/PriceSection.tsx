'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

interface PriceItem {
  id: string;
  category: string;
  price: number;
  currency: string;
  note: string;
}

interface PriceSectionProps {
  priceItems: PriceItem[];
  bookingUrl: string;
  onPriceAdd: () => void;
  onPriceUpdate: (id: string, field: keyof PriceItem, value: any) => void;
  onPriceRemove: (id: string) => void;
  onBookingUrlChange: (value: string) => void;
}

export default function PriceSection({
  priceItems,
  bookingUrl,
  onPriceAdd,
  onPriceUpdate,
  onPriceRemove,
  onBookingUrlChange,
}: PriceSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <DollarSign className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">티켓 및 예약</h2>
          <p className="text-sm text-gray-600">입장료와 예약 정보를 설정하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 가격 정보 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              가격 정보
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={onPriceAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              요금 항목 추가
            </Button>
          </div>
          
          <div className="space-y-3">
            {priceItems.map(item => (
              <div key={item.id} className="flex gap-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Input
                    value={item.category}
                    onChange={(e) => onPriceUpdate(item.id, 'category', e.target.value)}
                    placeholder="구분명 (예: 성인, 학생, 어린이)"
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => onPriceUpdate(item.id, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="가격"
                  />
                </div>
                <div className="w-24">
                  <Select
                    value={item.currency}
                    onValueChange={(value) => onPriceUpdate(item.id, 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="KRW">KRW</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    value={item.note}
                    onChange={(e) => onPriceUpdate(item.id, 'note', e.target.value)}
                    placeholder="비고 (예: 온라인 예매 시 할인)"
                  />
                </div>
                {priceItems.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPriceRemove(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 실시간 예약 링크 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            실시간 예약 링크
          </label>
          <Input
            value={bookingUrl}
            onChange={(e) => onBookingUrlChange(e.target.value)}
            placeholder="https://booking.example.com/..."
          />
        </div>
      </div>
    </Card>
  );
}
