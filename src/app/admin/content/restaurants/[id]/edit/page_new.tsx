'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { locationService } from '@/services/locationService';

// 공통 섹션 컴포넌트들
import LocationSection from '@/components/admin/content/location/LocationSection';
import BasicInfoSection from '@/components/admin/content/location/BasicInfoSection';
import MultimediaSection from '@/components/admin/content/location/MultimediaSection';
import FacilitySection from '@/components/admin/content/location/FacilitySection';

// 레스토랑 전용 섹션들
import RestaurantTypeSection from '@/components/admin/content/restaurant/RestaurantTypeSection';
import MenuManagementSection from '@/components/admin/content/restaurant/MenuManagementSection';
import RestaurantSpecialsSection from '@/components/admin/content/restaurant/RestaurantSpecialsSection';
import ReservationSystemSection from '@/components/admin/content/restaurant/ReservationSystemSection';
import PriceLevelSelector from '@/components/shared/PriceLevelSelector';
import ScrollToTopButton from '@/components/shared/ScrollToTopButton';

interface Country {
  id: string;
  nameKr: string;
  code: string;
  currency: string;
}

interface City {
  id: string;
  nameKr: string;
  countryId: string;
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

export default function RestaurantEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 업종 타입
  const [restaurantType, setRestaurantType] = useState<'restaurant' | 'cafe' | 'bar'>('restaurant');

  // 위치 정보
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState('');
  const [gpsLongitude, setGpsLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapId, setGoogleMapId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // 가격대
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3 | 4>(2);

  // 기본 정보
  const [nameKr, setNameKr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [summary, setSummary] = useState('');
  const [coreInfo, setCoreInfo] = useState('');
  const [detailInfo, setDetailInfo] = useState('');
  const [advancedInfo, setAdvancedInfo] = useState('');

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<any>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    sunday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

  // 메뉴 관리
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);

  // 레스토랑 특화 (미슐랭, 드레스코드, 코스메뉴)
  const [michelinStars, setMichelinStars] = useState<0 | 1 | 2 | 3>(0);
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

  // 레스토랑 데이터 로드
  useEffect(() => {
    loadRestaurant();
    loadCountries();
    loadCities();
  }, [id]);

  useEffect(() => {
    if (selectedCountryId) {
      const filtered = cities.filter(city => city.countryId === selectedCountryId);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [selectedCountryId, cities]);

  const loadRestaurant = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'restaurants', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        toast.error('레스토랑을 찾을 수 없습니다');
        router.push('/admin/content/restaurants');
        return;
      }

      const rawData = docSnap.data();
      
      // 기본 정보
      setNameKr(rawData.name_kr || rawData.nameKr || '');
      setNameEn(rawData.name_en || rawData.nameEn || '');
      setSummary(rawData.summary || '');
      
      // 레스토랑 타입
      setRestaurantType(rawData.category || 'restaurant');
      
      // 위치 정보
      setSelectedCountryId(rawData.countryId || '');
      setSelectedCityId(rawData.cityId || '');
      setGpsLatitude(rawData.gpsLatitude ? rawData.gpsLatitude.toString() : '');
      setGpsLongitude(rawData.gpsLongitude ? rawData.gpsLongitude.toString() : '');
      setAddress(rawData.address || '');
      setGoogleMapId(rawData.googleMapId || '');
      setPhoneNumber(rawData.phoneNumber || '');
      setWebsiteUrl(rawData.websiteUrl || '');

      // 가격대
      setPriceLevel(rawData.priceLevel || 2);

      // 상세 정보
      setCoreInfo(rawData.coreInfo || '');
      setDetailInfo(rawData.detailInfo || '');
      setAdvancedInfo(rawData.advancedInfo || '');

      // 멀티미디어
      setThumbnailUrl(rawData.thumbnailUrl || '');
      setVideoUrl(rawData.videoUrl || '');
      setAudioGuideUrl(rawData.audioGuideUrl || '');
      setGalleryUrls(rawData.galleryUrls || []);

      // 시설 정보
      setFacilities(rawData.facilities || []);
      setOperatingHours(rawData.operatingHours || {
        monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        sunday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      });
      setRegularClosedDays(rawData.regularClosedDays || '');

      // 메뉴
      if (rawData.menus && rawData.menus.length > 0) {
        setMenuCategories(rawData.menus.map((menu: any, index: number) => ({
          id: Date.now().toString() + index,
          category: menu.category || '',
          items: menu.items.map((item: any, itemIndex: number) => ({
            id: Date.now().toString() + index + itemIndex,
            name: item.name || '',
            price: item.price || 0,
            description: item.description || '',
            allergyInfo: item.allergyInfo || ''
          }))
        })));
      }

      // 레스토랑 특화
      setMichelinStars(rawData.michelinStars || 0);
      setDressCode(rawData.dressCode || '');
      setHasCourseMenu(rawData.hasCourseMenu || false);

      // 예약 시스템
      if (rawData.reservation) {
        setReservationEnabled(rawData.reservation.enabled || false);
        setReservationStartTime(rawData.reservation.startTime || '10:00');
        setReservationEndTime(rawData.reservation.endTime || '22:00');
        setReservationInterval(rawData.reservation.interval || 30);
        setMaxDaysAdvance(rawData.reservation.maxDaysAdvance || 30);
        setMaxGuestsPerSlot(rawData.reservation.maxGuestsPerSlot || 4);
        setCancellationPolicy(rawData.reservation.cancellationPolicy || '');
      }

      toast.success('데이터를 불러왔습니다');
    } catch (error) {
      console.error('레스토랑 로드 실패:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

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

  const getCurrencySymbol = () => {
    const country = countries.find(c => c.id === selectedCountryId);
    return country?.currency || '€';
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
        name_kr: nameKr,
        nameKr,
        name_en: nameEn,
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
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'restaurants', id), restaurantData);
      toast.success(`${restaurantType === 'restaurant' ? '레스토랑' : restaurantType === 'cafe' ? '카페' : '바'}가 성공적으로 수정되었습니다`);
      router.push(`/admin/content/restaurants/${id}`);
    } catch (error) {
      console.error('수정 실패:', error);
      toast.error('수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">레스토랑/카페/바 수정</h1>
            <p className="text-gray-600">미식 명소 정보를 수정합니다</p>
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
          value={priceLevel as 1 | 2 | 3}
          onChange={(val) => setPriceLevel(val as 1 | 2 | 3 | 4)}
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
            onMichelinStarsChange={(stars) => setMichelinStars(stars as 0 | 1 | 2 | 3)}
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
