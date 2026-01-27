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
import { ArrowLeft, Globe, Search, ExternalLink, Info, Check, Flag, ImagePlus, Upload, X, Heart, Share2, Bookmark, FileDown, Eye, BookOpen, Mountain, Scale, TrendingUp, Users, Zap, Phone, Plane, Wallet, Clock, MessageCircle, Power, Plug, DollarSign, Camera, Image, HelpCircle, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import CountryStorytellingSelector from '@/components/admin/content/CountryStorytellingSelector';
import CultureSpecialSection from '@/components/admin/content/CultureSpecialSection';
import LibrarySearchModal from '@/components/admin/content/LibrarySearchModal';
import StatsManager from '@/components/common/StatsManager';
import TabbedInfoEditor, { TabConfig } from '@/components/common/TabbedInfoEditor';
import { contentLibraryAPI } from '@/services/contentLibraryService';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable FAQ Item Component
interface SortableFaqItemProps {
  faq: {
    id: string;
    question: string;
    answer: string;
  };
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: 'question' | 'answer', value: string) => void;
  onRemove: () => void;
}

function SortableFaqItem({
  faq,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: SortableFaqItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg bg-white hover:border-indigo-300 transition-all"
    >
      {/* 질문 헤더 */}
      <div className="flex items-start gap-3 p-4">
        {/* 드래그 핸들 */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-bold text-sm rounded">
            Q{index + 1}
          </span>
        </div>

        {/* 질문 입력 */}
        <div className="flex-1">
          <Input
            placeholder="질문을 입력하세요 (예: 비자가 필요한가요?)"
            value={faq.question}
            onChange={(e) => onUpdate('question', e.target.value)}
            className="font-semibold text-gray-900 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        {/* 아코디언 토글 & 삭제 버튼 */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 답변 영역 (아코디언) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="pl-11 pt-3">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              답변
            </label>
            <textarea
              placeholder="답변을 입력하세요..."
              value={faq.answer}
              onChange={(e) => onUpdate('answer', e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
  const handleStatsChange = (field: string, value: string) => {
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

  // 국가 스토리텔링 라이브러리 참조
  const [libraryObjects, setLibraryObjects] = useState<any[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);

  // 국가 문화 스페셜 데이터
  type CategoryKey = 'cuisine' | 'wine' | 'history' | 'art' | 'museum' | 'architecture' | 'literature' | 'music' | 'cinema' | 'unesco';
  const [cultureData, setCultureData] = useState<Record<CategoryKey, { description: string; images: string[]; isEnabled?: boolean }>>({} as any);

  // 실용 정보 섹션 state
  const [practicalInfo, setPracticalInfo] = useState({
    visaInfo: '',
    timezone: '',
    mainLanguage: '',
    basicPhrases: '',
    voltage: '',
    plugType: '',
    currency: '',
  });

  // 라이브러리 참조 state
  const [practicalLibraryRefs, setPracticalLibraryRefs] = useState({
    transportId: null as string | null,
    financeId: null as string | null,
    emergencyId: null as string | null,
  });

  // 미디어 아카이브 state
  const [mediaArchive, setMediaArchive] = useState<string[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 라이브러리 검색 모달 state (useState로 분리)
  const [modalsOpen, setModalsOpen] = useState({
    transport: false,
    finance: false,
    emergency: false,
  });

  // FAQ 섹션 state
  interface FAQ {
    id: string;
    question: string;
    answer: string;
    templateId?: string;
  }
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaqIds, setExpandedFaqIds] = useState<Set<string>>(new Set());

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 미디어 아카이브 핸들러
  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) {
      toast.error('URL을 입력해주세요.');
      return;
    }
    if (!isValidImageUrl(mediaUrlInput)) {
      toast.error('유효한 이미지 URL을 입력해주세요.');
      return;
    }
    if (mediaArchive.length >= 10) {
      toast.error('최대 10장까지만 추가할 수 있습니다.');
      return;
    }
    setMediaArchive([...mediaArchive, mediaUrlInput]);
    setMediaUrlInput('');
    toast.success('이미지가 추가되었습니다.');
  };

  const handleRemoveMedia = (index: number) => {
    setMediaArchive(mediaArchive.filter((_, i) => i !== index));
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (mediaArchive.length + imageFiles.length > 10) {
      toast.error(`최대 10장까지만 추가할 수 있습니다. (현재: ${mediaArchive.length}장)`);
      return;
    }

    // 파일을 Base64로 변환하여 미리보기 (실제로는 Firebase Storage 업로드 필요)
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMediaArchive(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${imageFiles.length}장의 이미지가 추가되었습니다.`);
  };

  // FAQ 핸들러
  const handleAddFaq = () => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFaq]);
    // 새로 추가된 FAQ를 자동으로 확장
    setExpandedFaqIds(prev => {
      const newSet = new Set(prev);
      newSet.add(newFaq.id);
      return newSet;
    });
    toast.success('새 질문이 추가되었습니다.');
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
    setExpandedFaqIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('질문이 삭제되었습니다.');
  };

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
  };

  const toggleFaqExpand = (id: string) => {
    setExpandedFaqIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleFaqReorder = (activeId: string, overId: string) => {
    const activeIndex = faqs.findIndex(faq => faq.id === activeId);
    const overIndex = faqs.findIndex(faq => faq.id === overId);

    if (activeIndex !== overIndex) {
      const newFaqs = [...faqs];
      const [movedItem] = newFaqs.splice(activeIndex, 1);
      newFaqs.splice(overIndex, 0, movedItem);
      setFaqs(newFaqs);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFaqs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const countryTabs: TabConfig[] = [
    {
      key: 'geography',
      icon: Mountain,
      title: '지리/기후',
      titleEn: 'Geography & Climate',
      placeholder: '국가의 지형적 특징과 연간 기후 정보를 입력하세요.\n예: 위치, 면적, 주요 지형(산맥, 평야, 해안선 등), 기후대, 연평균 기온, 강수량 등',
      activeStyle: 'bg-green-500 text-white border-green-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-green-300',
    },
    {
      key: 'politics',
      icon: Scale,
      title: '정치',
      titleEn: 'Politics',
      placeholder: '정부 형태 및 주요 정치 체제를 입력하세요.\n예: 정치 체제(공화제, 군주제 등), 정부 구조, 주요 정당, 선거 제도 등',
      activeStyle: 'bg-white text-blue-500 border-blue-500',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-blue-300',
    },
    {
      key: 'economy',
      icon: TrendingUp,
      title: '경제',
      titleEn: 'Economy',
      placeholder: '경제 현황 및 주요 산업을 입력하세요.\n예: GDP, 1인당 소득, 주요 산업(제조업, 서비스업, 농업 등), 수출입 품목, 경제 성장률 등',
      activeStyle: 'bg-white text-emerald-500 border-emerald-400',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-emerald-300',
    },
    {
      key: 'society',
      icon: Users,
      title: '사회',
      titleEn: 'Society',
      placeholder: '사회 구성 및 문화적 특성을 입력하세요.\n예: 총 인구, 인구 밀도, 주요 언어, 종교 분포, 교육 수준, 사회 복지 제도 등',
      activeStyle: 'bg-white text-purple-500 border-purple-400',
      inactiveStyle: 'border-gray-300 text-gray-600 hover:border-purple-300',
    },
  ];

  useEffect(() => {
    loadCountries();
    loadLibraryObjects();
  }, []);

  const loadLibraryObjects = async () => {
    try {
      // 모든 콘텐츠 라이브러리 객체 가져오기 (실용정보 포함)
      const objects = await contentLibraryAPI.fetchContentLibraryObjects();
      console.log('Loaded library objects:', objects);
      console.log('Total objects:', objects?.length);
      console.log('Country stories:', objects?.filter((obj: any) => obj.type === 'country-story').length);
      console.log('Transport:', objects?.filter((obj: any) => obj.type === 'practical-transport').length);
      console.log('Finance:', objects?.filter((obj: any) => obj.type === 'practical-finance').length);
      console.log('Emergency:', objects?.filter((obj: any) => obj.type === 'practical-emergency').length);
      setLibraryObjects(objects || []);
    } catch (error) {
      console.error('Failed to load library objects:', error);
      setLibraryObjects([]);
    }
  };

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
        practicalInfo,
        practicalLibraryRefs,
        mediaArchive,
        faqs,
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
  }, [basicInfo, tabImages, statsData, formData, flagIconUrl, heroImageUrl, practicalInfo, practicalLibraryRefs, mediaArchive, faqs]);

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
            setPracticalInfo(draft.practicalInfo || {
              visaInfo: '',
              timezone: '',
              mainLanguage: '',
              basicPhrases: '',
              voltage: '',
              plugType: '',
              currency: '',
            });
            setPracticalLibraryRefs(draft.practicalLibraryRefs || {
              transportId: null,
              financeId: null,
              emergencyId: null,
            });
            setMediaArchive(draft.mediaArchive || []);
            setFaqs(draft.faqs || []);
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
        // 기본 정보 (Plain Text)
        geographyContent: basicInfo.geography || '',
        politicsContent: basicInfo.politics || '',
        economyContent: basicInfo.economy || '',
        societyContent: basicInfo.society || '',
        // 탭별 이미지
        geographyImages: tabImages.geography,
        politicsImages: tabImages.politics,
        economyImages: tabImages.economy,
        societyImages: tabImages.society,
        // 국가 스토리텔링 라이브러리 참조
        storytellingLibraryId: selectedLibraryId,
        // 국가 문화 스페셜
        cultureSpecial: cultureData,
        // 실용 정보
        practicalInfo: practicalInfo,
        // 실용 정보 라이브러리 참조
        practicalLibraryRefs: practicalLibraryRefs,
        // 미디어 아카이브
        mediaArchive: mediaArchive,
        // FAQ
        faqs: faqs,
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
              <TabbedInfoEditor
                sectionNumber="1-1"
                sectionTitle="국가 기본 정보"
                sectionDescription="국가별 핵심 정보를 카테고리별로 관리합니다"
                tabs={countryTabs}
                basicInfo={basicInfo}
                onBasicInfoChange={setBasicInfo}
                tabImages={tabImages}
                onTabImagesChange={setTabImages}
                isSaving={isSaving}
                lastSaved={lastSaved}
                showInheritanceBadge={true}
                accordionGuideText="각 탭(지리/기후, 정치, 경제, 사회)을 이동하면 해당 세부 내용과 이미지가 표시됩니다. 각 항목마다 이미지 3장과 대용량 텍스트 입력이 가능합니다."
              />

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

                {/* 통계 입력 그리드 - StatsManager 컴포넌트 사용 */}
                <StatsManager
                  stats={statsData}
                  onChange={handleStatsChange}
                  fieldMapping={{
                    likes: 'favorites',
                    shares: 'shares',
                    saves: 'saves',
                    pdfDownloads: 'pdfDownloads',
                    views: 'views',
                  }}
                />

                {/* 하단 안내 박스 */}
                <div className="bg-purple-100/50 border border-purple-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">💡 통계 데이터 관리:</span> 이 필드는 실제 사용자 행동 데이터와 별개로 관리자가 직접 수정할 수 있습니다. 
                    초기 인기도 표시 또는 마케팅 목적으로 활용하세요.
                  </p>
                </div>
              </div>

              {/* 국가 스토리텔링 섹션 */}
              <div className="mt-6">
                <CountryStorytellingSelector
                  selectedLibraryId={selectedLibraryId}
                  onSelectLibrary={setSelectedLibraryId}
                  libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'country-story')}
                  selectedCountryName={selectedCountry?.nameKr}
                />
              </div>

              {/* 국가 문화 스페셜 섹션 */}
              <div className="mt-6">
                <CultureSpecialSection
                  cultureData={cultureData}
                  onCultureDataChange={setCultureData}
                  selectedCountryName={selectedCountry?.nameKr}
                />
              </div>

              {/* 실용 정보 섹션 */}
              <div className="mt-6 bg-[#F1FBF5] rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">1-5. 실용 정보</h3>
                      <p className="text-sm text-zinc-600">여행에 필요한 실용적인 정보를 입력하세요</p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-300">
                    <span className="text-xs font-semibold text-green-700">자동 상속됨</span>
                  </div>
                </div>

                {/* 일반 입력 항목 그리드 */}
                <div className="bg-white rounded-xl p-6 mb-6 border border-green-200">
                  <h4 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    기본 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 비자 정보 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <Flag className="w-4 h-4 text-blue-500" />
                        비자 정보
                      </label>
                      <Input
                        placeholder="예: 90일 무비자"
                        value={practicalInfo.visaInfo}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, visaInfo: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 시차 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-500" />
                        시차
                      </label>
                      <Input
                        placeholder="예: UTC+9 (한국과 동일)"
                        value={practicalInfo.timezone}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, timezone: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 주요 언어 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        주요 언어
                      </label>
                      <Input
                        placeholder="예: 프랑스어"
                        value={practicalInfo.mainLanguage}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, mainLanguage: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 기초 회화 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-teal-500" />
                        기초 회화
                      </label>
                      <Input
                        placeholder="예: 안녕하세요 - Bonjour"
                        value={practicalInfo.basicPhrases}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, basicPhrases: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 전압 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <Power className="w-4 h-4 text-yellow-500" />
                        전압
                      </label>
                      <Input
                        placeholder="예: 220V"
                        value={practicalInfo.voltage}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, voltage: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 플러그 타입 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <Plug className="w-4 h-4 text-orange-500" />
                        플러그 타입
                      </label>
                      <Input
                        placeholder="예: C, E 타입"
                        value={practicalInfo.plugType}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, plugType: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>

                    {/* 통화 */}
                    <div>
                      <label className="text-sm font-semibold text-zinc-700 mb-2 block flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        통화
                      </label>
                      <Input
                        placeholder="예: 유로(EUR)"
                        value={practicalInfo.currency}
                        onChange={(e) => setPracticalInfo({ ...practicalInfo, currency: e.target.value })}
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* 교통 라이브러리 참조 */}
                <div className="bg-white rounded-xl p-6 mb-6 border-2 border-dashed border-blue-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-blue-500" />
                      실용정보: 교통
                    </h4>
                    {practicalLibraryRefs.transportId && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        참조됨
                      </span>
                    )}
                  </div>
                  {practicalLibraryRefs.transportId ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-blue-900 mb-1">라이브러리 객체 참조 중</p>
                          <p className="text-xs text-blue-700">ID: {practicalLibraryRefs.transportId}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPracticalLibraryRefs({ ...practicalLibraryRefs, transportId: null })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          참조 해제
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setModalsOpen(prev => ({ ...prev, transport: true }))}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      라이브러리에서 검색
                    </Button>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">💡</span>
                    </div>
                    <p className="text-xs text-yellow-800">
                      라이브러리에서 교통 관련 콘텐츠 객체를 검색하여 참조할 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 금융 라이브러리 참조 */}
                <div className="bg-white rounded-xl p-6 mb-6 border-2 border-dashed border-emerald-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-500" />
                      실용정보: 금융
                    </h4>
                    {practicalLibraryRefs.financeId && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                        참조됨
                      </span>
                    )}
                  </div>
                  {practicalLibraryRefs.financeId ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900 mb-1">라이브러리 객체 참조 중</p>
                          <p className="text-xs text-emerald-700">ID: {practicalLibraryRefs.financeId}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPracticalLibraryRefs({ ...practicalLibraryRefs, financeId: null })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          참조 해제
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setModalsOpen(prev => ({ ...prev, finance: true }))}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      라이브러리에서 검색
                    </Button>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">💡</span>
                    </div>
                    <p className="text-xs text-yellow-800">
                      라이브러리에서 금융 관련 콘텐츠 객체를 검색하여 참조할 수 있습니다.
                    </p>
                  </div>
                </div>

                {/* 긴급연락처 라이브러리 참조 */}
                <div className="bg-white rounded-xl p-6 border-2 border-dashed border-red-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-red-500" />
                      실용정보: 긴급연락처
                    </h4>
                    {practicalLibraryRefs.emergencyId && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        참조됨
                      </span>
                    )}
                  </div>
                  {practicalLibraryRefs.emergencyId ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-red-900 mb-1">라이브러리 객체 참조 중</p>
                          <p className="text-xs text-red-700">ID: {practicalLibraryRefs.emergencyId}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPracticalLibraryRefs({ ...practicalLibraryRefs, emergencyId: null })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          참조 해제
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setModalsOpen(prev => ({ ...prev, emergency: true }))}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      라이브러리에서 검색
                    </Button>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-start gap-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white">💡</span>
                    </div>
                    <p className="text-xs text-yellow-800">
                      라이브러리에서 긴급연락처 관련 콘텐츠 객체를 검색하여 참조할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 미디어 아카이브 섹션 */}
              <div className="mt-6 bg-[#F1FBF5] rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">1-6. 미디어 아카이브</h3>
                      <p className="text-sm text-zinc-600">갤러리 이미지 최대 10장</p>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-300">
                    <span className="text-xs font-semibold text-green-700">자동 상속됨</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-green-200">
                  {/* Drag & Drop 영역 */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 mb-6 transition-all ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="text-center">
                      <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        {isDragging ? '여기에 이미지를 놓으세요' : '이미지를 드래그 & 드롭하세요'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        또는 아래 URL 입력 필드를 사용하세요
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                        <Image className="w-4 h-4" />
                        최대 10장 | JPG, PNG, GIF, WEBP
                      </div>
                    </div>
                  </div>

                  {/* URL 입력 방식 */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-zinc-700 mb-2 block">
                      이미지 URL 입력
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={mediaUrlInput}
                        onChange={(e) => setMediaUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddMediaUrl();
                          }
                        }}
                        className="flex-1 bg-gray-50 border-gray-200"
                        disabled={mediaArchive.length >= 10}
                      />
                      <Button
                        onClick={handleAddMediaUrl}
                        disabled={mediaArchive.length >= 10}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        추가
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {mediaArchive.length}/10 이미지 추가됨
                    </p>
                  </div>

                  {/* 이미지 그리드 미리보기 */}
                  {mediaArchive.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {mediaArchive.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={() => {
                                toast.error(`이미지 ${index + 1}을 불러올 수 없습니다.`);
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">💡 미디어 아카이브:</span> 국가를 대표하는 다양한 이미지를 추가하세요. 
                      추가된 이미지는 갤러리 형태로 사용자에게 표시됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ 섹션 */}
              <div className="mt-6 bg-white rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">1-7. 자주 묻는 질문 (FAQ)</h3>
                      <p className="text-sm text-zinc-600">사용자들이 자주 묻는 질문과 답변을 관리합니다</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                      {faqs.length}개 등록됨
                    </span>
                    <Button
                      onClick={handleAddFaq}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      질문 추가하기
                    </Button>
                  </div>
                </div>

                {/* SEO 안내 박스 */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-indigo-900 mb-1">
                        🔍 SEO 최적화
                      </p>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        등록된 FAQ는 구조화된 데이터(JSON-LD)로 변환되어 검색 엔진에 최적화됩니다. 
                        명확하고 구체적인 질문과 답변을 작성하면 검색 결과에서 더 잘 노출될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ 리스트 */}
                {faqs.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium mb-2">아직 등록된 질문이 없습니다</p>
                    <p className="text-sm text-gray-500 mb-4">
                      상단의 "질문 추가하기" 버튼을 클릭하여 FAQ를 등록하세요
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={faqs.map(f => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {faqs.map((faq, index) => (
                          <SortableFaqItem
                            key={faq.id}
                            faq={faq}
                            index={index}
                            isExpanded={expandedFaqIds.has(faq.id)}
                            onToggleExpand={() => toggleFaqExpand(faq.id)}
                            onUpdate={(field, value) => handleUpdateFaq(faq.id, field, value)}
                            onRemove={() => handleRemoveFaq(faq.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* FAQ 템플릿 (향후 구현) */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-sm font-bold text-gray-700">
                      📋 FAQ 템플릿 (향후 구현 예정)
                    </h4>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'visa', label: '입국/비자', icon: '🛂' },
                      { id: 'voltage', label: '전압', icon: '⚡' },
                      { id: 'timezone', label: '시차', icon: '🕐' },
                      { id: 'language', label: '언어', icon: '🗣️' },
                      { id: 'currency', label: '통화', icon: '💱' },
                      { id: 'safety', label: '안전', icon: '🛡️' },
                    ].map((template) => (
                      <button
                        key={template.id}
                        disabled
                        className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed opacity-60"
                      >
                        <span className="mr-1.5">{template.icon}</span>
                        {template.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 템플릿 버튼을 클릭하면 해당 주제의 일반적인 질문과 답변이 자동으로 추가됩니다.
                  </p>
                </div>
              </div>

              {/* 라이브러리 검색 모달들 */}
              {modalsOpen.transport && (
                <LibrarySearchModal
                  isOpen={modalsOpen.transport}
                  onClose={() => setModalsOpen(prev => ({ ...prev, transport: false }))}
                  onSelect={(obj) => {
                    setPracticalLibraryRefs({ ...practicalLibraryRefs, transportId: obj.id });
                    toast.success('교통 정보가 참조되었습니다.');
                  }}
                  libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-transport')}
                />
              )}
              {modalsOpen.finance && (
                <LibrarySearchModal
                  isOpen={modalsOpen.finance}
                  onClose={() => setModalsOpen(prev => ({ ...prev, finance: false }))}
                  onSelect={(obj) => {
                    setPracticalLibraryRefs({ ...practicalLibraryRefs, financeId: obj.id });
                    toast.success('금융 정보가 참조되었습니다.');
                  }}
                  libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-finance')}
                />
              )}
              {modalsOpen.emergency && (
                <LibrarySearchModal
                  isOpen={modalsOpen.emergency}
                  onClose={() => setModalsOpen(prev => ({ ...prev, emergency: false }))}
                  onSelect={(obj) => {
                    setPracticalLibraryRefs({ ...practicalLibraryRefs, emergencyId: obj.id });
                    toast.success('긴급연락처가 참조되었습니다.');
                  }}
                  libraryObjects={(libraryObjects || []).filter((obj: any) => obj.type === 'practical-emergency')}
                />
              )}
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
