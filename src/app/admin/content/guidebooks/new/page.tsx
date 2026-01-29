'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Book, 
  Check,
  MapPin,
  Globe,
  FileText,
  Utensils,
  ShoppingBag,
  Briefcase,
  Star,
  Map as MapIcon,
  Sparkles,
  Plane,
  DollarSign,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import MasterSearchSelect from '@/components/common/MasterSearchSelect';
import CityMasterSearchModal from '@/components/admin/content/CityMasterSearchModal';
import { CityMaster } from '@/types/location';
import BulkContentSearchModal from '@/components/admin/content/BulkContentSearchModal';
import { countryDetailService } from '@/services/countryDetailService';
import { cityDetailService } from '@/services/cityDetailService';

interface LibraryReference {
  id: string;
  name?: string;
}

export default function NewGuidebookPage() {
  const router = useRouter();
  
  // 기본 정보
  const [titleKr, setTitleKr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [description, setDescription] = useState('');
  
  // 국가/도시 선택
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [isCitySearchModalOpen, setIsCitySearchModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityMaster | null>(null);
  
  // 단계별 모듈 (ID 참조)
  const [countryStorytellingId, setCountryStorytellingId] = useState('');
  const [cityStorytellingId, setCityStorytellingId] = useState('');
  const [isCountryStoryAutoLinked, setIsCountryStoryAutoLinked] = useState(false);
  const [isCityStoryAutoLinked, setIsCityStoryAutoLinked] = useState(false);
  
  const [transportId, setTransportId] = useState('');
  const [isTransportAutoLinked, setIsTransportAutoLinked] = useState(false);
  
  const [financeId, setFinanceId] = useState('');
  const [isFinanceAutoLinked, setIsFinanceAutoLinked] = useState(false);
  
  const [emergencyId, setEmergencyId] = useState('');
  const [isEmergencyAutoLinked, setIsEmergencyAutoLinked] = useState(false);
  
  // 벌크 선택 모듈 (ID 배열)
  const [attractionSpecialIds, setAttractionSpecialIds] = useState<string[]>([]);
  const [attractionPlaceIds, setAttractionPlaceIds] = useState<string[]>([]);
  const [cultureSpecialIds, setCultureSpecialIds] = useState<string[]>([]);
  const [diningPlaceIds, setDiningPlaceIds] = useState<string[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [shoppingIds, setShoppingIds] = useState<string[]>([]);
  
  // 벌크 모달 상태
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentBulkCategory, setCurrentBulkCategory] = useState<'attractions' | 'dining' | 'shopping' | 'services' | 'accommodation'>('attractions');
  const [currentBulkTarget, setCurrentBulkTarget] = useState<'attractionSpecial' | 'attractionPlace' | 'cultureSpecial' | 'diningPlace' | 'service' | 'shopping'>('attractionSpecial');
  
  const [saving, setSaving] = useState(false);

  // 국가 목록 로드
  useEffect(() => {
    const loadCountries = async () => {
      const data = await locationService.getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  // 국가 선택 시 국가 스토리텔링 ID 자동 연동
  useEffect(() => {
    const fetchCountryStorytellingId = async () => {
      if (!selectedCountryId) {
        setCountryStorytellingId('');
        setIsCountryStoryAutoLinked(false);
        return;
      }

      try {
        const countryDetail = await countryDetailService.getCountryDetailById(selectedCountryId);
        if (countryDetail?.storytellingLibraryId) {
          setCountryStorytellingId(countryDetail.storytellingLibraryId);
          setIsCountryStoryAutoLinked(true);
        } else {
          setCountryStorytellingId('');
          setIsCountryStoryAutoLinked(false);
        }
      } catch (error) {
        console.error('국가 스토리텔링 ID 조회 실패:', error);
        setCountryStorytellingId('');
        setIsCountryStoryAutoLinked(false);
      }
    };

    fetchCountryStorytellingId();
  }, [selectedCountryId]);

  // 도시 선택 시 도시 스토리텔링 ID 자동 연동
  useEffect(() => {
    const fetchCityStorytellingId = async () => {
      if (!selectedCity) {
        setCityStorytellingId('');
        setIsCityStoryAutoLinked(false);
        return;
      }

      try {
        const cityDetail = await cityDetailService.getCityDetailByCode(selectedCity.cityCode);
        if (cityDetail?.storytellingLibraryId) {
          setCityStorytellingId(cityDetail.storytellingLibraryId);
          setIsCityStoryAutoLinked(true);
        } else {
          setCityStorytellingId('');
          setIsCityStoryAutoLinked(false);
        }
      } catch (error) {
        console.error('도시 스토리텔링 ID 조회 실패:', error);
        setCityStorytellingId('');
        setIsCityStoryAutoLinked(false);
      }
    };

    fetchCityStorytellingId();
  }, [selectedCity]);

  // 도시 선택 시 실용 정보 ID 자동 연동
  useEffect(() => {
    const fetchPracticalInfoIds = async () => {
      if (!selectedCity) {
        setTransportId('');
        setIsTransportAutoLinked(false);
        setFinanceId('');
        setIsFinanceAutoLinked(false);
        setEmergencyId('');
        setIsEmergencyAutoLinked(false);
        return;
      }

      try {
        const cityDetail = await cityDetailService.getCityDetailByCode(selectedCity.cityCode);
        
        // 교통 정보
        if (cityDetail?.transportationLibraryId) {
          setTransportId(cityDetail.transportationLibraryId);
          setIsTransportAutoLinked(true);
        } else {
          setTransportId('');
          setIsTransportAutoLinked(false);
        }
        
        // 금융 정보
        if (cityDetail?.financeLibraryId) {
          setFinanceId(cityDetail.financeLibraryId);
          setIsFinanceAutoLinked(true);
        } else {
          setFinanceId('');
          setIsFinanceAutoLinked(false);
        }
        
        // 긴급 연락처
        if (cityDetail?.emergencyLibraryId) {
          setEmergencyId(cityDetail.emergencyLibraryId);
          setIsEmergencyAutoLinked(true);
        } else {
          setEmergencyId('');
          setIsEmergencyAutoLinked(false);
        }
      } catch (error) {
        console.error('실용 정보 ID 조회 실패:', error);
        setTransportId('');
        setIsTransportAutoLinked(false);
        setFinanceId('');
        setIsFinanceAutoLinked(false);
        setEmergencyId('');
        setIsEmergencyAutoLinked(false);
      }
    };

    fetchPracticalInfoIds();
  }, [selectedCity]);

  // 국가 필터링 함수
  const filterCountries = (countries: Country[], keyword: string) => {
    if (!keyword.trim()) return countries;
    const lowerKeyword = keyword.toLowerCase();
    return countries.filter(
      (c) =>
        c.nameKr.toLowerCase().includes(lowerKeyword) ||
        c.nameEn.toLowerCase().includes(lowerKeyword) ||
        c.isoCode.toLowerCase().includes(lowerKeyword)
    );
  };

  // 도시 선택 핸들러
  const handleCitySelect = (city: CityMaster) => {
    setSelectedCity(city);
    if (!titleKr && !titleEn) {
      setTitleKr(`${city.nameKr} 완전 정복 가이드`);
      setTitleEn(`Complete ${city.nameEn} Guide`);
    }
  };

  // 벌크 모달 열기
  const openBulkModal = (target: typeof currentBulkTarget, category: typeof currentBulkCategory) => {
    setCurrentBulkTarget(target);
    setCurrentBulkCategory(category);
    setShowBulkModal(true);
  };

  // 벌크 추가 핸들러
  const handleBulkAdd = (selectedIds: string[]) => {
    switch (currentBulkTarget) {
      case 'attractionSpecial':
        setAttractionSpecialIds([...attractionSpecialIds, ...selectedIds]);
        break;
      case 'attractionPlace':
        setAttractionPlaceIds([...attractionPlaceIds, ...selectedIds]);
        break;
      case 'cultureSpecial':
        setCultureSpecialIds([...cultureSpecialIds, ...selectedIds]);
        break;
      case 'diningPlace':
        setDiningPlaceIds([...diningPlaceIds, ...selectedIds]);
        break;
      case 'service':
        setServiceIds([...serviceIds, ...selectedIds]);
        break;
      case 'shopping':
        setShoppingIds([...shoppingIds, ...selectedIds]);
        break;
    }
    setShowBulkModal(false);
    toast.success(`${selectedIds.length}개 항목이 추가되었습니다.`);
  };

  // 저장 핸들러
  const handleSave = async () => {
    // 유효성 검사
    if (!titleKr || !titleEn) {
      toast.error('가이드북 제목을 입력하세요.');
      return;
    }
    if (!selectedCity) {
      toast.error('도시를 선택하세요.');
      return;
    }

    setSaving(true);
    try {
      const guidebookData = {
        titleKr,
        titleEn,
        description,
        cityName: selectedCity.nameKr,
        cityCode: selectedCity.cityCode,
        countryCode: selectedCity.countryCode || '',
        region: '유럽', // TODO: 국가 정보에서 자동 매핑
        guideType: 'Express',
        
        // 단일 참조 모듈
        modules: {
          countryStorytellingId: countryStorytellingId || null,
          cityStorytellingId: cityStorytellingId || null,
          transportId: transportId || null,
          financeId: financeId || null,
          emergencyId: emergencyId || null,
          
          // 벌크 선택 모듈 (ID 배열)
          attractionSpecialIds,
          attractionPlaceIds,
          cultureSpecialIds,
          diningPlaceIds,
          serviceIds,
          shoppingIds,
          
          // 통계
          l1: (countryStorytellingId ? 1 : 0) + (cityStorytellingId ? 1 : 0),
          l2: (transportId ? 1 : 0) + (financeId ? 1 : 0) + (emergencyId ? 1 : 0),
          l3: attractionPlaceIds.length + diningPlaceIds.length + serviceIds.length + shoppingIds.length,
          l4: attractionSpecialIds.length + cultureSpecialIds.length,
        },
        
        downloads: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('저장할 가이드북 데이터:', guidebookData);
      const docRef = await addDoc(collection(db, 'guidebooks'), guidebookData);
      console.log('가이드북 저장 성공, 문서 ID:', docRef.id);
      toast.success('가이드북이 저장되었습니다.');
      router.push('/admin/content/guidebooks');
    } catch (error) {
      console.error('가이드북 저장 실패:', error);
      toast.error('가이드북 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">일반 가이드북 조립</h1>
              <p className="text-gray-600 mt-1">모든 모듈을 포함하는 표준 레이아웃</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.back()} variant="outline">
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              <Check className="w-5 h-5 mr-2" />
              {saving ? '저장 중...' : '조립 완료'}
            </Button>
          </div>
        </div>

        {/* 기본 정보 */}
        <Card className="p-6 mb-6 shadow-lg border-2 border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">기본 정보</h2>
              <p className="text-sm text-gray-600">가이드북 제목 및 설명</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                가이드북 제목 (한글) <span className="text-red-500">*</span>
              </label>
              <Input
                value={titleKr}
                onChange={(e) => setTitleKr(e.target.value)}
                placeholder="예: 파리 완전 정복 가이드"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                가이드북 제목 (영문) <span className="text-red-500">*</span>
              </label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="예: Complete Paris Guide"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                설명 (선택사항)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="가이드북에 대한 간단한 설명을 입력하세요"
                className="bg-white min-h-[80px]"
              />
            </div>
          </div>
        </Card>

        {/* 대상 도시 선택 */}
        <Card className="p-6 mb-6 shadow-lg border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">대상 도시 선택</h2>
              <p className="text-sm text-gray-600">국가 및 도시 검색</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 국가 선택 */}
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
              getItemSecondary={(country) => `${country.isoCode}`}
              filterItems={filterCountries}
            />

            {/* 도시 선택 */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                도시 검색 <span className="text-red-500">*</span>
              </label>
              <Button
                onClick={() => setIsCitySearchModalOpen(true)}
                variant="outline"
                className="w-full justify-start h-12 text-left"
              >
                <Globe className="w-5 h-5 mr-2 text-gray-400" />
                {selectedCity ? (
                  <span className="text-gray-900">
                    {selectedCity.nameKr} ({selectedCity.cityCode})
                  </span>
                ) : (
                  <span className="text-gray-400">도시를 검색하세요</span>
                )}
              </Button>
              {selectedCity && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ 선택됨: {selectedCity.nameKr} / {selectedCity.nameEn}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 9단계 모듈 조립 */}
        {selectedCity && (
          <>
            {/* Step 1-2: 스토리텔링 */}
            <Card className="p-6 mb-6 shadow-lg border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 1-2: 스토리텔링</h2>
                  <p className="text-sm text-gray-600">국가 및 도시 스토리 연동</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    1. 국가 스토리텔링 ID
                    {isCountryStoryAutoLinked && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ 자동 연동됨
                      </span>
                    )}
                  </label>
                  <Input
                    value={countryStorytellingId}
                    onChange={(e) => setCountryStorytellingId(e.target.value)}
                    placeholder="국가 스토리 문서 ID"
                    className="bg-white"
                    readOnly={isCountryStoryAutoLinked}
                    disabled={isCountryStoryAutoLinked}
                  />
                  {!isCountryStoryAutoLinked && selectedCountryId && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> 마스터 DB에 등록된 스토리가 없습니다. 수동 입력 가능
                    </p>
                  )}
                  {isCountryStoryAutoLinked && (
                    <p className="text-xs text-green-600 mt-1">
                      💡 국가 마스터에서 자동으로 연동된 ID입니다
                    </p>
                  )}
                  {!selectedCountryId && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 먼저 국가를 선택하세요
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    2. 도시 스토리텔링 ID
                    {isCityStoryAutoLinked && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ 자동 연동됨
                      </span>
                    )}
                  </label>
                  <Input
                    value={cityStorytellingId}
                    onChange={(e) => setCityStorytellingId(e.target.value)}
                    placeholder="도시 스토리 문서 ID"
                    className="bg-white"
                    readOnly={isCityStoryAutoLinked}
                    disabled={isCityStoryAutoLinked}
                  />
                  {!isCityStoryAutoLinked && selectedCity && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> 마스터 DB에 등록된 스토리가 없습니다. 수동 입력 가능
                    </p>
                  )}
                  {isCityStoryAutoLinked && (
                    <p className="text-xs text-green-600 mt-1">
                      💡 도시 마스터에서 자동으로 연동된 ID입니다 (도시: {selectedCity?.nameKr})
                    </p>
                  )}
                  {!selectedCity && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 먼저 도시를 선택하세요
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Step 3-5: 실용 정보 */}
            <Card className="p-6 mb-6 shadow-lg border-2 border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 3-5: 실용 정보</h2>
                  <p className="text-sm text-gray-600">교통, 금융, 긴급연락처 연동</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-blue-600" />
                    3. 교통 정보 ID
                    {isTransportAutoLinked && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ 자동 연동됨
                      </span>
                    )}
                  </label>
                  <Input
                    value={transportId}
                    onChange={(e) => setTransportId(e.target.value)}
                    placeholder="교통 정보 문서 ID"
                    className="bg-white"
                    readOnly={isTransportAutoLinked}
                    disabled={isTransportAutoLinked}
                  />
                  {!isTransportAutoLinked && selectedCity && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> 마스터 DB에 등록된 교통 정보가 없습니다. 수동 입력 가능
                    </p>
                  )}
                  {isTransportAutoLinked && (
                    <p className="text-xs text-green-600 mt-1">
                      💡 도시 마스터에서 자동으로 연동된 ID입니다
                    </p>
                  )}
                  {!selectedCity && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 먼저 도시를 선택하세요
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    4. 금융 정보 ID
                    {isFinanceAutoLinked && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ 자동 연동됨
                      </span>
                    )}
                  </label>
                  <Input
                    value={financeId}
                    onChange={(e) => setFinanceId(e.target.value)}
                    placeholder="금융 정보 문서 ID"
                    className="bg-white"
                    readOnly={isFinanceAutoLinked}
                    disabled={isFinanceAutoLinked}
                  />
                  {!isFinanceAutoLinked && selectedCity && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> 마스터 DB에 등록된 금융 정보가 없습니다. 수동 입력 가능
                    </p>
                  )}
                  {isFinanceAutoLinked && (
                    <p className="text-xs text-green-600 mt-1">
                      💡 도시 마스터에서 자동으로 연동된 ID입니다
                    </p>
                  )}
                  {!selectedCity && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 먼저 도시를 선택하세요
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-600" />
                    5. 긴급연락처 ID
                    {isEmergencyAutoLinked && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ 자동 연동됨
                      </span>
                    )}
                  </label>
                  <Input
                    value={emergencyId}
                    onChange={(e) => setEmergencyId(e.target.value)}
                    placeholder="긴급연락처 문서 ID"
                    className="bg-white"
                    readOnly={isEmergencyAutoLinked}
                    disabled={isEmergencyAutoLinked}
                  />
                  {!isEmergencyAutoLinked && selectedCity && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> 마스터 DB에 등록된 긴급연락처가 없습니다. 수동 입력 가능
                    </p>
                  )}
                  {isEmergencyAutoLinked && (
                    <p className="text-xs text-green-600 mt-1">
                      💡 도시 마스터에서 자동으로 연동된 ID입니다
                    </p>
                  )}
                  {!selectedCity && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 먼저 도시를 선택하세요
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Step 6: 명소 (스페셜 + 장소) */}
            <Card className="p-6 mb-6 shadow-lg border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 6: 명소 연동</h2>
                  <p className="text-sm text-gray-600">스페셜 DB 및 명소 DB 벌크 선택</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    6-1. 스페셜(명소) - {attractionSpecialIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('attractionSpecial', 'attractions')}
                    variant="outline"
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    스페셜 명소 검색 및 벌크 추가
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    6-2. 장소(명소) - {attractionPlaceIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('attractionPlace', 'attractions')}
                    variant="outline"
                    className="w-full"
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    명소 장소 검색 및 벌크 추가
                  </Button>
                </div>
              </div>
            </Card>

            {/* Step 7: 미식 (스페셜 + 장소) */}
            <Card className="p-6 mb-6 shadow-lg border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 7: 미식 연동</h2>
                  <p className="text-sm text-gray-600">문화 스페셜 및 음식점 벌크 선택</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    7-1. 문화 스페셜(미식) - {cultureSpecialIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('cultureSpecial', 'dining')}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    미식 스페셜 검색 및 벌크 추가
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    7-2. 장소(음식점/카페/바) - {diningPlaceIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('diningPlace', 'dining')}
                    variant="outline"
                    className="w-full"
                  >
                    <Utensils className="w-4 h-4 mr-2" />
                    음식점 검색 및 벌크 추가
                  </Button>
                </div>
              </div>
            </Card>

            {/* Step 8-9: 서비스 & 쇼핑 */}
            <Card className="p-6 mb-6 shadow-lg border-2 border-pink-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Step 8-9: 서비스 & 쇼핑</h2>
                  <p className="text-sm text-gray-600">라이프스타일 서비스 및 쇼핑 정보</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    8. 장소(서비스) - {serviceIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('service', 'services')}
                    variant="outline"
                    className="w-full"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    서비스 검색 및 벌크 추가
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-600" />
                    9. 쇼핑 정보 - {shoppingIds.length}개 선택됨
                  </label>
                  <Button
                    onClick={() => openBulkModal('shopping', 'shopping')}
                    variant="outline"
                    className="w-full"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    쇼핑 정보 검색 및 벌크 추가
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 하단 액션 바 */}
        <div className="sticky bottom-8 bg-white border-2 border-indigo-200 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">조립 진행 상황</h3>
              <p className="text-sm text-gray-600">
                선택된 모듈: {
                  (countryStorytellingId ? 1 : 0) +
                  (cityStorytellingId ? 1 : 0) +
                  (transportId ? 1 : 0) +
                  (financeId ? 1 : 0) +
                  (emergencyId ? 1 : 0) +
                  attractionSpecialIds.length +
                  attractionPlaceIds.length +
                  cultureSpecialIds.length +
                  diningPlaceIds.length +
                  serviceIds.length +
                  shoppingIds.length
                }개
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Check className="w-5 h-5 mr-2" />
              {saving ? '저장 중...' : '조립 완료'}
            </Button>
          </div>
        </div>
      </div>

      {/* 도시 검색 모달 */}
      <CityMasterSearchModal
        isOpen={isCitySearchModalOpen}
        onClose={() => setIsCitySearchModalOpen(false)}
        onSelect={handleCitySelect}
      />

      {/* 벌크 콘텐츠 검색 모달 */}
      {selectedCity && (
        <BulkContentSearchModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          category={currentBulkCategory}
          categoryLabel={
            currentBulkCategory === 'attractions'
              ? '명소 & 박물관'
              : currentBulkCategory === 'dining'
              ? '레스토랑 & 카페 & 바'
              : currentBulkCategory === 'shopping'
              ? '쇼핑'
              : currentBulkCategory === 'services'
              ? '라이프스타일 서비스'
              : '숙소'
          }
          cityCode={selectedCity.cityCode}
          alreadyLinkedIds={
            currentBulkTarget === 'attractionSpecial'
              ? attractionSpecialIds
              : currentBulkTarget === 'attractionPlace'
              ? attractionPlaceIds
              : currentBulkTarget === 'cultureSpecial'
              ? cultureSpecialIds
              : currentBulkTarget === 'diningPlace'
              ? diningPlaceIds
              : currentBulkTarget === 'service'
              ? serviceIds
              : shoppingIds
          }
          onBulkAdd={handleBulkAdd}
        />
      )}
    </div>
  );
}
