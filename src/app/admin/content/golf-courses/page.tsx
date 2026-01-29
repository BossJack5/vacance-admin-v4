'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  FlagTriangleRight,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface GolfCourse {
  id: string;
  nameKr: string;
  nameEn: string;
  cityCode: string;
  cityName?: string;
  holes: number; // 홀 수 (9, 18, 27, 36 등)
  par: number; // 파 (예: 72)
  designer: string; // 코스 디자이너
  rating: number; // 평점 (1~5)
  reviewCount?: number;
  status: 'published' | 'draft' | 'archived';
  createdAt?: any;
}

// 도시 배지 스타일 (연한 파란색)
const cityBadgeStyle = 'bg-blue-50 text-blue-600 border-blue-200';

// 코스 정보 배지 스타일 (연두색)
const courseInfoBadgeStyle = 'bg-green-50 text-green-600 border-green-200';

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

export default function GolfCoursesPage() {
  const router = useRouter();
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<GolfCourse[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedHoles, setSelectedHoles] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 유니크한 도시 목록
  const cities = Array.from(new Set(golfCourses.map(g => g.cityName || g.cityCode))).sort();
  
  // 유니크한 홀 수 목록
  const holeOptions = Array.from(new Set(golfCourses.map(g => g.holes))).sort((a, b) => a - b);

  useEffect(() => {
    loadGolfCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [golfCourses, searchKeyword, selectedCity, selectedHoles]);

  const loadGolfCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'golf_courses');
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: GolfCourse[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GolfCourse[];
      
      setGolfCourses(data);
      console.log('[골프장 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('골프장 로딩 실패:', error);
      toast.error('골프장 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...golfCourses];

    // 키워드 검색 (골프장명, 영문명, 디자이너, 도시)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.nameKr.toLowerCase().includes(keyword) ||
          g.nameEn.toLowerCase().includes(keyword) ||
          g.designer.toLowerCase().includes(keyword) ||
          (g.cityName && g.cityName.toLowerCase().includes(keyword)) ||
          g.cityCode.toLowerCase().includes(keyword)
      );
    }

    // 도시 필터
    if (selectedCity !== 'all') {
      filtered = filtered.filter((g) => (g.cityName || g.cityCode) === selectedCity);
    }

    // 홀 수 필터
    if (selectedHoles !== 'all') {
      filtered = filtered.filter((g) => g.holes === parseInt(selectedHoles));
    }

    setFilteredCourses(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 골프장을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'golf_courses', id));
      setGolfCourses(golfCourses.filter((g) => g.id !== id));
      toast.success('골프장이 삭제되었습니다.');
    } catch (error) {
      console.error('골프장 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast('데이터 내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast('일괄 업로드 기능은 준비 중입니다.');
  };

  // 통계 데이터
  const totalCourses = filteredCourses.length;
  const premium18Holes = filteredCourses.filter(g => g.holes >= 18).length;
  const premiumPar72 = filteredCourses.filter(g => g.par === 72).length;
  const publishedCount = filteredCourses.filter(g => g.status === 'published').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">골프장</h1>
            <p className="text-gray-600 mt-1">골프 코스 정보와 예약 시스템을 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/golf-courses/new')}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 골프장 등록
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <FlagTriangleRight className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalCourses}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 골프장</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{premium18Holes}</span>
            </div>
            <p className="text-sm font-medium text-green-700">18홀 이상 코스</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{premiumPar72}</span>
            </div>
            <p className="text-sm font-medium text-orange-700">프리미엄(Par 72)</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{publishedCount}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">게시 중</p>
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
                placeholder="골프장명, 디자이너 검색..."
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

            <Select value={selectedHoles} onValueChange={setSelectedHoles}>
              <SelectTrigger>
                <SelectValue placeholder="전체 홀 수" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 홀 수</SelectItem>
                {holeOptions.map((holes) => (
                  <SelectItem key={holes} value={holes.toString()}>
                    {holes}홀
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 골프장 목록 테이블 */}
        <Card className="overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <FlagTriangleRight className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">골프장이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/golf-courses/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 골프장 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      골프장명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      영문명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      도시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      코스 정보
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      디자이너
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      평점
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
                  {filteredCourses.map((course) => {
                    const statusInfo = statusConfig[course.status];
                    return (
                      <tr key={course.id} className="hover:bg-green-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FlagTriangleRight className="w-4 h-4 text-green-600" />
                            <p className="font-semibold text-gray-900">{course.nameKr}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{course.nameEn}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cityBadgeStyle}`}>
                            {course.cityName || course.cityCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${courseInfoBadgeStyle}`}>
                            {course.holes}홀 • Par {course.par}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">{course.designer}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({course.reviewCount || 0})</span>
                          </div>
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
                              onClick={() => router.push(`/admin/content/golf-courses/${course.id}`)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/content/golf-courses/${course.id}/edit`)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(course.id)}
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
            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            일괄 업로드
          </Button>
        </div>

        {/* 하단 정보 */}
        {filteredCourses.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-green-600">{filteredCourses.length}</span>개의 골프장이 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
