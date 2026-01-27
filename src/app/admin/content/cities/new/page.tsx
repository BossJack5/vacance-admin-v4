'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cityDetailService } from '@/services/cityDetailService';
import { countryDetailService, CountryDetail } from '@/services/countryDetailService';
import { locationService } from '@/services/locationService';
import { Country, CityMaster } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Search, Info, Star, Heart, Share2, Bookmark, FileDown, Eye, Globe, Building2, Check, X, Mountain, Cloud, Users } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import CityMasterSearchModal from '@/components/admin/content/CityMasterSearchModal';
import MasterSearchSelect from '@/components/common/MasterSearchSelect';
import InheritanceCard from '@/components/common/InheritanceCard';
import StatsManager from '@/components/common/StatsManager';
import TabbedInfoEditor, { TabConfig } from '@/components/common/TabbedInfoEditor';
import toast from 'react-hot-toast';

export default function NewCityDetailPage() {
  const router = useRouter();

  // 1. Country Selection
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [countrySearchKeyword, setCountrySearchKeyword] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [countryDetail, setCountryDetail] = useState<CountryDetail | null>(null);

  // 2. City Master Search
  const [isCitySearchModalOpen, setIsCitySearchModalOpen] = useState(false);
  const [selectedCityMaster, setSelectedCityMaster] = useState<CityMaster | null>(null);

  // 3. City Identity Fields (ReadOnly after selection)
  const [cityIdentity, setCityIdentity] = useState({
    cityCode: '',
    nameKr: '',
    nameEn: '',
  });

  // 4. Media & Tagline
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tagline, setTagline] = useState('');

  // 5. Rating
  const [vacanceRating, setVacanceRating] = useState<number>(0);

  // 5-1. Status
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // 6. Statistics
  const [statsData, setStatsData] = useState({
    likes: 0,
    shares: 0,
    saves: 0,
    pdfDownloads: 0,
    recentViews: 0,
  });

  // 7. Data Inheritance from Country
  const [inheritedData, setInheritedData] = useState({
    visaInfo: '',
    currency: '',
    voltage: '',
    language: '',
  });

  // 8. Override Toggles
  const [overrides, setOverrides] = useState({
    visaInfo: false,
    currency: false,
    voltage: false,
    language: false,
  });

  // 9. Custom Data (when override is enabled)
  const [customData, setCustomData] = useState({
    visaInfo: '',
    currency: '',
    voltage: '',
    language: '',
  });

  // 10. Basic Info (Geography, Climate, Society)
  const [basicInfo, setBasicInfo] = useState({
    geography: '',
    climate: '',
    society: '',
  });

  // 11. Tab Images for Basic Info
  const [tabImages, setTabImages] = useState<{
    geography: string[];
    climate: string[];
    society: string[];
  }>({
    geography: [],
    climate: [],
    society: [],
  });

  const [isSaving, setIsSaving] = useState(false);

  // City Basic Info Tabs Configuration
  const cityTabs: TabConfig[] = [
    {
      key: 'geography',
      icon: Mountain,
      title: '지리',
      titleEn: 'Geography',
      placeholder: '도시의 지형적 특징을 입력하세요.\n예: 위치, 면적, 주요 지형(산, 강, 해안 등), 고도, 지리적 특징 등',
      activeStyle: 'bg-green-500 text-white border-green-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-green-300',
    },
    {
      key: 'climate',
      icon: Cloud,
      title: '기후',
      titleEn: 'Climate',
      placeholder: '도시의 기후 정보를 입력하세요.\n예: 기후대, 연평균 기온, 계절별 기후, 강수량, 최적 여행 시기 등',
      activeStyle: 'bg-blue-500 text-white border-blue-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-blue-300',
    },
    {
      key: 'society',
      icon: Users,
      title: '사회',
      titleEn: 'Society',
      placeholder: '도시의 사회적 특성을 입력하세요.\n예: 인구, 주요 언어, 문화적 특징, 생활 방식, 축제 등',
      activeStyle: 'bg-purple-500 text-white border-purple-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-purple-300',
    },
  ];

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Filter countries based on search keyword
  useEffect(() => {
    if (!countrySearchKeyword.trim()) {
      setFilteredCountries(countries);
    } else {
      const keyword = countrySearchKeyword.toLowerCase();
      const filtered = countries.filter(
        (country) =>
          country.nameKr.toLowerCase().includes(keyword) ||
          country.nameEn.toLowerCase().includes(keyword) ||
          country.isoCode.toLowerCase().includes(keyword)
      );
      setFilteredCountries(filtered);
    }
  }, [countries, countrySearchKeyword]);

  const loadCountries = async () => {
    try {
      const data = await locationService.getCountries();
      setCountries(data);
      setFilteredCountries(data);
    } catch (error) {
      console.error('국가 목록 로딩 실패:', error);
      toast.error('국가 목록을 불러오는데 실패했습니다.');
    }
  };

  // Fetch country detail and inheritance data when country is selected
  useEffect(() => {
    if (selectedCountryId) {
      fetchCountryInheritanceData(selectedCountryId);
    }
  }, [selectedCountryId]);

  const fetchCountryInheritanceData = async (countryId: string) => {
    try {
      // Note: You may need to adjust this to fetch from countryDetailService if it has inheritance data
      // For now, we'll simulate fetching from countryDetailService
      const countryDetails = await countryDetailService.getCountryDetails();
      const detail = countryDetails.find(c => c.id === countryId);
      
      if (detail) {
        setCountryDetail(detail);
        
        // Extract inheritance data from country detail's practicalInfo
        setInheritedData({
          visaInfo: (detail as any).practicalInfo?.visaInfo || '정보 없음',
          currency: (detail as any).practicalInfo?.currency || '정보 없음',
          voltage: (detail as any).practicalInfo?.voltage || '정보 없음',
          language: (detail as any).practicalInfo?.mainLanguage || '정보 없음',
        });
      }
    } catch (error) {
      console.error('국가 상세 정보 로딩 실패:', error);
      toast.error('국가 정보를 불러오는데 실패했습니다.');
    }
  };

  // Handle City Master selection
  const handleCityMasterSelect = (city: CityMaster) => {
    setSelectedCityMaster(city);
    setCityIdentity({
      cityCode: city.cityCode,
      nameKr: city.nameKr,
      nameEn: city.nameEn,
    });
    toast.success('City Master 데이터가 자동으로 입력되었습니다.');
  };

  // Handle override toggle
  const handleOverrideToggle = (field: keyof typeof overrides) => {
    setOverrides({
      ...overrides,
      [field]: !overrides[field],
    });
  };

  // Handle stats change
  const handleStatsChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setStatsData({ ...statsData, [field]: numValue >= 0 ? numValue : 0 });
  };

  // Filter countries helper
  const filterCountries = (items: Country[], keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    return items.filter(
      (country) =>
        country.nameKr.toLowerCase().includes(lowerKeyword) ||
        country.nameEn.toLowerCase().includes(lowerKeyword) ||
        country.isoCode.toLowerCase().includes(lowerKeyword)
    );
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedCountryId) {
      toast.error('국가를 선택해주세요.');
      return false;
    }

    if (!selectedCityMaster) {
      toast.error('City Master에서 도시를 검색하여 선택해주세요.');
      return false;
    }

    if (!cityIdentity.cityCode || !cityIdentity.nameKr || !cityIdentity.nameEn) {
      toast.error('도시 기본 정보가 누락되었습니다.');
      return false;
    }

    return true;
  };

  // Save city detail
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const cityData = {
        // Identity
        countryId: selectedCountryId,
        cityCode: cityIdentity.cityCode,
        nameKr: cityIdentity.nameKr,
        nameEn: cityIdentity.nameEn,

        // Media
        thumbnailUrl: thumbnailUrl || undefined,
        tagline: tagline || undefined,

        // Rating
        vacanceRating: vacanceRating,

        // Status
        status: status,

        // Statistics
        stats: statsData,

        // Inheritance
        inheritedData: inheritedData,
        overrides: overrides,
        customData: customData,

        // Basic Info
        basicInfo: basicInfo,
        tabImages: tabImages,
      };

      const docId = await cityDetailService.createCityDetail(cityData);
      toast.success('도시 상세 정보가 성공적으로 등록되었습니다!');
      
      // Redirect to list or detail page
      setTimeout(() => {
        router.push('/admin/content/cities');
      }, 1000);
    } catch (error) {
      console.error('도시 등록 실패:', error);
      toast.error('도시 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get effective value (custom if override, otherwise inherited)
  const getEffectiveValue = (field: keyof typeof overrides): string => {
    if (overrides[field]) {
      return customData[field] || '';
    }
    return inheritedData[field] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-indigo-600" />
                도시 상세 등록 (Level 2)
              </h1>
              <p className="text-gray-600 mt-1">City Master에서 검색하여 도시 정보를 등록합니다</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </div>

        {/* Section 1: City Identity */}
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <MasterSearchSelect
            label="국가 선택"
            required
            placeholder="국가를 선택하세요"
            searchPlaceholder="국가명, ISO 코드 검색... (예: 프랑스, France, FR)"
            value={selectedCountryId}
            onChange={setSelectedCountryId}
            items={countries}
            getItemId={(country) => country.id}
            getItemLabel={(country) => `${country.nameKr} (${country.nameEn})`}
            getItemSecondary={(country) => `- ${country.isoCode}`}
            filterItems={filterCountries}
            className="mb-6"
          />

          {/* City Master Search */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              City Master 검색 <span className="text-red-500">*</span>
            </label>
            <Button
              onClick={() => setIsCitySearchModalOpen(true)}
              variant="outline"
              className="w-full justify-start h-12 text-left"
            >
              <Search className="w-5 h-5 mr-2 text-gray-400" />
              {selectedCityMaster ? (
                <span className="text-gray-900">
                  {selectedCityMaster.nameKr} ({selectedCityMaster.cityCode})
                </span>
              ) : (
                <span className="text-gray-400">도시를 검색하세요</span>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              💡 City Master 데이터베이스에서 도시를 검색하여 자동으로 정보를 가져옵니다
            </p>
          </div>

          {/* Auto-filled ReadOnly Fields */}
          {selectedCityMaster && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div>
                <label className="text-xs font-semibold text-indigo-900 mb-1 block">
                  도시명 (한글)
                </label>
                <Input
                  value={cityIdentity.nameKr}
                  readOnly
                  className="bg-white border-indigo-300 text-gray-900 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-900 mb-1 block">
                  도시명 (영문)
                </label>
                <Input
                  value={cityIdentity.nameEn}
                  readOnly
                  className="bg-white border-indigo-300 text-gray-900 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-indigo-900 mb-1 block">
                  City Code (IATA)
                </label>
                <Input
                  value={cityIdentity.cityCode}
                  readOnly
                  className="bg-white border-indigo-300 text-gray-900 font-mono font-semibold"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Section 2: Data Inheritance from Country */}
        {selectedCountryId && (
          <InheritanceCard
            title="국가 정보 상속"
            subtitle="국가로부터 상속된 정보 (필요시 Override 가능)"
            icon={<Globe className="w-6 h-6 text-purple-600" />}
            infoMessage="이 정보는 선택된 국가로부터 자동으로 가져옵니다. 도시별로 다른 정보가 필요한 경우 Override 토글을 활성화하세요."
            fields={[
              {
                label: '비자 정보 (Visa)',
                value: inheritedData.visaInfo,
                override: overrides.visaInfo,
                customValue: customData.visaInfo,
                onOverrideToggle: () => handleOverrideToggle('visaInfo'),
                onCustomValueChange: (value) => setCustomData({ ...customData, visaInfo: value }),
              },
              {
                label: '통화 (Currency)',
                value: inheritedData.currency,
                override: overrides.currency,
                customValue: customData.currency,
                onOverrideToggle: () => handleOverrideToggle('currency'),
                onCustomValueChange: (value) => setCustomData({ ...customData, currency: value }),
              },
              {
                label: '전압 (Voltage)',
                value: inheritedData.voltage,
                override: overrides.voltage,
                customValue: customData.voltage,
                onOverrideToggle: () => handleOverrideToggle('voltage'),
                onCustomValueChange: (value) => setCustomData({ ...customData, voltage: value }),
              },
              {
                label: '주요 언어 (Language)',
                value: inheritedData.language,
                override: overrides.language,
                customValue: customData.language,
                onOverrideToggle: () => handleOverrideToggle('language'),
                onCustomValueChange: (value) => setCustomData({ ...customData, language: value }),
              },
            ]}
          />
        )}

        {/* Section 3: Media & Status */}
        <Card className="p-6 mb-6 bg-white shadow-sm space-y-6">
          {/* Thumbnail */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              도시 대표 이미지
            </label>
            <ImageUploader
              images={thumbnailUrl ? [thumbnailUrl] : []}
              maxImages={1}
              onImagesChange={(images) => setThumbnailUrl(images[0] || '')}
              aspectRatio="aspect-video"
              placeholder="도시 대표 이미지를 업로드하세요"
              tabName="city-thumbnails"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 드래그 앤 드롭 또는 파일 선택으로 이미지를 업로드할 수 있습니다
            </p>
          </div>

          {/* Tagline */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              태그라인
            </label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="예: 낭만의 도시, 빛의 도시 파리"
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-2">
              도시를 한 줄로 표현하는 소개 문구를 입력하세요
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              상태
            </label>
            <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              초안 상태에서는 일반 사용자에게 노출되지 않습니다
            </p>
          </div>
        </Card>

        {/* Section 4: Rating & Stats */}
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">평가 & 통계</h2>
              <p className="text-sm text-gray-600">Vacance 별점 및 통계 데이터</p>
            </div>
          </div>

          {/* Vacance Star Rating */}
          <div className="mb-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Vacance 별점 ⭐
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setVacanceRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 cursor-pointer ${
                      star <= vacanceRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Statistical Data */}
          <StatsManager
            stats={statsData}
            onChange={handleStatsChange}
          />
        </Card>

        {/* Section 6: City Basic Info */}
        <TabbedInfoEditor
          sectionNumber="3-1"
          sectionTitle="도시 기본 정보"
          sectionDescription="도시별 핵심 정보를 카테고리별로 관리합니다"
          tabs={cityTabs}
          basicInfo={basicInfo}
          onBasicInfoChange={setBasicInfo}
          tabImages={tabImages}
          onTabImagesChange={setTabImages}
          accordionGuideText="각 탭(지리, 기후, 사회)을 이동하면 해당 세부 내용과 이미지가 표시됩니다. 각 항목마다 이미지 3장과 대용량 텍스트 입력이 가능합니다."
        />

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-t-xl">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-sm text-gray-600">
              {selectedCityMaster ? (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>
                    <strong>{selectedCityMaster.nameKr}</strong> 등록 준비 완료
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <X className="w-5 h-5 text-gray-400" />
                  <span>도시를 선택해주세요</span>
                </span>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !selectedCityMaster}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
            >
              {isSaving ? '저장 중...' : '등록 완료'}
            </Button>
          </div>
        </div>
      </div>

      {/* City Master Search Modal */}
      <CityMasterSearchModal
        isOpen={isCitySearchModalOpen}
        onClose={() => setIsCitySearchModalOpen(false)}
        onSelect={handleCityMasterSelect}
      />
    </div>
  );
}
