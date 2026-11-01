(function () {
  'use strict';

  const inNode = typeof window === 'undefined';
  let api;
  if (inNode) api = require('./did_you_mean.js');
  else api = window;
  const TYPE = api.TYPE;
  const results = [];

  function printResult(functionName, parameters, actual, expected) {
    results.push({
      functionName,
      parameters,
      actual: JSON.stringify(actual),
      expected: JSON.stringify(expected),
      passed: JSON.stringify(actual) === JSON.stringify(expected),
    });
  }

  function assertisJugglable(ss, expected) {
    printResult('isJugglable', ss, api.isJugglable(api.strToArr(ss)), expected);
  }

  function assertDidYouMean(ss, expected) {
    const actual = api.listupDidYouMean(api.strToArr(ss)).sort();
    printResult('listupDidYouMean', ss, actual, expected.sort());
  }

  function testIsSiteswap() {
    assertisJugglable('0', true);
    assertisJugglable('1', true);
    assertisJugglable('2', true);
    assertisJugglable('a', true);
    assertisJugglable('10', false);
    assertisJugglable('11', true);
    assertisJugglable('531', true);
    assertisJugglable('551', false);
    assertisJugglable('7441', true);
    assertisJugglable('db97531', true);
    assertisJugglable('31416', true);
    assertisJugglable('3141592', false);
    assertisJugglable('siteswap', false);
    assertisJugglable('siteawsp', true);
    assertisJugglable('sitaeswp', true);
  }

  function testDidYouMean() {
    assertDidYouMean('7351', [
      [TYPE.SWAP, [1, 3, 5, 7]],
      [TYPE.SWAP, [7, 5, 3, 1]],
      [TYPE.MOVE, [3, 5, 7, 1]],
      [TYPE.MOVE, [7, 1, 3, 5]],
      [TYPE.INSERT, [7, 3, 4, 5, 1]],
    ]);

    assertDidYouMean('siteswap', [
      [TYPE.MOVE, [28, 18, 29, 10, 14, 28, 32, 25]],
      [TYPE.SWAP, [28, 18, 29, 14, 10, 32, 28, 25]],
    ]);

    assertDidYouMean('551', [
      ['1字削除', [5, 1]],
      ['1字削除', [5, 5]],
      ['1字変更', [5, 3, 1]],
      ['1字変更', [5, 5, 2]],
      ['1字変更', [5, 6, 1]],
      ['1字挿入', [5, 1, 5, 1]],
      ['1字挿入', [5, 5, 1, 1]],
      ['1字挿入', [5, 5, 1, 5]],
      ['1字挿入', [5, 5, 5, 1]],
    ]);
  }

  function testInput() {
    for (const [input, expected] of [
      ['５５１', '551'],
      ['ＳＩＴＥＳＷＡＰ', 'siteswap'],
      ['Siteswap', 'siteswap'],
      [' ５ ５\n１　', '551'],
      ['', ''],
      ['③', '③'],
    ]) {
      printResult(
        'normalizeSiteswap',
        input,
        api.normalizeSiteswap(input),
        expected
      );
    }
    for (const input of ['?', '%', '<img>', 'あ', '５５１', null]) {
      printResult('strToArr', input, api.strToArr(input), null);
    }
    printResult('strToArr', '09az', api.strToArr('09az'), [0, 9, 10, 35]);
    printResult('strToArr', 'empty', api.strToArr(''), []);
    for (const input of [
      null,
      '',
      [],
      [NaN],
      [Infinity],
      [-1],
      [1.5],
      [undefined],
    ]) {
      printResult('isJugglable', String(input), api.isJugglable(input), false);
      printResult(
        'listupDidYouMean',
        String(input),
        api.listupDidYouMean(input),
        []
      );
    }
    printResult('arrToStr', '0,9,10,35', api.arrToStr([0, 9, 10, 35]), '09az');
    printResult('arrToStr', '36', api.arrToStr([36]), '<z+1>');
    printResult('arrToStr', 'invalid', api.arrToStr([-1]), null);
    const pattern = [5, 5, 1];
    api.listupDidYouMean(pattern);
    printResult('listupDidYouMean', '入力を変更しない', pattern, [5, 5, 1]);
  }

  function testCandidates() {
    assertDidYouMean('2', [[TYPE.INSERT, [2, 2]]]);
    const entries = [
      [TYPE.SWAP, [5, 3, 1]],
      [TYPE.MOVE, [5, 3, 1]],
      [TYPE.SWAP, [5, 3, 1]],
      [TYPE.INSERT, [36]],
      [TYPE.REMOVE, [5, 1]],
    ];
    printResult(
      'groupCandidates',
      '重複・複数の操作・表示範囲',
      api.groupCandidates(entries),
      [
        { siteswap: '51', balls: 3, methods: [TYPE.REMOVE] },
        { siteswap: '531', balls: 3, methods: [TYPE.SWAP, TYPE.MOVE] },
      ]
    );
    printResult('groupCandidates', 'empty', api.groupCandidates([]), []);
    let valid = true;
    // 独立した判定方法で、探索された候補の着地点がすべて異なることを確認。
    for (let value = 0; value < 1000; value++) {
      const input = api.strToArr(String(value).padStart(3, '0'));
      for (const [, pattern] of api.listupDidYouMean(input)) {
        const landings = pattern.map(
          (height, index) => (height + index) % pattern.length
        );
        if (
          new Set(landings).size !== pattern.length ||
          pattern.some((height) => height < 0)
        ) {
          valid = false;
        }
      }
    }
    printResult('listupDidYouMean', '000〜999の全候補の成立性', valid, true);
  }

  function testAll() {
    testIsSiteswap();
    testDidYouMean();
    testInput();
    testCandidates();
    const passed = results.filter((result) => result.passed);
    const failed = results.filter((result) => !result.passed);
    const message = passed.length + '件成功 / ' + failed.length + '件失敗';
    if (inNode) {
      console.log(message);
      for (const result of failed) console.error(result);
      if (failed.length > 0) process.exitCode = 1;
      return;
    }
    document.getElementById('PassedResult').textContent =
      passed.length + '件成功';
    document.getElementById('FailedResult').textContent =
      failed.length + '件失敗';
    document.getElementById('Notes').textContent = message;
    renderTable('PassedResultTable', passed);
    renderTable('FailedResultTable', failed);
  }

  function renderTable(id, rows) {
    const table = document.getElementById(id);
    if (rows.length === 0) return;
    const header = table.insertRow();
    for (const label of ['関数', '入力・確認内容', '結果', '期待値']) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      header.append(cell);
    }
    for (const result of rows) {
      const row = table.insertRow();
      for (const value of [
        result.functionName,
        result.parameters,
        result.actual,
        result.expected,
      ]) {
        row.insertCell().textContent = value;
      }
    }
  }

  if (inNode) testAll();
  else document.addEventListener('DOMContentLoaded', testAll);
})();
