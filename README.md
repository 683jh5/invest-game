# invest-game

## 시간상단 앱 (jangteo.html)
청소년 AI금융캠프 이틀 동안 쓰는 하나의 앱. 기존 index.html과 같은 Firebase를 쓰고, 데이터는 `classes/JT-{장터코드}`에 따로 저장돼 기존 수업 코드와 겹치지 않아요.

- 학생: `jangteo.html` → 장터 코드 + 상단 + 이름(닉네임)으로 입장
  - 탭: 장터 · 우리 상단(간판·크레딧·신용점수·대출·해금 보관함) · 테스트(사전/사후 설문, AI 윤리력) · 투자(라운드가 열렸을 때만) · 결과 카드
- 강사: `jangteo.html#teacher` → 인증코드(index.html과 같은 값)로 장터 코드 만들기
  - 탭: 시세 · 수익률 순위 · 누구 말을 믿었나 · 참가자 · 상단 관리 · 해금 · 테스트 · 투자
  - 큰 화면: 장터 / 상단 / 테스트 / 투자 보기 전환
- 연습: `jangteo.html?demo` (이 브라우저에만 저장, 탭 여러 개로 학생·강사 동시 연습)
- 링크에 코드 미리 넣기: `jangteo.html?code=AB12`

### 데이터 (classes/JT-{코드})
- `meta`: status, day, endsAt, teams, era(past/now/future), namesLocked, keys{trust,record,share,check}, challenges{c1..c4}, tests{pre,post,ethics: open|closed}, invest{status: open|closed}
- `teams/{번호}`: base, credit, score, debt, log[{t,amt,reason,kind}] (강사만 씀, base는 잠금 전 학생도 씀)
- `players/{id}`: 기존 장터 필드 + survey{pre,post:{a,b,c}}, ethics{answers,axes,types,type}, invest{상단번호:냥}, card{link,pledge}

## 캠프용 모의투자 (camp.html)
청소년 AI금융캠프 1일차 오후 '미래 기업 모의투자'(35분)용. index.html을 복사해 내용·색만 바꾼 것이라 기존 수업(index.html)에는 영향 없음.
- 색: 캠프 PPT 시안(네이비 + 주황), 글꼴 Pretendard
- 회사는 모두 수업용 가상 미래 기업, 시작가 1주 10,000원, 시작 자금 1,000만 원: 똑똑칩(AI 반도체)·하늘배송(드론 배송)·훨훨모빌리티(하늘을 나는 자동차)·초록에너지·든든헬스·냠냠푸드·미래기업 ETF·국채 ETF
- 3라운드: 1R 발표 뉴스 → 2R 소문 섞기 + AI로 확인 → 3R 반도체 급락·소문 반전(나눠 산 사람이 버팀)
- 뉴스 꼬리표: 발표 / 소문 / AI 질문
- 강사: `camp.html#teacher`

## IR Day 평가 (eval.html)
청소년 AI금융캠프 2일차 발표 평가. 강의안(261022) 198~200쪽 기준. 데이터는 `classes/EV-{평가코드}`.
- 최종 = 전문가 평균 × 60% + 다른 팀 × 40% (설정에서 비율 변경)
- 전문가: 5개 항목 100점 (문제 정의 15 · 금융투자 반영 25 · 앱 완성도 20 · 창의성·독창성 20 · 발표력 20), 팀마다 저장
- 학생: 투자 기준마다 1,000만 원씩 다른 팀에 100만 원 단위로 투자 + 칭찬 한 줄 (우리 팀은 목록에 없음, 입장 시 팀 확인)
- 기본 기준: 팀워크 · 현실 활용 가능성 · 성실함 (설정 탭에서 2~5개로 고침)
- 상호평가 = 기준별 투자 점수의 평균. 기준별 점수는 '1인당 받은 투자금'을 가장 많이 받은 팀 대비 100점으로 환산
- 운영자: `eval.html#teacher` (인증코드는 index.html과 같음) → 평가 만들기 → 코드·전문가 PIN 발급
- 큰 화면: 운영자 화면의 '큰 화면 열기' (투표 중엔 QR·진행률, 공개 시 1~3위 또는 전체 순위)
- 학생 링크: `eval.html?code=코드` · 연습: `eval.html?demo`

## 보따리 거래 강사 화면 (bottari.html)
청소년 AI금융캠프 1일차 '과거의 문 · 보따리 거래'용 프로젝터 화면. 서버 없이 이 브라우저에만 저장(localStorage).
- 상단 뽑기: 팀 수(2~12)·이름 입력 → 룰렛으로 하나씩 배정. 5개 상단을 고르게 섞어서 5팀 이하면 겹치지 않음
- 주문(목표 2종·단서) → 장터 상인표 공개(보따리 고른 뒤) → R1 결과 체크 → 조개 장터(R2) → 두 라운드 비교
- ← → 키로 단계 이동, '처음부터'로 초기화
