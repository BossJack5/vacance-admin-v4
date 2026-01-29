'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

import MagazineSectionEditor from '@/components/admin/content/jeudi/MagazineSectionEditor';
import AdminStatsSection from '@/components/admin/content/jeudi/AdminStatsSection';
import ContentAnalysis from '@/components/admin/content/jeudi/ContentAnalysis';
import ImageUploader from '@/components/admin/ImageUploader';

export default function NewJeudiMagazinePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // 기본 정보
  const [issue, setIssue] = useState('');
  const [mainTitle, setMainTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // 섹션 기반 구조
  const [sections, setSections] = useState<Array<any>>([]);

  // 사용자 통계
  const [stats, setStats] = useState({
    likes: 0,
    shares: 0,
    saves: 0,
    pdfDownloads: 0,
    views: 0,
  });

  const handleStatsChange = (field: string, value: number) => {
    setStats({ ...stats, [field]: value });
  };

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!issue || !mainTitle) {
      toast.error('호수, 메인 타이틀은 필수 항목입니다');
      return;
    }

    if (sections.length === 0) {
      toast.error('최소 1개 이상의 섹션을 추가해주세요');
      return;
    }

    // 각 섹션 검증
    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].countryId || !sections[i].cityId) {
        toast.error(`섹션 #${i + 1}: 국가와 도시를 선택해주세요`);
        return;
      }
    }

    setSaving(true);
    try {
      const magazineData = {
        // 기본 정보
        issue,
        mainTitle,
        thumbnailUrl: thumbnailUrl[0] || '',
        status: publishStatus,

        // 섹션 기반 콘텐츠
        sections: sections.map(section => ({
          countryId: section.countryId,
          countryName: section.countryName,
          cityId: section.cityId,
          cityName: section.cityName,
          subtitle: section.subtitle,
          blocks: section.blocks,
        })),

        // 사용자 통계
        stats,

        // 메타 정보
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'jeudi-magazine'), magazineData);
      
      if (publishStatus === 'published') {
        toast.success('매거진이 성공적으로 발행되었습니다!');
      } else {
        toast.success('임시 저장되었습니다');
      }
      
      router.push('/admin/content/jeudi-magazine');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      {/* 헤더 */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 쥬디(Jeudi) 매거진 작성</h1>
            <p className="text-gray-600">모듈형 블록 에디터로 매거진 콘텐츠를 자유롭게 구성하세요</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleSave('draft')}
              disabled={saving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              임시 저장
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {saving ? (
                <>처리 중...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  최종 발행
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2컬럼 레이아웃 (7:3) */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        {/* 좌측: 에디터 (70%) */}
        <div className="col-span-8 space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메인 타이틀 *
                </label>
                <Input
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="매거진 메인 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  호수(Issue) *
                </label>
                <Input
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="예: 2026년 1월호"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 썸네일
                </label>
                <ImageUploader
                  images={thumbnailUrl}
                  maxImages={1}
                  onImagesChange={setThumbnailUrl}
                  placeholder="대표 이미지를 업로드하거나 URL을 입력하세요"
                  aspectRatio="aspect-video"
                  tabName="jeudi-magazine"
                />
              </div>
            </div>
          </div>

          {/* 섹션 에디터 */}
          <MagazineSectionEditor
            sections={sections}
            onSectionsChange={setSections}
          />
        </div>

        {/* 우측: 통계 및 분석 (30%) */}
        <div className="col-span-4 space-y-6">
          {/* 콘텐츠 분석 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">콘텐츠 분석</h3>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {sections.length}
                </div>
                <div className="text-sm text-gray-600">총 섹션 수</div>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <div className="text-2xl font-bold text-indigo-700 mb-1">
                  {sections.reduce((acc, section) => acc + section.blocks.length, 0)}
                </div>
                <div className="text-sm text-gray-600">총 블록 수</div>
              </div>
            </div>
          </div>

          {/* 사용자 통계 */}
          <AdminStatsSection
            likes={stats.likes}
            shares={stats.shares}
            saves={stats.saves}
            pdfDownloads={stats.pdfDownloads}
            views={stats.views}
            onStatsChange={handleStatsChange}
          />

          {/* 가이드 박스 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">💡 작성 가이드</h3>
            <ul className="space-y-1 text-xs text-amber-800">
              <li>• 섹션별로 국가/도시 선택</li>
              <li>• 블록 순서는 상/하 화살표로 조정</li>
              <li>• 이미지는 드래그 앤 드롭으로 업로드</li>
              <li>• 임시 저장으로 작업 보관 가능</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
