'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { 
  Palette,
  Search, 
  Eye,
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Building2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';

interface Artwork {
  id: string;
  nameKr: string;
  nameEn: string;
  artist: string;
  artistEn?: string;
  museumId: string; // 필수 필드
  museumName?: string;
  imageUrl?: string;
  period: string; // 시대 (예: 르네상스, 바로크, 현대)
  style: string; // 스타일 (예: 인상주의, 추상주의, 사실주의)
  viewCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt?: any;
}

// 시대 배지 색상
const periodColors: Record<string, string> = {
  '고대': 'bg-amber-100 text-amber-700 border-amber-200',
  '중세': 'bg-stone-100 text-stone-700 border-stone-200',
  '르네상스': 'bg-purple-100 text-purple-700 border-purple-200',
  '바로크': 'bg-violet-100 text-violet-700 border-violet-200',
  '고전주의': 'bg-blue-100 text-blue-700 border-blue-200',
  '낭만주의': 'bg-pink-100 text-pink-700 border-pink-200',
  '근대': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '현대': 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

// 스타일 배지 색상
const styleColors: Record<string, string> = {
  '사실주의': 'bg-sky-100 text-sky-700 border-sky-200',
  '인상주의': 'bg-blue-100 text-blue-700 border-blue-200',
  '표현주의': 'bg-purple-100 text-purple-700 border-purple-200',
  '입체주의': 'bg-teal-100 text-teal-700 border-teal-200',
  '추상주의': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '초현실주의': 'bg-violet-100 text-violet-700 border-violet-200',
  '팝아트': 'bg-pink-100 text-pink-700 border-pink-200',
};

// 상태 색상
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<string, string> = {
  active: '노출 중',
  inactive: '비노출',
  pending: '검토 중',
};

export default function MuseumArtworksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetMuseumId = searchParams.get('museumId'); // URL에서 박물관 ID 가져오기

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMuseum, setSelectedMuseum] = useState<string>(presetMuseumId || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 통계 데이터
  const totalArtworks = filteredArtworks.length;
  const activeArtworks = filteredArtworks.filter(a => a.status === 'active').length;
  const connectedMuseums = new Set(filteredArtworks.map(a => a.museumId)).size;
  const totalViews = filteredArtworks.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  // 유니크한 박물관 목록
  const museums = Array.from(new Set(artworks.map(a => a.museumName || a.museumId))).sort();
  
  // 유니크한 시대 목록
  const periods = Array.from(new Set(artworks.map(a => a.period))).sort();

  useEffect(() => {
    loadArtworks();
  }, []);

  useEffect(() => {
    // URL에서 박물관 ID가 있으면 자동 필터링
    if (presetMuseumId) {
      setSelectedMuseum(presetMuseumId);
    }
  }, [presetMuseumId]);

  useEffect(() => {
    filterArtworks();
  }, [artworks, searchKeyword, selectedMuseum, selectedPeriod, selectedStatus]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const artworksRef = collection(db, 'artworks');
      const q = query(artworksRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Artwork[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Artwork[];
      
      setArtworks(data);
      console.log('[작품 목록] 로드됨:', data.length, '개');
    } catch (error) {
      console.error('작품 로딩 실패:', error);
      toast.error('작품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterArtworks = () => {
    let filtered = [...artworks];

    // 키워드 검색 (작품명 또는 작가명)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nameKr.toLowerCase().includes(keyword) ||
          a.nameEn.toLowerCase().includes(keyword) ||
          a.artist.toLowerCase().includes(keyword) ||
          (a.artistEn && a.artistEn.toLowerCase().includes(keyword))
      );
    }

    // 박물관 필터
    if (selectedMuseum !== 'all') {
      filtered = filtered.filter((a) => 
        a.museumId === selectedMuseum || (a.museumName || a.museumId) === selectedMuseum
      );
    }

    // 시대 필터
    if (selectedPeriod !== 'all') {
      filtered = filtered.filter((a) => a.period === selectedPeriod);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    setFilteredArtworks(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 작품을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'artworks', id));
      setArtworks(artworks.filter((a) => a.id !== id));
      toast.success('작품이 삭제되었습니다.');
    } catch (error) {
      console.error('작품 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleExport = () => {
    toast('내보내기 기능은 준비 중입니다.');
  };

  const handleBulkUpload = () => {
    toast('일괄 업로드 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 - 보라색/핑크 그라데이션 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">박물관 작품 관리</h1>
              <p className="text-purple-100">박물관별 작품 등록 및 관리 - 작가, 시대, 스타일별 분류</p>
            </div>
            <Button
              onClick={() => router.push('/admin/content/museum-artworks/new')}
              className="bg-white text-purple-600 hover:bg-purple-50 border-2 border-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 작품 등록
            </Button>
          </div>
        </div>

        {/* 통계 카드 - 4개 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* 전체 작품 (Blue) */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Palette className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{totalArtworks}</span>
            </div>
            <p className="text-sm font-medium text-blue-700">전체 작품</p>
          </Card>

          {/* 노출 중 (Green) */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-900">{activeArtworks}</span>
            </div>
            <p className="text-sm font-medium text-green-700">노출 중</p>
          </Card>

          {/* 연결된 박물관 (Purple) */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{connectedMuseums}</span>
            </div>
            <p className="text-sm font-medium text-purple-700">연결된 박물관</p>
          </Card>

          {/* 총 조회수 (Orange) */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">{totalViews.toLocaleString()}</span>
            </div>
            <p className="text-sm font-medium text-orange-700">총 조회수</p>
          </Card>
        </div>

        {/* 필터 섹션 */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* 첫 번째 줄: 검색 및 필터 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="작품명/작가명 검색..."
                  className="pl-10"
                />
              </div>

              <Select value={selectedMuseum} onValueChange={setSelectedMuseum}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 박물관" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 박물관</SelectItem>
                  {museums.map((museum) => (
                    <SelectItem key={museum} value={museum}>
                      {museum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 시대" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 시대</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">노출 중</SelectItem>
                  <SelectItem value="inactive">비노출</SelectItem>
                  <SelectItem value="pending">검토 중</SelectItem>
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
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                일괄 업로드
              </Button>
            </div>
          </div>
        </Card>

        {/* 작품 목록 테이블 */}
        <Card className="overflow-hidden mb-6">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">작품이 없습니다.</p>
              <Button
                onClick={() => router.push('/admin/content/museum-artworks/new')}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 작품 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      이미지
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작품명
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      작가
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      박물관
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      시대
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      스타일
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      조회수
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
                  {filteredArtworks.map((artwork) => (
                    <tr key={artwork.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                          {artwork.imageUrl ? (
                            <Image
                              src={artwork.imageUrl}
                              alt={artwork.nameKr}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{artwork.nameKr}</p>
                          <p className="text-sm text-gray-500">{artwork.nameEn}</p>
                          <p className="text-xs font-mono text-gray-400 mt-1">
                            ID: {artwork.id.substring(0, 8)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{artwork.artist}</p>
                          {artwork.artistEn && (
                            <p className="text-sm text-gray-500">{artwork.artistEn}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/admin/content/museums/${artwork.museumId}`)}
                          className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
                        >
                          {artwork.museumName || artwork.museumId}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            periodColors[artwork.period] || 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {artwork.period}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            styleColors[artwork.style] || 'bg-sky-100 text-sky-700 border-sky-200'
                          }`}
                        >
                          {artwork.style}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {(artwork.viewCount || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {artwork.status === 'active' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[artwork.status]
                            }`}
                          >
                            {statusLabels[artwork.status]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/content/museum-artworks/${artwork.id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/content/museum-artworks/${artwork.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(artwork.id)}
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

        {/* 하단 관리 가이드 */}
        <Card className="p-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-purple-900 mb-3">📋 박물관 작품 관리 가이드</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    <strong>박물관 연결 필수:</strong> 모든 작품은 반드시 특정 박물관에 귀속되어야 합니다. museumId는 필수 입력 항목입니다.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    <strong>고해상도 이미지 권장:</strong> 작품 이미지는 최소 1200x800px 이상의 고해상도로 업로드해 주세요.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    <strong>메타데이터 정확성:</strong> 작가명, 제작 시대, 스타일은 가이드북 자동 추천에 활용되므로 정확하게 입력하세요.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    <strong>상태 관리:</strong> '노출 중' 상태의 작품만 사용자 앱에 표시되며, '검토 중'은 관리자 승인 대기 상태입니다.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 하단 정보 */}
        {filteredArtworks.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 text-center">
            총 <span className="font-bold text-purple-600">{filteredArtworks.length}</span>개의 작품이 표시되고 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
