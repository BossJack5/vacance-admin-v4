'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ShoppingBag } from 'lucide-react';
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

// 쇼핑 전용 섹션 컴포넌트들
import TaxRefundSection from '@/components/admin/content/shopping/TaxRefundSection';
import ProductCategorySection from '@/components/admin/content/shopping/ProductCategorySection';
import ShoppingFacilitySection from '@/components/admin/content/shopping/ShoppingFacilitySection';

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

export default function NewShoppingPage() {
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

  // 택스 리펀 정보
  const [hasTaxRefund, setHasTaxRefund] = useState(false);
  const [refundLocation, setRefundLocation] = useState('');
  const [minPurchase, setMinPurchase] = useState(0);
  const [refundRate, setRefundRate] = useState(0);

  // 상품 카테고리
  const [productCategories, setProductCategories] = useState<string[]>([]);

  // 쇼핑 시설
  const [hasLuggageStorage, setHasLuggageStorage] = useState(false);
  const [hasInternationalShipping, setHasInternationalShipping] = useState(false);

  // 가격대 (최대 3단계: $, $$, $$$)
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3>(2);

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '10:00', closeTime: '20:00' },
    tuesday: { isClosed: false, openTime: '10:00', closeTime: '20:00' },
    wednesday: { isClosed: false, openTime: '10:00', closeTime: '20:00' },
    thursday: { isClosed: false, openTime: '10:00', closeTime: '20:00' },
    friday: { isClosed: false, openTime: '10:00', closeTime: '21:00' },
    saturday: { isClosed: false, openTime: '10:00', closeTime: '21:00' },
    sunday: { isClosed: false, openTime: '11:00', closeTime: '20:00' },
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

  const toggleProductCategory = (category: string) => {
    setProductCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryCode || !selectedCityCode) {
      toast.error('필수 항목을 모두 입력해주세요 (매장명, 국가, 도시)');
      return;
    }

    if (productCategories.length === 0) {
      toast.error('최소 1개 이상의 상품 카테고리를 선택해주세요');
      return;
    }

    if (hasTaxRefund && (!refundLocation || minPurchase <= 0 || refundRate <= 0)) {
      toast.error('택스 리펀 정보를 모두 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      const shoppingData = {
        // 기본 정보
        nameKr,
        nameEn,
        summary,
        category: 'shopping',

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

        // 택스 리펀
        taxRefund: {
          available: hasTaxRefund,
          location: refundLocation,
          minPurchase,
          refundRate
        },

        // 상품 카테고리
        productCategories,

        // 쇼핑 시설
        shoppingFacilities: {
          luggageStorage: hasLuggageStorage,
          internationalShipping: hasInternationalShipping
        },

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
        type: '쇼핑',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'shopping'), shoppingData);
      toast.success('쇼핑 매장이 성공적으로 등록되었습니다');
      router.push('/admin/content/shopping');
    } catch (error) {
      console.error('등록 실패:', error);
      toast.error('등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">새 쇼핑 등록</h1>
              <p className="text-gray-600">패션, 명품, 뷰티 등 쇼핑 명소 정보를 등록하고 관리합니다</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
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

        {/* 쇼핑 전용: 택스 리펀 섹션 */}
        <TaxRefundSection
          hasTaxRefund={hasTaxRefund}
          refundLocation={refundLocation}
          minPurchase={minPurchase}
          refundRate={refundRate}
          onToggle={() => setHasTaxRefund(!hasTaxRefund)}
          onRefundLocationChange={setRefundLocation}
          onMinPurchaseChange={setMinPurchase}
          onRefundRateChange={setRefundRate}
        />

        {/* 쇼핑 전용: 상품 카테고리 */}
        <ProductCategorySection
          selectedCategories={productCategories}
          onCategoryToggle={toggleProductCategory}
        />

        {/* 쇼핑 전용: 쇼핑 시설 정보 */}
        <ShoppingFacilitySection
          hasLuggageStorage={hasLuggageStorage}
          hasInternationalShipping={hasInternationalShipping}
          onLuggageStorageToggle={() => setHasLuggageStorage(!hasLuggageStorage)}
          onInternationalShippingToggle={() => setHasInternationalShipping(!hasInternationalShipping)}
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

        {/* 가격대 선택 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">가격대 설정</h3>
          <p className="text-sm text-gray-600 mb-4">매장의 평균 가격대를 선택하세요 (최대 $$$)</p>
          
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
                  {level === 1 && '저렴'}
                  {level === 2 && '보통'}
                  {level === 3 && '고가'}
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
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
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
