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
import { ArrowLeft, MapPin, Search, Info, Star, Heart, Share2, Bookmark, FileDown, Eye, Globe, Building2, Check, X, Mountain, Cloud, Users, Camera, Upload, ImagePlus, Sparkles, Plane, DollarSign, Phone, Hotel, Ticket, Car, UtensilsCrossed, ShoppingBag, Map, AlertCircle, Plus, Trash2, MapPinned, Award, BarChart3, Utensils, Store, Briefcase, Bed } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import CityMasterSearchModal from '@/components/admin/content/CityMasterSearchModal';
import CityStorytellingSelector from '@/components/admin/content/CityStorytellingSelector';
import PoiSearchModal from '@/components/admin/content/PoiSearchModal';
import BulkContentSearchModal from '@/components/admin/content/BulkContentSearchModal';
import CategoryAccordionLinker from '@/components/admin/content/CategoryAccordionLinker';
import MasterSearchSelect from '@/components/common/MasterSearchSelect';
import InheritanceCard from '@/components/common/InheritanceCard';
import StatsManager from '@/components/common/StatsManager';
import TabbedInfoEditor, { TabConfig } from '@/components/common/TabbedInfoEditor';
import LibraryObjectLinker, { defaultColorThemes } from '@/components/common/LibraryObjectLinker';
import NavigationTabItem from '@/components/common/NavigationTabItem';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import { contentLibraryAPI } from '@/services/contentLibraryService';
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
    safetyLevel: '',
    safetyTips: '',
  });

  // 8. Override Toggles
  const [overrides, setOverrides] = useState({
    visaInfo: false,
    currency: false,
    voltage: false,
    language: false,
    safetyLevel: false,
    safetyTips: false,
  });

  // 9. Custom Data (when override is enabled)
  const [customData, setCustomData] = useState({
    visaInfo: '',
    currency: '',
    voltage: '',
    language: '',
    safetyLevel: 'safe' as 'safe' | 'moderate' | 'caution' | 'danger',
    safetyTips: '',
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

  // 12. Media Archive
  const [mediaArchive, setMediaArchive] = useState<string[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 13. City Storytelling Library
  const [libraryObjects, setLibraryObjects] = useState<any[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  // 14. Transportation Library Reference
  const [transportationLibraryId, setTransportationLibraryId] = useState<string | null>(null);

  // 15. Finance Library Reference
  const [financeLibraryId, setFinanceLibraryId] = useState<string | null>(null);

  // 16. Emergency Library Reference
  const [emergencyLibraryId, setEmergencyLibraryId] = useState<string | null>(null);

  // 17. Navigation Tabs
  const [navigationTabs, setNavigationTabs] = useState({
    flights: { customUrl: '', isEnabled: true },
    accommodations: { customUrl: '', isEnabled: true },
    tours: { customUrl: '', isEnabled: true },
    pickup: { customUrl: '', isEnabled: true },
    rental: { customUrl: '', isEnabled: true },
    dining: { customUrl: '', isEnabled: true },
    shopping: { customUrl: '', isEnabled: true },
    maps: { customUrl: '', isEnabled: true },
  });

  // 18. Culture Specials
  const [cultureSpecials, setCultureSpecials] = useState<{
    id: string;
    category: string;
    title: string;
    description: string;
    productIds: string[];
  }[]>([]);
  const [productIdInput, setProductIdInput] = useState<{ [key: string]: string }>({});

  // 19. Districts (구역 정의 및 콘텐츠 맵핑)
  const [districts, setDistricts] = useState<{
    id: string;
    name: string;
    description: string;
    contents?: {
      attractions?: string[];
      dining?: string[];
      shopping?: string[];
      services?: string[];
      accommodation?: string[];
    };
  }[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [showBulkContentModal, setShowBulkContentModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('');

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
        
        // Extract inheritance data from country detail's practicalInfo and safety
        setInheritedData({
          visaInfo: (detail as any).practicalInfo?.visaInfo || '정보 없음',
          currency: (detail as any).practicalInfo?.currency || '정보 없음',
          voltage: (detail as any).practicalInfo?.voltage || '정보 없음',
          language: (detail as any).practicalInfo?.mainLanguage || '정보 없음',
          safetyLevel: (detail as any).safety?.safetyLevel || '정보 없음',
          safetyTips: (detail as any).safety?.safetyTips || '정보 없음',
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

  // Media Archive - Image URL Validation
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  };

  // Media Archive - Add URL
  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) {
      toast.error('이미지 URL을 입력해주세요.');
      return;
    }

    if (!isValidImageUrl(mediaUrlInput)) {
      toast.error('올바른 이미지 URL 형식이 아닙니다. (jpg, png, gif, webp, svg)');
      return;
    }

    if (mediaArchive.length >= 10) {
      toast.error('최대 10장까지만 추가할 수 있습니다.');
      return;
    }

    setMediaArchive([...mediaArchive, mediaUrlInput.trim()]);
    setMediaUrlInput('');
    toast.success('이미지가 미디어 아카이브에 추가되었습니다.');
  };

  // Media Archive - Remove
  const handleRemoveMedia = (index: number) => {
    setMediaArchive(mediaArchive.filter((_, i) => i !== index));
    toast.success('이미지가 제거되었습니다.');
  };

  // Media Archive - Drag Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (mediaArchive.length + imageFiles.length > 10) {
      toast.error(`최대 10장까지만 추가할 수 있습니다. (현재: ${mediaArchive.length}장)`);
      return;
    }

    // 파일을 Base64로 변환하여 미리보기 (실제로는 Firebase Storage 업로드 필요)
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMediaArchive(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${imageFiles.length}장의 이미지가 추가되었습니다.`);
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

        // Media Archive
        mediaArchive: mediaArchive,

        // Storytelling Library
        storytellingLibraryId: selectedLibraryId,

        // Practical Info Library References
        transportationLibraryId: transportationLibraryId,
        financeLibraryId: financeLibraryId,
        emergencyLibraryId: emergencyLibraryId,

        // Navigation Tabs
        navigation: navigationTabs,

        // Culture Specials
        cultureSpecials: cultureSpecials,

        // Districts & Contents Mapping
        districts: districts,
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">1. 도시 식별 정보</h2>
              <p className="text-sm text-gray-600">국가 선택 및 도시 기본 정보</p>
            </div>
          </div>

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
            title="2. 국가 정보 상속"
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
              {
                label: '치안 수준 (Safety Level)',
                value: inheritedData.safetyLevel === 'safe' ? '안전' : 
                       inheritedData.safetyLevel === 'moderate' ? '보통' : 
                       inheritedData.safetyLevel === 'caution' ? '주의' : 
                       inheritedData.safetyLevel === 'danger' ? '위험' : inheritedData.safetyLevel,
                override: overrides.safetyLevel,
                customValue: customData.safetyLevel === 'safe' ? '안전' : 
                            customData.safetyLevel === 'moderate' ? '보통' : 
                            customData.safetyLevel === 'caution' ? '주의' : 
                            customData.safetyLevel === 'danger' ? '위험' : customData.safetyLevel,
                onOverrideToggle: () => handleOverrideToggle('safetyLevel'),
                onCustomValueChange: (value) => {
                  const level = value === '안전' ? 'safe' : 
                               value === '보통' ? 'moderate' : 
                               value === '주의' ? 'caution' : 
                               value === '위험' ? 'danger' : 'safe';
                  setCustomData({ ...customData, safetyLevel: level as any });
                },
              },
              {
                label: '안전 팁 (Safety Tips)',
                value: inheritedData.safetyTips,
                override: overrides.safetyTips,
                customValue: customData.safetyTips,
                onOverrideToggle: () => handleOverrideToggle('safetyTips'),
                onCustomValueChange: (value) => setCustomData({ ...customData, safetyTips: value }),
              },
            ]}
          />
        )}

        {/* Section 3: Media & Status */}
        <Card className="p-6 mb-6 bg-white shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">3. 미디어 & 상태</h2>
              <p className="text-sm text-gray-600">도시 대표 이미지, 태그라인 및 게시 상태</p>
            </div>
          </div>

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
              <h2 className="text-xl font-bold text-gray-900">4. 평가 & 통계</h2>
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

        {/* Section 5: City Basic Info */}
        <TabbedInfoEditor
          sectionNumber="5"
          sectionTitle="도시 기본 정보"
          sectionDescription="도시별 핵심 정보를 카테고리별로 관리합니다"
          tabs={cityTabs}
          basicInfo={basicInfo}
          onBasicInfoChange={setBasicInfo}
          tabImages={tabImages}
          onTabImagesChange={setTabImages}
          accordionGuideText="각 탭(지리, 기후, 사회)을 이동하면 해당 세부 내용과 이미지가 표시됩니다. 각 항목마다 이미지 3장과 대용량 텍스트 입력이 가능합니다."
        />

        {/* Section 6: Transportation */}
        <LibraryObjectLinker
          sectionNumber="6"
          title="도시 교통 정보"
          description="공항↔시내, 대중교통 등 멀티모달 정보"
          icon={<Plane className="w-5 h-5 text-white" />}
          colorTheme={defaultColorThemes.green}
          selectedLibraryId={transportationLibraryId}
          onSelectLibrary={setTransportationLibraryId}
          libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-transport')}
          categoryName="교통"
          placeholder="도시명으로 검색..."
          targetName={selectedCityMaster?.nameKr}
        />

        {/* Section 6-1: Finance */}
        <LibraryObjectLinker
          sectionNumber="6-1"
          title="금융 정보"
          description="환율 팁, 수수료, ATM 위치 등"
          icon={<DollarSign className="w-5 h-5 text-white" />}
          colorTheme={defaultColorThemes.yellow}
          selectedLibraryId={financeLibraryId}
          onSelectLibrary={setFinanceLibraryId}
          libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-finance')}
          categoryName="금융"
          placeholder="도시명으로 검색..."
          targetName={selectedCityMaster?.nameKr}
        />

        {/* Section 6-2: Emergency */}
        <LibraryObjectLinker
          sectionNumber="6-2"
          title="긴급 연락처"
          description="대사관, 경찰, 구급차 등 비상 연락망"
          icon={<Phone className="w-5 h-5 text-white" />}
          colorTheme={defaultColorThemes.red}
          selectedLibraryId={emergencyLibraryId}
          onSelectLibrary={setEmergencyLibraryId}
          libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-emergency')}
          categoryName="긴급연락처"
          placeholder="도시명으로 검색..."
          targetName={selectedCityMaster?.nameKr}
        />

        {/* Section 7: City Storytelling */}
        <Card className="p-8 shadow-lg border-orange-200">
          <CityStorytellingSelector
            selectedLibraryId={selectedLibraryId}
            onSelectLibrary={setSelectedLibraryId}
            libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'city-story')}
            selectedCityName={selectedCityMaster?.nameKr}
          />
        </Card>

        {/* Section 8: Media Archive */}
        <Card className="p-8 shadow-lg border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">8. 미디어 아카이브</h2>
              <p className="text-sm text-gray-500 mt-1">
                도시의 다양한 이미지를 관리합니다 (최대 10장)
              </p>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 mb-6 transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 bg-gray-50 hover:border-purple-300'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 mb-2">
                <strong>드래그 & 드롭</strong>으로 이미지를 추가하거나
              </p>
              <p className="text-xs text-gray-500">
                아래 URL 입력란을 사용하세요
              </p>
            </div>
            {mediaArchive.length > 0 && (
              <div className="absolute -top-3 -right-3 bg-white rounded-full px-3 py-1 shadow-md border border-green-300 backdrop-blur-sm">
                <span className="text-sm font-bold text-green-700">
                  {mediaArchive.length} / 10
                </span>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              이미지 URL 추가
            </label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMediaUrl();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddMediaUrl}
                disabled={mediaArchive.length >= 10}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                추가
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {mediaArchive.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                미디어 목록 ({mediaArchive.length}장)
              </h3>
              <div
                className={`grid gap-4 ${
                  mediaArchive.length === 1
                    ? 'grid-cols-1'
                    : mediaArchive.length === 2
                    ? 'grid-cols-2'
                    : mediaArchive.length <= 4
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                }`}
              >
                {mediaArchive.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all"
                  >
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          {mediaArchive.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p>
                💡 <strong>미디어 아카이브란?</strong>
              </p>
              <p className="mt-1">
                도시를 대표하는 다양한 이미지를 수집하여 관리합니다. 랜드마크, 거리 풍경, 문화 요소 등을 포함할 수 있습니다.
              </p>
            </div>
          )}
        </Card>

        {/* Section 9: Culture Specials */}
        <Card className="p-8 shadow-lg border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">9. 도시 문화 스페셜 (추천 상품 매칭)</h2>
                <p className="text-sm text-gray-500 mt-1">
                  문화 커텐츠와 연결된 상품 제안으로 전환율 극대화
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                const newSpecial = {
                  id: `special_${Date.now()}`,
                  category: 'dining',
                  title: '',
                  description: '',
                  productIds: [],
                };
                setCultureSpecials([...cultureSpecials, newSpecial]);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              스페셜 추가
            </Button>
          </div>

          {/* 커머스 깔때기 전략 안내 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-700">
                <p className="font-semibold mb-1">📊 커머스 깔때기 전략</p>
                <p>
                  사용자가 특정 문화(예: 프랑스 미식)에 매료되었을 때, 관련 상품(예: 미슐랭 투어)을 즉시 제안하여 전환율을 높입니다.
                  각 스페셜당 최대 2개의 상품을 연결할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 스페셜 리스트 */}
          {cultureSpecials.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">아직 등록된 스페셜이 없습니다</p>
              <p className="text-sm text-gray-500 mb-4">
                상단의 "스페셜 추가" 버튼을 클릭하여 문화 커텐츠를 등록하세요
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cultureSpecials.map((special, index) => (
                <Card key={special.id} className="p-6 border-2 border-purple-100 bg-gradient-to-r from-white to-purple-50/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-purple-600">Special #{index + 1}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCultureSpecials(cultureSpecials.filter(s => s.id !== special.id));
                        const newInput = { ...productIdInput };
                        delete newInput[special.id];
                        setProductIdInput(newInput);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 카테고리 */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      카테고리
                    </label>
                    <Select
                      value={special.category}
                      onValueChange={(value) => {
                        const updated = [...cultureSpecials];
                        updated[index].category = value;
                        setCultureSpecials(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dining">🍽️ 미식</SelectItem>
                        <SelectItem value="wine">🍷 와인</SelectItem>
                        <SelectItem value="history">📜 역사</SelectItem>
                        <SelectItem value="art">🎨 예술</SelectItem>
                        <SelectItem value="museum">🏛️ 박물관</SelectItem>
                        <SelectItem value="architecture">🏰 건축</SelectItem>
                        <SelectItem value="literature">📚 문학</SelectItem>
                        <SelectItem value="music">🎵 음악</SelectItem>
                        <SelectItem value="movie">🎬 영화</SelectItem>
                        <SelectItem value="unesco">🌍 유네스코</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 스페셜 제목 */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      스페셜 제목
                    </label>
                    <Input
                      value={special.title}
                      onChange={(e) => {
                        const updated = [...cultureSpecials];
                        updated[index].title = e.target.value;
                        setCultureSpecials(updated);
                      }}
                      placeholder="예: 파리 미슐랭 레스토랑 투어"
                    />
                  </div>

                  {/* 설명 */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      설명
                    </label>
                    <textarea
                      value={special.description}
                      onChange={(e) => {
                        const updated = [...cultureSpecials];
                        updated[index].description = e.target.value;
                        setCultureSpecials(updated);
                      }}
                      placeholder="이 스페셜의 매력을 설명하세요..."
                      className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* 상품 연결 */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      상품 연결 (최대 2개)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={productIdInput[special.id] || ''}
                        onChange={(e) => setProductIdInput({ ...productIdInput, [special.id]: e.target.value })}
                        placeholder="상품 ID 입력"
                        disabled={special.productIds.length >= 2}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          const inputId = productIdInput[special.id]?.trim();
                          if (!inputId) {
                            toast.error('상품 ID를 입력하세요.');
                            return;
                          }
                          if (special.productIds.includes(inputId)) {
                            toast.error('이미 추가된 상품입니다.');
                            return;
                          }
                          if (special.productIds.length >= 2) {
                            toast.error('최대 2개까지만 연결할 수 있습니다.');
                            return;
                          }
                          const updated = [...cultureSpecials];
                          updated[index].productIds.push(inputId);
                          setCultureSpecials(updated);
                          setProductIdInput({ ...productIdInput, [special.id]: '' });
                          toast.success('상품이 연결되었습니다.');
                        }}
                        disabled={special.productIds.length >= 2}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 연결된 상품 목록 */}
                    {special.productIds.length > 0 && (
                      <div className="space-y-2">
                        {special.productIds.map((productId, pIndex) => (
                          <div
                            key={pIndex}
                            className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm font-medium text-purple-700">
                              상품 ID: {productId}
                            </span>
                            <button
                              onClick={() => {
                                const updated = [...cultureSpecials];
                                updated[index].productIds = updated[index].productIds.filter((_, i) => i !== pIndex);
                                setCultureSpecials(updated);
                                toast.success('상품 연결이 해제되었습니다.');
                              }}
                              className="text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 비즈니스 로직 안내 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">📊 상품 연결 비즈니스 로직</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Strict 2-Product Rule:</strong> UI 일관성을 위해 항목당 최대 2개까지만 연결 가능</li>
              <li><strong>ID 유효성 검증:</strong> 상품 ID 입력 시 실제 존재하는 상품인지 확인 필요</li>
              <li><strong>데이터 상속:</strong> 할인 가격, 별점 등은 Product API를 통해 실시간 동기화</li>
            </ul>
          </div>
        </Card>

        {/* Section 10: Districts & Featured POIs */}
        <Card className="p-8 shadow-lg border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPinned className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">10. 구역 및 명소 탐색 관리</h2>
              <p className="text-sm text-gray-500 mt-1">
                사용자 앱의 검색 필터와 1:1 매핑되는 구역 및 핵심 명소 큐레이션
              </p>
            </div>
          </div>

          {/* 구역 정의 섹션 (Blue Theme) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">도시 구역 정의</h3>
              </div>
              <Button
                onClick={() => {
                  const newDistrict = {
                    id: `district_${Date.now()}`,
                    name: '',
                    description: '',
                  };
                  setDistricts([...districts, newDistrict]);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                구역 추가
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">🗺️ 구역 필터링 전략</p>
                  <p>
                    사용자가 앱에서 클릭할 필터 버튼을 정의합니다. 물리적 행정구역(1~20구)을 논리적 서비스 단위(예: 1~4구, Old Town)로 재그룹화하세요.
                  </p>
                </div>
              </div>
            </div>

            {districts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p className="text-blue-600 font-medium mb-2">아직 등록된 구역이 없습니다</p>
                <p className="text-sm text-blue-500 mb-4">
                  "구역 추가" 버튼을 클릭하여 도시 구역을 정의하세요
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {districts.map((district, index) => (
                  <Card key={district.id} className="p-6 border-2 border-blue-100 bg-gradient-to-r from-white to-blue-50/30">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-sm font-bold text-blue-600">구역 #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDistricts(districts.filter(d => d.id !== district.id));
                          toast.success('구역이 삭제되었습니다.');
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          구역 이름
                        </label>
                        <Input
                          value={district.name}
                          onChange={(e) => {
                            const updated = [...districts];
                            updated[index].name = e.target.value;
                            setDistricts(updated);
                          }}
                          placeholder="예: 1~4구, Old Town"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          구역 설명
                        </label>
                        <Input
                          value={district.description}
                          onChange={(e) => {
                            const updated = [...districts];
                            updated[index].description = e.target.value;
                            setDistricts(updated);
                          }}
                          placeholder="예: 루브르 박물관 외"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* B. 구역별 통합 콘텐츠 맵핑 */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-800">구역별 통합 콘텐츠 맵핑</h3>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-700">
                  <p className="font-semibold mb-1">🎯 통합 큐레이션 전략</p>
                  <p>
                    등록된 구역을 선택한 후, 해당 구역에 속할 명소/레스토랑/쇼핑/서비스/숙소를 카테고리별로 일괄 연동합니다.
                    체크박스 기반 벌크(Bulk) 추가 방식으로 대량의 콘텐츠를 효율적으로 관리할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 구역 선택 */}
            {districts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium mb-2">먼저 구역을 정의해주세요</p>
                <p className="text-sm text-gray-500">
                  상단의 "A. 도시 구역 정의" 섹션에서 구역을 추가한 후 콘텐츠를 연동할 수 있습니다
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    콘텐츠를 연동할 구역 선택
                  </label>
                  <select
                    value={selectedDistrictId || ''}
                    onChange={(e) => setSelectedDistrictId(e.target.value || null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">구역을 선택하세요</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name} ({district.description})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 선택된 구역의 카테고리별 콘텐츠 */}
                {selectedDistrictId && (() => {
                  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);
                  if (!selectedDistrict) return null;

                  const categories = [
                    {
                      key: 'attractions' as const,
                      title: '명소 & 박물관',
                      icon: <MapPin className="w-5 h-5" />,
                      colorTheme: {
                        bg: 'bg-blue-50',
                        border: 'border-blue-200',
                        text: 'text-blue-600',
                        button: 'bg-blue-600 hover:bg-blue-700',
                      },
                    },
                    {
                      key: 'dining' as const,
                      title: '레스토랑 & 카페 & 바',
                      icon: <Utensils className="w-5 h-5" />,
                      colorTheme: {
                        bg: 'bg-orange-50',
                        border: 'border-orange-200',
                        text: 'text-orange-600',
                        button: 'bg-orange-600 hover:bg-orange-700',
                      },
                    },
                    {
                      key: 'shopping' as const,
                      title: '쇼핑',
                      icon: <Store className="w-5 h-5" />,
                      colorTheme: {
                        bg: 'bg-pink-50',
                        border: 'border-pink-200',
                        text: 'text-pink-600',
                        button: 'bg-pink-600 hover:bg-pink-700',
                      },
                    },
                    {
                      key: 'services' as const,
                      title: '라이프스타일 서비스',
                      icon: <Briefcase className="w-5 h-5" />,
                      colorTheme: {
                        bg: 'bg-purple-50',
                        border: 'border-purple-200',
                        text: 'text-purple-600',
                        button: 'bg-purple-600 hover:bg-purple-700',
                      },
                    },
                    {
                      key: 'accommodation' as const,
                      title: '숙소',
                      icon: <Bed className="w-5 h-5" />,
                      colorTheme: {
                        bg: 'bg-indigo-50',
                        border: 'border-indigo-200',
                        text: 'text-indigo-600',
                        button: 'bg-indigo-600 hover:bg-indigo-700',
                      },
                    },
                  ];

                  const [openCategories, setOpenCategories] = React.useState<string[]>(['attractions']);

                  const handleToggleCategory = (key: string) => {
                    setOpenCategories(prev =>
                      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                    );
                  };

                  const handleBulkAdd = (category: string, selectedIds: string[]) => {
                    const updated = [...districts];
                    const districtIndex = updated.findIndex(d => d.id === selectedDistrictId);
                    if (districtIndex === -1) return;

                    if (!updated[districtIndex].contents) {
                      updated[districtIndex].contents = {};
                    }

                    const key = category as 'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation';
                    const currentIds = (updated[districtIndex].contents![key] || []) as string[];
                    const newIds = selectedIds.filter(id => !currentIds.includes(id));

                    updated[districtIndex].contents![key] = [
                      ...currentIds,
                      ...newIds,
                    ];

                    setDistricts(updated);
                    toast.success(`${newIds.length}개의 콘텐츠가 추가되었습니다.`);
                  };

                  const handleRemove = (category: string, contentId: string) => {
                    const updated = [...districts];
                    const districtIndex = updated.findIndex(d => d.id === selectedDistrictId);
                    if (districtIndex === -1 || !updated[districtIndex].contents) return;

                    const key = category as 'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation';
                    const currentIds = (updated[districtIndex].contents![key] || []) as string[];
                    updated[districtIndex].contents![key] = currentIds.filter(
                      (id: string) => id !== contentId
                    );

                    setDistricts(updated);
                    toast.success('콘텐츠가 제거되었습니다.');
                  };

                  return (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <CategoryAccordionLinker
                          key={category.key}
                          title={category.title}
                          icon={category.icon}
                          colorTheme={category.colorTheme}
                          linkedIds={selectedDistrict.contents?.[category.key] || []}
                          isOpen={openCategories.includes(category.key)}
                          onToggle={() => handleToggleCategory(category.key)}
                          onAddClick={() => {
                            setCurrentCategory(category.key);
                            setShowBulkContentModal(true);
                          }}
                          onRemove={(id) => handleRemove(category.key, id)}
                        />
                      ))}

                      {/* 통계 대시보드 */}
                      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-lg p-6">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-emerald-600" />
                          현재 구역 콘텐츠 통계
                        </h4>
                        <div className="grid grid-cols-5 gap-4">
                          {categories.map((category) => {
                            const count = selectedDistrict.contents?.[category.key]?.length || 0;
                            return (
                              <div key={category.key} className="text-center">
                                <div className={`${category.colorTheme.bg} ${category.colorTheme.border} border-2 rounded-lg p-4`}>
                                  <div className={`${category.colorTheme.text} mb-2`}>
                                    {category.icon}
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                                  <p className="text-xs text-gray-600 mt-1">{category.title}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* 데이터 무결성 안내 */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">🔗 관계형 데이터 설계</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>Single Source of Truth:</strong> POI ID만 저장하며, 썸네일/평점은 poi_master에서 실시간 로드</li>
              <li><strong>데이터 매핑:</strong> 사용자가 구역 필터 클릭 시 city_id + district_id로 필터링</li>
              <li><strong>벌크 처리:</strong> Firebase writeBatch 기능으로 대량 데이터의 트랜잭션 안정성 확보</li>
              <li><strong>중복 방지:</strong> 이미 연결된 콘텐츠는 검색 모달에서 자동으로 비활성화</li>
            </ul>
          </div>
        </Card>

        {/* Section 11: Navigation Tabs */}
        <Card className="p-8 shadow-lg border-indigo-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Map className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">11. 탭 내비게이션 및 검색 연동</h2>
              <p className="text-sm text-gray-500 mt-1">
                도시별 맞춤 서비스 탭 URL 관리
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">🔗 자동 라우팅 시스템</p>
                <p>
                  도시 코드가 입력되면 각 탭의 Default Path에서 <code className="bg-blue-100 px-1 py-0.5 rounded">XXX</code>가 자동으로 치환됩니다.
                  특별한 제휴나 시즌 이벤트가 있을 경우 커스텀 URL을 입력하여 오버라이드할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* City Code Warning */}
          {!cityIdentity.cityCode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-700">
                  <p className="font-semibold mb-1">⚠️ 도시 코드를 먼저 입력하세요</p>
                  <p>
                    City Master에서 도시를 선택하면 도시 코드가 자동으로 입력됩니다.
                    도시 코드가 없으면 URL에 <code className="bg-orange-100 px-1 py-0.5 rounded">XXX</code>가 그대로 표시됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tab Items */}
          <div className="space-y-4">
            {/* Flights */}
            <NavigationTabItem
              icon={<Plane className="w-5 h-5 text-blue-600" />}
              label="✈️ 항공권 검색"
              colorClass="border-blue-200"
              defaultPath="https://flights.vacance.app/search/XXX"
              customUrl={navigationTabs.flights.customUrl}
              isEnabled={navigationTabs.flights.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, flights: { ...navigationTabs.flights, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, flights: { ...navigationTabs.flights, isEnabled: !navigationTabs.flights.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Accommodations */}
            <NavigationTabItem
              icon={<Hotel className="w-5 h-5 text-green-600" />}
              label="🏨 숙소 찾기"
              colorClass="border-green-200"
              defaultPath="https://hotels.vacance.app/city/XXX"
              customUrl={navigationTabs.accommodations.customUrl}
              isEnabled={navigationTabs.accommodations.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, accommodations: { ...navigationTabs.accommodations, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, accommodations: { ...navigationTabs.accommodations, isEnabled: !navigationTabs.accommodations.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Tours & Tickets */}
            <NavigationTabItem
              icon={<Ticket className="w-5 h-5 text-yellow-600" />}
              label="🎫 여행상품 (투어/티켓)"
              colorClass="border-yellow-200"
              defaultPath="https://tours.vacance.app/XXX/activities"
              customUrl={navigationTabs.tours.customUrl}
              isEnabled={navigationTabs.tours.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, tours: { ...navigationTabs.tours, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, tours: { ...navigationTabs.tours, isEnabled: !navigationTabs.tours.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Pickup Service */}
            <NavigationTabItem
              icon={<Car className="w-5 h-5 text-indigo-600" />}
              label="🚗 픽업 서비스"
              colorClass="border-indigo-200"
              defaultPath="https://transfer.vacance.app/XXX/pickup"
              customUrl={navigationTabs.pickup.customUrl}
              isEnabled={navigationTabs.pickup.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, pickup: { ...navigationTabs.pickup, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, pickup: { ...navigationTabs.pickup, isEnabled: !navigationTabs.pickup.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Rental Car */}
            <NavigationTabItem
              icon={<Car className="w-5 h-5 text-purple-600" />}
              label="🚙 렌트카"
              colorClass="border-purple-200"
              defaultPath="https://rental.vacance.app/cars/XXX"
              customUrl={navigationTabs.rental.customUrl}
              isEnabled={navigationTabs.rental.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, rental: { ...navigationTabs.rental, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, rental: { ...navigationTabs.rental, isEnabled: !navigationTabs.rental.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Dining Guide */}
            <NavigationTabItem
              icon={<UtensilsCrossed className="w-5 h-5 text-red-600" />}
              label="🍽️ 미식 가이드"
              colorClass="border-red-200"
              defaultPath="https://dining.vacance.app/XXX/restaurants"
              customUrl={navigationTabs.dining.customUrl}
              isEnabled={navigationTabs.dining.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, dining: { ...navigationTabs.dining, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, dining: { ...navigationTabs.dining, isEnabled: !navigationTabs.dining.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Shopping Guide */}
            <NavigationTabItem
              icon={<ShoppingBag className="w-5 h-5 text-pink-600" />}
              label="🛍️ 쇼핑 가이드"
              colorClass="border-pink-200"
              defaultPath="https://shopping.vacance.app/XXX/stores"
              customUrl={navigationTabs.shopping.customUrl}
              isEnabled={navigationTabs.shopping.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, shopping: { ...navigationTabs.shopping, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, shopping: { ...navigationTabs.shopping, isEnabled: !navigationTabs.shopping.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />

            {/* Map Finder */}
            <NavigationTabItem
              icon={<Map className="w-5 h-5 text-teal-600" />}
              label="🗺️ 지도 찾기"
              colorClass="border-teal-200"
              defaultPath="https://maps.vacance.app/city/XXX"
              customUrl={navigationTabs.maps.customUrl}
              isEnabled={navigationTabs.maps.isEnabled}
              onCustomUrlChange={(value) => 
                setNavigationTabs({ ...navigationTabs, maps: { ...navigationTabs.maps, customUrl: value } })
              }
              onToggle={() => 
                setNavigationTabs({ ...navigationTabs, maps: { ...navigationTabs.maps, isEnabled: !navigationTabs.maps.isEnabled } })
              }
              cityCode={cityIdentity.cityCode}
            />
          </div>

          {/* Operation Tip */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">💡 운영 팁:</span> 탭을 비활성화하면 프론트엔드(사용자 앱)에서 해당 버튼이 숨겨집니다. 
              특정 도시에서 제공하지 않는 서비스는 토글을 OFF 상태로 유지하여 사용자에게 혼란을 주지 않도록 관리하세요.
            </p>
          </div>
        </Card>

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

      {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* City Master Search Modal */}
      <CityMasterSearchModal
        isOpen={isCitySearchModalOpen}
        onClose={() => setIsCitySearchModalOpen(false)}
        onSelect={handleCityMasterSelect}
      />

      {/* Bulk Content Search Modal */}
      {selectedDistrictId && currentCategory && (
        <BulkContentSearchModal
          isOpen={showBulkContentModal}
          onClose={() => {
            setShowBulkContentModal(false);
            setCurrentCategory('');
          }}
          category={currentCategory as any}
          categoryLabel={
            currentCategory === 'attractions'
              ? '명소 & 박물관'
              : currentCategory === 'dining'
              ? '레스토랑 & 카페 & 바'
              : currentCategory === 'shopping'
              ? '쇼핑'
              : currentCategory === 'services'
              ? '라이프스타일 서비스'
              : '숙소'
          }
          cityCode={cityIdentity.cityCode}
          alreadyLinkedIds={
            (() => {
              const district = districts.find((d) => d.id === selectedDistrictId);
              if (!district?.contents) return [];
              const key = currentCategory as 'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation';
              return (district.contents[key] || []) as string[];
            })()
          }
          onBulkAdd={(selectedIds) => {
            const updated = [...districts];
            const districtIndex = updated.findIndex((d) => d.id === selectedDistrictId);
            if (districtIndex === -1) return;

            if (!updated[districtIndex].contents) {
              updated[districtIndex].contents = {};
            }

            const key = currentCategory as 'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation';
            const currentIds = (updated[districtIndex].contents![key] || []) as string[];
            const newIds = selectedIds.filter((id) => !currentIds.includes(id));

            updated[districtIndex].contents![key] = [...currentIds, ...newIds];

            setDistricts(updated);
            toast.success(`${newIds.length}개의 콘텐츠가 추가되었습니다.`);
          }}
        />
      )}
    </div>
  );
}
