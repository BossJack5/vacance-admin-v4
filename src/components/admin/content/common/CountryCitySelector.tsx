'use client';

import React, { useState, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface Country {
  id: string;
  nameKr: string;
  nameEn: string;
}

interface City {
  id: string;
  nameKr: string;
  countryId: string;
}

interface CountryCitySelectorProps {
  countryId: string;
  cityId: string;
  onCountryChange: (countryId: string, countryName: string) => void;
  onCityChange: (cityId: string, cityName: string) => void;
  required?: boolean;
}

export default function CountryCitySelector({
  countryId,
  cityId,
  onCountryChange,
  onCityChange,
  required = false,
}: CountryCitySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (countryId) {
      fetchCities(countryId);
    }
    // countryId가 없을 때는 아무것도 하지 않음 (기존 cities 유지)
  }, [countryId]);

  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'), orderBy('nameKr', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        nameKr: doc.data().nameKr || '',
        nameEn: doc.data().nameEn || '',
      }));
      setCountries(data);
    } catch (error) {
      console.error('국가 로드 실패:', error);
    }
  };

  const fetchCities = async (selectedCountryId: string) => {
    console.log('🔍 Fetching cities for countryId:', selectedCountryId);
    setLoading(true);
    try {
      const q = query(
        collection(db, 'cities'),
        where('countryId', '==', selectedCountryId)
      );
      const snapshot = await getDocs(q);
      console.log('📊 Cities snapshot size:', snapshot.size);
      
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        console.log('🏙️ City doc:', doc.id, docData);
        return {
          id: doc.id,
          nameKr: docData.nameKr || '',
          countryId: docData.countryId || '',
        };
      });
      
      console.log('✅ Loaded cities:', data);
      setCities(data);
    } catch (error) {
      console.error('❌ 도시 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryId = e.target.value;
    const country = countries.find((c) => c.id === selectedCountryId);
    
    console.log('🌍 Country changed:', selectedCountryId, country?.nameKr);
    
    // 도시 선택 초기화
    onCityChange('', '');
    
    // 국가 변경
    onCountryChange(selectedCountryId, country ? country.nameKr : '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = e.target.value;
    const city = cities.find((c) => c.id === selectedCityId);
    onCityChange(selectedCityId, city ? city.nameKr : '');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 국가 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          관련 국가 {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={countryId}
          onChange={handleCountryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">국가를 선택하세요</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.nameKr} ({country.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* 도시 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          관련 도시 {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={cityId}
          onChange={handleCityChange}
          disabled={!countryId || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {!countryId
              ? '먼저 국가를 선택하세요'
              : loading
              ? '로딩 중...'
              : '도시를 선택하세요'}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.nameKr}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
