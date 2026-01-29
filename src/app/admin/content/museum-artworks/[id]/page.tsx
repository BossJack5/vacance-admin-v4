'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Palette, 
  Upload, 
  X, 
  Image as ImageIcon,
  MapPin,
  Phone,
  Lightbulb,
  Building2,
  User,
  Calendar,
  Ruler,
  FileText,
  Trash2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Museum {
  id: string;
  nameKr: string;
  nameEn?: string;
}

export default function EditMuseumArtworkPage() {
  const router = useRouter();
  const params = useParams();
  const artworkId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [museums, setMuseums] = useState<Museum[]>([]);

  // 소속 박물관
  const [selectedMuseumId, setSelectedMuseumId] = useState('');

  // 작품 기본 정보
  const [artworkNameKr, setArtworkNameKr] = useState('');
  const [artworkNameEn, setArtworkNameEn] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');

  // 대표 이미지
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');

  // 박물관 내 위치 정보
  const [floor, setFloor] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [audioGuideNumber, setAudioGuideNumber] = useState('');

  // 추가 이미지
  const [additionalImages, setAdditionalImages] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    loadMuseums();
    loadArtwork();
  }, [artworkId]);

  const loadMuseums = async () => {
    try {
      const museumsRef = collection(db, 'museums');
      const snapshot = await getDocs(museumsRef);
      const museumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        nameKr: doc.data().nameKr || '',
        nameEn: doc.data().nameEn || ''
      })) as Museum[];
      setMuseums(museumsData);
    } catch (error) {
      console.error('박물관 목록 로드 실패:', error);
    }
  };

  const loadArtwork = async () => {
    setLoading(true);
    try {
      const artworkRef = doc(db, 'museum_artworks', artworkId);
      const artworkSnap = await getDoc(artworkRef);

      if (artworkSnap.exists()) {
        const data = artworkSnap.data();
        setSelectedMuseumId(data.museumId || '');
        setArtworkNameKr(data.nameKr || '');
        setArtworkNameEn(data.nameEn || '');
        setArtist(data.artist || '');
        setYear(data.year?.toString() || '');
        setMaterial(data.material || '');
        setDimensions(data.dimensions || '');
        setDescription(data.description || '');
        setMainImagePreview(data.thumbnailUrl || '');
        setFloor(data.floor || '');
        setRoomNumber(data.roomNumber || '');
        setAudioGuideNumber(data.audioGuideNumber || '');
        
        const additional = data.additionalImages || [];
        setAdditionalImages([
          additional[0] || '',
          additional[1] || '',
          additional[2] || '',
          additional[3] || '',
          additional[4] || ''
        ]);
      } else {
        toast.error('작품을 찾을 수 없습니다');
        router.push('/admin/content/museum-artworks');
      }
    } catch (error) {
      console.error('작품 로드 실패:', error);
      toast.error('작품 정보를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMainImage(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview('');
  };

  const updateAdditionalImage = (index: number, value: string) => {
    const updated = [...additionalImages];
    updated[index] = value;
    setAdditionalImages(updated);
  };

  const handleSave = async () => {
    if (!artworkNameKr || !artist || !selectedMuseumId || !year) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      const artworkRef = doc(db, 'museum_artworks', artworkId);
      const updateData = {
        museumId: selectedMuseumId,
        nameKr: artworkNameKr,
        nameEn: artworkNameEn,
        artist,
        year: parseInt(year) || null,
        material,
        dimensions,
        description,
        thumbnailUrl: mainImagePreview || '',
        additionalImages: additionalImages.filter(url => url.trim() !== ''),
        floor,
        roomNumber,
        audioGuideNumber,
        updatedAt: serverTimestamp()
      };

      await updateDoc(artworkRef, updateData);
      toast.success('작품이 성공적으로 수정되었습니다');
      router.push('/admin/content/museum-artworks');
    } catch (error) {
      console.error('작품 수정 실패:', error);
      toast.error('작품 수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 작품을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'museum_artworks', artworkId));
      toast.success('작품이 삭제되었습니다');
      router.push('/admin/content/museum-artworks');
    } catch (error) {
      console.error('작품 삭제 실패:', error);
      toast.error('작품 삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">작품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
      {/* 헤더 */}
      <div className="max-w-5xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>

        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <Palette className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">박물관 작품 수정</h1>
              <p className="text-purple-100">작품 정보를 수정하고 관리합니다</p>
            </div>
          </div>

          <div className="bg-yellow-400 text-gray-900 rounded-lg p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">필수 입력 항목 안내</p>
              <p className="text-sm">작품명, 작가, 연결할 박물관, 제작연도는 반드시 입력해야 합니다.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            {deleting ? (
              <>삭제 중...</>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                작품 삭제
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>처리 중...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                변경사항 저장
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* 소속 박물관 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">소속 박물관</h2>
              <p className="text-sm text-gray-600">작품이 소장된 박물관을 선택하세요</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              박물관 선택 <span className="text-red-500">*</span>
            </label>
            <Select value={selectedMuseumId} onValueChange={setSelectedMuseumId}>
              <SelectTrigger>
                <SelectValue placeholder="박물관을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {museums.map(museum => (
                  <SelectItem key={museum.id} value={museum.id}>
                    {museum.nameKr} {museum.nameEn && `(${museum.nameEn})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* 작품 기본 정보 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">작품 기본 정보</h2>
              <p className="text-sm text-gray-600">작품의 상세 정보를 입력하세요</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  작품명 (한글) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={artworkNameKr}
                  onChange={(e) => setArtworkNameKr(e.target.value)}
                  placeholder="예: 모나리자"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  작품명 (영문)
                </label>
                <Input
                  value={artworkNameEn}
                  onChange={(e) => setArtworkNameEn(e.target.value)}
                  placeholder="예: Mona Lisa"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  작가 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="예: 레오나르도 다 빈치"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  제작 연도 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="예: 1503"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  재료
                </label>
                <Input
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="예: 캔버스에 유채"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Ruler className="w-4 h-4" />
                  규격
                </label>
                <Input
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="예: 77 × 53 cm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                작품 설명
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="작품의 역사적 배경, 특징, 의미 등을 상세히 입력하세요"
                className="min-h-[150px]"
              />
            </div>
          </div>
        </Card>

        {/* 작품 대표 이미지 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">작품 대표 이미지</h2>
              <p className="text-sm text-gray-600">드래그 앤 드롭 또는 클릭하여 이미지를 업로드하세요</p>
            </div>
          </div>

          {!mainImagePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-pink-100 rounded-full">
                  <Upload className="w-12 h-12 text-pink-600" />
                </div>
                {isDragActive ? (
                  <p className="text-lg font-semibold text-pink-600">이미지를 여기에 놓아주세요</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-700">
                      이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, WEBP (최대 5MB) • 정사각형 비율 권장
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={mainImagePreview}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={removeMainImage}
                className="absolute top-4 right-4 bg-white hover:bg-red-50"
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </Card>

        {/* 박물관 내 위치 정보 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">박물관 내 위치 정보</h2>
              <p className="text-sm text-gray-600">방문객이 작품을 찾을 수 있도록 위치를 입력하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                층 (Floor)
              </label>
              <Input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="예: 2F"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                방 번호 (Room Number)
              </label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="예: 711"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                오디오 가이드 번호
              </label>
              <Input
                value={audioGuideNumber}
                onChange={(e) => setAudioGuideNumber(e.target.value)}
                placeholder="예: #042"
              />
            </div>
          </div>
        </Card>

        {/* 추가 이미지 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">추가 이미지</h2>
              <p className="text-sm text-gray-600">다양한 각도의 작품 이미지를 최대 5장까지 등록할 수 있습니다</p>
            </div>
          </div>

          <div className="space-y-3">
            {additionalImages.map((url, index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이미지 {index + 1}
                </label>
                <Input
                  value={url}
                  onChange={(e) => updateAdditionalImage(index, e.target.value)}
                  placeholder="이미지 URL을 입력하세요"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 하단 버튼 */}
        <div className="flex justify-between pb-8">
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            {deleting ? (
              <>삭제 중...</>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                작품 삭제
              </>
            )}
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>처리 중...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  변경사항 저장
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
