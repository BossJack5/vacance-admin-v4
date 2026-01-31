'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'restaurants', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        
        // category 필드가 없으면 name_kr에서 추측
        let category: 'restaurant' | 'cafe' | 'bar' = 'restaurant';
        if (rawData.category) {
          category = rawData.category;
        } else if (rawData.name_kr) {
          const nameLower = rawData.name_kr.toLowerCase();
          if (nameLower.includes('카페') || nameLower.includes('cafe')) {
            category = 'cafe';
          } else if (nameLower.includes('바') || nameLower.includes('bar')) {
            category = 'bar';
          }
        }
        
        setRestaurant({
          id: docSnap.id,
          ...rawData,
          nameKr: rawData.name_kr || rawData.nameKr || '',
          nameEn: rawData.name_en || rawData.nameEn || '',
          category: category,
        });
      } else {
        toast.error('레스토랑을 찾을 수 없습니다.');
        router.push('/admin/content/restaurants');
      }
    } catch (error) {
      console.error('레스토랑 로딩 실패:', error);
      toast.error('레스토랑 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 레스토랑을 삭제하시겠습니까?')) return;
    
    try {
      await deleteDoc(doc(db, 'restaurants', id));
      toast.success('레스토랑이 삭제되었습니다.');
      router.push('/admin/content/restaurants');
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/admin/content/restaurants')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.nameKr}</h1>
              {restaurant.nameEn && (
                <p className="text-lg text-gray-600 mt-1">{restaurant.nameEn}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/admin/content/restaurants/${id}/edit`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 기본 정보 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">업종</p>
                <p className="font-semibold">
                  {restaurant.category === 'restaurant' && '레스토랑'}
                  {restaurant.category === 'cafe' && '카페'}
                  {restaurant.category === 'bar' && '바'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">도시</p>
                <p className="font-semibold">{restaurant.cityId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">국가</p>
                <p className="font-semibold">{restaurant.countryId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <p className="font-semibold">{restaurant.status || '-'}</p>
              </div>
            </div>
          </Card>

          {/* 상세 정보 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">상세 정보</h2>
            <div className="space-y-4">
              {restaurant.summary && (
                <div>
                  <p className="text-sm text-gray-500">요약</p>
                  <p className="text-gray-900">{restaurant.summary}</p>
                </div>
              )}
              {restaurant.description && (
                <div>
                  <p className="text-sm text-gray-500">설명</p>
                  <p className="text-gray-900">{restaurant.description}</p>
                </div>
              )}
              {restaurant.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">주소</p>
                    <p className="text-gray-900">{restaurant.address}</p>
                  </div>
                </div>
              )}
              {restaurant.contact && (
                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">연락처</p>
                    <p className="text-gray-900">{restaurant.contact}</p>
                  </div>
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-start gap-2">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">웹사이트</p>
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {restaurant.website}
                    </a>
                  </div>
                </div>
              )}
              {restaurant.hours && (
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">영업시간</p>
                    <p className="text-gray-900">{restaurant.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 가격 및 평점 */}
          {(restaurant.priceLevel || restaurant.average_price || restaurant.michelinStars) && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">가격 및 평점</h2>
              <div className="grid grid-cols-2 gap-4">
                {restaurant.priceLevel && (
                  <div>
                    <p className="text-sm text-gray-500">가격대</p>
                    <p className="font-semibold text-lg">{'€'.repeat(restaurant.priceLevel)}</p>
                  </div>
                )}
                {restaurant.average_price && (
                  <div>
                    <p className="text-sm text-gray-500">평균 가격</p>
                    <p className="font-semibold">{restaurant.average_price}</p>
                  </div>
                )}
                {restaurant.michelinStars && restaurant.michelinStars > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">미슐랭 별</p>
                    <div className="flex items-center gap-1">
                      {[...Array(restaurant.michelinStars)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 시그니처 메뉴 */}
          {restaurant.signature_menu && restaurant.signature_menu.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">시그니처 메뉴</h2>
              <ul className="list-disc list-inside space-y-2">
                {restaurant.signature_menu.map((menu: string, index: number) => (
                  <li key={index} className="text-gray-900">{menu}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
