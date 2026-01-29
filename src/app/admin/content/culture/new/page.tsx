'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

import TagInputSection from '@/components/admin/content/cultural/TagInputSection';
import CitySearchSection from '@/components/admin/content/cultural/CitySearchSection';
import ProductConnectionSection from '@/components/admin/content/cultural/ProductConnectionSection';
import DetailListSection from '@/components/admin/content/cultural/DetailListSection';
import ImageUploader from '@/components/admin/ImageUploader';

interface ListItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function NewCulturalSpecialPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // 기본 메타데이터
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [relatedCities, setRelatedCities] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [thumbnailUrl, setThumbnailUrl] = useState<string[]>([]);

  // 4개의 상세 정보 에디터
  const [historyOrigin, setHistoryOrigin] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  const [symbolism, setSymbolism] = useState('');
  const [generalDescription, setGeneralDescription] = useState('');

  // 실무 이용 가이드
  const [usageTips, setUsageTips] = useState<ListItem[]>([]);
  const [transportInfo, setTransportInfo] = useState('');
  const [alternativeInfo, setAlternativeInfo] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bestVisitTime, setBestVisitTime] = useState('');

  // 리스트형 데이터
  const [detailItems, setDetailItems] = useState<ListItem[]>([]);

  // 연결 상품
  const [connectedProductIds, setConnectedProductIds] = useState<string[]>([]);

  // 갤러리
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const handleSave = async () => {
    // 필수 항목 검증
    if (!title || !category) {
      toast.error('제목과 카테고리는 필수 항목입니다');
      return;
    }

    // Alex의 상품 미연결 경고
    if (connectedProductIds.length === 0) {
      toast('연결된 상품이 없습니다. 커머스 전환을 위해 상품 연결을 권장합니다.', {
        icon: '💡',
        duration: 4000,
      });
    }

    setSaving(true);
    try {
      const culturalSpecialData = {
        // 기본 메타데이터
        title,
        subtitle,
        category,
        relatedCities,
        keywords,
        status,
        thumbnailUrl: thumbnailUrl[0] || '',

        // 상세 정보 에디터
        detailInfo: {
          historyOrigin,
          technicalSpecs,
          symbolism,
          generalDescription,
        },

        // 실무 이용 가이드
        practicalGuide: {
          usageTips,
          transportInfo,
          alternativeInfo,
          priceRange,
          bestVisitTime,
        },

        // 리스트형 데이터
        detailItems,

        // 연결 상품
        connectedProductIds,
        connectedProductCount: connectedProductIds.length,

        // 갤러리
        gallery: galleryUrls,

        // 메타 정보
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'cultural-specials'), culturalSpecialData);
      toast.success('문화 스페셜이 성공적으로 등록되었습니다!');
      router.push('/admin/content/cultural-specials');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              문화 스페셜 등록
            </h1>
            <p className="text-gray-600">
              독립적인 마스터 콘텐츠로 등록되어{' '}
              <span className="font-semibold text-purple-700">매거진과 가이드북에서 재사용</span>됩니다
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {saving ? (
              <>처리 중...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* 기본 메타데이터 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                콘텐츠 제목 *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 베네치아의 곤돌라 - 800년 전통의 수상 교통수단"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">부제</label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제 또는 짧은 설명"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                <option value="역사/문화">역사/문화</option>
                <option value="예술">예술</option>
                <option value="건축">건축</option>
                <option value="전통/공예">전통/공예</option>
                <option value="음식문화">음식문화</option>
                <option value="축제/이벤트">축제/이벤트</option>
                <option value="자연/경관">자연/경관</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">발행 상태</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatus('draft')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    status === 'draft'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  초안 (Draft)
                </button>
                <button
                  onClick={() => setStatus('published')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    status === 'published'
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  발행 (Published)
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 썸네일
              </label>
              <ImageUploader
                images={thumbnailUrl}
                maxImages={1}
                onImagesChange={setThumbnailUrl}
                placeholder="대표 이미지를 업로드하거나 URL을 입력하세요"
                aspectRatio="aspect-video"
                tabName="cultural-specials"
              />
            </div>
          </div>
        </div>

        {/* 관련 도시 검색 */}
        <CitySearchSection
          selectedCities={relatedCities}
          onCitiesChange={setRelatedCities}
        />

        {/* 키워드 태그 */}
        <TagInputSection
          label="대표 키워드"
          tags={keywords}
          onTagsChange={setKeywords}
          placeholder="키워드 입력 (예: 곤돌라, 전통, 수상교통)"
          helperText="검색 및 분류를 위한 키워드를 추가하세요"
        />

        {/* 4개의 상세 정보 에디터 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">인문학적 깊이 - 상세 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유래 및 역사
              </label>
              <Textarea
                value={historyOrigin}
                onChange={(e) => setHistoryOrigin(e.target.value)}
                placeholder="역사적 배경, 유래, 발전 과정 등을 작성하세요..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기술적 제원
              </label>
              <Textarea
                value={technicalSpecs}
                onChange={(e) => setTechnicalSpecs(e.target.value)}
                placeholder="예: 곤돌라의 길이(11m), 무게(600kg), 사용되는 8종의 목재, 280개 부품 등 구체적 스펙"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상징성 설명
              </label>
              <Textarea
                value={symbolism}
                onChange={(e) => setSymbolism(e.target.value)}
                placeholder="문화적 의미, 상징성, 사회적 맥락 등을 작성하세요..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일반 상세 설명
              </label>
              <Textarea
                value={generalDescription}
                onChange={(e) => setGeneralDescription(e.target.value)}
                placeholder="전반적인 특징, 현재 상황, 추가 정보 등을 작성하세요..."
                rows={4}
              />
            </div>
          </div>

          {/* Alex의 데이터 재사용 가이드 */}
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-900">
              ℹ️ <span className="font-semibold">이 내용은 가이드북의 '심화 정보' 탭에 자동으로 노출됩니다.</span> 인문학적 깊이를 담아 작성하세요.
            </p>
          </div>
        </div>

        {/* 실무 이용 가이드 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">실무 이용 가이드</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정거장 및 노선 정보
              </label>
              <Textarea
                value={transportInfo}
                onChange={(e) => setTransportInfo(e.target.value)}
                placeholder="대중교통 접근 방법, 주요 정거장, 노선 정보 등..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대안 정보
              </label>
              <Textarea
                value={alternativeInfo}
                onChange={(e) => setAlternativeInfo(e.target.value)}
                placeholder="대체 수단, 비슷한 경험을 제공하는 옵션 등..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 범위
                </label>
                <Input
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="예: 80-100 EUR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최적 방문 시간
                </label>
                <Input
                  value={bestVisitTime}
                  onChange={(e) => setBestVisitTime(e.target.value)}
                  placeholder="예: 일몰 시간대 (17:00-19:00)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 이용 요령 팁 (동적 리스트) */}
        <DetailListSection
          title="이용 요령 팁"
          items={usageTips}
          onItemsChange={setUsageTips}
          helperText="실제 여행자에게 유용한 팁을 항목별로 추가하세요"
          guidanceNote="이 팁들은 모바일 앱에서 체크리스트 형태로 표시됩니다"
        />

        {/* 리스트형 상세 데이터 */}
        <DetailListSection
          title="상세 정보 리스트"
          items={detailItems}
          onItemsChange={setDetailItems}
          helperText="항목별 상세 정보를 구조화하여 입력하세요"
          guidanceNote="드래그하여 순서를 변경할 수 있으며, 앱에서는 이 순서대로 표시됩니다"
        />

        {/* 갤러리 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">이미지 갤러리</h2>
          <p className="text-sm text-gray-600 mb-4">
            드래그 앤 드롭으로 이미지를 업로드하거나 URL을 직접 입력할 수 있습니다
          </p>
          <ImageUploader
            images={galleryUrls}
            maxImages={20}
            onImagesChange={setGalleryUrls}
            placeholder="갤러리 이미지를 추가하세요 (최대 20장)"
            aspectRatio="aspect-video"
            tabName="cultural-specials"
          />
        </div>

        {/* 연결 상품 관리 */}
        <ProductConnectionSection
          connectedProductIds={connectedProductIds}
          onProductsChange={setConnectedProductIds}
        />
      </div>
    </div>
  );
}
