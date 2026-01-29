'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Book, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Edit, 
  Trash2,
  Globe,
  Map,
  MapPin,
  Star,
  ArrowRight,
  BarChart3,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface Guidebook {
  id: string;
  titleKr: string;
  titleEn: string;
  cityName: string;
  region: string;
  guideType: string;
  createdAt: any;
  modules: {
    l1?: number; // 국가/도시 모듈 수
    l2?: number; // 실용 정보 모듈 수
    l3?: number; // 장소 모듈 수
    l4?: number; // 스페셜/코스 모듈 수
  };
  downloads: number;
  views: number;
}

export default function GuidebooksPage() {
  const router = useRouter();
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');

  // Firestore에서 가이드북 목록 로드
  useEffect(() => {
    const loadGuidebooks = async () => {
      try {
        console.log('[가이드북 목록] 로딩 시작...');
        const guidebooksRef = collection(db, 'guidebooks');
        const q = query(guidebooksRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        console.log('[가이드북 목록] Firestore 결과:', snapshot.size, '개 문서');
        
        const data: Guidebook[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Guidebook[];
        
        console.log('[가이드북 목록] 파싱된 데이터:', data.length, '개');
        console.log('[가이드북 목록] 첫 번째 항목:', data[0]);
        
        setGuidebooks(data);
      } catch (error) {
        console.error('[가이드북 목록] 로딩 실패:', error);
        toast.error('가이드북 목록을 불러오는데 실패했습니다.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGuidebooks();
  }, []);

  // 통계 계산
  const totalGuidebooks = guidebooks.length;
  const totalDownloads = guidebooks.reduce((sum, gb) => sum + gb.downloads, 0);
  const totalViews = guidebooks.reduce((sum, gb) => sum + gb.views, 0);
  const avgModules = guidebooks.length > 0
    ? Math.round(
        guidebooks.reduce(
          (sum, gb) => sum + (gb.modules.l1 || 0) + (gb.modules.l2 || 0) + (gb.modules.l3 || 0) + (gb.modules.l4 || 0),
          0
        ) / guidebooks.length
      )
    : 0;

  // 필터링된 가이드북
  const filteredGuidebooks = guidebooks.filter((gb) => {
    const matchesSearch = gb.titleKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gb.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || gb.cityName === cityFilter;
    const matchesTemplate = templateFilter === 'all' || gb.guideType === templateFilter;
    return matchesSearch && matchesCity && matchesTemplate;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('이 가이드북을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'guidebooks', id));
      setGuidebooks(guidebooks.filter((gb) => gb.id !== id));
      toast.success('가이드북이 삭제되었습니다.');
    } catch (error) {
      console.error('가이드북 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      // TODO: PDF 다운로드 로직
      toast.success('PDF 다운로드를 시작합니다.');
    } catch (error) {
      toast.error('PDF 다운로드에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Book className="w-8 h-8 text-indigo-600" />
            가이드북 모듈형 조립 관리
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            L1~L4 모듈을 조합하여 맞춤형 여행 가이드북을 생성하세요
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/content/guidebooks/new')}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 가이드북 조립
        </Button>
      </div>

      {/* 아키텍처 시각화 */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          모듈형 조립 아키텍처 (Modular Assembly Architecture)
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {/* L1 */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-600">L1</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">국가/도시 모듈</h3>
            <p className="text-xs text-gray-600">국가 개요, 도시 개요</p>
          </div>

          {/* L2 */}
          <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs font-bold text-green-600">L2</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">실용 정보 모듈</h3>
            <p className="text-xs text-gray-600">비자, 환율, 교통패스</p>
          </div>

          {/* L3 */}
          <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-purple-600">L3</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">장소 모듈</h3>
            <p className="text-xs text-gray-600">명소, 레스토랑 등</p>
          </div>

          {/* L4 */}
          <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs font-bold text-orange-600">L4</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">스페셜/코스 모듈</h3>
            <p className="text-xs text-gray-600">특별 가이드, 익스프레스</p>
          </div>
        </div>
      </Card>

      {/* 통계 대시보드 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-2">
            <Book className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalGuidebooks}</span>
          </div>
          <p className="text-sm font-medium text-blue-700">전체 가이드북</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between mb-2">
            <Download className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalDownloads.toLocaleString()}</span>
          </div>
          <p className="text-sm font-medium text-green-700">총 다운로드 (PDF)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalViews.toLocaleString()}</span>
          </div>
          <p className="text-sm font-medium text-purple-700">총 조회수</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{avgModules}</span>
          </div>
          <p className="text-sm font-medium text-orange-700">평균 모듈 수</p>
        </Card>
      </div>

      {/* 필터 섹션 */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="가이드북 제목 검색..."
              className="pl-10"
            />
          </div>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="도시 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 도시</SelectItem>
              <SelectItem value="파리">파리</SelectItem>
              <SelectItem value="도쿄">도쿄</SelectItem>
              <SelectItem value="런던">런던</SelectItem>
            </SelectContent>
          </Select>

          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="템플릿 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 템플릿</SelectItem>
              <SelectItem value="Express">Express</SelectItem>
              <SelectItem value="Specialty">Specialty</SelectItem>
              <SelectItem value="Culture">Culture</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 가이드북 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : filteredGuidebooks.length === 0 ? (
        <Card className="p-12 text-center">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">가이드북이 없습니다</p>
          <p className="text-sm text-gray-500 mb-6">새로운 가이드북을 조립하여 시작하세요</p>
          <Button onClick={() => router.push('/admin/content/guidebooks/new')}>
            <Plus className="w-4 h-4 mr-2" />
            가이드북 조립하기
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGuidebooks.map((guidebook) => (
            <Card key={guidebook.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                {/* 좌측: 가이드북 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{guidebook.titleKr}</h3>
                    <span className="text-sm text-gray-500">{guidebook.titleEn}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Map className="w-4 h-4" />
                      {guidebook.cityName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {guidebook.region}
                    </div>
                    <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {guidebook.guideType}
                    </div>
                    <span className="text-xs text-gray-400">
                      {guidebook.createdAt?.toDate ? guidebook.createdAt.toDate().toLocaleDateString('ko-KR') : '-'}
                    </span>
                  </div>

                  {/* 모듈 구성 배지 */}
                  <div className="flex items-center gap-2 mb-4">
                    {guidebook.modules.l1 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        L1 ({guidebook.modules.l1})
                      </span>
                    )}
                    {guidebook.modules.l2 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        L2 ({guidebook.modules.l2})
                      </span>
                    )}
                    {guidebook.modules.l3 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                        L3 ({guidebook.modules.l3})
                      </span>
                    )}
                    {guidebook.modules.l4 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
                        L4 ({guidebook.modules.l4})
                      </span>
                    )}
                  </div>

                  {/* 하단 통계 */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{guidebook.downloads.toLocaleString()}</span>
                      <span className="text-gray-400">다운로드</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{guidebook.views.toLocaleString()}</span>
                      <span className="text-gray-400">조회</span>
                    </div>
                  </div>
                </div>

                {/* 우측: 작업 버튼 */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownloadPDF(guidebook.id)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => router.push(`/admin/content/guidebooks/${guidebook.id}/edit`)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(guidebook.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
