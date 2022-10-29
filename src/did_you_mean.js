// シンプルな(多重配列でない)配列を、cloneメソッドでコピーできるようにする。
Array.prototype.clone = function() {
  return Array.apply(null, this);
};

function ArrToStr(arr) {
  let str = '';
  for (let i = 0; i < arr.length; i++) {
    if (!(typeof arr[i] === 'number')) {
      alert('Error in ArrToStr(): arr[' + i + '] isn\'t a number. ' + arr[i]);
      return '';
    }
    if (0 <= arr[i] && arr[i] <= 9) {
      str += arr[i];
    } else if (10 <= arr[i] && arr[i] <= 35) {
      str += String.fromCharCode(('a').charCodeAt() + arr[i] - 10);
    } else if (36 <= arr[i]) {
      str += '<z+' + (arr[i] - 35) + '>';
    } else {
      alert('Error in ArrToStr(): arr[' + i + '] = ' + arr[i]);
      return '';
    }
  }
  return str;
}

function StrToArr(str) {
  const arr = new Array();
  for (let i = 0; i < str.length; i++) {
    if ('0' <= str[i] && str[i] <= '9') {
      arr.push(str[i].charCodeAt() - ('0').charCodeAt());
    } else if ('a' <= str[i] && str[i] <= 'z') {
      arr.push(str[i].charCodeAt() - ('a').charCodeAt() + 10);
    } else {
      alert('入力可能な文字は、0～9と、a～zです。');
      //alert("Error in StrToArr(): str[" + i + "] = " + str[i]);
      return '';
    }
  }
  return arr;
}

// ジャグリング可能なサイトスワップになっているか否かを判定する。※引数は文字列ではなく、数字の配列。
function IsJugglable(arr) {
  if (arr.length == 0) {
    return false;
  }
  const checkArr = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) { //負の数が入っているものは「ジャグリング不可」とする。
      return false;
    }
    const index = (arr[i] + i) % arr.length;
    if (checkArr[index] != null) {
      return false;
    } else {
      checkArr[index] = 1;
    }
  }
  return true;
}

function ave(arr) {
  let sum = 0;
  for (let i = 0, len = arr.length; i < len; ++i) {
    sum += arr[i];
  }
  return sum / arr.length;
}

const TYPE = {
  REMOVE: '1字削除',
  CHANGE: '1字変更',
  INSERT: '1字挿入',
  MOVE: '1字移動',
  SWAP: '2字交換',
};

function ListupDidYouMean(pat) {
  const ssList = new Array();

  // TODO: Dealing Mulitplex and/or Sync patterns
  let sum = 0;
  for (let i = 0, len = pat.length; i < len; i++) {
    sum += pat[i];
  }
  const average = ~~(sum / pat.length);

  (function() { // Remove one element
    // e.g. 551 => 55, 51
    for (let i = 0; i < pat.length; i++) {
      const trialPat = pat.clone();
      trialPat.splice(i, 1);
      if (IsJugglable(trialPat)) {
        ssList.push([TYPE.REMOVE, trialPat]);
      }
    }
  })();

  if (sum % pat.length == 0) {
    (function() { // Swap two elements
      // e.g. 7351 => 1357, 7531
      for (let i = 0; i < pat.length; i++) {
        for (let j = i + 1; j < pat.length; j++) {
          const trialPat = pat.clone();
          trialPat[i] = pat[j];
          trialPat[j] = pat[i];
          if (IsJugglable(trialPat)) {
            ssList.push([TYPE.SWAP, trialPat]);
          }
        }
      }
    })();
    (function() { // Move one element
      // e.g. 5371 => 7531
      for (let i = 0; i < pat.length; i++) { // move element index-i to index-j
        for (let j = 0; j < pat.length - 1; j++) {
          if (j < i - 1) {
            (function() {
              const trialPat = new Array();
              Array.prototype.push.apply(trialPat, pat.slice(0, j));
              trialPat[j] = pat[i];
              Array.prototype.push.apply(trialPat, pat.slice(j, i));
              Array.prototype.push.apply(trialPat, pat.slice(i + 1, pat.length));
              if (IsJugglable(trialPat)) {
                ssList.push([TYPE.MOVE, trialPat]);
              }
            })();
          } else if (j > i + 1) {
            (function() {
              const trialPat = new Array();
              Array.prototype.push.apply(trialPat, pat.slice(0, i));
              Array.prototype.push.apply(trialPat, pat.slice(i + 1, j + 1));
              trialPat[j] = pat[i];
              Array.prototype.push.apply(trialPat, pat.slice(j + 1, pat.length));
              if (IsJugglable(trialPat)) {
                ssList.push([TYPE.MOVE, trialPat]);
              }
            })();
          }
        }
      }
    })();
  } else {
    (function() { // Change one element
      const diff1 = (sum % pat.length); // (large -> small) e.g. 551 => 531
      const diff2 = pat.length - (sum % pat.length); // (small -> large) e.g. 551 => 561, 552
      for (let i = 0; i < pat.length; i++) {
        {
          const trialPat = pat.clone();
          trialPat[i] = pat[i] - diff1;
          if (IsJugglable(trialPat)) {
            ssList.push([TYPE.CHANGE, trialPat]);
          }
        }
        {
          const trialPat = pat.clone();
          trialPat[i] = pat[i] + diff2;
          if (IsJugglable(trialPat)) {
            ssList.push([TYPE.CHANGE, trialPat]);
          }
        }
      }
    })();
    (function() { // Insert one element (>average)
      // e.g. 551 => 5551
      const validSum = (average + 1) * (pat.length + 1);
      const insertValue = validSum - sum;
      for (let i = 1; i <= pat.length; i++) {
        const trialPat = new Array();
        Array.prototype.push.apply(trialPat, pat.slice(0, i));
        trialPat[i] = insertValue;
        Array.prototype.push.apply(trialPat, pat.slice(i, pat.length));
        if (IsJugglable(trialPat)) {
          ssList.push([TYPE.INSERT, trialPat]);
        }
      }
    })();
  }

  (function() { // Insert one element (element <= average)
    // e.g. 551 => 5151, 5511 (1 < average)
    // e.g. 135 => 1353 (3 == average)
    const validSum = average * (pat.length + 1);
    const insertValue = validSum - sum;
    for (let i = 1; i <= pat.length; i++) {
      const trialPat = new Array();
      Array.prototype.push.apply(trialPat, pat.slice(0, i));
      trialPat[i] = insertValue;
      Array.prototype.push.apply(trialPat, pat.slice(i, pat.length));
      if (IsJugglable(trialPat)) {
        ssList.push([TYPE.INSERT, trialPat]);
      }
    }
  })();

  return ssList.sort();
}

