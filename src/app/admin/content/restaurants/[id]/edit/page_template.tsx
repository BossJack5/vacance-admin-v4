'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import toast from 'react-hot-toast';

// 공통 섹션 컴포넌트들
import LocationSection from '@/components/admin/content/location/LocationSection';
import BasicInfoSection from '@/components/admin/content/location/BasicInfoSection';
import MultimediaSection from '@/components/admin/content/location/MultimediaSection';
import FacilitySection from '@/components/admin/content/location/FacilitySection';

// 공통 컴포넌트
import PriceLevelSelector from '@/components/shared/PriceLevelSelector';
import ScrollToTopButton from '@/components/shared/ScrollToTopButton';

// 레스토랑 전용 섹션 컴포넌트들
import RestaurantTypeSection from '@/components/admin/content/restaurant/RestaurantTypeSection';
import MenuManagementSection from '@/components/admin/content/restaurant/MenuManagementSection';
import RestaurantSpecialsSection from '@/components/admin/content/restaurant/RestaurantSpecialsSection';
import ReservationSystemSection from '@/components/admin/content/restaurant/ReservationSystemSection';

interface City {
  id: string;
  nameKr: string;
  nameEn: string;
  countryId: string;
}

interface OperatingHours {
  [key: string]: {
    isClosed: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  allergyInfo: string;
}

interface MenuCategory {
  id: string;
  category: string;
  items: MenuItem[];
}

export default function NewRestaurantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  // 레스토랑 타입
  const [restaurantType, setRestaurantType] = useState<'restaurant' | 'cafe' | 'bar'>('restaurant');

  // 위치 정보
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
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

  // 가격대
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(2);

