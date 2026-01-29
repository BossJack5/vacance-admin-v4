'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  Newspaper,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  TrendingUp,
  Heart,
  MessageCircle,
  Calendar,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Magazine {
  id: string;
  title: string;
  category: string;
  tags: string[]; // 태그 배열
  status: 'published' | 'draft' | 'archived';
  publishedAt?: any;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt?: any;
}

// 카테고리 배지 색상
const categoryColors: Record<string, string> = {
  '맛집/카페': 'bg-purple-50 text-purple-600 border-purple-200',
  '역사/문화': 'bg-pink-50 text-pink-600 border-pink-200',
  '여행팁': 'bg-blue-50 text-blue-600 border-blue-200',
  '쇼핑': 'bg-orange-50 text-orange-600 border-orange-200',
  '예술': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '라이프스타일': 'bg-green-50 text-green-600 border-green-200',
};

// 상태 색상
const statusColors: Record<string, string> = {
  published: 'bg-orange-50 text-orange-600',
  draft: 'bg-yellow-50 text-yellow-600',
  archived: 'bg-gray-50 text-gray-600',
};

const statusLabels: Record<string, string> = {
  published: '게시됨',
  draft: '초안',
  archived: '보관됨',
};

export default function JeudiMagazinePage() {
  const router = useRouter();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalMagazines = filteredMagazines.length;
  const publishedMagazines = filteredMagazines.filter(m => m.status === 'published').length;
  const categoryCount = Array.from(new Set(magazines.map(m => m.category))).length;
  const totalLikes = filteredMagazines.reduce((sum, m) => sum + (m.likeCount || 0), 0);

  // 인기 매거진
  const mostViewed = magazines.length > 0 
    ? magazines.reduce((prev, curr) => (curr.viewCount > prev.viewCount ? curr : prev))
    : null;
  const mostLiked = magazines.length > 0
    ? magazines.reduce((prev, curr) => (curr.likeCount > prev.likeCount ? curr : prev))
    : null;
  const mostCommented = magazines.length > 0
    ? magazines.reduce((prev, curr) => (curr.commentCount > prev.commentCount ? curr : prev))
    : null;

  // 유니크한 카테고리 목록
  const categories = Array.from(new Set(magazines.map(m => m.category))).sort();

  useEffect(() => {
    loadMagazines();
  }, []);

  useEffect(() => {
    filterMagazines();
  }, [magazines, searchKeyword, selectedCategory, selectedStatus]);

  const loadMagazines = async () => {
    try {
      setLoading(true);
      const magazinesRef = collection(db, 'magazines');
      const q = query(magazinesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Magazine[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Magazine[];
      
      setMagazines(data);
      console.log('[매거진 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('매거진 로딩 실패:', error);
      toast.error('매거진 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterMagazines = () => {
    let filtered = [...magazines];

    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((m) => m.title.toLowerCase().includes(keyword));
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === selectedStatus);
    }

    setFilteredMagazines(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 매거진을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'magazines', id));
      setMagazines(magazines.filter((m) => m.id !== id));
      toast.success('매거진이 삭제되었습니다.');
    } catch (error) {
      console.error('매거진 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">쥬디(Jeudi) 매거진 관리</h1>
            <p className="text-gray-600 mt-1">모듈형 블록 에디터로 매거진 콘텐츠를 작성합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/jeudi-magazine/new')}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 매거진 작성
          </Button>
        </div>

        {/* 통계 카드 - 4개 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Newspaper className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalMagazines}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 매거진</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{publishedMagazines}</span>
            </div>
            <p className="text-sm font-medium text-orange-700">발행 완료</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Tag className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{categoryCount}</span>
            </div>
            <p className="text-sm font-medium text-green-700">카테고리 종류</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-pink-600" />
              <span className="text-2xl font-bold text-pink-900">{totalLikes.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-pink-700">누적 좋아요</p>
          </Card>
        </div>

        {/* 인기 매거진 Insight 섹션 */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            인기 매거진 인사이트
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">최다 조회</p>
              <p className="font-semibold text-gray-900 truncate">{mostViewed?.title || '-'}</p>
              <p className="text-sm text-green-600 mt-1">
                👁️ {mostViewed?.viewCount.toLocaleString() || 0}회
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">최다 좋아요</p>
              <p className="font-semibold text-gray-900 truncate">{mostLiked?.title || '-'}</p>
              <p className="text-sm text-pink-600 mt-1">
                ❤️ {mostLiked?.likeCount.toLocaleString() || 0}개
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">최다 댓글</p>
              <p className="font-semibold text-gray-900 truncate">{mostCommented?.title || '-'}</p>
              <p className="text-sm text-blue-600 mt-1">
                💬 {mostCommented?.commentCount.toLocaleString() || 0}개
              </p>
            </div>
          </div>
        </Card>

        {/* 검색 및 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="매거진 제목 검색..."
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="모든 카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="모든 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="archived">보관됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 매거진 목록 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredMagazines.length === 0 ? (
            <div className="p-12 text-center">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">매거진이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/jeudi-magazine/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 매거진 작성하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      발행일
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMagazines.map((magazine) => (
                    <tr key={magazine.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500">
                          {magazine.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 mb-2">{magazine.title}</p>
                          {magazine.tags && magazine.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {magazine.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            categoryColors[magazine.category] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {magazine.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[magazine.status]
                          }`}
                        >
                          {statusLabels[magazine.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {magazine.publishedAt?.toDate
                            ? magazine.publishedAt.toDate().toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/content/jeudi-magazine/${magazine.id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/content/jeudi-magazine/${magazine.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(magazine.id)}
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
        {filteredMagazines.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-purple-600">{filteredMagazines.length}</span>개의 매거진이 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
