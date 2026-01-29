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
import PriceSection from '@/components/admin/content/location/PriceSection';

// 박물관 전용 섹션 컴포넌트들
import FloorMapSection from '@/components/admin/content/museum/FloorMapSection';
import CrowdednessSection from '@/components/admin/content/museum/CrowdednessSection';
import ArtworkConnectionSection from '@/components/admin/content/museum/ArtworkConnectionSection';
import MuseumDetailGuideSection from '@/components/admin/content/museum/MuseumDetailGuideSection';
import ManualStatsSection from '@/components/admin/content/museum/ManualStatsSection';

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

interface FloorMap {
  id: string;
  floorName: string;
  imageUrl: string;
}

interface CrowdednessData {
  [key: string]: number;
}

export default function NewMuseumPage() {
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

  // 멀티미디어
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioGuideUrl, setAudioGuideUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['']);

  // 시설 정보
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    tuesday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    wednesday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    thursday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    friday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    saturday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
    sunday: { isClosed: false, openTime: '10:00', closeTime: '18:00' },
  });
  const [regularClosedDays, setRegularClosedDays] = useState('');

  // 가격 정보
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: '1', category: '성인', price: 0, currency: 'EUR', note: '' }
  ]);
  const [bookingUrl, setBookingUrl] = useState('');

  // 박물관 전용 필드
  const [floorMaps, setFloorMaps] = useState<FloorMap[]>([
    { id: '1', floorName: '1층', imageUrl: '' }
  ]);
  const [crowdedness, setCrowdedness] = useState<CrowdednessData>({
    '09:00': 20, '10:00': 40, '11:00': 60, '12:00': 50,
    '13:00': 40, '14:00': 60, '15:00': 80, '16:00': 70,
    '17:00': 50, '18:00': 30, '19:00': 20, '20:00': 10
  });
  const [connectedArtworkIds, setConnectedArtworkIds] = useState<string[]>([]);

  // 박물관 상세 가이드
  const [overview, setOverview] = useState('');
  const [visitGuide, setVisitGuide] = useState('');
  const [visitPlan, setVisitPlan] = useState('');

  // 수동 통계 데이터
  const [manualStats, setManualStats] = useState({
    likes: 0,
    shares: 0,
    saves: 0,
    pdfDownloads: 0,
    recentViews: 0
  });

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

  // 박물관 전용 핸들러
  const addFloorMap = () => {
    setFloorMaps([
      ...floorMaps,
      { id: Date.now().toString(), floorName: '', imageUrl: '' }
    ]);
  };

  const updateFloorMap = (id: string, field: keyof FloorMap, value: string) => {
    setFloorMaps(floorMaps.map(floor =>
      floor.id === id ? { ...floor, [field]: value } : floor
    ));
  };

  const removeFloorMap = (id: string) => {
    if (floorMaps.length > 1) {
      setFloorMaps(floorMaps.filter(floor => floor.id !== id));
    }
  };

  const updateCrowdedness = (hour: string, value: number) => {
    setCrowdedness(prev => ({
      ...prev,
      [hour]: value
    }));
  };

  const addArtwork = (artworkId: string) => {
    if (!connectedArtworkIds.includes(artworkId)) {
      setConnectedArtworkIds([...connectedArtworkIds, artworkId]);
    }
  };

  const removeArtwork = (artworkId: string) => {
    setConnectedArtworkIds(connectedArtworkIds.filter(id => id !== artworkId));
  };

  const handleMuseumGuideChange = (field: string, value: string) => {
    switch (field) {
      case 'overview': setOverview(value); break;
      case 'visitGuide': setVisitGuide(value); break;
      case 'visitPlan': setVisitPlan(value); break;
    }
  };

  const handleStatsChange = (field: string, value: number) => {
    setManualStats(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!nameKr || !selectedCountryCode || !selectedCityCode) {
      toast.error('필수 항목을 모두 입력해주세요 (박물관 이름, 국가, 도시)');
      return;
    }

    setSaving(true);
    try {
      const museumData = {
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

        // 박물관 전용 필드
        floorMaps: floorMaps.filter(floor => floor.floorName.trim() !== ''),
        crowdedness,
        artworkIds: connectedArtworkIds,

        // 박물관 상세 가이드
        overview,
        visitGuide,
        visitPlan,

        // 수동 통계 데이터
        manualStats,

        // 메타 정보
        status: 'active',
        type: '박물관',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'museums'), museumData);
      toast.success('박물관이 성공적으로 등록되었습니다');
      router.push('/admin/content/museums');
    } catch (error) {
      console.error('박물관 등록 실패:', error);
      toast.error('박물관 등록에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 박물관 등록</h1>
            <p className="text-gray-600">박물관 정보를 입력하고 소장 작품을 연결하세요</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
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
          type="museum"
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

        {/* 박물관 전용: 층별 안내도 */}
        <FloorMapSection
          floorMaps={floorMaps}
          onFloorAdd={addFloorMap}
          onFloorUpdate={updateFloorMap}
          onFloorRemove={removeFloorMap}
        />

        {/* 박물관 전용: 혼잡도 관리 */}
        <CrowdednessSection
          crowdedness={crowdedness}
          onCrowdednessUpdate={updateCrowdedness}
        />

        {/* 박물관 전용: 작품 연결 */}
        <ArtworkConnectionSection
          connectedArtworkIds={connectedArtworkIds}
          onArtworkAdd={addArtwork}
          onArtworkRemove={removeArtwork}
        />

        {/* 박물관 전용: 상세 가이드 */}
        <MuseumDetailGuideSection
          overview={overview}
          visitGuide={visitGuide}
          visitPlan={visitPlan}
          onFieldChange={handleMuseumGuideChange}
        />

        {/* 박물관 전용: 수동 통계 */}
        <ManualStatsSection
          stats={manualStats}
          onStatsChange={handleStatsChange}
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
            className="bg-purple-600 hover:bg-purple-700"
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
