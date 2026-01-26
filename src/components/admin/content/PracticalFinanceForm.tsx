'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { locationService } from '@/services/locationService';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Country, City } from '@/types/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface FinanceFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

const PracticalFinanceForm = forwardRef<{ handleSave: () => void }, FinanceFormProps>(({ initialData, onSuccess }, ref) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1300,
    EUR: 1480,
    GBP: 1700,
    JPY: 900,
    CNY: 180,
  });
  const [lastUpdated, setLastUpdated] = useState<string>('2026-01-26 09:00:00');
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    guideContent: '',
    exchangeFee: '',
    atmTips: '',
    cardUsageTips: '',
    keywords: [] as string[],
  });

  // 1. 국가 목록 로드
  useEffect(() => {
    locationService.getCountries().then(setCountries);
  }, []);

  // 2. 수정 모드 시 데이터 세팅
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        tagline: initialData.tagline || '',
        guideContent: initialData.guideContent || '',
        exchangeFee: initialData.exchangeFee || '',
        atmTips: initialData.atmTips || '',
        cardUsageTips: initialData.cardUsageTips || '',
        keywords: initialData.keywords || [],
      });
      if (initialData.countryId) {
        setSelectedCountryId(initialData.countryId);
      }
      if (initialData.selectedCurrency) {
        setSelectedCurrency(initialData.selectedCurrency);
      }
    }
  }, [initialData]);

  const filteredCountries = countries.filter(c => 
    c.nameKr.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const currencyNames: { [key: string]: string } = {
    USD: '달러',
    EUR: '유로',
    GBP: '파운드',
    JPY: '엔화',
    CNY: '위안화',
  };

  const handleSave = async () => {
    const targetId = selectedCountryId;
    const targetName = countries.find(c => c.id === selectedCountryId)?.nameKr;

    if (!targetId || !formData.title) return toast.error("대상과 제목은 필수입니다.");

    try {
      const data = {
        ...formData,
        type: 'practical-finance',
        typeName: '금융 가이드',
        targetId,
        targetName,
        countryId: selectedCountryId,
        selectedCurrency,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'contentLibrary', initialData.id), data);
      } else {
        await addDoc(collection(db, 'contentLibrary'), { ...data, createdAt: serverTimestamp() });
      }
      toast.success("저장 완료!");
      onSuccess?.();
    } catch (e) { toast.error("저장 실패"); }
  };

  useImperativeHandle(ref, () => ({ handleSave }));

  return (
    <div className="space-y-6 p-1">
      {/* 대상 국가 선택 */}
      <div className="p-6 border-2 border-zinc-100 rounded-2xl bg-zinc-50/50">
        <label className="text-sm font-bold text-zinc-700 mb-4 block">대상 국가 선택</label>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 검색</label>
            <Input 
              placeholder="국가 검색..." 
              value={countrySearchTerm} 
              onChange={(e) => setCountrySearchTerm(e.target.value)} 
              className="bg-white" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">국가 선택</label>
            <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
              <SelectTrigger className="h-12 bg-white">
                <SelectValue placeholder="국가를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {filteredCountries.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nameKr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 실시간 환율 정보 */}
      <div className="p-6 border-2 border-blue-100 rounded-2xl bg-blue-50/30">
        <label className="text-sm font-bold text-zinc-700 mb-4 block">실시간 환율 정보 (자동 동기화)</label>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-zinc-600 mb-1 block">통화 선택</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="h-12 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">원화 대 달러 (USD)</SelectItem>
                <SelectItem value="EUR">원화 대 유로 (EUR)</SelectItem>
                <SelectItem value="GBP">원화 대 파운드 (GBP)</SelectItem>
                <SelectItem value="JPY">원화 대 엔화 (JPY)</SelectItem>
                <SelectItem value="CNY">원화 대 위안화 (CNY)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-zinc-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-zinc-500 mb-1">현재 기준 환율 (미리보기)</div>
                <div className="text-2xl font-bold text-zinc-800">
                  1 {selectedCurrency} = {exchangeRates[selectedCurrency as keyof typeof exchangeRates].toLocaleString()}원
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500 mb-1">마지막 업데이트</div>
                <div className="text-sm font-medium text-zinc-700">{lastUpdated}</div>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-3 pt-3 border-t border-zinc-100">
              ℹ️ 백엔드에서 한국수출입은행 API를 통해 자동 갱신됩니다.
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              📅 업데이트 주기: 매일 오전 9시
            </div>
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">가이드 제목</label>
        <Input 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          placeholder="예: 프랑스 환전 및 결제 완벽 가이드" 
          className="h-12"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">태그라인 (한줄 요약)</label>
        <Input 
          value={formData.tagline} 
          onChange={e => setFormData({...formData, tagline: e.target.value})} 
          placeholder="예: 똑똑한 환전 방법과 카드 사용 팁" 
          className="h-12"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">금융 상세 가이드</label>
        <Textarea 
          className="min-h-[400px]" 
          value={formData.guideContent} 
          onChange={e => setFormData({...formData, guideContent: e.target.value})}
          placeholder="금융 가이드 내용을 입력하세요..."
        />
      </div>

      {/* 환전소 수수료 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">환전소 수수료</label>
        <Textarea 
          className="min-h-[200px]" 
          value={formData.exchangeFee} 
          onChange={e => setFormData({...formData, exchangeFee: e.target.value})}
          placeholder="환전소별 수수료 정보를 입력하세요...&#x0a;예: 공항 환전소 3-5%, 시내 환전소 1-2%"
        />
      </div>

      {/* ATM 인출 팁 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">ATM 인출 팁</label>
        <Textarea 
          className="min-h-[200px]" 
          value={formData.atmTips} 
          onChange={e => setFormData({...formData, atmTips: e.target.value})}
          placeholder="ATM 사용 시 유의사항 및 팁을 입력하세요...&#x0a;예: 수수료, 인출 한도, 추천 ATM 위치 등"
        />
      </div>

      {/* 카드 사용 요령 */}
      <div>
        <label className="text-sm font-bold text-zinc-600 mb-2 block">카드 사용 요령</label>
        <Textarea 
          className="min-h-[200px]" 
          value={formData.cardUsageTips} 
          onChange={e => setFormData({...formData, cardUsageTips: e.target.value})}
          placeholder="신용카드/체크카드 사용 팁을 입력하세요...&#x0a;예: 해외 수수료, 추천 카드, 사용 가능 매장 등"
        />
      </div>

      {/* 키워드 */}
      <div className="p-6 bg-white border-2 border-zinc-100 rounded-2xl">
        <label className="text-sm font-bold text-zinc-700 mb-2 block">핵심 키워드</label>
        <div className="flex gap-2 mb-2">
          <Input 
            value={keywordInput} 
            onChange={e => setKeywordInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && keywordInput.trim() && (e.preventDefault(), setFormData({...formData, keywords: [...formData.keywords, keywordInput.trim()]}), setKeywordInput(''))} 
            placeholder="키워드 입력 후 엔터"
          />
          <Button 
            type="button" 
            onClick={() => { 
              if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
                setFormData({...formData, keywords: [...formData.keywords, keywordInput.trim()]}); 
                setKeywordInput(''); 
              }
            }}
            variant="outline"
          >
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.keywords.map((k, i) => (
            <span key={i} className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md flex items-center gap-1">
              #{k}
              <button 
                onClick={() => setFormData({...formData, keywords: formData.keywords.filter((_, idx) => idx !== i)})} 
                className="text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

PracticalFinanceForm.displayName = 'PracticalFinanceForm';
export default PracticalFinanceForm;