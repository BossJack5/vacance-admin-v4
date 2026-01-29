'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Star,
  Clock,
  DollarSign,
  Download,
  Upload,
  TrendingUp,
  Users,
  CheckCircle,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface POI {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  type: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  entranceFee?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt?: any;
}

// POI 유형 색상 매핑
const typeColors: Record<string, string> = {
  '관광명소': 'bg-blue-100 text-blue-700 border-blue-200',
  '박물관': 'bg-purple-100 text-purple-700 border-purple-200',
  '미술관': 'bg-pink-100 text-pink-700 border-pink-200',
  '공원': 'bg-green-100 text-green-700 border-green-200',
  '랜드마크': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '테마파크': 'bg-orange-100 text-orange-700 border-orange-200',
  '역사유적': 'bg-amber-100 text-amber-700 border-amber-200',
  '전망대': 'bg-sky-100 text-sky-700 border-sky-200',
};

// 상태 색상 매핑
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기',
};

export default function POIManagementPage() {
  const router = useRouter();
  const [pois, setPois] = useState<POI[]>([]);
  const [filteredPois, setFilteredPois] = useState<POI[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalPOIs = filteredPois.length;
  const avgRating = filteredPois.length > 0
    ? (filteredPois.reduce((sum, poi) => sum + (poi.rating || 0), 0) / filteredPois.filter(poi => poi.rating).length).toFixed(1)
    : '0.0';
  const totalReviews = filteredPois.reduce((sum, poi) => sum + (poi.reviewCount || 0), 0);
  const activePOIs = filteredPois.filter(poi => poi.status === 'active').length;

  // 유니크한 도시 목록
  const cities = Array.from(new Set(pois.map(poi => poi.cityName || poi.cityCode))).sort();
  
  // 유니크한 유형 목록
  const types = Array.from(new Set(pois.map(poi => poi.type))).sort();

  useEffect(() => {
    loadPOIs();
  }, []);

  useEffect(() => {
    filterPOIs();
  }, [pois, searchKeyword, selectedCity, selectedType]);

  const loadPOIs = async () => {
    try {
      setLoading(true);
      const poisRef = collection(db, 'poi_master');
      const q = query(poisRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: POI[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POI[];
      
      setPois(data);
    } catch (error) {
      console.error('POI 로딩 실패:', error);
      toast.error('명소 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterPOIs = () => {
    let filtered = [...pois];

    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (poi) =>
          poi.nameKr.toLowerCase().includes(keyword) ||
          poi.nameEn.toLowerCase().includes(keyword) ||
          poi.cityCode.toLowerCase().includes(keyword)
      );
    }

    // 도시 필터
    if (selectedCity !== 'all') {
      filtered = filtered.filter((poi) => (poi.cityName || poi.cityCode) === selectedCity);
    }

    // 유형 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter((poi) => poi.type === selectedType);
    }

    setFilteredPois(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 명소를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'poi_master', id));
      setPois(pois.filter((poi) => poi.id !== id));
      toast.success('명소가 삭제되었습니다.');
    } catch (error) {
      console.error('명소 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast.info('내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast.info('일괄 업로드 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">명소/관광지 관리</h1>
            <p className="text-gray-600 mt-1">POI (Points of Interest) 마스터 데이터 관리</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/landmarks/new')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 명소 등록
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalPOIs}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 명소</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-900">{avgRating}</span>
            </div>
            <p className="text-sm font-medium text-yellow-700">평균 평점</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{totalReviews.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">총 리뷰</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{activePOIs}</span>
            </div>
            <p className="text-sm font-medium text-green-700">활성 POI</p>
          </Card>
        </div>

        {/* 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* 첫 번째 줄: 검색 및 필터 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="명소 이름 검색..."
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
                  <SelectValue placeholder="전체 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 두 번째 줄: 액션 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>
              <Button
                onClick={handleBulkUpload}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                일괄 업로드
              </Button>
            </div>
          </div>
        </Card>

        {/* 명소 목록 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredPois.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">명소가 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/landmarks/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 명소 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      명소명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평점
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      영업시간
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      입장료
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
                  {filteredPois.map((poi) => (
                    <tr key={poi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500">{poi.id.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{poi.nameKr}</p>
                          <p className="text-sm text-gray-500">{poi.nameEn}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{poi.cityName || poi.cityCode}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[poi.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {poi.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {poi.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{poi.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({poi.reviewCount || 0})</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{poi.openingHours || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{poi.entranceFee || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[poi.status]}`}>
                          {statusLabels[poi.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/content/landmarks/${poi.id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/content/landmarks/${poi.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(poi.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* 하단 정보 */}
        {filteredPois.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-indigo-600">{filteredPois.length}</span>개의 명소가 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
