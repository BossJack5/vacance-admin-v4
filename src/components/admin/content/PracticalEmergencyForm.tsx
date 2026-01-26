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

interface PracticalEmergencyFormProps {
  onSuccess?: () => void;
  initialData?: ContentObject;
}

const PracticalEmergencyForm = forwardRef<{ handleSave: () => void }, PracticalEmergencyFormProps>(({ onSuccess, initialData }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [formData, setFormData] = useState({
    tagline: '',
    emergencyNumber: '',
    police: '',
    fire: '',
    medical: '',
    embassyInfo: '',
    keywords: [] as string[],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  useEffect(() => {
    const loadCountries = async () => {
      const data = await locationService.getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (initialData && countries.length > 0) {
      setSelectedCountryId(initialData.countryId || '');
      setFormData({
        tagline: initialData.tagline || '',
        emergencyNumber: initialData.emergencyNumber || '',
        police: initialData.police || '',
        fire: initialData.fire || '',
        medical: initialData.medical || '',
        embassyInfo: initialData.embassyInfo || '',
        keywords: initialData.keywords,
      });
      // 수정 모드에서는 검색어를 비워서 전체 국가 목록을 보여줌
      setCountrySearchTerm('');
    } else if (!initialData) {
      setSelectedCountryId('');
      setFormData({
        tagline: '',
        emergencyNumber: '',
        police: '',
        fire: '',
        medical: '',
        embassyInfo: '',
        keywords: [],
      });
      setCountrySearchTerm('');
    }
  }, [initialData, countries]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedCountryId) {
      toast.error("국가를 선택해주세요.");
      return;
    }
    if (!formData.emergencyNumber && !formData.police && !formData.fire && !formData.medical) {
      toast.error("최소 하나의 비상 연락처를 입력해주세요.");
      return;
    }
    try {
      const targetName = countries.find(c => c.id === selectedCountryId)?.nameKr || '';
      
      const dataToSave = {
        type: 'practical-emergency' as ContentObjectType,
        typeName: TYPE_NAME_MAP['practical-emergency'],
        targetId: selectedCountryId,
        targetName: targetName,
        title: '비상 연락처',
        tagline: formData.tagline,
        description: '',
        emergencyNumber: formData.emergencyNumber,
        police: formData.police,
        fire: formData.fire,
        medical: formData.medical,
        embassyInfo: formData.embassyInfo,
        keywords: formData.keywords,
        countryId: selectedCountryId,
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
      {/* 대상 설정 */}
      <div className="p-6 border-2 border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-6">
        <label className="text-sm font-bold text-zinc-700">대상 설정</label>
        <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 검색</label>
        <Input placeholder="국가 검색..." value={countrySearchTerm} onChange={(e) => setCountrySearchTerm(e.target.value)} className="bg-white mb-2" />
        <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 선택</label>
        <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
          <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="국가를 선택하세요 (선택사항)" /></SelectTrigger>
          <SelectContent>{filteredCountries.map(c => <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* 태그라인 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-1 block">태그라인 (한줄 요약)</label>
        <Input 
          placeholder="예: 긴급 상황 시 꼭 알아야 할 연락처" 
          value={formData.tagline} 
          onChange={(e) => setFormData({...formData, tagline: e.target.value})} 
          className="h-12" 
        />
      </div>

      {/* 비상 연락처 입력 (한 줄로) */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">통합 긴급전화</label>
          <Input 
            placeholder="예: 112" 
            value={formData.emergencyNumber} 
            onChange={(e) => setFormData({...formData, emergencyNumber: e.target.value})} 
            className="h-12" 
          />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">경찰</label>
          <Input 
            placeholder="예: 110" 
            value={formData.police} 
            onChange={(e) => setFormData({...formData, police: e.target.value})} 
            className="h-12" 
          />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">소방</label>
          <Input 
            placeholder="예: 119" 
            value={formData.fire} 
            onChange={(e) => setFormData({...formData, fire: e.target.value})} 
            className="h-12" 
          />
        </div>
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">응급의료</label>
          <Input 
            placeholder="예: 911" 
            value={formData.medical} 
            onChange={(e) => setFormData({...formData, medical: e.target.value})} 
            className="h-12" 
          />
        </div>
      </div>

      {/* 대사관 정보 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-1 block">대사관 정보</label>
        <Textarea 
          placeholder="대사관 주소, 연락처, 긴급 연락처 등을 입력하세요" 
          value={formData.embassyInfo} 
          onChange={(e) => setFormData({...formData, embassyInfo: e.target.value})} 
          className="min-h-[300px]" 
        />
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

PracticalEmergencyForm.displayName = 'PracticalEmergencyForm';
export default PracticalEmergencyForm;