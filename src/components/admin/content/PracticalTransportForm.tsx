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

interface PracticalTransportFormProps {
  onSuccess?: () => void;
  initialData?: ContentObject;
}

const PracticalTransportForm = forwardRef<{ handleSave: () => void }, PracticalTransportFormProps>(({ onSuccess, initialData }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [formData, setFormData] = useState({
    targetId: '',
    tagline: '',
    airportToCity: '',
    urbanTransport: '',
    personalMobility: '',
    intercityTravel: '',
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
      // 전체 도시 로드 (국가 선택과 상관없이)
      const allCities: City[] = [];
      const cityPromises = countries.map(country => locationService.getCities(country.id));
      const cityArrays = await Promise.all(cityPromises);
      cityArrays.forEach(cityArray => {
        allCities.push(...cityArray);
      });
      setCities(allCities);
    };
    if (countries.length > 0) {
      loadCities();
    }
  }, [countries]);

  useEffect(() => {
    if (initialData) {
      setSelectedCountryId(initialData.countryId || '');
      setFormData({
        targetId: initialData.targetId,
        tagline: initialData.tagline || '',
        airportToCity: initialData.airportToCity || '',
        urbanTransport: initialData.urbanTransport || '',
        personalMobility: initialData.personalMobility || '',
        intercityTravel: initialData.intercityTravel || '',
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
        tagline: '',
        airportToCity: '',
        urbanTransport: '',
        personalMobility: '',
        intercityTravel: '',
        keywords: [],
      });
      setCountrySearchTerm('');
      setSearchTerm('');
    }
  }, [initialData, countries, cities]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(item =>
    item.nameKr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.airportToCity && !formData.urbanTransport && !formData.personalMobility && !formData.intercityTravel) {
      toast.error("최소 하나의 교통 정보를 입력해주세요.");
      return;
    }
    try {
      let targetName = '';
      if (formData.targetId) {
        const city = cities.find(c => c.id === formData.targetId);
        if (city) {
          targetName = city.nameKr;
        } else {
          const country = countries.find(c => c.id === formData.targetId);
          if (country) {
            targetName = country.nameKr;
          }
        }
      }
      const dataToSave = {
        type: 'practical-transport' as ContentObjectType,
        typeName: TYPE_NAME_MAP['practical-transport'],
        targetId: formData.targetId,
        targetName: targetName,
        title: '교통 정보',
        tagline: formData.tagline,
        description: '',
        airportToCity: formData.airportToCity,
        urbanTransport: formData.urbanTransport,
        personalMobility: formData.personalMobility,
        intercityTravel: formData.intercityTravel,
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
        <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 검색</label>
        <Input placeholder="도시 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white" />
        <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 선택</label>
        <Select value={formData.targetId} onValueChange={(val) => setFormData({...formData, targetId: val})}>
          <SelectTrigger className="h-12 bg-white"><SelectValue placeholder="도시를 선택하세요 (선택사항)" /></SelectTrigger>
          <SelectContent>
            {filteredCities.map(item => (
              <SelectItem key={item.id} value={item.id}>{item.nameKr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 태그라인 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-1 block">태그라인 (한줄 요약)</label>
        <Input 
          placeholder="예: 편리한 대중교통으로 도시 곳곳을 자유롭게" 
          value={formData.tagline} 
          onChange={(e) => setFormData({...formData, tagline: e.target.value})} 
          className="h-12" 
        />
      </div>

      {/* 입력 필드 */}
      <div className="space-y-6">
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">공항에서 시내가는 방법</label>
          <Textarea 
            placeholder="공항에서 시내로 이동하는 다양한 방법을 설명해주세요 (공항버스, 지하철, 택시, 리무진 등)" 
            value={formData.airportToCity} 
            onChange={(e) => setFormData({...formData, airportToCity: e.target.value})} 
            className="min-h-[300px]" 
          />
        </div>
        
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 내 대중 교통</label>
          <Textarea 
            placeholder="버스, 지하철, 트램 등 도시 내 대중교통 이용 방법을 설명해주세요" 
            value={formData.urbanTransport} 
            onChange={(e) => setFormData({...formData, urbanTransport: e.target.value})} 
            className="min-h-[300px]" 
          />
        </div>
        
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">개인 모빌리티</label>
          <Textarea 
            placeholder="자전거, 킥보드, 렌터카 등 개인 모빌리티 이용 방법을 설명해주세요" 
            value={formData.personalMobility} 
            onChange={(e) => setFormData({...formData, personalMobility: e.target.value})} 
            className="min-h-[300px]" 
          />
        </div>
        
        <div>
          <label className="text-sm font-bold text-zinc-600 mb-1 block">도시 간 이동</label>
          <Textarea 
            placeholder="기차, 버스, 항공 등 도시 간 이동 방법을 설명해주세요" 
            value={formData.intercityTravel} 
            onChange={(e) => setFormData({...formData, intercityTravel: e.target.value})} 
            className="min-h-[300px]" 
          />
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

PracticalTransportForm.displayName = 'PracticalTransportForm';
export default PracticalTransportForm;