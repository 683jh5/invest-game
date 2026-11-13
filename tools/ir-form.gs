/**
 * IR Day 평가 · 구글폼 자동 만들기
 *
 * 사용법
 * 1) script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기
 * 2) 아래 TEAMS에 팀 이름 입력 (현장에서 앱 ⚙ 설정으로도 바꿀 수 있음)
 * 3) 위쪽 함수 선택에서 makeIRForm 선택 → ▶ 실행 → 권한 허용
 * 4) 실행 로그에 나온 "앱 링크"를 복사 → 이 링크(또는 QR)로 평가
 *
 * 만들어지는 것: 구글폼 1개 + 결과 시트 1개(응답 시트 + '결과' 탭)
 */

const TITLE = 'IR Day 평가';
const TEAMS = ['1팀', '2팀', '3팀', '4팀'];
const EXPERT_WEIGHT = 0.6; // 전문가 60% · 학생 40%
const APP_URL = 'https://683jh5.github.io/invest-game/ir.html';

const CRITERIA = [
  ['문제 정의', '해결하려는 문제가 분명한가'],
  ['금융 이해도', '금융 개념이 서비스에 잘 담겼는가'],
  ['서비스 완성도', '앱이 실제로 작동하는가'],
  ['창의성', '아이디어가 새로운가'],
  ['발표력', '내용을 잘 전달했는가'],
];

function makeIRForm() {
  // 1. 폼
  const form = FormApp.create(TITLE);
  form.setDescription('IR Day 평가 앱에서 보낸 점수가 모이는 폼입니다. 폼을 직접 작성하지 않아도 됩니다.');
  try { form.setRequireLogin(false); } catch (e) {}           // 회사 계정: 로그인 없이 제출
  try { form.setCollectEmail(false); } catch (e) {}

  const qRole = form.addMultipleChoiceItem().setTitle('구분').setChoiceValues(['전문가', '학생']);
  const qWho = form.addTextItem().setTitle('평가자');
  const qTeam = form.addTextItem().setTitle('평가 팀');
  const qScores = CRITERIA.map(c =>
    form.addScaleItem().setTitle(c[0]).setHelpText(c[1]).setBounds(1, 5));
  const qNote = form.addParagraphTextItem().setTitle('한마디');

  try { form.setPublished(true); } catch (e) {}                // 2025년 이후 폼 게시 설정

  // 2. 앱이 쓸 문항 번호(entry ID) 뽑기
  const entryOf = r => form.createResponse().withItemResponse(r).toPrefilledUrl().match(/entry\.(\d+)=/)[1];
  const ids = [
    entryOf(qRole.createResponse('전문가')),
    entryOf(qWho.createResponse('x')),
    entryOf(qTeam.createResponse('x')),
    ...qScores.map(q => entryOf(q.createResponse(1))),
    entryOf(qNote.createResponse('x')),
  ];
  const formKey = form.getPublishedUrl().match(/\/d\/e\/([^/]+)\//)[1];

  // 3. 결과 시트
  const ss = SpreadsheetApp.create(TITLE + ' 결과');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  let resp = null;
  for (let i = 0; i < 10 && !resp; i++) {
    resp = SpreadsheetApp.openById(ss.getId()).getSheets().find(s => s.getFormUrl());
    if (!resp) Utilities.sleep(1000);
  }
  const book = SpreadsheetApp.openById(ss.getId());
  const res = book.getSheets().find(s => !s.getFormUrl()) || book.insertSheet();
  res.setName('결과');
  const R = "'" + resp.getName() + "'!";
  const col = c => R + '$' + c + '$2:$' + c;
  const sum = '(' + ['E', 'F', 'G', 'H', 'I'].map(col).join('+') + ')';

  res.getRange('A1:G1').setValues([['팀', '전문가 점수', '전문가 수', '학생 점수', '학생 수', '최종 점수', '순위']])
    .setFontWeight('bold').setBackground('#1b2a4a').setFontColor('#ffffff');
  res.getRange('A2').setFormula('=IFERROR(SORT(UNIQUE(FILTER(' + col('D') + ',' + col('D') + '<>""))),"")');
  for (let r = 2; r <= 21; r++) {
    const avg = who => '=IF($A' + r + '="","",IFERROR(ROUND(SUMPRODUCT((' + col('D') + '=$A' + r + ')*(' + col('B') + '="' + who + '")*' + sum + ')*4/' + (who === '전문가' ? 'C' : 'E') + r + ',1),"-"))';
    const cnt = who => '=IF($A' + r + '="","",COUNTIFS(' + col('D') + ',$A' + r + ',' + col('B') + ',"' + who + '"))';
    res.getRange('B' + r).setFormula(avg('전문가'));
    res.getRange('C' + r).setFormula(cnt('전문가'));
    res.getRange('D' + r).setFormula(avg('학생'));
    res.getRange('E' + r).setFormula(cnt('학생'));
    res.getRange('F' + r).setFormula('=IF($A' + r + '="","",IF(AND(C' + r + '>0,E' + r + '>0),ROUND(B' + r + '*$J$1+D' + r + '*(1-$J$1),1),IF(C' + r + '>0,B' + r + ',IF(E' + r + '>0,D' + r + ',"-"))))');
    res.getRange('G' + r).setFormula('=IF(OR($A' + r + '="",NOT(ISNUMBER(F' + r + '))),"",RANK(F' + r + ',$F$2:$F$21))');
  }
  res.getRange('I1:J1').setValues([['전문가 비율', EXPERT_WEIGHT]]);
  res.getRange('I2').setValue('점수는 100점 만점 (5개 항목 × 5점 × 4)');
  res.setColumnWidth(1, 140);
  res.setFrozenRows(1);
  book.setActiveSheet(res);
  book.moveActiveSheet(1);

  // 4. 앱 링크
  const link = APP_URL + '#f=' + formKey + '&e=' + ids.join(',') + '&t=' + encodeURIComponent(TEAMS.join(','));
  res.getRange('I4:J4').setValues([['앱 링크', link]]);
  res.getRange('I5:J5').setValues([['폼 수정', form.getEditUrl()]]);

  Logger.log('앱 링크: ' + link);
  Logger.log('결과 시트: ' + book.getUrl());
  Logger.log('폼 수정: ' + form.getEditUrl());
}
