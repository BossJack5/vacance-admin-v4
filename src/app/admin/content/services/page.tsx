'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  Sparkles,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Star,
  DollarSign,
  TrendingUp,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Service {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  type: string; // 타입 (스파, 온천, 헤어살롱, 마사지, 네일 등)
  rating: number; // 평점 (1~5)
  reviewCount?: number;
  priceLevel: number; // 가격대 (1~3, 최대 3개로 제한)
  status: 'published' | 'draft' | 'archived';
  createdAt?: any;
}

// 도시 배지 스타일 (연한 파란색)
const cityBadgeStyle = 'bg-blue-50 text-blue-600 border-blue-200';

// 타입 배지 스타일 (연한 보라색)
const typeBadgeStyle = 'bg-purple-50 text-purple-600 border-purple-200';

// 상태 색상
const statusConfig: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  published: { 
    label: '게시됨', 
    dotColor: 'bg-green-500', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-700' 
  },
  draft: { 
    label: '초안', 
    dotColor: 'bg-yellow-500', 
    bgColor: 'bg-yellow-50', 
    textColor: 'text-yellow-700' 
  },
  archived: { 
    label: '보관됨', 
    dotColor: 'bg-gray-500', 
    bgColor: 'bg-gray-50', 
    textColor: 'text-gray-700' 
  },
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 유니크한 도시 목록
  const cities = Array.from(new Set(services.map(s => s.cityName || s.cityCode))).sort();
  
  // 유니크한 타입 목록
  const types = Array.from(new Set(services.map(s => s.type))).sort();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchKeyword, selectedCity, selectedType]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Service[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      
      setServices(data);
      console.log('[서비스 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('서비스 로딩 실패:', error);
      toast.error('서비스 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // 키워드 검색 (서비스명 또는 도시)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.nameKr.toLowerCase().includes(keyword) ||
          s.nameEn.toLowerCase().includes(keyword) ||
          (s.cityName && s.cityName.toLowerCase().includes(keyword)) ||
          s.cityCode.toLowerCase().includes(keyword)
      );
    }

    // 도시 필터
    if (selectedCity !== 'all') {
      filtered = filtered.filter((s) => (s.cityName || s.cityCode) === selectedCity);
    }

    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter((s) => s.type === selectedType);
    }

    setFilteredServices(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 서비스를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      setServices(services.filter((s) => s.id !== id));
      toast.success('서비스가 삭제되었습니다.');
    } catch (error) {
      console.error('서비스 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast('데이터 내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast('일괄 업로드 기능은 준비 중입니다.');
  };

  // 가격대 렌더링 (최대 3개로 제한: $~$$$ 또는 €~€€€)
  const renderPriceLevel = (level: number) => {
    // 최대 3개로 제한
    const limitedLevel = Math.min(level, 3);
    // 레벨 1-2는 $, 3은 €로 표시
    const symbol = limitedLevel <= 2 ? '$' : '€';
    const count = limitedLevel <= 2 ? limitedLevel : limitedLevel;
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-700">{symbol.repeat(count)}</span>
      </div>
    );
  };

  // 통계 데이터
  const totalServices = filteredServices.length;
  const spaWellness = filteredServices.filter(s => s.type === '스파' || s.type === '온천' || s.type === '마사지').length;
  const highRated = filteredServices.filter(s => s.rating >= 4.5).length;
  const publishedCount = filteredServices.filter(s => s.status === 'published').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">서비스 (살롱/스파)</h1>
            <p className="text-gray-600 mt-1">스파, 온천, 살롱, 마사지, 네일 등 웰니스 서비스 정보를 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/services/new')}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 서비스 등록
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalServices}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 서비스</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{spaWellness}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">스파/웰니스</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-orange-600 fill-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{highRated}</span>
            </div>
            <p className="text-sm font-medium text-orange-700">고평점(4.5↑)</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{publishedCount}</span>
            </div>
            <p className="text-sm font-medium text-green-700">게시 중</p>
          </Card>
        </div>

        {/* 검색 및 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="서비스명, 도시 검색..."
                className="pl-10"
              />
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="전체 도시" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 도시</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="전체 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 타입</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 서비스 목록 테이블 */}
        <Card className="overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">서비스가 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/services/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 서비스 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      서비스명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      영문명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      타입
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평점
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      가격대
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => {
                    const statusInfo = statusConfig[service.status];
                    return (
                      <tr key={service.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <p className="font-semibold text-gray-900">{service.nameKr}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{service.nameEn}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cityBadgeStyle}`}>
                            {service.cityName || service.cityCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeBadgeStyle}`}>
                            {service.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{service.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({service.reviewCount || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderPriceLevel(service.priceLevel)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${statusInfo.dotColor} rounded-full`}></div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => router.push(`/admin/content/services/${service.id}`)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/content/services/${service.id}/edit`)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(service.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* 하단 액션 바 */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            데이터 내보내기
          </Button>
          <Button
            onClick={handleBulkUpload}
            variant="outline"
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            일괄 업로드
          </Button>
        </div>

        {/* 하단 정보 */}
        {filteredServices.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-purple-600">{filteredServices.length}</span>개의 서비스가 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
