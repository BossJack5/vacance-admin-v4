'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface MasterSearchSelectProps<T> {
  label: string;
  required?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  onChange: (value: string) => void;
  items: T[];
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  getItemSecondary?: (item: T) => string;
  filterItems: (items: T[], keyword: string) => T[];
  className?: string;
  helpText?: string;
}

export default function MasterSearchSelect<T>({
  label,
  required = false,
  placeholder,
  searchPlaceholder,
  value,
  onChange,
  items,
  getItemId,
  getItemLabel,
  getItemSecondary,
  filterItems,
  className = '',
  helpText,
}: MasterSearchSelectProps<T>) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  // Filter items based on search keyword
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = filterItems(items, searchKeyword);
      setFilteredItems(filtered);
    }
  }, [items, searchKeyword, filterItems]);

  return (
    <div className={className}>
      <label className="text-sm font-semibold text-gray-700 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Select Dropdown */}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredItems.map((item) => (
              <SelectItem key={getItemId(item)} value={getItemId(item)}>
                {getItemLabel(item)}
                {getItemSecondary && ` ${getItemSecondary(item)}`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Help Text or Result Count */}
      {searchKeyword && filteredItems.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {filteredItems.length}개의 결과가 검색되었습니다
        </p>
      )}
      {helpText && !searchKeyword && (
        <p className="text-xs text-gray-500 mt-2">{helpText}</p>
      )}
    </div>
  );
}
