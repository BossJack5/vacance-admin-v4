'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Phone,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import MasterSearchSelect from '@/components/common/MasterSearchSelect';
import CityMasterSearchModal from '@/components/admin/content/CityMasterSearchModal';
import { CityMaster } from '@/types/location';
import BulkContentSearchModal from '@/components/admin/content/BulkContentSearchModal';
import { countryDetailService } from '@/services/countryDetailService';
import { cityDetailService } from '@/services/cityDetailService';

export default function EditGuidebookPage() {
  const router = useRouter();
  const params = useParams();
  const guidebookId = params.id as string;
  
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  // 가이드북 데이터 로드
  useEffect(() => {
    const loadGuidebook = async () => {
      try {
        const docRef = doc(db, 'guidebooks', guidebookId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast.error('가이드북을 찾을 수 없습니다.');
          router.push('/admin/content/guidebooks');
          return;
        }
        
        const data = docSnap.data();
        
        // 기본 정보
        setTitleKr(data.titleKr || '');
        setTitleEn(data.titleEn || '');
        setDescription(data.description || '');
        
        // 도시 정보 복원
        if (data.cityCode) {
          setSelectedCity({
            id: data.cityCode,
            nameKr: data.cityName,
            nameEn: data.titleEn.replace('Complete ', '').replace(' Guide', ''),
            cityCode: data.cityCode,
            countryCode: data.countryCode,
          });
        }
        
        // 모듈 정보
        if (data.modules) {
          setCountryStorytellingId(data.modules.countryStorytellingId || '');
          setCityStorytellingId(data.modules.cityStorytellingId || '');
          setTransportId(data.modules.transportId || '');
          setFinanceId(data.modules.financeId || '');
          setEmergencyId(data.modules.emergencyId || '');
          
          setAttractionSpecialIds(data.modules.attractionSpecialIds || []);
          setAttractionPlaceIds(data.modules.attractionPlaceIds || []);
          setCultureSpecialIds(data.modules.cultureSpecialIds || []);
          setDiningPlaceIds(data.modules.diningPlaceIds || []);
          setServiceIds(data.modules.serviceIds || []);
          setShoppingIds(data.modules.shoppingIds || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('가이드북 로딩 실패:', error);
        toast.error('가이드북 로딩에 실패했습니다.');
        router.push('/admin/content/guidebooks');
      }
    };
    
    loadGuidebook();
  }, [guidebookId, router]);

  // 국가 목록 로드
  useEffect(() => {
    const loadCountries = async () => {
      const data = await locationService.getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

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
        region: '유럽',
        guideType: 'Express',
        
        modules: {
          countryStorytellingId: countryStorytellingId || null,
          cityStorytellingId: cityStorytellingId || null,
          transportId: transportId || null,
          financeId: financeId || null,
          emergencyId: emergencyId || null,
          
          attractionSpecialIds,
          attractionPlaceIds,
          cultureSpecialIds,
          diningPlaceIds,
          serviceIds,
          shoppingIds,
          
          l1: (countryStorytellingId ? 1 : 0) + (cityStorytellingId ? 1 : 0),
          l2: (transportId ? 1 : 0) + (financeId ? 1 : 0) + (emergencyId ? 1 : 0),
          l3: attractionPlaceIds.length + diningPlaceIds.length + serviceIds.length + shoppingIds.length,
          l4: attractionSpecialIds.length + cultureSpecialIds.length,
        },
        
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'guidebooks', guidebookId), guidebookData);
      toast.success('가이드북이 수정되었습니다.');
      router.push('/admin/content/guidebooks');
    } catch (error) {
      console.error('가이드북 수정 실패:', error);
      toast.error('가이드북 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">가이드북 로딩 중...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">가이드북 수정</h1>
              <p className="text-gray-600 mt-1">가이드북 정보를 수정합니다</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.back()} variant="outline">
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              <Check className="w-5 h-5 mr-2" />
              {saving ? '저장 중...' : '저장'}
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

        {/* 대상 도시 */}
        <Card className="p-6 mb-6 shadow-lg border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">대상 도시</h2>
              <p className="text-sm text-gray-600">현재: {selectedCity?.nameKr || '-'}</p>
            </div>
          </div>

          <Button
            onClick={() => setIsCitySearchModalOpen(true)}
            variant="outline"
            className="w-full"
          >
            <Globe className="w-5 h-5 mr-2" />
            도시 변경
          </Button>
        </Card>

        {/* Step 1-2: 스토리텔링 */}
        {selectedCity && (
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
              </div>
            </div>
          </Card>
        )}

        {/* Step 3-5: 실용 정보 */}
        {selectedCity && (
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
              </div>
            </div>
          </Card>
        )}

        {/* Step 6: 명소 (스페셜 + 장소) */}
        {selectedCity && (
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
        )}

        {/* Step 7: 미식 (스페셜 + 장소) */}
        {selectedCity && (
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
        )}

        {/* Step 8-9: 서비스 & 쇼핑 */}
        {selectedCity && (
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
        )}

        {/* 하단 액션 바 */}
        <div className="sticky bottom-8 bg-white border-2 border-indigo-200 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">수정 완료</h3>
              <p className="text-sm text-gray-600">
                변경사항을 저장하시겠습니까?
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Check className="w-5 h-5 mr-2" />
              {saving ? '저장 중...' : '저장'}
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
