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
import CurationSection from '@/components/admin/content/location/CurationSection';
import BasicInfoSection from '@/components/admin/content/location/BasicInfoSection';
import MultimediaSection from '@/components/admin/content/location/MultimediaSection';
import FacilitySection from '@/components/admin/content/location/FacilitySection';
import PriceSection from '@/components/admin/content/location/PriceSection';

interface City {
  id: string;
  cityCode: string;
  cityName: string;
  countryCode: string;
}

interface PriceItem {
  id: string;
  category: string;
  price: number;
  currency: string;
  note: string;
}

interface OperatingHours {
  [key: string]: {
    isClosed: boolean;
    openTime: string;
    closeTime: string;
  };
}

export default function NewLandmarkPage() {
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

  // 큐레이션 정보 (명소 전용)
  const [category, setCategory] = useState<'major' | 'support'>('major');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(100);
  const [recommendedTimes, setRecommendedTimes] = useState<string[]>([]);

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
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    thursday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    friday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    saturday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
    sunday: { isClosed: false, openTime: '09:00', closeTime: '18:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

  // 가격 정보
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: '1', category: '성인', price: 0, currency: 'EUR', note: '' }
  ]);
  const [bookingUrl, setBookingUrl] = useState('');

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

  const handleCategoryChange = (value: 'major' | 'support') => {
    setCategory(value);
  };

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleAllThemesToggle = () => {
    const allThemes = [
      '역사/문화 유적', '현대건축', '자연경관', '예술/미술', '종교시설', '전망대/조망',
      '공원/정원', '테마파크', '쇼핑명소', '음식/미식', '사진명소', '야경명소',
      '가족여행', '커플추천', '혼행추천', '우천대체'
    ];
    setSelectedThemes(prev => prev.length === allThemes.length ? [] : allThemes);
  };

  const handleTimeToggle = (time: string) => {
    setRecommendedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
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

  const addPriceItem = () => {
    setPriceItems([
      ...priceItems,
      { id: Date.now().toString(), category: '', price: 0, currency: 'EUR', note: '' }
    ]);
  };

  const updatePriceItem = (id: string, field: keyof PriceItem, value: any) => {
    setPriceItems(priceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removePriceItem = (id: string) => {
    if (priceItems.length > 1) {
      setPriceItems(priceItems.filter(item => item.id !== id));
    }
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryCode || !selectedCityCode) {
      toast.error('필수 항목을 모두 입력해주세요 (명소 이름, 국가, 도시)');
      return;
    }

    setSaving(true);
    try {
      const landmarkData = {
        // 기본 정보
        nameKr,
        nameEn,
        summary,
        
        // 위치 정보
        countryCode: selectedCountryCode,
        cityCode: selectedCityCode,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        address,
        googleMapId,
        phoneNumber,
        websiteUrl,

        // 큐레이션
        category,
        themes: selectedThemes,
        priority,
        recommendedTimes,

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

        // 티켓 정보
        priceItems: priceItems.filter(item => item.category.trim() !== ''),
        bookingUrl,

        // 메타 정보
        status: 'active',
        type: '관광명소',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'landmarks'), landmarkData);
      toast.success('명소가 성공적으로 등록되었습니다');
      router.push('/admin/content/landmarks');
    } catch (error) {
      console.error('명소 등록 실패:', error);
      toast.error('명소 등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 명소 등록</h1>
            <p className="text-gray-600">주요 관광 명소를 등록하고 관리합니다</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
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
        {/* 공통 섹션: 위치 정보 */}
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

        {/* 명소 전용: 큐레이션 섹션 */}
        <CurationSection
          category={category}
          selectedThemes={selectedThemes}
          priority={priority}
          recommendedTimes={recommendedTimes}
          onCategoryChange={handleCategoryChange}
          onThemeToggle={handleThemeToggle}
          onAllThemesToggle={handleAllThemesToggle}
          onPriorityChange={setPriority}
          onTimeToggle={handleTimeToggle}
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
          type="landmark"
        />

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

        {/* 공통 섹션: 가격 정보 */}
        <PriceSection
          priceItems={priceItems}
          bookingUrl={bookingUrl}
          onPriceAdd={addPriceItem}
          onPriceUpdate={updatePriceItem}
          onPriceRemove={removePriceItem}
          onBookingUrlChange={setBookingUrl}
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
            className="bg-blue-600 hover:bg-blue-700"
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
