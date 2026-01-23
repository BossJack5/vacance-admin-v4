'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import * as locationService from '@/services/locationService';
import { countrySchema, citySchema, locationSchema } from '@/lib/validations';
import { Country, City, Location } from '@/types/location';
import { useAuth } from '@/context/AuthContext'; // AuthContext 사용

// Component Imports
import CountryModal from '@/components/admin/locations/CountryModal';
import CityModal from '@/components/admin/locations/CityModal';
import LocationModal from '@/components/admin/locations/LocationModal';
import { 
  Globe, Plus, Loader2, Building2, Trash2, MapPin, Edit2, Search, 
  FileText, DownloadCloud, UploadCloud 
} from 'lucide-react';

const initialCountryForm = { nameKr: '', nameEn: '', isoCode: '', phoneCode: '', continent: '' };
const initialCityForm = { nameKr: '', nameEn: '', cityCode: '', timezone: '', lat: '', lng: '' };
const initialLocationForm = { nameKr: '', nameEn: '', zipPrefix: '' };

export default function LocationsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'jackmimosa@gmail.com';

  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [countryForm, setCountryForm] = useState(initialCountryForm);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [cityForm, setCityForm] = useState(initialCityForm);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [locationForm, setLocationForm] = useState(initialLocationForm);
  const [filters, setFilters] = useState({ country: '', city: '', location: '' });

  useEffect(() => {
    const unsubscribeCountries = locationService.subscribeCountries(setCountries);
    return () => unsubscribeCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const unsubscribeCities = locationService.subscribeCities(selectedCountry.id, setCities);
      return () => unsubscribeCities();
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity) {
      const unsubscribeLocations = locationService.subscribeLocations(selectedCity.id, setLocations);
      return () => unsubscribeLocations();
    } else {
      setLocations([]);
    }
  }, [selectedCity]);

  const filteredCountries = countries.filter(c => c.nameKr.toLowerCase().includes(filters.country.toLowerCase()) || c.nameEn.toLowerCase().includes(filters.country.toLowerCase()) || c.isoCode.toLowerCase().includes(filters.country.toLowerCase()));
  const filteredCities = cities.filter(city => city.nameKr.toLowerCase().includes(filters.city.toLowerCase()) || city.cityCode.toLowerCase().includes(filters.city.toLowerCase()));
  const filteredLocations = locations.filter(loc => loc.nameKr.toLowerCase().includes(filters.location.toLowerCase()) || loc.zipPrefix.includes(filters.location));
  const handleSelectCountry = (country: Country) => { setSelectedCountry(country); setSelectedCity(null); };
  const openNewCountryModal = () => { setEditCountry(null); setCountryForm(initialCountryForm); setIsCountryModalOpen(true); };
  const openEditCountryModal = (country: Country) => { setEditCountry(country); setCountryForm(country); setIsCountryModalOpen(true); };
  const handleSaveCountry = async () => { /* ... */ };
  const onDeleteCountry = async (e: React.MouseEvent, id: string, name: string) => { /* ... */ };
  const openNewCityModal = () => { setEditCity(null); setCityForm(initialCityForm); setIsCityModalOpen(true); };
  const openEditCityModal = (city: City) => { setEditCity(city); setCityForm(city); setIsCityModalOpen(true); };
  const handleSaveCity = async () => { /* ... */ };
  const onDeleteCity = async (e: React.MouseEvent, id: string, name: string) => { /* ... */ };
  const openNewLocationModal = () => { setEditLocation(null); setLocationForm(initialLocationForm); setIsLocationModalOpen(true); };
  const openEditLocationModal = (loc: Location) => { setEditLocation(loc); setLocationForm(loc); setIsLocationModalOpen(true); };
  const handleSaveLocation = async () => { /* ... */ };
  const onDeleteLocation = async (e: React.MouseEvent, id: string) => { /* ... */ };
  const handleDownloadTemplate = () => { /* ... */ };
  const handleExportExcel = async () => { /* ... */ };
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">위치 정보 관리</h2>
        {isSuperAdmin && (
          <button onClick={openNewCountryModal} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-6 h-6" /> 새 국가 등록
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[750px]">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredCountries.map(country => (
              <div key={country.id} onClick={() => handleSelectCountry(country)} className={`group p-5 rounded-[1.5rem] border transition-all flex justify-between items-center cursor-pointer ${selectedCountry?.id === country.id ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-50 hover:border-blue-200 hover:bg-white'}`}>
                <div>
                  <span className={`font-bold block ${selectedCountry?.id === country.id ? 'text-blue-700' : 'text-slate-700'}`}>{country.nameKr}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{country.isoCode}</span>
                </div>
                {isSuperAdmin && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => {e.stopPropagation(); openEditCountryModal(country)}} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => onDeleteCountry(e, country.id, country.nameKr)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-1">
              {selectedCountry && isSuperAdmin && (
                <>
                  <button onClick={handleDownloadTemplate} title="업로드 양식 다운로드" className="p-2 text-slate-400 hover:text-orange-500"><FileText className="w-5 h-5" /></button>
                  <button onClick={handleExportExcel} title="엑셀로 내보내기" className="p-2 text-slate-400 hover:text-green-600"><DownloadCloud className="w-5 h-5" /></button>
                  <label title="엑셀 데이터 가져오기" className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer"><UploadCloud className="w-5 h-5" /><input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} /></label>
                  <button onClick={() => setIsCityModalOpen(true)} className="ml-2 p-3 bg-green-600 text-white rounded-2xl"><Plus className="w-6 h-6" /></button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {!selectedCountry ? ( <div className="h-full flex items-center justify-center text-slate-400">국가를 먼저 선택해 주세요</div> ) 
            : ( filteredCities.map(city => (
                <div key={city.id} onClick={() => setSelectedCity(city)} className={`group p-5 rounded-[1.5rem] border ...`}>
                  <div>
                    <span className={`font-bold block ${selectedCity?.id === city.id ? 'text-green-700' : 'text-slate-700'}`}>{city.nameKr}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{city.cityCode}</span>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => {e.stopPropagation(); openEditCityModal(city)}} className="p-2 text-slate-400 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => onDeleteCity(e, city.id, city.nameKr)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              )))
            }
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden">
           <div className="p-8 border-b flex justify-between items-center bg-slate-50/30">
            {selectedCity && isSuperAdmin && <button onClick={openNewLocationModal} className="p-3 bg-purple-600 text-white rounded-2xl"><Plus className="w-6 h-6" /></button>}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {!selectedCity ? ( <div className="h-full flex items-center justify-center text-slate-400">도시를 먼저 선택해 주세요</div> )
            : ( filteredLocations.map(loc => (
                <div key={loc.id} className="group p-5 bg-slate-50/50 ...">
                   <div>
                    <span className="font-bold text-purple-700">{loc.nameKr}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{loc.zipPrefix}</span>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => {e.stopPropagation(); openEditLocationModal(loc)}} className="p-2 text-slate-300 hover:text-purple-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => onDeleteLocation(e, loc.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              )))
            }
          </div>
        </div>
      </div>

      {/* Modals */}
      <CountryModal isOpen={isCountryModalOpen} onClose={() => setIsCountryModalOpen(false)} onSave={handleSaveCountry} form={countryForm} setForm={setCountryForm} isSaving={isSaving} editData={editCountry} />
      <CityModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} onSave={handleSaveCity} form={cityForm} setForm={setCityForm} isSaving={isSaving} editData={editCity} selectedCountryName={selectedCountry?.nameKr || ''} />
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onSave={handleSaveLocation} form={locationForm} setForm={setLocationForm} isSaving={isSaving} editData={editLocation} selectedCityName={selectedCity?.nameKr || ''} />
    </div>
  );
}
