// 결과 통계 집계 Cloud Functions.
//
// org 정책상 public 함수 호출(allUsers run.invoker)이 막혀, 클라이언트는 함수를 직접 호출하지 않는다.
// 대신 클라이언트가 completions/{id}에 완료 1건을 write하고, 이 firestore 트리거가
// test_stats/<versionKey>에 집계한다(트리거는 호출이 아닌 이벤트라 org 정책과 무관하다).
// 분포 read는 test_stats가 공개 read라 클라이언트가 firestore에서 직접 읽는다.
//
// 데이터 모델: test_stats/<versionKey>  (versionKey = `${testId}@${version}`)
//   { testId, version, total, counts: { <resultCode>: n }, updatedAt }
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

// 서울 사용자 기준 region. maxInstances로 폭주 시 비용을 막는다.
setGlobalOptions({ region: 'asia-northeast3', maxInstances: 10 });

const TEST_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESULT_CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function versionKeyOf(testId, version) {
  return `${testId}@${version}`;
}

// completions/{id} 생성 시 test_stats에 집계하고, 처리한 완료 문서는 삭제해 큐를 비운다.
// 잘못된 형식의 문서는 집계하지 않고 삭제만 한다(rules에서 1차 검증, 여기서 2차 검증).
export const aggregateCompletion = onDocumentCreated('completions/{completionId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    return;
  }
  const data = snap.data() ?? {};
  const { testId, version, resultCode } = data;

  const valid =
    typeof testId === 'string' &&
    TEST_ID_PATTERN.test(testId) &&
    Number.isInteger(version) &&
    version >= 1 &&
    typeof resultCode === 'string' &&
    RESULT_CODE_PATTERN.test(resultCode);

  if (valid) {
    await db.collection('test_stats').doc(versionKeyOf(testId, version)).set(
      {
        testId,
        version,
        total: FieldValue.increment(1),
        counts: { [resultCode]: FieldValue.increment(1) },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  // 집계 후 완료 문서 삭제(큐 역할, 누적 방지). 삭제 실패해도 집계 결과는 유지된다.
  await snap.ref.delete().catch(() => {});
});
