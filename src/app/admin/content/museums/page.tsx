'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  Search, 
  Calendar,
  Edit, 
  Trash2, 
  Plus,
  Star,
  Palette,
  Award,
  CircleAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface MuseumData {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  type: string;
  rating: number; // 레바캉스 별점 1~3
  connectedArtworksCount: number; // 연결된 작품 수
  status: '운영중' | '임시휴관' | '폐관';
  createdAt?: any;
}

// 박물관 유형 색상 매핑
const typeColors: Record<string, string> = {
  '국립박물관': 'bg-blue-100 text-blue-700 border-blue-200',
  '시립박물관': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '사립박물관': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '미술관': 'bg-pink-100 text-pink-700 border-pink-200',
  '현대미술관': 'bg-purple-100 text-purple-700 border-purple-200',
  '특수박물관': 'bg-amber-100 text-amber-700 border-amber-200',
  '과학박물관': 'bg-green-100 text-green-700 border-green-200',
};

// 상태 색상 매핑
const statusColors: Record<string, string> = {
  '운영중': 'bg-green-100 text-green-700',
  '임시휴관': 'bg-yellow-100 text-yellow-700',
  '폐관': 'bg-red-100 text-red-700',
};

export default function MuseumManagementPage() {
  const router = useRouter();
  const [museums, setMuseums] = useState<MuseumData[]>([]);
  const [filteredMuseums, setFilteredMuseums] = useState<MuseumData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalMuseums = filteredMuseums.length;
  const threeStarMuseums = filteredMuseums.filter(m => m.rating === 3).length;
  const totalArtworks = filteredMuseums.reduce((sum, m) => sum + (m.connectedArtworksCount || 0), 0);

  // 유니크한 도시 목록
  const cities = Array.from(new Set(museums.map(m => m.cityName || m.cityCode))).sort();
  
  // 유니크한 유형 목록
  const types = Array.from(new Set(museums.map(m => m.type))).sort();

  useEffect(() => {
    loadMuseums();
  }, []);

  useEffect(() => {
    filterMuseums();
  }, [museums, searchKeyword, selectedCity, selectedType]);

  const loadMuseums = async () => {
    try {
      setLoading(true);
      const museumsRef = collection(db, 'museums');
      const q = query(museumsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: MuseumData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MuseumData[];
      
      setMuseums(data);
      console.log('[박물관 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('박물관 로딩 실패:', error);
      toast.error('박물관 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterMuseums = () => {
    let filtered = [...museums];

    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.nameKr.toLowerCase().includes(keyword) ||
          m.nameEn.toLowerCase().includes(keyword) ||
          m.cityCode.toLowerCase().includes(keyword)
      );
    }

    // 도시 필터
    if (selectedCity !== 'all') {
      filtered = filtered.filter((m) => (m.cityName || m.cityCode) === selectedCity);
    }

    // 유형 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter((m) => m.type === selectedType);
    }

    setFilteredMuseums(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 박물관을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'museums', id));
      setMuseums(museums.filter((m) => m.id !== id));
      toast.success('박물관이 삭제되었습니다.');
    } catch (error) {
      console.error('박물관 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExhibitionSchedule = (museumId: string) => {
    router.push(`/admin/content/museums/${museumId}/exhibitions`);
  };

  const handleViewArtworks = (museumId: string) => {
    router.push(`/admin/content/museums/${museumId}/artworks`);
  };

  // 별점 렌더링 함수 (1~3개)
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(3)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">박물관/미술관 관리</h1>
            <p className="text-gray-600 mt-1">박물관 및 미술관 마스터 데이터 관리</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/museums/new')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 박물관 등록
          </Button>
        </div>

        {/* 통계 카드 - 3개 */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* 전체 박물관 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalMuseums}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 박물관</p>
          </Card>

          {/* 별 3개 박물관 (Gold) */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-300">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-900">{threeStarMuseums}</span>
            </div>
            <p className="text-sm font-medium text-yellow-700">별 3개 박물관</p>
          </Card>

          {/* 총 연결 작품 수 (Purple) */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Palette className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{totalArtworks.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">총 연결 작품 수</p>
          </Card>
        </div>

        {/* 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="박물관/미술관 이름 검색..."
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
        </Card>

        {/* 박물관 목록 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredMuseums.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">박물관/미술관이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/museums/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 박물관 등록하기
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
                      박물관명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      레바캉스 별점
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      연결 작품 수
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
                  {filteredMuseums.map((museum) => (
                    <tr key={museum.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500">
                          {museum.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{museum.nameKr}</p>
                          <p className="text-sm text-gray-500">{museum.nameEn}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {museum.cityName || museum.cityCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            typeColors[museum.type] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {museum.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRating(museum.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewArtworks(museum.id)}
                          className="text-purple-600 hover:text-purple-700 hover:underline font-semibold"
                        >
                          {museum.connectedArtworksCount || 0}점
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[museum.status]
                          }`}
                        >
                          {museum.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleExhibitionSchedule(museum.id)}
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            title="전시 일정 관리"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/content/museums/${museum.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(museum.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="삭제"
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
        {filteredMuseums.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-purple-600">{filteredMuseums.length}</span>개의 박물관/미술관이 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
