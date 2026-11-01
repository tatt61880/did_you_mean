(function () {
  'use strict';

  const TYPE = {
    REMOVE: '1字削除',
    CHANGE: '1字変更',
    INSERT: '1字挿入',
    MOVE: '1字移動',
    SWAP: '2字交換',
  };

  const api = {
    TYPE,
    normalizeSiteswap,
    arrToStr,
    strToArr,
    isJugglable,
    listupDidYouMean,
    groupCandidates,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    Object.assign(window, api);
  }

  function normalizeSiteswap(str) {
    return str
      .replace(/[０-９Ａ-Ｚａ-ｚ]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0xfee0)
      )
      .replace(/\s/g, '')
      .toLowerCase();
  }

  function isPattern(arr) {
    if (!Array.isArray(arr)) return false;
    for (const value of arr) {
      if (!Number.isSafeInteger(value) || value < 0) return false;
    }
    return true;
  }

  function arrToStr(arr) {
    if (!isPattern(arr)) return null;
    return arr
      .map((value) => {
        if (value <= 35) return value.toString(36);
        return '<z+' + (value - 35) + '>';
      })
      .join('');
  }

  function strToArr(str) {
    if (typeof str !== 'string' || !/^[0-9a-z]*$/.test(str)) return null;
    return Array.from(str, (char) => parseInt(char, 36));
  }

  // ジャグリング可能なサイトスワップになっているか否かを判定する。※引数は文字列ではなく、数字の配列。
  function isJugglable(arr) {
    if (!isPattern(arr) || arr.length === 0) {
      return false;
    }
    const checkArr = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < 0) {
        // 負の数が入っているものは「ジャグリング不可」とする。
        return false;
      }
      const index = (arr[i] + i) % arr.length;
      if (checkArr[index] !== undefined) {
        return false;
      } else {
        checkArr[index] = 1;
      }
    }
    return true;
  }

  function listupDidYouMean(pat) {
    if (!isPattern(pat) || pat.length === 0) return [];

    const ssList = new Array();

    // TODO: Dealing Mulitplex and/or Sync patterns
    let sum = 0;
    for (let i = 0, len = pat.length; i < len; i++) {
      sum += pat[i];
    }
    const average = Math.floor(sum / pat.length);

    (function () {
      // Remove one element
      // e.g. 551 => 55, 51
      for (let i = 0; i < pat.length; i++) {
        const trialPat = pat.slice();
        trialPat.splice(i, 1);
        if (isJugglable(trialPat)) {
          ssList.push([TYPE.REMOVE, trialPat]);
        }
      }
    })();

    if (sum % pat.length === 0) {
      (function () {
        // Swap two elements
        // e.g. 7351 => 1357, 7531
        for (let i = 0; i < pat.length; i++) {
          for (let j = i + 1; j < pat.length; j++) {
            const trialPat = pat.slice();
            trialPat[i] = pat[j];
            trialPat[j] = pat[i];
            if (isJugglable(trialPat)) {
              ssList.push([TYPE.SWAP, trialPat]);
            }
          }
        }
      })();
      (function () {
        // Move one element
        // e.g. 5371 => 7531
        for (let i = 0; i < pat.length; i++) {
          // move element index-i to index-j
          for (let j = 0; j < pat.length - 1; j++) {
            if (j < i - 1) {
              (function () {
                const trialPat = new Array();
                Array.prototype.push.apply(trialPat, pat.slice(0, j));
                trialPat[j] = pat[i];
                Array.prototype.push.apply(trialPat, pat.slice(j, i));
                Array.prototype.push.apply(
                  trialPat,
                  pat.slice(i + 1, pat.length)
                );
                if (isJugglable(trialPat)) {
                  ssList.push([TYPE.MOVE, trialPat]);
                }
              })();
            } else if (j > i + 1) {
              (function () {
                const trialPat = new Array();
                Array.prototype.push.apply(trialPat, pat.slice(0, i));
                Array.prototype.push.apply(trialPat, pat.slice(i + 1, j + 1));
                trialPat[j] = pat[i];
                Array.prototype.push.apply(
                  trialPat,
                  pat.slice(j + 1, pat.length)
                );
                if (isJugglable(trialPat)) {
                  ssList.push([TYPE.MOVE, trialPat]);
                }
              })();
            }
          }
        }
      })();
    } else {
      (function () {
        // Change one element
        const diff1 = sum % pat.length; // (large -> small) e.g. 551 => 531
        const diff2 = pat.length - (sum % pat.length); // (small -> large) e.g. 551 => 561, 552
        for (let i = 0; i < pat.length; i++) {
          {
            const trialPat = pat.slice();
            trialPat[i] = pat[i] - diff1;
            if (isJugglable(trialPat)) {
              ssList.push([TYPE.CHANGE, trialPat]);
            }
          }
          {
            const trialPat = pat.slice();
            trialPat[i] = pat[i] + diff2;
            if (isJugglable(trialPat)) {
              ssList.push([TYPE.CHANGE, trialPat]);
            }
          }
        }
      })();
      (function () {
        // Insert one element (>average)
        // e.g. 551 => 5551
        const validSum = (average + 1) * (pat.length + 1);
        const insertValue = validSum - sum;
        for (let i = 1; i <= pat.length; i++) {
          const trialPat = new Array();
          Array.prototype.push.apply(trialPat, pat.slice(0, i));
          trialPat[i] = insertValue;
          Array.prototype.push.apply(trialPat, pat.slice(i, pat.length));
          if (isJugglable(trialPat)) {
            ssList.push([TYPE.INSERT, trialPat]);
          }
        }
      })();
    }

    (function () {
      // Insert one element (element <= average)
      // e.g. 551 => 5151, 5511 (1 < average)
      // e.g. 135 => 1353 (3 === average)
      const validSum = average * (pat.length + 1);
      const insertValue = validSum - sum;
      for (let i = 1; i <= pat.length; i++) {
        const trialPat = new Array();
        Array.prototype.push.apply(trialPat, pat.slice(0, i));
        trialPat[i] = insertValue;
        Array.prototype.push.apply(trialPat, pat.slice(i, pat.length));
        if (isJugglable(trialPat)) {
          ssList.push([TYPE.INSERT, trialPat]);
        }
      }
    })();

    const unique = new Map();
    for (const candidate of ssList) {
      unique.set(JSON.stringify(candidate), candidate);
    }
    return Array.from(unique.values()).sort();
  }

  // 同じ候補をまとめ、複数の操作で見つかった場合は操作名をすべて残す。
  function groupCandidates(entries) {
    const candidates = new Map();
    for (const [method, pattern] of entries) {
      // 0〜9・a〜zで表せない候補は、従来どおり表示対象から除く。
      if (pattern.some((value) => value > 35)) continue;
      const siteswap = arrToStr(pattern);
      if (!candidates.has(siteswap)) {
        const balls = pattern.reduce((sum, value) => sum + value, 0);
        candidates.set(siteswap, {
          siteswap,
          balls: balls / pattern.length,
          methods: [],
        });
      }
      const candidate = candidates.get(siteswap);
      if (!candidate.methods.includes(method)) candidate.methods.push(method);
    }
    return Array.from(candidates.values()).sort(
      (a, b) => a.balls - b.balls || a.siteswap.localeCompare(b.siteswap)
    );
  }
})();
