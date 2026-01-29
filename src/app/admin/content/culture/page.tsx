'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  Image as ImageIcon,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  RotateCcw,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface CulturalSpecial {
  id: string;
  title: string;
  season: string; // 시즌 (봄, 여름, 가을, 겨울 등)
  type: string; // 유형 (축제, 전시, 공연 등)
  status: 'published' | 'draft' | 'archived';
  relatedProductIds: string[]; // 연결 상품 ID 배열
  isFeatured?: boolean; // 추천 여부
  createdAt?: any;
}

// 시즌 배지 색상 (연한 파란색)
const seasonBadgeStyle = 'bg-blue-50 text-blue-600 border-blue-200';

// 유형 배지 색상 (연한 보라색)
const typeBadgeStyle = 'bg-purple-50 text-purple-600 border-purple-200';

// 상태 색상
const statusColors: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  archived: 'bg-gray-50 text-gray-600',
};

const statusLabels: Record<string, string> = {
  published: '진행 중',
  draft: '준비 중',
  archived: '종료',
};

export default function CulturalSpecialsPage() {
  const router = useRouter();
  const [specials, setSpecials] = useState<CulturalSpecial[]>([]);
  const [filteredSpecials, setFilteredSpecials] = useState<CulturalSpecial[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalSpecials = filteredSpecials.length;
  const activeSpecials = filteredSpecials.filter(s => s.status === 'published').length;
  const linkedSpecials = filteredSpecials.filter(s => s.relatedProductIds && s.relatedProductIds.length > 0).length;
  const unlinkedSpecials = filteredSpecials.filter(s => !s.relatedProductIds || s.relatedProductIds.length === 0).length;

  // 추천 스페셜 (상위 2개)
  const featuredSpecials = specials.filter(s => s.isFeatured).slice(0, 2);

  // 유니크한 시즌 목록
  const seasons = Array.from(new Set(specials.map(s => s.season))).sort();

  useEffect(() => {
    loadSpecials();
  }, []);

  useEffect(() => {
    filterSpecials();
  }, [specials, searchKeyword, selectedSeason, selectedStatus]);

  const loadSpecials = async () => {
    try {
      setLoading(true);
      const specialsRef = collection(db, 'cultural_specials');
      const q = query(specialsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: CulturalSpecial[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CulturalSpecial[];
      
      setSpecials(data);
      console.log('[문화 스페셜 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('문화 스페셜 로딩 실패:', error);
      toast.error('문화 스페셜 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterSpecials = () => {
    let filtered = [...specials];

    // 키워드 검색
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(keyword));
    }

    // 시즌 필터
    if (selectedSeason !== 'all') {
      filtered = filtered.filter((s) => s.season === selectedSeason);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    setFilteredSpecials(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 문화 스페셜을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'cultural_specials', id));
      setSpecials(specials.filter((s) => s.id !== id));
      toast.success('문화 스페셜이 삭제되었습니다.');
    } catch (error) {
      console.error('문화 스페셜 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSelectedSeason('all');
    setSelectedStatus('all');
  };

  const handleExport = () => {
    toast.info('내보내기 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">문화 스페셜 관리</h1>
            <p className="text-gray-600 mt-1">마스터 콘텐츠와 기획전을 관리합니다</p>
          </div>
          <Button
            onClick={() => router.push('/admin/content/culture/new')}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 스페셜 등록
          </Button>
        </div>

        {/* 통계 카드 - 4개 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <ImageIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalSpecials}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 스페셜</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{activeSpecials}</span>
            </div>
            <p className="text-sm font-medium text-green-700">진행 중</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{linkedSpecials}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">상품 연결 완료</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-red-900">{unlinkedSpecials}</span>
            </div>
            <p className="text-sm font-medium text-red-700">미연결 콘텐츠</p>
          </Card>
        </div>

        {/* 추천 스페셜 Insight 섹션 */}
        {featuredSpecials.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              추천 스페셜 (앱 상단 노출)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {featuredSpecials.map((special) => (
                <div key={special.id} className="bg-white rounded-lg p-4 border-2 border-yellow-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-2">{special.title}</p>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${seasonBadgeStyle}`}>
                          {special.season}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${typeBadgeStyle}`}>
                          {special.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        연결 상품: <span className="font-semibold">{special.relatedProductIds?.length || 0}개</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 검색 및 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="스페셜 제목 검색..."
                  className="pl-10"
                />
              </div>

              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="모든 시즌" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 시즌</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
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
                  <SelectItem value="published">진행 중</SelectItem>
                  <SelectItem value="draft">준비 중</SelectItem>
                  <SelectItem value="archived">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                초기화
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </Button>
            </div>
          </div>
        </Card>

        {/* 문화 스페셜 목록 테이블 */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredSpecials.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">문화 스페셜이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/culture/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 스페셜 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      시즌
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      연결 상품 수
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSpecials.map((special) => {
                    const productCount = special.relatedProductIds?.length || 0;
                    const isUnlinked = productCount === 0;

                    return (
                      <tr key={special.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono text-gray-500">
                            {special.id.substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <p className="font-bold text-gray-900">{special.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${seasonBadgeStyle}`}>
                            {special.season}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeBadgeStyle}`}>
                            {special.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[special.status]
                            }`}
                          >
                            {statusLabels[special.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link2 className={`w-4 h-4 ${isUnlinked ? 'text-red-500' : 'text-purple-500'}`} />
                            <span
                              className={`font-semibold ${
                                isUnlinked ? 'text-red-600' : 'text-gray-900'
                              }`}
                            >
                              {productCount}개
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => router.push(`/admin/content/culture/${special.id}`)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/content/culture/${special.id}/edit`)}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(special.id)}
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

        {/* 하단 정보 */}
        {filteredSpecials.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-indigo-600">{filteredSpecials.length}</span>개의 문화 스페셜이 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
