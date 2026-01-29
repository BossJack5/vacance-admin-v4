'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Flag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import toast from 'react-hot-toast';

// 공통 섹션 컴포넌트들 (100% 재사용)
import LocationSection from '@/components/admin/content/location/LocationSection';
import BasicInfoSection from '@/components/admin/content/location/BasicInfoSection';
import MultimediaSection from '@/components/admin/content/location/MultimediaSection';
import FacilitySection from '@/components/admin/content/location/FacilitySection';
import PriceSection from '@/components/admin/content/location/PriceSection';

// 골프 전용 섹션들
import CourseInfoSection from '@/components/admin/content/golf/CourseInfoSection';
import PriceTableSection from '@/components/admin/content/golf/PriceTableSection';
import GolfFacilitiesSection from '@/components/admin/content/golf/GolfFacilitiesSection';
import BookingPolicySection from '@/components/admin/content/golf/BookingPolicySection';

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

interface PriceItem {
  id: string;
  item: string;
  price: number;
  currency: 'EUR' | 'USD' | 'KRW';
}

export default function NewGolfCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

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

  // 코스 정보
  const [holes, setHoles] = useState(18);
  const [par, setPar] = useState(72);
  const [courseType, setCourseType] = useState<'public' | 'private' | 'semi-private'>('public');
  const [teeGrass, setTeeGrass] = useState('');
  const [fairwayGrass, setFairwayGrass] = useState('');
  const [greenGrass, setGreenGrass] = useState('');

  // 비용 체계
  const [priceTable, setPriceTable] = useState<PriceItem[]>([
    {
      id: '1',
      item: 'green_fee',
      price: 0,
      currency: 'EUR'
    }
  ]);

  // 부대시설
  const [golfFacilities, setGolfFacilities] = useState<string[]>([]);

  // 예약 정책
  const [bookingOpenDays, setBookingOpenDays] = useState(7);
  const [depositRequired, setDepositRequired] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState('');

  // 가격 정보 (공통 컴포넌트)
  const [priceItems, setPriceItems] = useState<Array<{id: string; category: string; price: number; currency: string; note: string}>>([
    { id: '1', category: '', price: 0, currency: 'EUR', note: '' }
  ]);
  const [bookingUrl, setBookingUrl] = useState('');

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보 (일반)
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '06:00', closeTime: '18:00' },
    tuesday: { isClosed: false, openTime: '06:00', closeTime: '18:00' },
    wednesday: { isClosed: false, openTime: '06:00', closeTime: '18:00' },
    thursday: { isClosed: false, openTime: '06:00', closeTime: '18:00' },
    friday: { isClosed: false, openTime: '06:00', closeTime: '18:00' },
    saturday: { isClosed: false, openTime: '06:00', closeTime: '19:00' },
    sunday: { isClosed: false, openTime: '06:00', closeTime: '19:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

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

  // 비용 체계 관리 (PriceTable)
  const addPriceTable = () => {
    setPriceTable([
      ...priceTable,
      {
        id: Date.now().toString(),
        item: '',
        price: 0,
        currency: 'EUR'
      }
    ]);
  };

  const removePriceTable = (id: string) => {
    setPriceTable(priceTable.filter(price => price.id !== id));
  };

  const updatePriceTable = (id: string, field: keyof PriceItem, value: any) => {
    setPriceTable(priceTable.map(price =>
      price.id === id ? { ...price, [field]: value } : price
    ));
  };

  // 골프 시설 토글
  const toggleGolfFacility = (facility: string) => {
    setGolfFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  // 가격 정보 관리
  const addPrice = () => {
    setPriceItems([...priceItems, { id: Date.now().toString(), category: '', price: 0, currency: 'EUR', note: '' }]);
  };

  const removePrice = (id: string) => {
    setPriceItems(priceItems.filter(p => p.id !== id));
  };

  const updatePrice = (id: string, field: string, value: any) => {
    setPriceItems(priceItems.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryId || !selectedCityId) {
      toast.error('필수 항목을 모두 입력해주세요 (골프장명, 국가, 도시)');
      return;
    }

    if (!refundPolicy) {
      toast.error('취소 규정을 입력해주세요');
      return;
    }

    const validPrices = priceTable.filter(p => p.item && p.price > 0);
    if (validPrices.length === 0) {
      toast.error('최소 1개 이상의 비용 항목을 등록해주세요');
      return;
    }

    setSaving(true);
    try {
      const golfCourseData = {
        // 기본 정보
        nameKr,
        nameEn,
        summary,
        category: 'golf',

        // 위치 정보
        countryId: selectedCountryId,
        cityId: selectedCityId,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        address,
        googleMapId,
        phoneNumber,
        websiteUrl,

        // 상세 정보
        coreInfo,
        detailInfo,
        advancedInfo,

        // 코스 정보 (Object 구조)
        courseSpec: {
          holes,
          par,
          type: courseType,
          grass: {
            tee: teeGrass || undefined,
            fairway: fairwayGrass || undefined,
            green: greenGrass || undefined
          }
        },

        // 비용 체계 (Array[Object] 구조)
        priceTable: validPrices,

        // 가격 정보 (공통)
        priceItems: priceItems.filter(p => p.category && p.price > 0),
        bookingUrl,

        // 골프 전용 부대시설
        golfFacilities,

        // 예약 정책 (Object 구조)
        bookingPolicy: {
          openDays: bookingOpenDays,
          depositRequired,
          refundText: refundPolicy
        },

        // 멀티미디어
        thumbnailUrl,
        videoUrl,
        audioGuideUrl,
        galleryUrls: galleryUrls.filter(url => url.trim() !== ''),

        // 일반 시설 정보
        facilities,
        operatingHours,
        regularClosedDays,

        // 메타 정보
        status: 'active',
        type: '골프장',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'golf-courses'), golfCourseData);
      toast.success('골프장이 성공적으로 등록되었습니다');
      router.push('/admin/content/golf-courses');
    } catch (error) {
      console.error('등록 실패:', error);
      toast.error('등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Flag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">새 골프장 등록</h1>
              <p className="text-gray-600">골프 코스 정보와 비용, 예약 정책을 등록하고 관리합니다</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
        {/* 공통 섹션: 위치 정보 (100% 재사용) */}
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

        {/* 골프 전용: 코스 정보 */}
        <CourseInfoSection
          holes={holes}
          par={par}
          courseType={courseType}
          teeGrass={teeGrass}
          fairwayGrass={fairwayGrass}
          greenGrass={greenGrass}
          onHolesChange={setHoles}
          onParChange={setPar}
          onCourseTypeChange={setCourseType}
          onTeeGrassChange={setTeeGrass}
          onFairwayGrassChange={setFairwayGrass}
          onGreenGrassChange={setGreenGrass}
        />

        {/* 골프 전용: 비용 체계 */}
        <PriceTableSection
          priceTable={priceTable}
          onPriceAdd={addPriceTable}
          onPriceRemove={removePriceTable}
          onPriceUpdate={updatePriceTable}
        />

        {/* 골프 전용: 부대시설 */}
        <GolfFacilitiesSection
          facilities={golfFacilities}
          onFacilityToggle={toggleGolfFacility}
        />

        {/* 골프 전용: 예약 정책 */}
        <BookingPolicySection
          openDays={bookingOpenDays}
          depositRequired={depositRequired}
          refundPolicy={refundPolicy}
          onOpenDaysChange={setBookingOpenDays}
          onDepositToggle={() => setDepositRequired(!depositRequired)}
          onRefundPolicyChange={setRefundPolicy}
        />

        {/* 공통 섹션: 가격 정보 (100% 재사용) */}
        <PriceSection
          priceItems={priceItems}
          bookingUrl={bookingUrl}
          onPriceAdd={addPrice}
          onPriceRemove={removePrice}
          onPriceUpdate={updatePrice}
          onBookingUrlChange={setBookingUrl}
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
