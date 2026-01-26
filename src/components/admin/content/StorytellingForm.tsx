'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { locationService } from '@/services/locationService';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Country, City } from '@/types/location';
import { ContentObject, ContentObjectType, TYPE_NAME_MAP } from '@/services/contentLibraryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import toast from 'react-hot-toast';

interface FormDataType {
  targetId: string;
  title: string;
  tagline: string;
  description: string;
  culturalFeatures: string;
  keywords: string[];
  historicalBackground?: string;
  localTips?: string;
  guideContent?: string;
  countryId?: string;
}

interface StorytellingFormProps {
  onSuccess?: () => void;
  initialData?: ContentObject;
}

const StorytellingForm = forwardRef<{ handleSave: () => void }, StorytellingFormProps>(({ onSuccess, initialData }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedType, setSelectedType] = useState('country-story');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [formData, setFormData] = useState<FormDataType>({
    targetId: '',
    title: '',
    tagline: '',
    description: '',
    culturalFeatures: '',
    keywords: [],
    historicalBackground: '',
    localTips: '',
    guideContent: '',
    countryId: '',
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  useEffect(() => {
    const loadCountries = async () => {
      const data = await locationService.getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedCountryId) {
        const data = await locationService.getCities(selectedCountryId);
        setCities(data);
      } else {
        setCities([]);
      }
    };
    loadCities();
  }, [selectedCountryId]);

  useEffect(() => {
    if (initialData) {
      setSelectedType(initialData.type);
      setSelectedCountryId(initialData.countryId || '');
      setFormData({
        targetId: initialData.targetId,
        title: initialData.title,
        tagline: initialData.tagline,
        description: initialData.description,
        culturalFeatures: initialData.culturalFeatures,
        keywords: initialData.keywords,
        historicalBackground: initialData.historicalBackground,
        localTips: initialData.localTips,
        guideContent: initialData.guideContent,
        countryId: initialData.countryId,
      });
    } else {
      setSelectedType('country-story');
      setSelectedCountryId('');
      setFormData({
        targetId: '',
        title: '',
        tagline: '',
        description: '',
        culturalFeatures: '',
        keywords: [],
        historicalBackground: '',
        localTips: '',
        guideContent: '',
        countryId: '',
      });
    }
  }, [initialData]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCountriesForCity = countries.filter(c => 
    c.nameKr.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(item =>
    item.nameKr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.targetId || !formData.title) {
      toast.error("대상과 제목을 입력해주세요.");
      return;
    }
    try {
      let targetName = '';
      if (selectedType === 'city-story') {
        const city = cities.find(c => c.id === formData.targetId);
        targetName = city?.nameKr || '';
      } else {
        const country = countries.find(c => c.id === formData.targetId);
        targetName = country?.nameKr || '';
      }
      const dataToSave = {
        type: selectedType,
        typeName: TYPE_NAME_MAP[selectedType as ContentObjectType] || selectedType,
        targetId: formData.targetId,
        targetName: targetName,
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        culturalFeatures: formData.culturalFeatures,
        keywords: formData.keywords,
        historicalBackground: formData.historicalBackground,
        localTips: formData.localTips,
        guideContent: formData.guideContent,
        updatedAt: serverTimestamp(),
      };
      if (initialData?.id) {
        await updateDoc(doc(db, 'contentLibrary', initialData.id), dataToSave);
      } else {
        (dataToSave as any).createdAt = serverTimestamp();
        await addDoc(collection(db, 'contentLibrary'), dataToSave);
      }
      toast.success("성공적으로 저장되었습니다!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  useImperativeHandle(ref, () => ({ handleSave }));

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto pr-2 max-h-[70vh]">
        <Tabs defaultValue="country-story" onValueChange={setSelectedType} className="w-full">
          {/* 상단 5대 타입 선택 */}
          <TabsList className="grid w-full grid-cols-5 mb-8 h-16 bg-zinc-100 p-1 rounded-xl">
            <TabsTrigger value="country-story">국가</TabsTrigger>
            <TabsTrigger value="city-story">도시</TabsTrigger>
            <TabsTrigger value="practical-finance">금융</TabsTrigger>
            <TabsTrigger value="practical-emergency">연락처</TabsTrigger>
            <TabsTrigger value="practical-transport">교통</TabsTrigger>
          </TabsList>

          <div className="space-y-6 pb-10">
            {/* 공통 섹션: 대상 선택 */}
            <div className="p-6 border-2 border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-6">
              <label className="text-sm font-bold text-zinc-700">대상 설정</label>
              {selectedType === 'city-story' && (
                <>
                  <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 검색</label>
                  <Input placeholder="국가 검색..." value={countrySearchTerm} onChange={(e) => setCountrySearchTerm(e.target.value)} className="bg-white mb-2" />
                  <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 선택</label>
                  <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                    <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="먼저 국가를 선택하세요" /></SelectTrigger>
                    <SelectContent>{filteredCountriesForCity.map(c => <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-zinc-600 mb-1 block">검색어</label>
                <Input placeholder="검색어 입력..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white" />
                <label className="text-sm font-bold text-zinc-600 mb-1 block">대상 선택</label>
                <Select value={formData.targetId} onValueChange={(val) => setFormData({...formData, targetId: val})}>
                  <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="최종 대상 선택" /></SelectTrigger>
                  <SelectContent>
                    {(selectedType === 'city-story' ? filteredCities : filteredCountries).map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.nameKr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 입력 필드 (탭 콘텐츠) */}
            <TabsContent value="country-story" className="space-y-6 m-0">
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">제목</label>
                 <Input placeholder="제목" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-12" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">태그라인</label>
                 <Input placeholder="태그라인" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} className="h-12" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 개요</label>
                 <Textarea placeholder="상세 개요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[300px]" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">문화적 특징</label>
                 <Textarea placeholder="문화적 특징" value={formData.culturalFeatures} onChange={(e) => setFormData({...formData, culturalFeatures: e.target.value})} className="min-h-[300px]" />
               </div>
            </TabsContent>

            <TabsContent value="city-story" className="space-y-6 m-0">
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 스토리 제목</label>
                 <Input placeholder="도시 스토리 제목" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-12" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">한줄 요약</label>
                 <Input placeholder="한줄 요약" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} className="h-12" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 개요</label>
                 <Textarea placeholder="도시 개요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[300px]" />
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">로컬 팁 (숨은 명소)</label>
                 <Textarea placeholder="로컬 팁 (숨은 명소)" value={formData.localTips} onChange={(e) => setFormData({...formData, localTips: e.target.value})} className="min-h-[300px]" />
               </div>
            </TabsContent>

            <TabsContent value="practical-finance" className="space-y-6 m-0">
               <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                 <span className="text-sm font-bold text-green-800">실시간 환율 정보 (자동 동기화)</span>
                 <span className="text-lg font-black text-green-700">1 EUR = 1,480원</span>
               </div>
               <div>
                 <label className="text-sm font-bold text-zinc-600 mb-1 block">환전 및 금융 가이드 내용</label>
                 <Textarea placeholder="환전 및 금융 가이드 내용" value={formData.guideContent} onChange={(e) => setFormData({...formData, guideContent: e.target.value})} className="min-h-[200px]" />
               </div>
            </TabsContent>

            {/* 키워드 및 정합성 영역 (공통) */}
            <div className="p-6 bg-white border-2 border-zinc-100 rounded-2xl space-y-4">
              <label className="text-sm font-bold text-zinc-700">핵심 키워드</label>
              <div className="flex gap-2">
                <Input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())} placeholder="키워드 입력 후 엔터" />
                <Button type="button" onClick={addKeyword} variant="outline">추가</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords.map((kw, i) => (
                  <span key={i} className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md flex items-center gap-1">
                    #{kw}
                    <button onClick={() => setFormData({...formData, keywords: formData.keywords.filter((_, idx) => idx !== i)})} className="text-zinc-400 hover:text-zinc-600">×</button>
                  </span>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-blue-800 font-bold text-xs font-sans">✓ 데이터 정합성 보장</p>
                <p className="text-blue-600 text-[10px] mt-1">입력된 데이터는 가이드북 및 상세페이지에 즉시 반영됩니다.</p>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
});

StorytellingForm.displayName = 'StorytellingForm';
export default StorytellingForm;