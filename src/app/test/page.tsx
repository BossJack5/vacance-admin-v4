'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadCityMasterData } from '@/utils/uploadCityMaster';
import { Database, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const result = await uploadCityMasterData();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Database className="w-8 h-8 text-indigo-600" />
          개발자 도구
        </h1>

        <Card className="p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            City Master 데이터 업로드
          </h2>
          
          <p className="text-sm text-gray-600 mb-6">
            cityMasterSeedData.ts 파일의 시드 데이터를 Firebase의 cityMaster 컬렉션에 업로드합니다.
          </p>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                City Master 데이터 업로드
              </>
            )}
          </Button>

          {uploadResult && (
            <div className={`mt-6 p-4 rounded-lg border ${
              uploadResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {uploadResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">업로드 완료!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">업로드 실패</span>
                  </>
                )}
              </div>

              {uploadResult.success ? (
                <div className="text-sm text-green-800">
                  <p>총 {uploadResult.total}개 중 {uploadResult.successCount}개 성공</p>
                  {uploadResult.errorCount > 0 && (
                    <p className="text-red-600 mt-1">실패: {uploadResult.errorCount}개</p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-800">
                  <p>오류: {uploadResult.error || uploadResult.message || '알 수 없는 오류'}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 참고:</span> 이미 데이터가 있는 경우, 
              확인 메시지가 표시됩니다. 중복 업로드에 주의하세요.
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          개발자 전용 페이지 - 프로덕션에서는 제거 필요
        </div>
      </div>
    </div>
  );
}