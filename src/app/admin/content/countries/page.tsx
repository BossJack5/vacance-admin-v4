'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { countryDetailService, CountryDetail } from '@/services/countryDetailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryDetail[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryDetail[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const continents = [
    { value: 'all', label: '전체 대륙' },
    { value: 'asia', label: '아시아' },
    { value: 'europe', label: '유럽' },
    { value: 'africa', label: '아프리카' },
    { value: 'north-america', label: '북아메리카' },
    { value: 'south-america', label: '남아메리카' },
    { value: 'oceania', label: '오세아니아' },
  ];

  const statuses = [
    { value: 'all', label: '전체 상태' },
    { value: 'active', label: '활성' },
    { value: 'inactive', label: '비활성' },
  ];

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    filterCountries();
  }, [countries, searchKeyword, selectedContinent, selectedStatus]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await countryDetailService.getCountryDetails();
      setCountries(data);
    } catch (error) {
      toast.error('국가 상세 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterCountries = () => {
    let filtered = [...countries];

    // 키워드 검색
    if (searchKeyword) {
      filtered = filtered.filter(
        (country) =>
          country.nameKr.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          country.nameEn.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          country.code.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 대륙 필터
    if (selectedContinent !== 'all') {
      filtered = filtered.filter((country) => country.continent === selectedContinent);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (country) => country.status === selectedStatus
      );
    }

    setFilteredCountries(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 국가를 삭제하시겠습니까?')) return;
    
    try {
      await countryDetailService.deleteCountryDetail(id);
      toast.success('국가가 삭제되었습니다.');
      loadCountries();
    } catch (error) {
      toast.error('국가 삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['국가명(한글)', '국가명(영문)', '코드', '대륙', '도시 수', '상태'].join(','),
      ...filteredCountries.map((country) =>
        [
          country.nameKr,
          country.nameEn,
          country.code,
          country.continent || '',
          country.cityCount || 0,
          country.status || 'active',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `country_details_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('데이터를 내보냈습니다.');
  };

  const getStatusBadge = (status?: string) => {
    const activeStatus = status || 'active';
    if (activeStatus === 'active') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          활성
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        비활성
      </span>
    );
  };

  const getContinentName = (continent?: string) => {
    const found = continents.find((c) => c.value === continent);
    return found ? found.label : continent || '-';
  };

  return (
    <div className="p-8 space-y-6">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">국가 상세 정보</h1>
          <p className="text-zinc-600 mt-2">
            여행 가능한 국가 정보를 관리하고 상세 데이터를 확인하세요
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/content/countries/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + 새 국가 등록
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-zinc-700 mb-2 block">
              키워드 검색
            </label>
            <Input
              placeholder="국가명, 코드로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-zinc-700 mb-2 block">
              대륙 선택
            </label>
            <Select value={selectedContinent} onValueChange={setSelectedContinent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {continents.map((continent) => (
                  <SelectItem key={continent.value} value={continent.value}>
                    {continent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold text-zinc-700 mb-2 block">
              상태 선택
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 데이터 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  국가명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  영문명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  코드
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  대륙
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  도시 수
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {country.nameKr.charAt(0)}
                        </div>
                        <span className="font-medium text-zinc-900">
                          {country.nameKr}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{country.nameEn}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-mono font-semibold rounded bg-zinc-100 text-zinc-700">
                        {country.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {getContinentName(country.continent)}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {country.cityCount || 0}개
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(country.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast('상세 보기 기능은 준비 중입니다.')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast('수정 기능은 준비 중입니다.')}
                          className="text-zinc-600 hover:text-zinc-700"
                        >
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(country.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 하단 액션 */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              데이터 일괄 관리
            </h3>
            <p className="text-sm text-zinc-600">
              국가 데이터를 내보내거나 일괄 업로드할 수 있습니다
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-zinc-300"
            >
              📥 내보내기
            </Button>
            <Button
              variant="outline"
              onClick={() => toast('일괄 업로드 기능은 준비 중입니다.')}
              className="border-zinc-300"
            >
              📤 일괄 업로드
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
