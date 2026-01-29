'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Palette, Plus, Search, X, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Artwork {
  id: string;
  nameKr: string;
  nameEn: string;
  artist: string;
  year?: string;
  thumbnailUrl?: string;
}

interface ArtworkConnectionSectionProps {
  connectedArtworkIds: string[];
  onArtworkAdd: (artworkId: string) => void;
  onArtworkRemove: (artworkId: string) => void;
}

export default function ArtworkConnectionSection({
  connectedArtworkIds,
  onArtworkAdd,
  onArtworkRemove,
}: ArtworkConnectionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [connectedArtworks, setConnectedArtworks] = useState<Artwork[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      loadArtworks();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (connectedArtworkIds.length > 0) {
      loadConnectedArtworks();
    }
  }, [connectedArtworkIds]);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const artworksRef = collection(db, 'museum_artworks');
      const snapshot = await getDocs(artworksRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Artwork[];
      setArtworks(data);
    } catch (error) {
      console.error('작품 목록 로드 실패:', error);
      toast.error('작품 목록을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectedArtworks = async () => {
    try {
      const artworksRef = collection(db, 'museum_artworks');
      const snapshot = await getDocs(artworksRef);
      const data = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(artwork => connectedArtworkIds.includes(artwork.id)) as Artwork[];
      setConnectedArtworks(data);
    } catch (error) {
      console.error('연결된 작품 로드 실패:', error);
    }
  };

  const filteredArtworks = artworks.filter(artwork =>
    !connectedArtworkIds.includes(artwork.id) &&
    (artwork.nameKr.toLowerCase().includes(searchKeyword.toLowerCase()) ||
     artwork.nameEn?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
     artwork.artist?.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  const handleArtworkSelect = (artworkId: string) => {
    onArtworkAdd(artworkId);
    toast.success('작품이 연결되었습니다');
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">소장 작품 연결</h2>
            <p className="text-sm text-gray-600">박물관에 소장된 작품들을 연결하세요 (Many-to-Many)</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            작품 추가
          </Button>
        </div>

        {connectedArtworks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {connectedArtworks.map(artwork => (
              <div key={artwork.id} className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                {artwork.thumbnailUrl && (
                  <img
                    src={artwork.thumbnailUrl}
                    alt={artwork.nameKr}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{artwork.nameKr}</h4>
                  <p className="text-sm text-gray-600 truncate">{artwork.artist}</p>
                  {artwork.year && (
                    <p className="text-xs text-gray-500">{artwork.year}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onArtworkRemove(artwork.id);
                    toast.success('작품 연결이 해제되었습니다');
                  }}
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <Palette className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">연결된 작품이 없습니다</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              작품 추가하기
            </Button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <ExternalLink className="w-4 h-4" />
          <span>총 {connectedArtworkIds.length}개 작품 연결됨</span>
        </div>
      </Card>

      {/* 작품 검색 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>작품 검색 및 연결</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-auto">
            {/* 검색 */}
            <div className="relative sticky top-0 bg-white z-10 pb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="작품명, 작가명으로 검색..."
                className="pl-10"
              />
            </div>

            {/* 작품 목록 */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : filteredArtworks.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredArtworks.map(artwork => (
                  <button
                    key={artwork.id}
                    onClick={() => handleArtworkSelect(artwork.id)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left"
                  >
                    {artwork.thumbnailUrl && (
                      <img
                        src={artwork.thumbnailUrl}
                        alt={artwork.nameKr}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate text-sm">
                        {artwork.nameKr}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{artwork.artist}</p>
                      {artwork.year && (
                        <p className="text-xs text-gray-500">{artwork.year}</p>
                      )}
                    </div>
                    <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchKeyword ? '검색 결과가 없습니다' : '연결 가능한 작품이 없습니다'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
