'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface City {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
}

interface Country {
  id: string;
  nameKr: string;
  nameEn: string;
}

interface CitySearchSectionProps {
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
}

export default function CitySearchSection({
  selectedCities,
  onCitiesChange,
}: CitySearchSectionProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cities, setCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const q = query(collection(db, 'countries'), orderBy('nameKr', 'asc'));
      const countriesSnapshot = await getDocs(q);
      const countriesData = countriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nameKr: doc.data().nameKr || '',
        nameEn: doc.data().nameEn || '',
      }));
      setCountries(countriesData);
    } catch (error) {
      console.error('국가 목록 로드 실패:', error);
    }
  };

  const fetchCities = async (countryId: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'cities'),
        where('countryId', '==', countryId)
      );
      const citiesSnapshot = await getDocs(q);
      const citiesData = citiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '',
        countryId: doc.data().countryId || '',
        countryName: doc.data().countryName || '',
      }));
      setCities(citiesData);
    } catch (error) {
      console.error('도시 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(
    (city) =>
      !selectedCities.includes(city.name) &&
      (city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.countryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCity = (cityName: string) => {
    if (!selectedCities.includes(cityName)) {
      onCitiesChange([...selectedCities, cityName]);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleRemoveCity = (cityName: string) => {
    onCitiesChange(selectedCities.filter((c) => c !== cityName));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">관련 도시</h2>
      <p className="text-sm text-gray-600 mb-4">
        이 스페셜이 연관된 도시를 검색하여 추가하세요
      </p>

      {/* 국가 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          국가 선택 *
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setCities([]);
            setSearchQuery('');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">국가를 선택하세요</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.nameKr} ({country.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* 선택된 도시 목록 */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCities.map((cityName, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{cityName}</span>
              <button
                onClick={() => handleRemoveCity(cityName)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 도시 검색 */}
      <Button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        variant="outline"
        className="w-full border-blue-300 hover:bg-blue-50"
        disabled={!selectedCountry}
      >
        <Search className="w-4 h-4 mr-2" />
        도시 검색 및 추가
      </Button>

      {!selectedCountry && (
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ 먼저 국가를 선택해주세요
        </p>
      )}

      {isSearchOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="도시명 또는 국가명으로 검색..."
            className="mb-3"
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-4">로딩 중...</p>
            ) : filteredCities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {searchQuery ? '검색 결과가 없습니다' : '도시를 검색하세요'}
              </p>
            ) : (
              filteredCities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleAddCity(city.name)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {city.name}
                      </div>
                      <div className="text-xs text-gray-500">{city.countryName}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCity(city.name);
                    }}
                  >
                    추가
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedCities.length === 0 && (
        <p className="text-sm text-gray-400 italic mt-4">
          아직 추가된 도시가 없습니다
        </p>
      )}
    </div>
  );
}
