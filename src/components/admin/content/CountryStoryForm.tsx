'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { locationService } from '@/services/locationService';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Country } from '@/types/location';
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

interface CountryStoryFormProps {
  onSuccess?: () => void;
  initialData?: ContentObject;
}

const CountryStoryForm = forwardRef<{ handleSave: () => void }, CountryStoryFormProps>(({ onSuccess, initialData }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState({
    targetId: '',
    title: '',
    tagline: '',
    description: '',
    culturalFeatures: '',
    keywords: [] as string[],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCountries = async () => {
      const data = await locationService.getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        targetId: initialData.targetId,
        title: initialData.title,
        tagline: initialData.tagline,
        description: initialData.description,
        culturalFeatures: initialData.culturalFeatures,
        keywords: initialData.keywords,
      });
      // 수정 시 해당 국가를 검색어로 설정하여 쉽게 찾을 수 있도록 함
      const country = countries.find(c => c.id === initialData.targetId);
      if (country) {
        setSearchTerm(country.nameKr);
      }
    } else {
      setFormData({
        targetId: '',
        title: '',
        tagline: '',
        description: '',
        culturalFeatures: '',
        keywords: [],
      });
      setSearchTerm('');
    }
  }, [initialData, countries]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.targetId || !formData.title) {
      toast.error("대상과 제목을 입력해주세요.");
      return;
    }
    try {
      const dataToSave = {
        type: 'country-story' as ContentObjectType,
        typeName: TYPE_NAME_MAP['country-story'],
        targetId: formData.targetId,
        targetName: countries.find(c => c.id === formData.targetId)?.nameKr || '',
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        culturalFeatures: formData.culturalFeatures,
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
        <label className="text-sm font-bold text-zinc-700 mb-4 block">대상 국가 선택</label>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-zinc-600 mb-1 block">검색어</label>
          <Input placeholder="국가 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white" />
          <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 선택</label>
          <Select value={formData.targetId} onValueChange={(val) => setFormData({...formData, targetId: val})}>
            <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="국가를 선택하세요" /></SelectTrigger>
            <SelectContent>
              {filteredCountries.map(c => <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 입력 필드 */}
      <div className="space-y-6">
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
          <Textarea placeholder="국가 개요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[400px]" />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">문화적 특징</label>
          <Textarea placeholder="문화적 특징" value={formData.culturalFeatures} onChange={(e) => setFormData({...formData, culturalFeatures: e.target.value})} className="min-h-[400px]" />
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

CountryStoryForm.displayName = 'CountryStoryForm';
export default CountryStoryForm;