  // 선택된 국가에 따라 화폐 심볼 결정
  const getCurrencySymbol = () => {
    const country = countries.find(c => c.id === selectedCountryId);
    if (!country) return '€';
    
    const usCountries = ['US', 'USA'];
    const krCountries = ['KR', 'KOR'];
    const jpCountries = ['JP', 'JPN'];
    const gbCountries = ['GB', 'GBR', 'UK'];
    const chCountries = ['CH', 'CHE'];
    
    const isoCode = country.isoCode;
    if (usCountries.includes(isoCode)) return '$';
    if (krCountries.includes(isoCode)) return '₩';
    if (jpCountries.includes(isoCode)) return '¥';
    if (gbCountries.includes(isoCode)) return '£';
    if (chCountries.includes(isoCode)) return 'Fr';
    
    return '€';
  };

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '11:00', closeTime: '22:00' },
    tuesday: { isClosed: false, openTime: '11:00', closeTime: '22:00' },
    wednesday: { isClosed: false, openTime: '11:00', closeTime: '22:00' },
    thursday: { isClosed: false, openTime: '11:00', closeTime: '22:00' },
    friday: { isClosed: false, openTime: '11:00', closeTime: '23:00' },
    saturday: { isClosed: false, openTime: '11:00', closeTime: '23:00' },
    sunday: { isClosed: false, openTime: '11:00', closeTime: '22:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

  // 메뉴 관리
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([
    {
      id: '1',
      category: '시그니처',
      items: []
    }
  ]);

  // 레스토랑 특화 필드
  const [michelinStars, setMichelinStars] = useState(0);
  const [dressCode, setDressCode] = useState('');
  const [hasCourseMenu, setHasCourseMenu] = useState(false);

  // 예약 시스템
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [reservationStartTime, setReservationStartTime] = useState('11:00');
  const [reservationEndTime, setReservationEndTime] = useState('21:00');
  const [reservationInterval, setReservationInterval] = useState<30 | 60>(60);
  const [maxDaysAdvance, setMaxDaysAdvance] = useState(7);
  const [maxGuestsPerSlot, setMaxGuestsPerSlot] = useState(4);
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  useEffect(() => {
    loadCountries();
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      const filtered = cities.filter(city => city.countryId === selectedCountryId);
      setFilteredCities(filtered);
      setSelectedCityId('');
    } else {
      setFilteredCities([]);
    }
  }, [selectedCountryId, cities]);

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

  // 메뉴 관리 핸들러
  const addMenuCategory = () => {
    setMenuCategories([
      ...menuCategories,
      {
        id: Date.now().toString(),
        category: '',
        items: []
      }
    ]);
  };

  const removeMenuCategory = (categoryId: string) => {
    setMenuCategories(menuCategories.filter(cat => cat.id !== categoryId));
  };

  const updateMenuCategory = (categoryId: string, field: string, value: string) => {
    setMenuCategories(menuCategories.map(cat =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
  };

  const addMenuItem = (categoryId: string) => {
    setMenuCategories(menuCategories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: [
              ...cat.items,
              {
                id: Date.now().toString(),
                name: '',
                price: 0,
                description: '',
                allergyInfo: ''
              }
            ]
          }
        : cat
    ));
  };

  const removeMenuItem = (categoryId: string, itemId: string) => {
    setMenuCategories(menuCategories.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
        : cat
    ));
  };

  const updateMenuItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => {
    setMenuCategories(menuCategories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : cat
    ));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryId || !selectedCityId) {
      toast.error('필수 항목을 모두 입력해주세요 (매장명, 국가, 도시)');
      return;
    }

    setSaving(true);
    try {
      const restaurantData = {
        // 기본 정보
        nameKr,
        nameEn,
        summary,
        
        // 레스토랑 타입
        category: restaurantType,
        
        // 위치 정보
        countryId: selectedCountryId,
        cityId: selectedCityId,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        address,
        googleMapId,
        phoneNumber,
        websiteUrl,

        // 가격대
        priceLevel,

        // 상세 정보
        coreInfo,
        detailInfo,
        advancedInfo,

        // 멀티미디어
        thumbnailUrl,
        videoUrl,
        audioGuideUrl,
        galleryUrls: galleryUrls.filter(url => url.trim() !== ''),

        // 시설 정보
        facilities,
        operatingHours,
        regularClosedDays,

        // 메뉴
        menus: menuCategories
          .filter(cat => cat.category.trim() !== '')
          .map(cat => ({
            category: cat.category,
            items: cat.items.filter(item => item.name.trim() !== '')
          })),

        // 레스토랑 특화
        michelinStars,
        dressCode,
        hasCourseMenu,

        // 예약 시스템
        reservation: reservationEnabled ? {
          enabled: true,
          startTime: reservationStartTime,
          endTime: reservationEndTime,
          interval: reservationInterval,
          maxDaysAdvance,
          maxGuestsPerSlot,
          cancellationPolicy
        } : {
          enabled: false
        },

        // 메타 정보
        status: 'active',
        type: '레스토랑',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'restaurants'), restaurantData);
      toast.success(`${restaurantType === 'restaurant' ? '레스토랑' : restaurantType === 'cafe' ? '카페' : '바'}가 성공적으로 등록되었습니다`);
      router.push('/admin/content/restaurants');
    } catch (error) {
      console.error('등록 실패:', error);
      toast.error('등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white p-8">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 레스토랑/카페/바 등록</h1>
            <p className="text-gray-600">미식 명소 정보를 등록하고 관리합니다</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700"
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
        {/* 업종 선택 */}
        <RestaurantTypeSection
          selectedType={restaurantType}
          onTypeChange={setRestaurantType}
        />

        {/* 공통 섹션: 위치 정보 */}
        <LocationSection
          countries={countries}
          cities={cities}
          filteredCities={filteredCities}
          selectedCountryCode={selectedCountryId}
          selectedCityCode={selectedCityId}
          gpsLatitude={gpsLatitude}
          gpsLongitude={gpsLongitude}
          address={address}
          googleMapId={googleMapId}
          phoneNumber={phoneNumber}
          websiteUrl={websiteUrl}
          onCountryChange={setSelectedCountryId}
          onCityChange={setSelectedCityId}
          onFieldChange={handleLocationFieldChange}
        />

        {/* 가격대 */}
        <PriceLevelSelector
          value={priceLevel}
          onChange={setPriceLevel}
          currency={getCurrencySymbol()}
          title="가격대 설정"
          description="레스토랑의 평균 가격대를 선택하세요"
        />

        {/* 공통 섹션: 기본 정보 */}
        <BasicInfoSection
          nameKr={nameKr}
          nameEn={nameEn}
          summary={summary}
          coreInfo={coreInfo}
          detailInfo={detailInfo}
          advancedInfo={advancedInfo}
          onFieldChange={handleBasicInfoFieldChange}
          type="restaurant"
        />

        {/* 메뉴 관리 */}
        <MenuManagementSection
          menuCategories={menuCategories}
          onCategoryAdd={addMenuCategory}
          onCategoryRemove={removeMenuCategory}
          onCategoryUpdate={updateMenuCategory}
          onItemAdd={addMenuItem}
          onItemRemove={removeMenuItem}
          onItemUpdate={updateMenuItem}
        />

        {/* 레스토랑 전용: 미식 특화 (레스토랑일 때만) */}
        {restaurantType === 'restaurant' && (
          <RestaurantSpecialsSection
            michelinStars={michelinStars}
            dressCode={dressCode}
            hasCourseMenu={hasCourseMenu}
            onMichelinStarsChange={setMichelinStars}
            onDressCodeChange={setDressCode}
            onCourseMenuToggle={() => setHasCourseMenu(!hasCourseMenu)}
          />
        )}

        {/* 공통 섹션: 멀티미디어 */}
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

        {/* 공통 섹션: 시설 정보 */}
        <FacilitySection
          facilities={facilities}
          operatingHours={operatingHours}
          regularClosedDays={regularClosedDays}
          onFacilityToggle={toggleFacility}
          onOperatingHoursUpdate={updateOperatingHours}
          onRegularClosedDaysChange={setRegularClosedDays}
        />

        {/* 예약 시스템 */}
        <ReservationSystemSection
          restaurantType={restaurantType}
          isEnabled={reservationEnabled}
          startTime={reservationStartTime}
          endTime={reservationEndTime}
          interval={reservationInterval}
          maxDaysAdvance={maxDaysAdvance}
          maxGuestsPerSlot={maxGuestsPerSlot}
          cancellationPolicy={cancellationPolicy}
          operatingHours={operatingHours}
          onToggle={() => setReservationEnabled(!reservationEnabled)}
          onStartTimeChange={setReservationStartTime}
          onEndTimeChange={setReservationEndTime}
          onIntervalChange={setReservationInterval}
          onMaxDaysChange={setMaxDaysAdvance}
          onMaxGuestsChange={setMaxGuestsPerSlot}
          onCancellationPolicyChange={setCancellationPolicy}
        />

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
            className="bg-orange-600 hover:bg-orange-700"
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
      <ScrollToTopButton />
    </div>
  );
}
