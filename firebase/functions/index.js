// 결과 통계 집계 Cloud Functions.
//
// 데이터 모델: test_stats/<versionKey>  (versionKey = `${testId}@${version}`)
//   { testId, version, total, counts: { <resultCode>: n }, updatedAt }
//
// 쓰기는 이 함수만 가능하다(firestore.rules에서 test_stats client write 금지).
// 읽기는 공개라 mobile은 Firestore SDK로 직접 읽고, AIT는 getStats를 호출한다.
import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
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

function validateKeys(data) {
  const testId = data?.testId;
  const version = data?.version;
  const resultCode = data?.resultCode;
  if (typeof testId !== 'string' || !TEST_ID_PATTERN.test(testId)) {
    throw new HttpsError('invalid-argument', 'invalid testId');
  }
  if (!Number.isInteger(version) || version < 1) {
    throw new HttpsError('invalid-argument', 'invalid version');
  }
  if (resultCode !== undefined && (typeof resultCode !== 'string' || !RESULT_CODE_PATTERN.test(resultCode))) {
    throw new HttpsError('invalid-argument', 'invalid resultCode');
  }
  return { testId, version, resultCode };
}

// 완료 1건을 기록하고 갱신된 분포를 돌려준다.
// App Check로 정품 앱에서 온 요청만 받아 카운트 조작을 막는다.
export const recordCompletion = onCall({ enforceAppCheck: true }, async (request) => {
  const { testId, version, resultCode } = validateKeys(request.data);
  if (!resultCode) {
    throw new HttpsError('invalid-argument', 'resultCode is required');
  }

  const ref = db.collection('test_stats').doc(versionKeyOf(testId, version));
  await ref.set(
    {
      testId,
      version,
      total: FieldValue.increment(1),
      counts: { [resultCode]: FieldValue.increment(1) },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const snap = await ref.get();
  const stats = snap.data() ?? {};
  return { total: stats.total ?? 0, counts: stats.counts ?? {} };
});

// 완료 없이 분포만 조회한다(목록/상세 미리보기, Firestore SDK 없는 AIT용).
export const getStats = onCall(async (request) => {
  const { testId, version } = validateKeys(request.data);
  const snap = await db.collection('test_stats').doc(versionKeyOf(testId, version)).get();
  if (!snap.exists) {
    return { total: 0, counts: {} };
  }
  const stats = snap.data() ?? {};
  return { total: stats.total ?? 0, counts: stats.counts ?? {} };
});
