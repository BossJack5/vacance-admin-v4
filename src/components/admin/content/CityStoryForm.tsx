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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import toast from 'react-hot-toast';

interface CityStoryFormProps {
  onSuccess?: () => void;
  initialData?: ContentObject;
}

const CityStoryForm = forwardRef<{ handleSave: () => void }, CityStoryFormProps>(({ onSuccess, initialData }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [formData, setFormData] = useState({
    targetId: '',
    title: '',
    tagline: '',
    description: '',
    culturalCharacteristics: '',
    historicalBackground: '',
    localTips: '',
    keywords: [] as string[],
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
      setSelectedCountryId(initialData.countryId || '');
      setFormData({
        targetId: initialData.targetId,
        title: initialData.title,
        tagline: initialData.tagline,
        description: initialData.description,
        culturalCharacteristics: initialData.culturalCharacteristics || '',
        historicalBackground: initialData.historicalBackground || '',
        localTips: initialData.localTips || '',
        keywords: initialData.keywords,
      });
      // 수정 시 해당 국가와 도시를 검색어로 설정하여 쉽게 찾을 수 있도록 함
      const country = countries.find(c => c.id === initialData.countryId);
      if (country) {
        setCountrySearchTerm(country.nameKr);
      }
      const city = cities.find(c => c.id === initialData.targetId);
      if (city) {
        setSearchTerm(city.nameKr);
      }
    } else {
      setSelectedCountryId('');
      setFormData({
        targetId: '',
        title: '',
        tagline: '',
        description: '',
        culturalCharacteristics: '',
        historicalBackground: '',
        localTips: '',
        keywords: [],
      });
      setCountrySearchTerm('');
      setSearchTerm('');
    }
  }, [initialData, countries, cities]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(c => 
    c.nameKr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.targetId || !formData.title) {
      toast.error("대상과 제목을 입력해주세요.");
      return;
    }
    try {
      const dataToSave = {
        type: 'city-story' as ContentObjectType,
        typeName: TYPE_NAME_MAP['city-story'],
        targetId: formData.targetId,
        targetName: cities.find(c => c.id === formData.targetId)?.nameKr || '',
        countryId: selectedCountryId,
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        culturalCharacteristics: formData.culturalCharacteristics,
        historicalBackground: formData.historicalBackground,
        localTips: formData.localTips,
        keywords: formData.keywords,
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
    <div className="flex flex-col h-full bg-white space-y-6">
      {/* 대상 선택 */}
      <div className="p-6 border-2 border-zinc-100 rounded-2xl bg-zinc-50/50">
        <label className="text-sm font-bold text-zinc-700 mb-4 block">대상 도시 선택</label>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 검색</label>
            <Input placeholder="국가 검색..." value={countrySearchTerm} onChange={(e) => setCountrySearchTerm(e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 선택</label>
            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
              <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="먼저 국가를 선택하세요" /></SelectTrigger>
              <SelectContent>{filteredCountries.map(c => <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">검색어</label>
            <Input placeholder="도시 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 선택</label>
            <Select value={formData.targetId} onValueChange={(val) => setFormData({...formData, targetId: val})}>
              <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="도시를 선택하세요" /></SelectTrigger>
              <SelectContent>
                {filteredCities.map(c => <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 입력 필드 */}
      <div className="space-y-6">
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
          <Textarea placeholder="도시 개요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[400px]" />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">문화적 특성</label>
          <Textarea placeholder="문화적 특성" value={formData.culturalCharacteristics} onChange={(e) => setFormData({...formData, culturalCharacteristics: e.target.value})} className="min-h-[400px]" />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">역사적 배경</label>
          <Textarea placeholder="역사적 배경" value={formData.historicalBackground} onChange={(e) => setFormData({...formData, historicalBackground: e.target.value})} className="min-h-[400px]" />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">로컬 팁 (숨은 명소)</label>
          <Textarea placeholder="로컬 팁 (숨은 명소)" value={formData.localTips} onChange={(e) => setFormData({...formData, localTips: e.target.value})} className="min-h-[400px]" />
        </div>
      </div>

      {/* 키워드 */}
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
      </div>
    </div>
  );
});

CityStoryForm.displayName = 'CityStoryForm';
export default CityStoryForm;