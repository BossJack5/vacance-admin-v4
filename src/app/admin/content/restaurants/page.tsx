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
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Restaurant {
  id: string;
  nameKr: string;
  nameEn?: string;
  countryId: string;
  cityId: string;
  category: 'restaurant' | 'cafe' | 'bar';
  michelinStars?: number;
  priceLevel: number;
  reservation?: {
    enabled: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt?: any;
}

const categoryLabels: Record<string, string> = {
  'restaurant': '레스토랑',
  'cafe': '카페',
  'bar': '바',
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchKeyword, selectedCategory]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'restaurants'));
      
      const data: Restaurant[] = snapshot.docs.map((doc) => {
        const rawData = doc.data();
        
        // category 필드가 없으면 name_kr에서 추측
        let category: 'restaurant' | 'cafe' | 'bar' = 'restaurant';
        if (rawData.category) {
          category = rawData.category;
        } else if (rawData.name_kr) {
          const nameLower = rawData.name_kr.toLowerCase();
          if (nameLower.includes('카페') || nameLower.includes('cafe')) {
            category = 'cafe';
          } else if (nameLower.includes('바') || nameLower.includes('bar')) {
            category = 'bar';
          }
        }
        
        return {
          id: doc.id,
          nameKr: rawData.name_kr || rawData.nameKr || '',
          nameEn: rawData.name_en || rawData.nameEn || '',
          countryId: rawData.countryId || '',
          cityId: rawData.cityId || '',
          category: category,
          michelinStars: rawData.michelinStars || 0,
          priceLevel: rawData.priceLevel || rawData.price_level || 1,
          reservation: rawData.reservation || { enabled: false },
          status: rawData.status || 'active',
          createdAt: rawData.createdAt
        };
      });
      
      setRestaurants(data);
      console.log('✅ [레스토랑 목록] 로드됨:', data.length, '개');
      if (data.length > 0) {
        console.log('📊 [변환된 첫 번째 레스토랑]', data[0]);
      }
    } catch (error) {
      console.error('❌ [레스토랑 로딩 실패]', error);
      toast.error('레스토랑 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((r) => {
        const nameKr = r.nameKr || '';
        const nameEn = r.nameEn || '';
        return nameKr.toLowerCase().includes(keyword) || nameEn.toLowerCase().includes(keyword);
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">레스토랑/카페 관리</h1>
            <p className="text-gray-600 mt-1">레스토랑 정보를 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/restaurants/new')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 레스토랑 등록
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <Card className="p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="레스토랑명으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="업종 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 업종</SelectItem>
                <SelectItem value="restaurant">레스토랑</SelectItem>
                <SelectItem value="cafe">카페</SelectItem>
                <SelectItem value="bar">바</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">레스토랑 목록을 불러오는 중...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">등록된 레스토랑이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">레스토랑명</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">도시</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">업종</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">미슐랭</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">가격대</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">예약</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">상태</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{restaurant.nameKr || '(이름 없음)'}</p>
                          {restaurant.nameEn && (
                            <p className="text-sm text-gray-500">{restaurant.nameEn}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{restaurant.cityId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {categoryLabels[restaurant.category] || restaurant.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {restaurant.michelinStars && restaurant.michelinStars > 0 ? (
                          <div className="flex items-center gap-0.5">
                            {[...Array(restaurant.michelinStars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-700">
                          {restaurant.priceLevel ? '€'.repeat(restaurant.priceLevel) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          restaurant.reservation?.enabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {restaurant.reservation?.enabled ? '사용' : '미사용'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {statusLabels[restaurant.status] || restaurant.status}
                        </span>
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
