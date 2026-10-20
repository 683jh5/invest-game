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
청소년 AI금융캠프 토 오전 '현재' 파트(70분)용. index.html을 복사해 내용만 바꾼 것이라 기존 수업(index.html)에는 영향 없음.
- 회사·뉴스 모두 수업용 가상: 반짝메모리·번개칩·톡톡·척척검색·씽씽모터스·훨훨모빌리티(하늘을 나는 자동차)·시장 전체 ETF·국채 ETF
- 뉴스 꼬리표: 발표(근거) / 소문 / AI 질문
- 4라운드 흐름: 1R 발표 뉴스 → 2R 소문 섞기 → 3R AI에게 물어보기 → 4R 반도체 급락(나눠 산 사람이 버팀)
- 강사: `camp.html#teacher`
