var passedCount = 0;
var failedCount = 0;
var passedTable;
var failedTable;

Array.prototype.equals = function(arr) {
  if (arr instanceof Array) {
    if (this.length != arr.length) {
      return false;
    }
    let f = true;
    for (let i = 0; i < this.length; ++i) {
      if (this[i] instanceof Array) {
        f = this[i].equals(arr[i]);
      } else {
        f = this[i] == arr[i];
      }
      if (f == false) break;
    }
    return f;
  } else {
    return false;
  }
};

Array.prototype.ToStr = function() {
  let str = '[';
  for (let i = 0; i < this.length; ++i) {
    if (this[i] instanceof Array) {
      str += this[i].ToStr();
    } else {
      if (typeof(this[i]) == 'string') {
        str += '"' + this[i] + '"';
      } else {
        str += this[i];
      }
    }
    if (i != this.length - 1) str += ',';
  }
  str += ']';
  return str;
};

function PrintResult(functionName, parameters, actual, expected) {
  if (actual === expected) {
    passedCount++;
    var row = passedTable.insertRow();
    row.insertCell().appendChild(document.createTextNode(functionName));
    row.insertCell().appendChild(document.createTextNode(parameters));
    row.insertCell().appendChild(document.createTextNode(actual));
  } else {
    failedCount++;
    var row = failedTable.insertRow();
    row.insertCell().appendChild(document.createTextNode(functionName));
    row.insertCell().appendChild(document.createTextNode(parameters));
    row.insertCell().appendChild(document.createTextNode(actual));
    row.insertCell().appendChild(document.createTextNode(expected));
  }
}

function assertIsJugglable(SS, exp) {
  const actual = IsJugglable(StrToArr(SS));
  PrintResult('IsJugglable', 'StrToArr("' + SS + '")', actual, exp);
}

function assertDidYouMean(SS, exp) {
  //console.log('.');
  //console.assert(actual.equals(expected), '\nact: ' + actual.ToStr() + '\nexp: ' + expected.ToStr());

  const actual		= ListupDidYouMean(StrToArr(SS)).sort().ToStr();
  const expected	= exp.sort().ToStr();
  PrintResult('ListupDidYouMean', 'StrToArr("' + SS + '")', actual, expected);
}

function TestIsSiteswap() {
  assertIsJugglable('0', true);
  assertIsJugglable('1', true);
  assertIsJugglable('2', true);
  assertIsJugglable('a', true);
  assertIsJugglable('10', false);
  assertIsJugglable('11', true);
  assertIsJugglable('531', true);
  assertIsJugglable('551', false);
  assertIsJugglable('7441', true);
  assertIsJugglable('db97531', true);
  assertIsJugglable('31416', true);
  assertIsJugglable('3141592', false);
  assertIsJugglable('siteswap', false);
  assertIsJugglable('siteawsp', true);
  assertIsJugglable('sitaeswp', true);
}

function TestDidYouMean() {
  assertDidYouMean('7351', [[TYPE.SWAP, [1, 3, 5, 7]], [TYPE.SWAP, [7, 5, 3, 1]], [TYPE.MOVE, [3, 5, 7, 1]], [TYPE.MOVE, [7, 1, 3, 5]], [TYPE.INSERT, [7, 3, 4, 5, 1]]]);
  assertDidYouMean('siteswap', [[TYPE.MOVE, [28, 18, 29, 10, 14, 28, 32, 25]], [TYPE.SWAP, [28, 18, 29, 14, 10, 32, 28, 25]]]);
  assertDidYouMean('551', [['1字削除', [5, 1]], ['1字削除', [5, 5]], ['1字変更', [5, 3, 1]], ['1字変更', [5, 5, 2]], ['1字変更', [5, 6, 1]], ['1字追加', [5, 1, 5, 1]], ['1字追加', [5, 5, 1, 1]], ['1字追加', [5, 5, 1, 5]], ['1字追加', [5, 5, 5, 1]]]);
}

function TestAll() {
  passedTable = document.getElementById('PassedResultTable');
  var row = passedTable.insertRow();
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Function'));	row.appendChild(thObj);
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Parameter'));	row.appendChild(thObj);
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Return'));	row.appendChild(thObj);

  failedTable = document.getElementById('FailedResultTable');
  var row = failedTable.insertRow();
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Function'));	row.appendChild(thObj);
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Parameter'));	row.appendChild(thObj);
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Return'));	row.appendChild(thObj);
  var thObj = document.createElement('th'); thObj.appendChild(document.createTextNode('Expected'));	row.appendChild(thObj);

  TestIsSiteswap();
  TestDidYouMean();

  if (failedCount == 0) {
    var notesSpan = document.getElementById('Notes');
    notesSpan.appendChild(document.createTextNode('Passed all ' + passedCount + ' tests!'));
    failedTable.deleteRow(0);
  } else {
    const passedSpan = document.getElementById('PassedResult');
    passedSpan.appendChild(document.createTextNode('Passed ' + passedCount + ' tests.'));
    const failedSpan = document.getElementById('FailedResult');
    failedSpan.appendChild(document.createTextNode('Failed ' + failedCount + ' tests.'));
    var notesSpan = document.getElementById('Notes');
    notesSpan.appendChild(document.createTextNode('There are failed tests below.'));
  }
}
