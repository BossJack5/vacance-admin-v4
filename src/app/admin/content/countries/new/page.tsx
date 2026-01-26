'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { countryDetailService } from '@/services/countryDetailService';
import { locationService } from '@/services/locationService';
import { Country } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Globe, Search, ExternalLink, Info, Check, Flag, ImagePlus, Upload, X, Heart, Share2, Bookmark, FileDown, Eye, BookOpen, Mountain, Scale, TrendingUp, Users } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { sanitizeHtml } from '@/lib/validations';
import toast from 'react-hot-toast';

export default function NewCountryDetailPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    status: 'active',
    description: '',
    cityCount: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Country[]>([]);
  
  // 이미지 관련 state
  const [flagIconUrl, setFlagIconUrl] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // 이미지 URL 유효성 검증
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    const urlPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
    if (!urlPattern.test(url)) return false;
    const imageExtPattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
    return imageExtPattern.test(url);
  };
  
  // 통계 데이터 state
  const [statsData, setStatsData] = useState({
    favorites: 0,
    shares: 0,
    saves: 0,
    pdfDownloads: 0,
    views: 0,
  });

  // 통계 데이터 입력 핸들러
  const handleStatsChange = (field: keyof typeof statsData, value: string) => {
    const numValue = parseInt(value) || 0;
    setStatsData({ ...statsData, [field]: numValue >= 0 ? numValue : 0 });
  };

  // 국가 기본 정보 탭 및 컨텐츠 state
  type TabType = 'geography' | 'politics' | 'economy' | 'society';
  const [activeTab, setActiveTab] = useState<TabType>('geography');
  const [basicInfo, setBasicInfo] = useState({
    geography: '',
    politics: '',
    economy: '',
    society: '',
  });

  // 탭별 이미지 관리 (URL 기반)
  const [tabImages, setTabImages] = useState<{
    geography: string[];
    politics: string[];
    economy: string[];
    society: string[];
  }>({
    geography: [],
    politics: [],
    economy: [],
    society: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  // 자동 저장 관리
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const tabConfig = {
    geography: {
      icon: Mountain,
      title: '지리/기후',
      titleEn: 'Geography & Climate',
      placeholder: '위치, 면적, 지형, 기후 특성 등을 작성하세요...',
      activeStyle: 'bg-green-500 text-white border-green-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-green-300',
    },
    politics: {
      icon: Scale,
      title: '정치',
      titleEn: 'Politics',
      placeholder: '정치 체제, 주요 정치 기구, 현재 정부 형태 등을 작성하세요...',
      activeStyle: 'bg-white text-blue-500 border-blue-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-blue-300',
    },
    economy: {
      icon: TrendingUp,
      title: '경제',
      titleEn: 'Economy',
      placeholder: '주요 산업, GDP, 통화, 무역 특성 등을 작성하세요...',
      activeStyle: 'bg-white text-emerald-500 border-emerald-400',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-emerald-300',
    },
    society: {
      icon: Users,
      title: '사회',
      titleEn: 'Society',
      placeholder: '인구, 언어, 종교, 문화적 특성 등을 작성하세요...',
      activeStyle: 'bg-white text-purple-500 border-purple-400',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-purple-300',
    },
  };

  useEffect(() => {
    loadCountries();
  }, []);

  // 자동 저장 로직 (3초 디바운스)
  useEffect(() => {
    if (!selectedCountry) return;

    const timer = setTimeout(() => {
      // localStorage에 임시 저장
      const draftData = {
        selectedCountry,
        formData,
        basicInfo,
        tabImages,
        statsData,
        flagIconUrl,
        heroImageUrl,
        timestamp: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem('country-detail-draft', JSON.stringify(draftData));
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (error) {
        console.error('자동 저장 실패:', error);
      }
    }, 3000);

    setIsSaving(true);
    return () => clearTimeout(timer);
  }, [basicInfo, tabImages, statsData, formData, flagIconUrl, heroImageUrl]);

  // 컴포넌트 마운트 시 드래프트 불러오기
  useEffect(() => {
    const savedDraft = localStorage.getItem('country-detail-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const draftTime = new Date(draft.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - draftTime.getTime()) / 1000 / 60;

        // 24시간 이내 드래프트만 불러오기
        if (diffMinutes < 1440) {
          const shouldRestore = confirm(
            `저장되지 않은 데이터가 있습니다. \n(마지막 수정: ${draftTime.toLocaleString()})\n\n복원하시겠습니까?`
          );
          
          if (shouldRestore) {
            setSelectedCountry(draft.selectedCountry);
            setFormData(draft.formData);
            setBasicInfo(draft.basicInfo);
            setTabImages(draft.tabImages);
            setStatsData(draft.statsData);
            setFlagIconUrl(draft.flagIconUrl || '');
            setHeroImageUrl(draft.heroImageUrl || '');
            setLastSaved(draftTime);
            toast.success('드래프트가 복원되었습니다.');
          } else {
            localStorage.removeItem('country-detail-draft');
          }
        } else {
          localStorage.removeItem('country-detail-draft');
        }
      } catch (error) {
        console.error('드래프트 불러오기 실패:', error);
        localStorage.removeItem('country-detail-draft');
      }
    }
  }, []);

  const loadCountries = async () => {
    try {
      const data = await locationService.getCountries();
      setCountries(data);
    } catch (error) {
      toast.error('국가 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      const filtered = countries.filter(
        (c) =>
          (c.nameKr?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          (c.nameEn?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          (c.isoCode?.toLowerCase() || '').includes(keyword.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSearchKeyword(country.nameKr);
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedCountry) {
      toast.error('국가를 먼저 선택해주세요.');
      return;
    }

    try {
      // HTML 내용 Sanitize (보안)
      const sanitizedBasicInfo = {
        geography: sanitizeHtml(basicInfo.geography),
        politics: sanitizeHtml(basicInfo.politics),
        economy: sanitizeHtml(basicInfo.economy),
        society: sanitizeHtml(basicInfo.society),
      };

      await countryDetailService.createCountryDetail({
        nameKr: selectedCountry.nameKr,
        nameEn: selectedCountry.nameEn,
        code: selectedCountry.isoCode,
        continent: selectedCountry.continent || '',
        status: formData.status,
        description: formData.description,
        cityCount: formData.cityCount,
        // 통계 데이터
        favorites: statsData.favorites,
        shares: statsData.shares,
        saves: statsData.saves,
        pdfDownloads: statsData.pdfDownloads,
        views: statsData.views,
        // 이미지 (TODO: Firebase Storage 업로드 구현 필요)
        flagIconUrl,
        heroImageUrl,
        // 기본 정보 (Sanitized HTML)
        geographyContent: sanitizedBasicInfo.geography,
        politicsContent: sanitizedBasicInfo.politics,
        economyContent: sanitizedBasicInfo.economy,
        societyContent: sanitizedBasicInfo.society,
        // 탭별 이미지
        geographyImages: tabImages.geography,
        politicsImages: tabImages.politics,
        economyImages: tabImages.economy,
        societyImages: tabImages.society,
      } as any);
      
      toast.success('국가 상세 정보가 등록되었습니다.');
      localStorage.removeItem('country-detail-draft'); // 드래프트 삭제
      router.push('/admin/content/countries');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('등록에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-zinc-900">새 국가 상세 등록</h1>
        </div>

        {/* 정보 배너 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                Level 1: Root Data (데이터 상속의 시작점)
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                국가 상세 정보는 모든 콘텐츠의 최상위 데이터입니다. 
                여기서 등록된 정보는 하위 도시, 관광지, 가이드 등 모든 콘텐츠에서 참조됩니다.
                정확한 기본 정보 입력이 전체 시스템의 데이터 일관성을 보장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 1. 기본 식별 정보 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">1. 기본 식별 정보</h2>
              <p className="text-sm text-zinc-600">국가를 고유하게 식별하는 핵심 정보</p>
            </div>
          </div>

          {/* 검색바 영역 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="text-sm font-semibold text-zinc-700 mb-2 block">
              등록된 국가 검색 (Location Master)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="기존 등록된 국가를 검색하여 선택하세요... (엔터로 검색)"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    handleSelectCountry(searchResults[0]);
                  }
                }}
                className="pl-10 bg-white border-gray-200"
              />
              {/* 검색 결과 드롭다운 */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleSelectCountry(country)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-zinc-900">
                            {country.nameKr} ({country.nameEn})
                          </div>
                          <div className="text-sm text-zinc-600">
                            코드: {country.isoCode} | 대륙: {country.continent || '-'}
                          </div>
                        </div>
                        {selectedCountry?.id === country.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 안내 박스 */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  찾으시는 국가가 없나요?
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  먼저 Location Master에서 기본 국가 정보를 등록한 후, 
                  이 페이지에서 상세 정보를 추가할 수 있습니다.
                </p>
                <a 
                  href="/admin/locations" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-flex items-center gap-1"
                >
                  Location Master로 이동
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* 폼 레이아웃 - 선택된 국가 정보 표시 */}
          {selectedCountry ? (
            <div className="space-y-6">
              {/* 선택된 국가 정보 표시 (읽기 전용) */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">선택된 국가 정보</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 mb-1 block">
                      국가명(한글)
                    </label>
                    <div className="bg-white border border-green-200 rounded-lg px-4 py-3 text-zinc-900 font-medium">
                      {selectedCountry.nameKr}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 mb-1 block">
                      국가명(영문)
                    </label>
                    <div className="bg-white border border-green-200 rounded-lg px-4 py-3 text-zinc-900 font-medium">
                      {selectedCountry.nameEn}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 mb-1 block">
                      국가 코드(ISO)
                    </label>
                    <div className="bg-white border border-green-200 rounded-lg px-4 py-3 text-zinc-900 font-mono font-bold">
                      {selectedCountry.isoCode}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-600 mb-1 block">
                      대륙
                    </label>
                    <div className="bg-white border border-green-200 rounded-lg px-4 py-3 text-zinc-900 font-medium">
                      {selectedCountry.continent || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 정보 입력 */}
              <div className="border-t-2 border-zinc-200 pt-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">추가 정보 입력</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 상태 */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 mb-2 block">
                      상태
                    </label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 도시 수 */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 mb-2 block">
                      도시 수
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.cityCount}
                      onChange={(e) => setFormData({ ...formData, cityCount: parseInt(e.target.value) || 0 })}
                      className="bg-gray-50 border-gray-200 h-12"
                      min="0"
                    />
                  </div>
                </div>

                {/* 설명 */}
                <div className="mt-6">
                  <label className="text-sm font-semibold text-zinc-700 mb-2 block">
                    국가 설명
                  </label>
                  <textarea
                    placeholder="국가에 대한 간단한 설명을 입력하세요..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* 국가 기본 정보 섹션 */}
              <div className="border-t-2 border-zinc-200 pt-6 mt-6">
                {/* 섹션 헤더 */}
                <div className="bg-[#334155] rounded-t-xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-white" />
                    <div>
                      <h3 className="text-lg font-bold text-white">1-1. 국가 기본 정보</h3>
                      <p className="text-sm text-slate-300 mt-0.5">국가별 핵심 정보를 카테고리별로 관리합니다</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="text-xs font-semibold text-white">자동 상속됨</span>
                  </div>
                </div>

                {/* 4단 탭 메뉴 */}
                <div className="bg-white border-x-2 border-gray-200 px-6 py-4">
                  <div className="grid grid-cols-4 gap-3">
                    {(Object.keys(tabConfig) as TabType[]).map((tabKey) => {
                      const config = tabConfig[tabKey];
                      const Icon = config.icon;
                      const isActive = activeTab === tabKey;
                      return (
                        <button
                          key={tabKey}
                          onClick={() => setActiveTab(tabKey)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                            isActive ? config.activeStyle : config.inactiveStyle
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {config.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 에디터 영역 */}
                <div className="bg-white border-2 border-t-0 border-gray-200 rounded-b-xl px-6 py-6">
                  {(() => {
                    const config = tabConfig[activeTab];
                    const Icon = config.icon;
                    return (
                      <div>
                        {/* 탭 헤더 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-6 h-6 text-zinc-700" />
                            <h4 className="text-lg font-bold text-zinc-900">
                              {config.title} <span className="text-sm text-gray-500 font-normal">({config.titleEn})</span>
                            </h4>
                          </div>
                          {/* 자동 저장 상태 */}
                          <div className="flex items-center gap-2 text-sm">
                            {isSaving ? (
                              <span className="text-yellow-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
                                저장 중...
                              </span>
                            ) : lastSaved ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                {lastSaved.toLocaleTimeString()} 자동 저장됨
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Rich Text 에디터 */}
                        <RichTextEditor
                          key={activeTab}
                          value={basicInfo[activeTab] || ''}
                          onChange={(value) => setBasicInfo({ ...basicInfo, [activeTab]: value })}
                          placeholder={config.placeholder}
                          minHeight="300px"
                        />

                        {/* 관련 이미지 업로더 */}
                        <div className="mt-6">
                          <h5 className="text-sm font-bold text-zinc-800 mb-3">🖼️ 관련 이미지 (최대 3장)</h5>
                          
                          <ImageUploader
                            images={tabImages[activeTab]}
                            maxImages={3}
                            onImagesChange={(newImages) =>
                              setTabImages({ ...tabImages, [activeTab]: newImages })
                            }
                            aspectRatio="aspect-video"
                            placeholder="관련 이미지를 추가하세요"
                            showUrlInput={true}
                            id={`tab-image-input-${activeTab}`}
                          />

                          {/* 하단 안내 박스 */}
                          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-4">
                            <p className="text-sm text-blue-800">
                              <span className="font-semibold">💡 아코디언 방식:</span> 각 탭(지리/기후, 정치, 경제, 사회)을 이동하면 해당 세부 내용과 이미지가 표시됩니다. 
                              각 항목마다 이미지 3장과 대용량 텍스트 입력이 가능합니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 이미지 등록 섹션 */}
              <div className="border-t-2 border-zinc-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">이미지 등록</h3>
                
                <div className="space-y-8">
                  {/* 국기 아이콘 섹션 */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 mb-3 block">
                      국기 아이콘
                    </label>
                    <div className="flex items-start gap-4">
                      {/* 국기 미리보기 박스 */}
                      <div className="relative">
                        <div className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                          {flagIconUrl && isValidImageUrl(flagIconUrl) ? (
                            <div className="relative w-full h-full p-2">
                              <img
                                src={flagIconUrl}
                                alt="Flag preview"
                                className="w-full h-full object-contain"
                                onError={() => toast.error('이미지를 불러올 수 없습니다.')}
                              />
                              <button
                                type="button"
                                onClick={() => setFlagIconUrl('')}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Flag className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500 text-center px-2">URL 입력 필요</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* URL 입력 필드 */}
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-zinc-600 mb-2 block">
                          국가 이미지 URL
                        </label>
                        <Input
                          value={flagIconUrl}
                          onChange={(e) => setFlagIconUrl(e.target.value)}
                          onBlur={() => {
                            if (flagIconUrl && !isValidImageUrl(flagIconUrl)) {
                              toast.error('유효한 이미지 URL이 아닙니다.');
                            }
                          }}
                          placeholder="https://example.com/flag.png"
                          className="bg-white border-gray-200 h-12"
                        />
                        <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>이미지를 Firebase Storage에 업로드한 후 URL을 입력하세요. Base64 이미지는 지원하지 않습니다.</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 대표 배경 이미지 섹션 */}
                  <div>
                    <label className="text-sm font-semibold text-zinc-700 mb-3 block">
                      대표 배경 이미지 <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="relative w-full aspect-[21/9] border-2 border-dashed rounded-lg overflow-hidden bg-gray-50/50 border-gray-300">
                      {heroImageUrl && isValidImageUrl(heroImageUrl) ? (
                        <>
                          <img
                            src={heroImageUrl}
                            alt="Hero preview"
                            className="w-full h-full object-cover"
                            onError={() => toast.error('이미지를 불러올 수 없습니다.')}
                          />
                          <button
                            type="button"
                            onClick={() => setHeroImageUrl('')}
                            className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ImagePlus className="w-16 h-16 text-gray-400 mb-3" />
                          <p className="text-base font-semibold text-gray-700 mb-1">
                            국가 대표 이미지
                          </p>
                          <p className="text-sm text-gray-500 mb-1">
                            권장 비율: 21:9 (Ultra-wide)
                          </p>
                          <p className="text-xs text-gray-400">
                            하단에 URL을 입력하세요
                          </p>
                        </div>
                      )}
                    </div>

                    {/* URL 입력 필드 */}
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-zinc-600 mb-2 block">
                        배경 이미지 URL
                      </label>
                      <Input
                        value={heroImageUrl}
                        onChange={(e) => setHeroImageUrl(e.target.value)}
                        onBlur={() => {
                          if (heroImageUrl && !isValidImageUrl(heroImageUrl)) {
                            toast.error('유효한 이미지 URL이 아닙니다.');
                          }
                        }}
                        placeholder="https://example.com/hero-image.jpg"
                        className="bg-white border-gray-200 h-12"
                      />
                      <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>이미지를 Firebase Storage에 업로드한 후 URL을 입력하세요. Base64 이미지는 DB 용량을 폭주시킬 수 있습니다.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 데이터 관리 섹션 */}
              <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-bold text-purple-700 mb-2">📊 1-2. 통계 데이터 관리</h3>
                <p className="text-sm text-purple-600/80 mb-6">
                  관리자가 직접 통계 수치를 입력하거나 수정할 수 있습니다
                </p>

                {/* 통계 입력 그리드 */}
                <div className="grid grid-cols-5 gap-4">
                  {/* 천 횟수 */}
                  <div>
                    <div className="flex flex-col items-center mb-3">
                      <Heart className="w-8 h-8 text-purple-500 mb-2" />
                      <label className="text-xs font-semibold text-zinc-700">
                        천 횟수
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={statsData.favorites}
                      onChange={(e) => handleStatsChange('favorites', e.target.value)}
                      placeholder="0"
                      className="text-center bg-white border-gray-200 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  {/* 공유 수 */}
                  <div>
                    <div className="flex flex-col items-center mb-3">
                      <Share2 className="w-8 h-8 text-purple-500 mb-2" />
                      <label className="text-xs font-semibold text-zinc-700">
                        공유 수
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={statsData.shares}
                      onChange={(e) => handleStatsChange('shares', e.target.value)}
                      placeholder="0"
                      className="text-center bg-white border-gray-200 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  {/* 저장 횟수 */}
                  <div>
                    <div className="flex flex-col items-center mb-3">
                      <Bookmark className="w-8 h-8 text-purple-500 mb-2" />
                      <label className="text-xs font-semibold text-zinc-700">
                        저장 횟수
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={statsData.saves}
                      onChange={(e) => handleStatsChange('saves', e.target.value)}
                      placeholder="0"
                      className="text-center bg-white border-gray-200 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  {/* PDF 다운로드 수 */}
                  <div>
                    <div className="flex flex-col items-center mb-3">
                      <FileDown className="w-8 h-8 text-purple-500 mb-2" />
                      <label className="text-xs font-semibold text-zinc-700">
                        PDF 다운로드 수
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={statsData.pdfDownloads}
                      onChange={(e) => handleStatsChange('pdfDownloads', e.target.value)}
                      placeholder="0"
                      className="text-center bg-white border-gray-200 focus:ring-purple-500"
                      min="0"
                    />
                  </div>

                  {/* 조회 수 */}
                  <div>
                    <div className="flex flex-col items-center mb-3">
                      <Eye className="w-8 h-8 text-purple-500 mb-2" />
                      <label className="text-xs font-semibold text-zinc-700">
                        조회 수
                      </label>
                    </div>
                    <Input
                      type="number"
                      value={statsData.views}
                      onChange={(e) => handleStatsChange('views', e.target.value)}
                      placeholder="0"
                      className="text-center bg-white border-gray-200 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                </div>

                {/* 하단 안내 박스 */}
                <div className="bg-purple-100/50 border border-purple-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">💡 통계 데이터 관리:</span> 이 필드는 실제 사용자 행동 데이터와 별개로 관리자가 직접 수정할 수 있습니다. 
                    초기 인기도 표시 또는 마케팅 목적으로 활용하세요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p className="font-medium">위에서 국가를 검색하고 선택해주세요</p>
              <p className="text-sm mt-1">Location Master에 등록된 국가만 선택 가능합니다</p>
            </div>
          )}
        </Card>

        {/* 하단 액션 버튼 */}
        <div className="flex justify-end gap-3 sticky bottom-8 bg-white p-4 rounded-lg border border-gray-200 shadow-lg">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-6"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            등록하기
          </Button>
        </div>
      </div>
    </div>
  );
}
