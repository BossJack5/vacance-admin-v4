'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, ExternalLink } from 'lucide-react';

interface LocationSectionProps {
  countries: any[];
  cities: any[];
  filteredCities: any[];
  selectedCountryCode: string;
  selectedCityCode: string;
  gpsLatitude: string;
  gpsLongitude: string;
  address: string;
  googleMapId: string;
  phoneNumber: string;
  websiteUrl: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onFieldChange: (field: string, value: string) => void;
}

export default function LocationSection({
  countries,
  cities,
  filteredCities,
  selectedCountryCode,
  selectedCityCode,
  gpsLatitude,
  gpsLongitude,
  address,
  googleMapId,
  phoneNumber,
  websiteUrl,
  onCountryChange,
  onCityChange,
  onFieldChange,
}: LocationSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">위치 및 소속 정보</h2>
          <p className="text-sm text-gray-600">위치와 연락처 정보를 입력하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 국가 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            국가 선택 <span className="text-red-500">*</span>
          </label>
          <Select value={selectedCountryCode} onValueChange={onCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="국가를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.nameKr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 도시 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            도시 선택 <span className="text-red-500">*</span>
          </label>
          <Select 
            value={selectedCityCode} 
            onValueChange={onCityChange}
            disabled={!selectedCountryCode}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedCountryCode ? "도시를 선택하세요" : "먼저 국가를 선택하세요"} />
            </SelectTrigger>
            <SelectContent>
              {filteredCities.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.nameKr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* GPS 좌표 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GPS 위도 (Latitude)
          </label>
          <Input
            type="number"
            step="0.000001"
            value={gpsLatitude}
            onChange={(e) => onFieldChange('gpsLatitude', e.target.value)}
            placeholder="예: 48.858844"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GPS 경도 (Longitude)
          </label>
          <Input
            type="number"
            step="0.000001"
            value={gpsLongitude}
            onChange={(e) => onFieldChange('gpsLongitude', e.target.value)}
            placeholder="예: 2.294351"
          />
        </div>

        {/* 주소 */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            주소
          </label>
          <Input
            value={address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            placeholder="전체 주소를 입력하세요"
          />
        </div>

        {/* Google Map ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Google Map ID <span className="text-gray-400 text-xs">(선택)</span>
          </label>
          <Input
            value={googleMapId}
            onChange={(e) => onFieldChange('googleMapId', e.target.value)}
            placeholder="Google Map Place ID"
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            전화번호
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={phoneNumber}
              onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
              placeholder="+33 1 234 5678"
              className="pl-10"
            />
          </div>
        </div>

        {/* 공식 웹사이트 */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            공식 웹사이트
          </label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={websiteUrl}
              onChange={(e) => onFieldChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