const jmjsURL = 'http://yuji-k64613.github.io/jmjs/jmjs.html';

// もしかして機能
function DidYouMean(ss) { // eslint-disable-line no-unused-vars
  const resultSpan = document.getElementById('resultSpan');
  resultSpan.innerHTML = '';

  const inputStr = ss;

  if (ss == '') {
    resultSpan.appendChild(document.createTextNode(inputStr + '何か入力してください。'));
    return;
  }
  const pat = StrToArr(inputStr);

  if (IsJugglable(pat)) {
    resultSpan.appendChild(document.createTextNode('「'));
    const link = document.createElement('a');
    link.href = jmjsURL + '?siteswap=' + inputStr;
    link.appendChild(document.createTextNode(inputStr));
    resultSpan.appendChild(link);
    resultSpan.appendChild(document.createTextNode('」はジャグリング可能な文字列です。←@yuji_k64613さんが作成した、JuggleMaster JavaScript版へのリンクです。'));
  } else {
    let ssList = ListupDidYouMean(pat);

    // output
    if (ssList.length == 0) {
      resultSpan.appendChild(document.createTextNode('「' + inputStr + '」はジャグリング不可能な文字列です。\n(似た文字列にもジャグリング可能な物はありません。)'));
    } else {
      resultSpan.appendChild(document.createTextNode('入力文字列: ' + inputStr + '\nもしかして: (下表をご参照ください) \n'));
      const table = document.getElementById('resultTable');
      table.innerHTML = '';

      // ヘッダー部を追加
      {
        const tr = table.insertRow();
        tr.appendChild(createTh('Siteswap'));
        tr.appendChild(createTh('ボールの数'));
        tr.appendChild(createTh('入力文字列との関係'));
        tr.appendChild(createTh('@yuji_k64613さんが作成した、JuggleMaster JavaScript版へのリンク。'));
      }

      ssList = ssList.sort();
      let last = '';
      ssList.forEach(function(siteswapArray) {
        const method = siteswapArray[0];
        const siteswap = ArrToStr(siteswapArray[1]);
        const num = ave(siteswapArray[1]);
        if (last != siteswap && !siteswap.match(/</)) { // 「<z+α>」が含まれると、JavaScript版JuggleMasterへのリンクが正常にならないため、省きます。
          last = siteswap;
          const row = table.insertRow();
          row.insertCell().appendChild(document.createTextNode(siteswap));
          row.insertCell().appendChild(document.createTextNode(num));
          row.insertCell().appendChild(document.createTextNode(method));
          const link = document.createElement('a');
          link.href = jmjsURL + '?siteswap=' + siteswap;
          link.appendChild(document.createTextNode(link.href));
          row.insertCell().appendChild(link);
        }
      });
    }
  }

  function createTh(text) {
    const th = document.createElement('th');
    th.innerText = text;
    return th;
  }
}
