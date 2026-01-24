'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Building2, MapPin, Plus, Search, 
  Edit2, Trash2, ChevronRight, X, Loader2, Tag 
} from 'lucide-react';
import { locationService } from '@/services/locationService';
import { Country, City, Region } from '@/types/location';

export default function LocationsPage() {
  // 1. 상태 관리
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [isEditCityModalOpen, setIsEditCityModalOpen] = useState(false);
  const [isAddRegionModalOpen, setIsAddRegionModalOpen] = useState(false);
  const [isEditRegionModalOpen, setIsEditRegionModalOpen] = useState(false);
  
  const [newCountry, setNewCountry] = useState({ nameKr: '', nameEn: '', isoCode: '', phoneCode: '', continent: '' });
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [newCity, setNewCity] = useState({ nameKr: '', nameEn: '', cityCode: '', lat: 0, lng: 0 });
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [newRegion, setNewRegion] = useState({ nameKr: '', nameEn: '', zipPrefix: '', tagInput: '' });
  const [editingRegion, setEditingRegion] = useState<any>(null);

  // 2. 초기 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await locationService.getCountries();
      setCountries(data || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const filteredCountries = countries.filter(c => c.nameKr.includes(searchQuery));
  const filteredCities = cities.filter(city => city.nameKr.includes(citySearchQuery));

  // 3. 핸들러 (지역 목록 출력 문제 해결)
  const handleCountryClick = async (country: Country) => {
    setSelectedCountry(country); setSelectedCity(null); setRegions([]);
    const data = await locationService.getCities(country.id);
    setCities(data || []);
  };

  const handleCityClick = async (city: City) => {
    if (!city?.id) {
      console.error("도시 ID가 없습니다!");
      return;
    }
  
    try {
      // 클릭한 즉시 상태 업데이트하여 UI 피드백 제공
      setSelectedCity(city);
      setRegions([]); // 일단 비워서 이전 데이터 잔상을 지웁니다.
  
      console.log(`[검증] 도시 클릭됨: ${city.nameKr} (ID: ${city.id})`);
  
      const data = await locationService.getRegions(city.id);
      
      console.log(`[검증] 불러온 지역 개수: ${data?.length || 0}`);
      setRegions(data || []);
    } catch (err) {
      console.error("지역 로드 중 치명적 오류:", err);
    }
  };

  const deleteItem = async (type: 'country' | 'city' | 'region', id: string, name: string) => {
    if (!confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return;
    if (type === 'country') await locationService.deleteCountry(id).then(loadData);
    if (type === 'city') await locationService.deleteCity(id).then(() => selectedCountry && handleCountryClick(selectedCountry));
    if (type === 'region') await locationService.deleteRegion(id).then(() => selectedCity && handleCityClick(selectedCity));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-900 font-sans">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-blue-600" /> 위치 관리</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* [국가 컬럼 - 수정 버튼 복구] */}
        <div className="bg-white rounded-3xl border h-[780px] flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b font-bold flex justify-between items-center text-blue-600 bg-white">
            <span>국가</span>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">+ 추가</button>
          </div>
          <div className="p-4 border-b bg-gray-50/30">
            <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder="검색..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-gray-300" /></div> : 
              filteredCountries.map(c => (
                <div key={c.id} onClick={() => handleCountryClick(c)} className={`group p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${selectedCountry?.id === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-50 hover:bg-white'}`}>
                  <div><div className="font-bold text-sm">{c.nameKr}</div><div className="text-[10px] text-gray-400 uppercase">{c.nameEn}</div></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => {e.stopPropagation(); setEditingCountry(c); setIsEditModalOpen(true);}} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"><Edit2 size={14}/></button>
                    <button onClick={(e) => {e.stopPropagation(); deleteItem('country', c.id, c.nameKr);}} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14}/></button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* [도시 컬럼 - 2행 영문 출력 반영] */}
<div className="bg-white rounded-3xl border h-[780px] flex flex-col overflow-hidden shadow-sm">
  <div className="p-5 border-b font-bold flex justify-between items-center text-green-600 bg-white">
    <span>도시</span>
    {selectedCountry && <button onClick={() => setIsAddCityModalOpen(true)} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">+ 추가</button>}
  </div>
  <div className="p-4 border-b bg-gray-50/30">
    <div className="relative">
      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
      <input type="text" placeholder="검색..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none" value={citySearchQuery} onChange={e => setCitySearchQuery(e.target.value)} disabled={!selectedCountry} />
    </div>
  </div>
  <div className="flex-1 overflow-y-auto p-4 space-y-2">
    {!selectedCountry ? (
      <div className="text-center py-20 text-gray-300">국가 선택</div>
    ) : (
      filteredCities.map(city => (
        <div key={city.id} onClick={() => handleCityClick(city)} className={`group p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${selectedCity?.id === city.id ? 'border-green-500 bg-green-50' : 'border-gray-50 hover:bg-white'}`}>
          {/* --- 수정된 부분 시작 --- */}
          <div>
            <div className="text-sm font-bold">{city.nameKr}</div>
            <div className="text-[10px] text-gray-400 uppercase">{city.nameEn}</div>
          </div>
          {/* --- 수정된 부분 끝 --- */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={(e) => {e.stopPropagation(); setEditingCity(city); setIsEditCityModalOpen(true);}} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md"><Edit2 size={14}/></button>
            <button onClick={(e) => {e.stopPropagation(); deleteItem('city', city.id, city.nameKr);}} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14}/></button>
          </div>
        </div>
      ))
    )}
  </div>
</div>

        {/* [지역 컬럼 - 목록 출력 복구] */}
        <div className="bg-white rounded-3xl border h-[780px] flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b font-bold flex justify-between items-center text-purple-600 bg-white">
            <span>지역</span>
            {selectedCity && <button onClick={() => setIsAddRegionModalOpen(true)} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">+ 추가</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedCity ? <div className="text-center py-20 text-gray-300 italic">도시 선택</div> : regions.map(r => (
              <div key={r.id} className="group p-4 rounded-2xl border border-gray-50 flex justify-between items-center hover:bg-white transition-all shadow-sm">
                <div className="text-left">
                  <div className="font-bold text-sm">{r.nameKr} <span className="text-[10px] text-purple-400 font-mono">({r.zipPrefix})</span></div>
                  <div className="flex flex-wrap gap-1 mt-1">{(r.tags || []).map((t, i) => <span key={i} className="text-[9px] bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded-full">#{t}</span>)}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => {setEditingRegion({...r, tagInput: (r.tags || []).join(', ')}); setIsEditRegionModalOpen(true);}} className="p-1 text-purple-600 hover:bg-purple-100 rounded-md"><Edit2 size={14}/></button>
                  <button onClick={() => deleteItem('region', r.id, r.nameKr)} className="p-1 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- [모달 섹션: X 버튼 및 전체 필드 포함] --- */}

      {/* 1. 국가 추가/수정 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[450px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">새 국가 등록</h2><button onClick={() => setIsAddModalOpen(false)}><X/></button></div>
            <input type="text" placeholder="한글명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCountry({...newCountry, nameKr: e.target.value})} />
            <input type="text" placeholder="영문명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCountry({...newCountry, nameEn: e.target.value})} />
            <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="ISO" className="border-2 rounded-xl p-3" onChange={e => setNewCountry({...newCountry, isoCode: e.target.value})} /><input type="text" placeholder="전화코드" className="border-2 rounded-xl p-3" onChange={e => setNewCountry({...newCountry, phoneCode: e.target.value})} /></div>
            <input type="text" placeholder="대륙" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCountry({...newCountry, continent: e.target.value})} />
            <button onClick={async () => { await locationService.createCountry(newCountry); setIsAddModalOpen(false); loadData(); }} className="w-full bg-black text-white font-bold py-4 rounded-2xl">저장</button>
          </div>
        </div>
      )}

      {isEditModalOpen && editingCountry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[450px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">국가 수정</h2><button onClick={() => setIsEditModalOpen(false)}><X/></button></div>
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCountry.nameKr} onChange={e => setEditingCountry({...editingCountry, nameKr: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCountry.nameEn} onChange={e => setEditingCountry({...editingCountry, nameEn: e.target.value})} />
            <div className="grid grid-cols-2 gap-3"><input type="text" className="border-2 rounded-xl p-3" value={editingCountry.isoCode} onChange={e => setEditingCountry({...editingCountry, isoCode: e.target.value})} /><input type="text" className="border-2 rounded-xl p-3" value={editingCountry.phoneCode} onChange={e => setEditingCountry({...editingCountry, phoneCode: e.target.value})} /></div>
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCountry.continent} onChange={e => setEditingCountry({...editingCountry, continent: e.target.value})} />
            <button onClick={async () => { await locationService.updateCountry(editingCountry.id, editingCountry); setIsEditModalOpen(false); loadData(); }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl">수정 완료</button>
          </div>
        </div>
      )}

      {/* 2. 도시 추가/수정 */}
      {isAddCityModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[450px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">새 도시 등록</h2><button onClick={() => setIsAddCityModalOpen(false)}><X/></button></div>
            <input type="text" placeholder="한글명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCity({...newCity, nameKr: e.target.value})} />
            <input type="text" placeholder="영문명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCity({...newCity, nameEn: e.target.value})} />
            <input type="text" placeholder="도시코드" className="w-full border-2 rounded-xl p-3" onChange={e => setNewCity({...newCity, cityCode: e.target.value})} />
            <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="위도" className="border-2 rounded-xl p-3" onChange={e => setNewCity({...newCity, lat: parseFloat(e.target.value)})} /><input type="number" placeholder="경도" className="border-2 rounded-xl p-3" onChange={e => setNewCity({...newCity, lng: parseFloat(e.target.value)})} /></div>
            <button onClick={async () => { if(selectedCountry) { await locationService.createCity({...newCity, countryId: selectedCountry.id}); setIsAddCityModalOpen(false); handleCountryClick(selectedCountry); } }} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl">저장</button>
          </div>
        </div>
      )}

      {isEditCityModalOpen && editingCity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[450px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">도시 수정</h2><button onClick={() => setIsEditCityModalOpen(false)}><X/></button></div>
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCity.nameKr} onChange={e => setEditingCity({...editingCity, nameKr: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCity.nameEn} onChange={e => setEditingCity({...editingCity, nameEn: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingCity.cityCode || ''} onChange={e => setEditingCity({...editingCity, cityCode: e.target.value})} placeholder="도시코드" />
            <div className="grid grid-cols-2 gap-3"><input type="number" className="border-2 rounded-xl p-3" value={editingCity.lat} onChange={e => setEditingCity({...editingCity, lat: parseFloat(e.target.value)})} /><input type="number" className="border-2 rounded-xl p-3" value={editingCity.lng} onChange={e => setEditingCity({...editingCity, lng: parseFloat(e.target.value)})} /></div>
            <button onClick={async () => { await locationService.updateCity(editingCity.id, editingCity); setIsEditCityModalOpen(false); if(selectedCountry) handleCountryClick(selectedCountry); }} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl">수정 완료</button>
          </div>
        </div>
      )}

      {/* 3. 지역 추가/수정 */}
      {isAddRegionModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[400px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">새 지역 등록</h2><button onClick={() => setIsAddRegionModalOpen(false)}><X/></button></div>
            <input type="text" placeholder="한글명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewRegion({...newRegion, nameKr: e.target.value})} />
            <input type="text" placeholder="영문명" className="w-full border-2 rounded-xl p-3" onChange={e => setNewRegion({...newRegion, nameEn: e.target.value})} />
            <input type="text" placeholder="zipPrefix" className="w-full border-2 rounded-xl p-3" onChange={e => setNewRegion({...newRegion, zipPrefix: e.target.value})} />
            <input type="text" placeholder="태그 (쉼표 구분)" className="w-full border-2 rounded-xl p-3" onChange={e => setNewRegion({...newRegion, tagInput: e.target.value})} />
            <button onClick={async () => { if(selectedCity) { const tags = newRegion.tagInput.split(',').map(t => t.trim()).filter(t => t !== ''); await locationService.createRegion({...newRegion, tags, cityId: selectedCity.id}); setIsAddRegionModalOpen(false); handleCityClick(selectedCity); } }} className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl">저장</button>
          </div>
        </div>
      )}

      {isEditRegionModalOpen && editingRegion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-800">
          <div className="bg-white rounded-3xl w-[400px] p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">지역 수정</h2><button onClick={() => setIsEditRegionModalOpen(false)}><X/></button></div>
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingRegion.nameKr} onChange={e => setEditingRegion({...editingRegion, nameKr: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingRegion.nameEn} onChange={e => setEditingRegion({...editingRegion, nameEn: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingRegion.zipPrefix} onChange={e => setEditingRegion({...editingRegion, zipPrefix: e.target.value})} />
            <input type="text" className="w-full border-2 rounded-xl p-3" value={editingRegion.tagInput} onChange={e => setEditingRegion({...editingRegion, tagInput: e.target.value})} />
            <button onClick={async () => { const tags = editingRegion.tagInput.split(',').map((t:any) => t.trim()).filter((t:any) => t !== ''); await locationService.updateRegion(editingRegion.id, {...editingRegion, tags}); setIsEditRegionModalOpen(false); if(selectedCity) handleCityClick(selectedCity); }} className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl">수정 완료</button>
          </div>
        </div>
      )}
    </div>
  );
}