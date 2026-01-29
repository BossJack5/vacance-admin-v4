'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  UtensilsCrossed,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Star,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Restaurant {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  cuisineType: string; // 음식 종류
  michelinStars?: number; // 미슐랭 별 (0~3)
  priceLevel: number; // 가격대 (1~4, €~€€€€)
  rating: number; // 평균 평점 (1~5)
  reviewCount?: number;
  reservationRequired: boolean; // 예약 필수 여부
  status: 'active' | 'inactive' | 'pending';
  createdAt?: any;
}

// 음식 종류 배지 색상 (주황색 계열)
const cuisineColors: Record<string, string> = {
  '프렌치 파인다이닝': 'bg-orange-100 text-orange-700 border-orange-200',
  '이탈리안': 'bg-red-100 text-red-700 border-red-200',
  '일식': 'bg-rose-100 text-rose-700 border-rose-200',
  '중식': 'bg-amber-100 text-amber-700 border-amber-200',
  '한식': 'bg-orange-100 text-orange-700 border-orange-200',
  '스페니쉬': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '지중해': 'bg-blue-100 text-blue-700 border-blue-200',
  '카페': 'bg-brown-100 text-brown-700 border-brown-200',
  '베이커리': 'bg-amber-100 text-amber-700 border-amber-200',
  '비스트로': 'bg-orange-100 text-orange-700 border-orange-200',
};

// 상태 색상
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<string, string> = {
  active: '영업중',
  inactive: '휴업',
  pending: '검토 중',
};

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalRestaurants = filteredRestaurants.length;
  const totalMichelinStars = filteredRestaurants.reduce((sum, r) => sum + (r.michelinStars || 0), 0);
  const reservationRequired = filteredRestaurants.filter(r => r.reservationRequired).length;
  const avgRating = filteredRestaurants.length > 0
    ? (filteredRestaurants.reduce((sum, r) => sum + r.rating, 0) / filteredRestaurants.length).toFixed(1)
    : '0.0';

  // 유니크한 도시 목록
  const cities = Array.from(new Set(restaurants.map(r => r.cityName || r.cityCode))).sort();
  
  // 유니크한 음식 종류 목록
  const cuisineTypes = Array.from(new Set(restaurants.map(r => r.cuisineType))).sort();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchKeyword, selectedCity, selectedCuisine]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(restaurantsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Restaurant[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[];
      
      setRestaurants(data);
      console.log('[레스토랑 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('레스토랑 로딩 실패:', error);
      toast.error('레스토랑 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.nameKr.toLowerCase().includes(keyword) ||
          r.nameEn.toLowerCase().includes(keyword) ||
          r.cityCode.toLowerCase().includes(keyword)
      );
    }

    // 도시 필터
    if (selectedCity !== 'all') {
      filtered = filtered.filter((r) => (r.cityName || r.cityCode) === selectedCity);
    }

    // 음식 종류 필터
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter((r) => r.cuisineType === selectedCuisine);
    }

    setFilteredRestaurants(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 레스토랑을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'restaurants', id));
      setRestaurants(restaurants.filter((r) => r.id !== id));
      toast.success('레스토랑이 삭제되었습니다.');
    } catch (error) {
      console.error('레스토랑 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast('내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast('일괄 업로드 기능은 준비 중입니다.');
  };

  // 미슐랭 별 렌더링 (0~3개)
  const renderMichelinStars = (stars?: number) => {
    if (!stars || stars === 0) {
      return <span className="text-gray-400 text-sm">-</span>;
    }
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(stars)].map((_, index) => (
          <Star
            key={index}
            className="w-4 h-4 text-yellow-500 fill-yellow-500"
          />
        ))}
      </div>
    );
  };

  // 가격대 렌더링 (€~€€€€)
  const renderPriceLevel = (level: number) => {
    const symbol = '€'.repeat(level);
    return <span className="font-semibold text-gray-700">{symbol}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">레스토랑/카페 관리</h1>
            <p className="text-gray-600 mt-1">레스토랑 정보와 메뉴, 예약 시스템을 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/restaurants/new')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 레스토랑 등록
          </Button>
        </div>

        {/* 통계 카드 - 4개 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* 전체 레스토랑 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalRestaurants}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 레스토랑</p>
          </Card>

          {/* 미슐랭 스타 (Orange) */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{totalMichelinStars}</span>
            </div>
            <p className="text-sm font-medium text-orange-700">미슐랭 스타</p>
          </Card>

          {/* 예약 필수 (Blue) */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-indigo-900">{reservationRequired}</span>
            </div>
            <p className="text-sm font-medium text-indigo-700">예약 필수</p>
          </Card>

          {/* 평균 평점 (Yellow) */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-900">{avgRating}</span>
            </div>
            <p className="text-sm font-medium text-yellow-700">평균 평점</p>
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
                  placeholder="레스토랑 이름 검색..."
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

              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 음식 종류" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 음식 종류</SelectItem>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
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
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                일괄 업로드
              </Button>
            </div>
          </div>
        </Card>

        {/* 레스토랑 목록 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">레스토랑이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/restaurants/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 레스토랑 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      레스토랑명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      음식 종류
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      미슐랭
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      가격대
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평점
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500">
                          {restaurant.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{restaurant.nameKr}</p>
                          <p className="text-sm text-gray-500">{restaurant.nameEn}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {restaurant.cityName || restaurant.cityCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            cuisineColors[restaurant.cuisineType] || 'bg-orange-100 text-orange-700 border-orange-200'
                          }`}
                        >
                          {restaurant.cuisineType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderMichelinStars(restaurant.michelinStars)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderPriceLevel(restaurant.priceLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({restaurant.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/content/restaurants/${restaurant.id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/content/restaurants/${restaurant.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(restaurant.id)}
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
        {filteredRestaurants.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-orange-600">{filteredRestaurants.length}</span>개의 레스토랑/카페가 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
