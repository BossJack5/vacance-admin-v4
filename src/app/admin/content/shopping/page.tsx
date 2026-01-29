'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  ShoppingBag,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Star,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Shopping {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  category: string; // 카테고리 (백화점, 쇼핑몰, 부티크 등)
  rating: number; // 평점 (1~5)
  reviewCount?: number;
  priceLevel: number; // 가격대 (1~4)
  status: 'published' | 'draft' | 'archived';
  createdAt?: any;
}

// 도시 배지 스타일 (연한 파란색)
const cityBadgeStyle = 'bg-blue-50 text-blue-600 border-blue-200';

// 카테고리 배지 스타일 (연한 분홍색)
const categoryBadgeStyle = 'bg-pink-50 text-pink-600 border-pink-200';

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

export default function ShoppingPage() {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<Shopping[]>([]);
  const [filteredList, setFilteredList] = useState<Shopping[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 유니크한 도시 목록
  const cities = Array.from(new Set(shoppingList.map(s => s.cityName || s.cityCode))).sort();
  
  // 유니크한 카테고리 목록
  const categories = Array.from(new Set(shoppingList.map(s => s.category))).sort();

  useEffect(() => {
    loadShopping();
  }, []);

  useEffect(() => {
    filterShopping();
  }, [shoppingList, searchKeyword, selectedCity, selectedCategory]);

  const loadShopping = async () => {
    try {
      setLoading(true);
      const shoppingRef = collection(db, 'shopping');
      const q = query(shoppingRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Shopping[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shopping[];
      
      setShoppingList(data);
      console.log('[쇼핑 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('쇼핑 로딩 실패:', error);
      toast.error('쇼핑 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterShopping = () => {
    let filtered = [...shoppingList];

    // 키워드 검색 (쇼핑명 또는 도시)
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

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    setFilteredList(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 쇼핑 장소를 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'shopping', id));
      setShoppingList(shoppingList.filter((s) => s.id !== id));
      toast.success('쇼핑 장소가 삭제되었습니다.');
    } catch (error) {
      console.error('쇼핑 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast('데이터 내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast('일괄 업로드 기능은 준비 중입니다.');
  };

  // 가격대 렌더링 (1~4레벨, $ 또는 € 조합)
  const renderPriceLevel = (level: number) => {
    // 레벨 1-2는 $, 3-4는 €로 표시
    const symbol = level <= 2 ? '$' : '€';
    const count = level <= 2 ? level : level - 2;
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-700">{symbol.repeat(count)}</span>
      </div>
    );
  };

  // 통계 데이터
  const totalShopping = filteredList.length;
  const departmentStores = filteredList.filter(s => s.category === '백화점' || s.category === '명품관').length;
  const highRated = filteredList.filter(s => s.rating >= 4.5).length;
  const publishedCount = filteredList.filter(s => s.status === 'published').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">쇼핑</h1>
            <p className="text-gray-600 mt-1">백화점, 명품관, 아울렛, 로컬 숍 등 쇼핑 정보를 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/shopping/new')}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 쇼핑 등록
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalShopping}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 쇼핑몰</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{departmentStores}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">백화점/명품관</p>
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="쇼핑명, 도시 검색..."
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

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="전체 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 쇼핑 목록 테이블 */}
        <Card className="overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">쇼핑 장소가 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/shopping/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 쇼핑 장소 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      쇼핑명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      영문명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      카테고리
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
                  {filteredList.map((shopping) => {
                    const statusInfo = statusConfig[shopping.status];
                    return (
                      <tr key={shopping.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{shopping.nameKr}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{shopping.nameEn}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cityBadgeStyle}`}>
                            {shopping.cityName || shopping.cityCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryBadgeStyle}`}>
                            {shopping.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{shopping.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({shopping.reviewCount || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderPriceLevel(shopping.priceLevel)}
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
                              onClick={() => router.push(`/admin/content/shopping/${shopping.id}`)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/content/shopping/${shopping.id}/edit`)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(shopping.id)}
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
        {filteredList.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-pink-600">{filteredList.length}</span>개의 쇼핑 장소가 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
