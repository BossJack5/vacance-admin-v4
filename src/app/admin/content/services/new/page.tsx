'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Sparkles, Heart, Palette, Dumbbell, Briefcase } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import toast from 'react-hot-toast';

// 공통 섹션 컴포넌트들 (쇼핑 등록과 100% 동일하게 재사용)
import LocationSection from '@/components/admin/content/location/LocationSection';
import BasicInfoSection from '@/components/admin/content/location/BasicInfoSection';
import MultimediaSection from '@/components/admin/content/location/MultimediaSection';
import FacilitySection from '@/components/admin/content/location/FacilitySection';

// 서비스 전용 섹션
import ServiceMenuSection from '@/components/admin/content/service/ServiceMenuSection';

interface City {
  id: string;
  cityCode: string;
  cityName: string;
  countryCode: string;
}

interface OperatingHours {
  [key: string]: {
    isClosed: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface ServiceMenuItem {
  id: string;
  name: string;
  duration: number | null;
  price: number;
  currency: 'EUR' | 'USD' | 'KRW';
  description: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  // 위치 정보
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState('');
  const [gpsLongitude, setGpsLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapId, setGoogleMapId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // 기본 정보
  const [nameKr, setNameKr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [summary, setSummary] = useState('');
  const [coreInfo, setCoreInfo] = useState('');
  const [detailInfo, setDetailInfo] = useState('');
  const [advancedInfo, setAdvancedInfo] = useState('');

  // 서비스 유형
  const [serviceType, setServiceType] = useState<'wellness' | 'ateliers' | 'leisure' | 'convenience'>('wellness');

  // 가격대 (최대 3단계)
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(2);

  // 서비스 메뉴
  const [serviceMenus, setServiceMenus] = useState<ServiceMenuItem[]>([
    {
      id: '1',
      name: '',
      duration: null,
      price: 0,
      currency: 'EUR',
      description: ''
    }
  ]);

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '09:00', closeTime: '21:00' },
    tuesday: { isClosed: false, openTime: '09:00', closeTime: '21:00' },
    wednesday: { isClosed: false, openTime: '09:00', closeTime: '21:00' },
    thursday: { isClosed: false, openTime: '09:00', closeTime: '21:00' },
    friday: { isClosed: false, openTime: '09:00', closeTime: '22:00' },
    saturday: { isClosed: false, openTime: '09:00', closeTime: '22:00' },
    sunday: { isClosed: false, openTime: '10:00', closeTime: '20:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

  useEffect(() => {
    loadCountries();
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCountryCode) {
      const filtered = cities.filter(city => city.countryCode === selectedCountryCode);
      setFilteredCities(filtered);
      setSelectedCityCode('');
    } else {
      setFilteredCities([]);
    }
  }, [selectedCountryCode, cities]);

  const loadCountries = async () => {
    try {
      const data = await locationService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('국가 목록 로드 실패:', error);
      toast.error('국가 목록을 불러오지 못했습니다');
    }
  };

  const loadCities = async () => {
    try {
      const citiesRef = collection(db, 'cities');
      const snapshot = await getDocs(citiesRef);
      const citiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as City[];
      setCities(citiesData);
    } catch (error) {
      console.error('도시 목록 로드 실패:', error);
      toast.error('도시 목록을 불러오지 못했습니다');
    }
  };

  const handleLocationFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'gpsLatitude': setGpsLatitude(value); break;
      case 'gpsLongitude': setGpsLongitude(value); break;
      case 'address': setAddress(value); break;
      case 'googleMapId': setGoogleMapId(value); break;
      case 'phoneNumber': setPhoneNumber(value); break;
      case 'websiteUrl': setWebsiteUrl(value); break;
    }
  };

  const handleBasicInfoFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'nameKr': setNameKr(value); break;
      case 'nameEn': setNameEn(value); break;
      case 'summary': setSummary(value); break;
      case 'coreInfo': setCoreInfo(value); break;
      case 'detailInfo': setDetailInfo(value); break;
      case 'advancedInfo': setAdvancedInfo(value); break;
    }
  };

  const handleMultimediaFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'thumbnailUrl': setThumbnailUrl(value); break;
      case 'videoUrl': setVideoUrl(value); break;
      case 'audioGuideUrl': setAudioGuideUrl(value); break;
    }
  };

  const addGalleryUrl = () => {
    if (galleryUrls.length < 20) {
      setGalleryUrls([...galleryUrls, '']);
    }
  };

  const updateGalleryUrl = (index: number, value: string) => {
    const updated = [...galleryUrls];
    updated[index] = value;
    setGalleryUrls(updated);
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // 서비스 메뉴 관리
  const addServiceMenu = () => {
    setServiceMenus([
      ...serviceMenus,
      {
        id: Date.now().toString(),
        name: '',
        duration: null,
        price: 0,
        currency: 'EUR',
        description: ''
      }
    ]);
  };

  const removeServiceMenu = (id: string) => {
    setServiceMenus(serviceMenus.filter(menu => menu.id !== id));
  };

  const updateServiceMenu = (id: string, field: keyof ServiceMenuItem, value: any) => {
    setServiceMenus(serviceMenus.map(menu =>
      menu.id === id ? { ...menu, [field]: value } : menu
    ));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryCode || !selectedCityCode) {
      toast.error('필수 항목을 모두 입력해주세요 (매장명, 국가, 도시)');
      return;
    }

    // 서비스 메뉴 검증
    const validMenus = serviceMenus.filter(menu => menu.name.trim() !== '' && menu.price > 0);
    if (validMenus.length === 0) {
      toast.error('최소 1개 이상의 서비스 메뉴를 등록해주세요 (서비스명, 금액 필수)');
      return;
    }

    setSaving(true);
    try {
      // "입력하면 보여주고, 비워두면 숨긴다" 원칙 적용
      const processedMenus = validMenus.map(menu => ({
        name: menu.name,
        duration: menu.duration || undefined, // null이면 undefined로 변환 (숨김)
        price: menu.price,
        currency: menu.currency,
        description: menu.description.trim() || undefined // 비어있으면 undefined (숨김)
      }));

      const serviceData = {
        // 기본 정보
        nameKr,
        nameEn,
        summary,
        serviceType,

        // 위치 정보
        countryCode: selectedCountryCode,
        cityCode: selectedCityCode,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        address,
        googleMapId,
        phoneNumber,
        websiteUrl,

        // 가격대 (최대 $$$)
        priceLevel,

        // 상세 정보
        coreInfo,
        detailInfo,
        advancedInfo,

        // 서비스 메뉴 (핵심 데이터)
        serviceMenus: processedMenus,

        // 멀티미디어
        thumbnailUrl,
        videoUrl,
        audioGuideUrl,
        galleryUrls: galleryUrls.filter(url => url.trim() !== ''),

        // 시설 정보
        facilities,
        operatingHours,
        regularClosedDays,

        // 메타 정보
        status: 'active',
        type: '서비스',
        isPremium: false, // 별점 3개 이상 시 자동 태그 로직 예비
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'services'), serviceData);
      
      // 성공 메시지 생성
      let successMessage = '';
      switch (serviceType) {
        case 'wellness':
          successMessage = '웰니스 & 뷰티 서비스가';
          break;
        case 'ateliers':
          successMessage = '클래스 & 워크숍이';
          break;
        case 'leisure':
          successMessage = '스포츠 & 레저 서비스가';
          break;
        case 'convenience':
          successMessage = '트래블 컨비니언스 서비스가';
          break;
      }
      
      toast.success(`${successMessage} 성공적으로 등록되었습니다`);
      router.push('/admin/content/services');
    } catch (error) {
      console.error('등록 실패:', error);
      toast.error('등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">새 서비스 등록</h1>
              <p className="text-gray-600">웰니스, 클래스, 레저, 컨비니언스 등 다양한 서비스를 등록하고 관리합니다</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saving ? (
              <>처리 중...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* 서비스 유형 선택 (4종 테마) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">서비스 유형</h3>
          <p className="text-sm text-gray-600 mb-6">제공하는 서비스의 유형을 선택하세요</p>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { 
                id: 'wellness', 
                label: '웰니스 & 뷰티', 
                desc: '스파, 마사지, 헤어살롱, 네일 등',
                icon: Heart,
                color: 'pink'
              },
              { 
                id: 'ateliers', 
                label: '클래스 & 워크숍', 
                desc: '쿠킹 클래스, 와인 시음, 향수 공방 등',
                icon: Palette,
                color: 'amber'
              },
              { 
                id: 'leisure', 
                label: '스포츠 & 레저', 
                desc: '테니스, 요가, 피트니스, 대여 등',
                icon: Dumbbell,
                color: 'green'
              },
              { 
                id: 'convenience', 
                label: '트래블 컨비니언스', 
                desc: '세탁, 짐 보관, 스냅 촬영, 컨시어지 등',
                icon: Briefcase,
                color: 'blue'
              }
            ].map((type) => {
              const Icon = type.icon;
              const isSelected = serviceType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setServiceType(type.id as any)}
                  className={`
                    p-5 rounded-xl border-2 transition-all duration-200 text-left
                    hover:shadow-md
                    ${isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-lg ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {/* 아이콘 */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-3
                    ${isSelected 
                      ? 'bg-purple-600' 
                      : 'bg-gray-100'
                    }
                  `}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  
                  {/* 타이틀 */}
                  <div className={`font-semibold mb-2 ${
                    isSelected ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </div>
                  
                  {/* 세부 설명 */}
                  <div className={`text-xs leading-relaxed ${
                    isSelected ? 'text-purple-700' : 'text-gray-500'
                  }`}>
                    {type.desc}
                  </div>
                  
                  {/* 선택 체크 표시 */}
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-purple-700">선택됨</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 확장성을 위한 특수 필드 영역 (향후 추가 가능) */}
          {(() => {
            switch (serviceType) {
              case 'wellness':
                // 웰니스 전용 필드 (향후 확장)
                return null;
              case 'ateliers':
                // 클래스 전용 필드 (향후 확장)
                return null;
              case 'leisure':
                // 레저 전용 필드 (향후 확장)
                return null;
              case 'convenience':
                // 컨비니언스 전용 필드 (향후 확장)
                return null;
              default:
                return null;
            }
          })()}
        </div>

        {/* 공통 섹션: 위치 정보 (100% 재사용) */}
        <LocationSection
          countries={countries}
          cities={cities}
          filteredCities={filteredCities}
          selectedCountryCode={selectedCountryCode}
          selectedCityCode={selectedCityCode}
          gpsLatitude={gpsLatitude}
          gpsLongitude={gpsLongitude}
          address={address}
          googleMapId={googleMapId}
          phoneNumber={phoneNumber}
          websiteUrl={websiteUrl}
          onCountryChange={setSelectedCountryCode}
          onCityChange={setSelectedCityCode}
          onFieldChange={handleLocationFieldChange}
        />

        {/* 공통 섹션: 기본 정보 (100% 재사용) */}
        <BasicInfoSection
          nameKr={nameKr}
          nameEn={nameEn}
          summary={summary}
          coreInfo={coreInfo}
          detailInfo={detailInfo}
          advancedInfo={advancedInfo}
          onFieldChange={handleBasicInfoFieldChange}
          type="landmark"
        />

        {/* 서비스 전용: 서비스 메뉴 관리 */}
        <ServiceMenuSection
          serviceMenus={serviceMenus}
          onMenuAdd={addServiceMenu}
          onMenuRemove={removeServiceMenu}
          onMenuUpdate={updateServiceMenu}
        />

        {/* 공통 섹션: 멀티미디어 (100% 재사용) */}
        <MultimediaSection
          thumbnailUrl={thumbnailUrl}
          videoUrl={videoUrl}
          audioGuideUrl={audioGuideUrl}
          galleryUrls={galleryUrls}
          onFieldChange={handleMultimediaFieldChange}
          onGalleryAdd={addGalleryUrl}
          onGalleryUpdate={updateGalleryUrl}
          onGalleryRemove={removeGalleryUrl}
        />

        {/* 공통 섹션: 시설 정보 (100% 재사용) */}
        <FacilitySection
          facilities={facilities}
          operatingHours={operatingHours}
          regularClosedDays={regularClosedDays}
          onFacilityToggle={toggleFacility}
          onOperatingHoursUpdate={updateOperatingHours}
          onRegularClosedDaysChange={setRegularClosedDays}
        />

        {/* 가격대 선택 (최대 3단계) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">가격대 설정</h3>
          <p className="text-sm text-gray-600 mb-4">서비스의 평균 가격대를 선택하세요 (최대 $$$)</p>
          
          <div className="flex gap-4">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setPriceLevel(level as 1 | 2 | 3)}
                className={`
                  flex-1 p-4 rounded-lg border-2 transition-all
                  ${priceLevel === level
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl font-bold mb-2">
                  {'$'.repeat(level)}
                </div>
                <div className="text-sm text-gray-600">
                  {level === 1 && '저렴 (~€50)'}
                  {level === 2 && '보통 (€50-150)'}
                  {level === 3 && '고가 (€150+)'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 저장 버튼 */}
        <div className="flex justify-end gap-4 pb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saving ? (
              <>처리 중...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
