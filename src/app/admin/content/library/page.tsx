'use client';

import { useState, useMemo, useEffect } from 'react';
// 별칭(@/)을 사용해 경로 에러 방지
import { db } from '@/lib/firebase'; 
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { 
  Library, Search, Plus, Edit, Trash2, Copy, TrendingUp, 
  BookOpen, Shield, Link as LinkIcon, MapPin, FileText
} from 'lucide-react';
import { contentLibraryAPI, ContentObject, ContentObjectType, TYPE_NAME_MAP } from '../../../../services/contentLibraryService';

// 주인공(Default Export) 등장! 이 줄이 없으면 런타임 에러가 발생합니다.
export default function ContentLibraryPage() {
  const [contentObjects, setContentObjects] = useState<ContentObject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ContentObject, 'id' | 'createdAt'>>({
    type: 'country-story',
    typeName: '국가 스토리텔링',
    target: '',
    title: '',
    tagline: '',
    preview: '',
    keywords: [],
    referenceCount: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await contentLibraryAPI.fetchContentLibraryObjects();
      setContentObjects(data);
    } catch (error) {
      console.error('로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    const dataToSave = { ...formData, typeName: TYPE_NAME_MAP[formData.type] };
    if (editingId) await contentLibraryAPI.updateContentLibraryObject(editingId, dataToSave);
    else await contentLibraryAPI.createContentLibraryObject(dataToSave);
    setIsModalOpen(false);
    loadData();
  };

  const filteredObjects = useMemo(() => {
    return contentObjects.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          obj.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          obj.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || obj.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [contentObjects, searchQuery, typeFilter]);

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. 상단 배너 */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center gap-3 text-indigo-700 font-bold mb-4">
          <TrendingUp className="w-5 h-5" />
          <span>객체 중심의 모듈형 콘텐츠 관리 (Object-Oriented Content Management)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-white p-4 rounded-lg border border-indigo-50 shadow-sm">
            <p className="font-bold text-indigo-900 mb-1">스토리텔링 객체</p>
            <p className="text-indigo-600">국가/도시 개요, Tagline, 핵심 키워드</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-indigo-50 shadow-sm">
            <p className="font-bold text-indigo-900 mb-1">실용 정보 객체</p>
            <p className="text-indigo-600">금융, 긴급연락처, 행정, 교통 개요</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-indigo-50 shadow-sm">
            <p className="font-bold text-indigo-900 mb-1">데이터 정합성 보장</p>
            <p className="text-indigo-600">라이브러리 1곳 수정 → 모든 페이지 반영</p>
          </div>
        </div>
      </div>

      {/* 2. 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-zinc-500">전체 객체</p>
            <h3 className="text-2xl font-bold mt-1">{contentObjects.length}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-zinc-500">스토리텔링</p>
            <h3 className="text-2xl font-bold mt-1">{contentObjects.filter(o => o.type.includes('story')).length}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-zinc-500">실용 정보</p>
            <h3 className="text-2xl font-bold mt-1">{contentObjects.filter(o => o.type.includes('practical')).length}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-zinc-500">총 참조</p>
            <h3 className="text-2xl font-bold mt-1">0</h3>
          </CardContent>
        </Card>
      </div>

      {/* 3. 검색 및 필터 */}
      <Card className="border-zinc-100 shadow-sm">
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input className="pl-10 bg-zinc-50 border-none" placeholder="제목, 대상, 키워드 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[220px] bg-zinc-50 border-none"><SelectValue placeholder="전체 타입" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 타입</SelectItem>
              {Object.entries(TYPE_NAME_MAP).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-black text-white hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" /> 새 객체 생성
          </Button>
        </CardContent>
      </Card>

      {/* 4. 목록 영역 */}
      <div className="space-y-4">
        {filteredObjects.map((obj) => (
          <Card key={obj.id} className="group hover:border-blue-500 transition-all border-zinc-100 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{obj.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase">{obj.typeName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {obj.target}</span>
                    <span>|</span>
                    <span>"{obj.tagline}"</span>
                  </div>
                  <div className="flex gap-2">
                    {obj.keywords?.map((kw, i) => (
                      <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">#{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => { setEditingId(obj.id); setFormData(obj); setIsModalOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => contentLibraryAPI.duplicateContentLibraryObject(obj).then(loadData)}><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if(confirm('삭제하시겠습니까?')) contentLibraryAPI.deleteContentLibraryObject(obj.id).then(loadData); }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 5. 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-zinc-50 border-b">
            <DialogTitle className="text-xl font-bold">{editingId ? '객체 수정' : '새 객체 생성'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">콘텐츠 타입</label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="bg-zinc-50 border-none h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_NAME_MAP).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">대상 국가/도시</label>
                <Input value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} className="bg-zinc-50 border-none h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">제목</label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-zinc-50 border-none h-12 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">한 줄 설명</label>
              <Input value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} className="bg-zinc-50 border-none h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">키워드 (쉼표 구분)</label>
              <Input 
                value={formData.keywords.join(', ')} 
                onChange={(e) => setFormData({...formData, keywords: e.target.value.split(',').map(s => s.trim())})} 
                placeholder="예: 예술, 역사, 미식" 
                className="bg-zinc-50 border-none h-12" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-zinc-50 border-t flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>취소</Button>
            <Button onClick={handleSave} className="bg-black text-white px-10 h-12">객체 저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}