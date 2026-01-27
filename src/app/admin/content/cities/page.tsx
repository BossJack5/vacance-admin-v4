'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cityDetailService } from '@/services/cityDetailService';
import { locationService } from '@/services/locationService';
import { CityDetail } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Flag,
  Star,
  TrendingUp,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CityWithCountry extends CityDetail {
  countryName?: string;
  countryCode?: string;
}

export default function CitiesPage() {
  const router = useRouter();
  const [cities, setCities] = useState<CityWithCountry[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityWithCountry[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCities();
  }, [cities, searchKeyword, selectedCountry, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 국가 목록과 도시 목록 동시 로드
      const [citiesData, countriesData] = await Promise.all([
        cityDetailService.getCityDetails(),
        locationService.getCountries()
      ]);

      // 도시에 국가 정보 매핑
      const citiesWithCountry = citiesData.map(city => {
        const country = countriesData.find(c => c.id === city.countryId);
        return {
          ...city,
          countryName: country?.nameKr || '알 수 없음',
          countryCode: country?.isoCode || 'XX',
        };
      });

      setCities(citiesWithCountry);
      setCountries(countriesData);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      toast.error('도시 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterCities = () => {
    let filtered = [...cities];

    // 키워드 검색 (도시명, 코드, 국가명)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (city) =>
          city.nameKr.toLowerCase().includes(keyword) ||
          city.nameEn.toLowerCase().includes(keyword) ||
          city.cityCode.toLowerCase().includes(keyword) ||
          (city.countryName && city.countryName.toLowerCase().includes(keyword))
      );
    }

    // 국가 필터
    if (selectedCountry !== 'all') {
      filtered = filtered.filter((city) => city.countryId === selectedCountry);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((city) => {
        const status = city.status || 'draft';
        return status === selectedStatus;
      });
    }

    setFilteredCities(filtered);
  };

  const handleView = (id: string) => {
    router.push(`/admin/content/cities/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/content/cities/${id}/edit`);
  };

  const handleDelete = async (id: string, cityName: string) => {
    if (!confirm(`정말 "${cityName}" 도시를 삭제하시겠습니까?`)) return;

    try {
      await cityDetailService.deleteCityDetail(id);
      toast.success('도시가 삭제되었습니다.');
      loadData();
    } catch (error) {
      console.error('도시 삭제 실패:', error);
      toast.error('도시 삭제에 실패했습니다.');
    }
  };

  const getStatusBadge = (city: CityWithCountry) => {
    const isPublished = city.status === 'published';
    
    if (isPublished) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          게시됨
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          초안
        </span>
      );
    }
  };

  const isPopularCity = (city: CityWithCountry): boolean => {
    // 통계 기준으로 인기 도시 판단 (예: 찜 500개 이상)
    return (city.stats?.likes || 0) >= 500;
  };

  // 구역 수와 POI 수는 임시로 랜덤 값 사용 (실제로는 관련 컬렉션에서 가져와야 함)
  const getRegionCount = () => Math.floor(Math.random() * 20) + 1;
  const getPoiCount = () => Math.floor(Math.random() * 100) + 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">도시 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              도시 상세 정보
            </h1>
            <p className="text-gray-600 mt-2">
              도시별 상세 정보, 구역, 교통패스, 필수 랜드마크 등을 관리합니다
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/cities/new')}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            새 도시 등록
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="도시명, 코드, 국가 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Country Filter */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="전체 국가" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 국가</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.nameKr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="전체 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
                <SelectItem value="draft">초안</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Count Display */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              총 <span className="text-indigo-600 font-bold text-lg">{filteredCities.length}</span>개 도시
            </p>
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                검색 초기화
              </button>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    도시명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    영문명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    코드
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    국가
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    구역 수
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    POI
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">등록된 도시가 없습니다</p>
                      <p className="text-sm text-gray-400 mt-1">
                        새 도시를 등록하여 시작하세요
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                      {/* 도시명 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {city.nameKr}
                              </span>
                              {isPopularCity(city) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                                  인기
                                </span>
                              )}
                            </div>
                            {city.tagline && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {city.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 영문명 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{city.nameEn}</span>
                      </td>

                      {/* 코드 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                          {city.cityCode}
                        </span>
                      </td>

                      {/* 국가 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-red-500" />
                          <span className="text-gray-900 font-medium">
                            {city.countryName}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({city.countryCode})
                          </span>
                        </div>
                      </td>

                      {/* 구역 수 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-700 font-medium">
                          {getRegionCount()}
                          <span className="text-gray-500 text-sm ml-1">개</span>
                        </span>
                      </td>

                      {/* POI */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-700 font-medium">
                          {getPoiCount()}
                          <span className="text-gray-500 text-sm ml-1">개</span>
                        </span>
                      </td>

                      {/* 상태 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(city)}
                      </td>

                      {/* 작업 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(city.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="조회"
                          >
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(city.id)}
                            className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
                            title="수정"
                          >
                            <Edit className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(city.id, city.nameKr)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stats Summary (Optional) */}
        {filteredCities.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 도시</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredCities.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">게시됨</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCities.filter(c => c.status === 'published').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">인기 도시</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredCities.filter(isPopularCity).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Flag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">등록 국가</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(filteredCities.map(c => c.countryId)).size}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
