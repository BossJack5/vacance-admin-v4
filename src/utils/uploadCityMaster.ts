import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { cityMasterData } from '@/data/cityMasterSeedData';

/**
 * City Master 시드 데이터를 Firebase에 업로드하는 함수
 * 개발자 콘솔에서 직접 실행하거나, 테스트 페이지에서 호출 가능
 */
export async function uploadCityMasterData() {
  try {
    console.log('🚀 City Master 데이터 업로드 시작...');
    
    // 이미 데이터가 있는지 확인
    const snapshot = await getDocs(collection(db, 'cities'));
    if (snapshot.size > 0) {
      console.log(`⚠️ cities 컬렉션에 이미 ${snapshot.size}개의 문서가 존재합니다.`);
      const confirmed = confirm('기존 데이터가 있습니다. 추가로 업로드하시겠습니까?');
      if (!confirmed) {
        console.log('❌ 업로드 취소됨');
        return { success: false, message: '사용자가 취소함' };
      }
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const cityData of cityMasterData) {
      try {
        await addDoc(collection(db, 'cities'), cityData);
        successCount++;
        console.log(`✅ ${cityData.nameKr} (${cityData.cityCode}) 업로드 완료`);
      } catch (error) {
        errorCount++;
        console.error(`❌ ${cityData.nameKr} 업로드 실패:`, error);
      }
    }
    
    console.log(`\n✨ 업로드 완료!`);
    console.log(`성공: ${successCount}개, 실패: ${errorCount}개`);
    
    return {
      success: true,
      successCount,
      errorCount,
      total: cityMasterData.length,
    };
  } catch (error) {
    console.error('City Master 데이터 업로드 중 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
