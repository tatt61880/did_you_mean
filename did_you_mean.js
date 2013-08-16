// シンプルな(多重配列でない)配列を、cloneメソッドでコピーできるようにする。
Array.prototype.clone = function() {
    return Array.apply(null,this)
}
function ArrToStr(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        if (0 <= arr[i] && arr[i] <= 9) {
            str += String(arr[i]);
        } else if (10 <= arr[i] && arr[i] <= 35) {
            str += String.fromCharCode(('a').charCodeAt() + arr[i] - 10);
        } else {
            alert("Error in ArrToStr(): arr[" + i + "] = " + arr[i]);
            return "";
        }
    }
    return str;
}

function StrToArr(str) {
    var arr = new Array();
    for (var i = 0; i < str.length; i++) {
        if ('0' <= str[i] && str[i] <= '9') {
            arr.push(str[i].charCodeAt() - ('0').charCodeAt());
        } else if ('a' <= str[i] && str[i] <= 'z') {
            arr.push(str[i].charCodeAt() - ('a').charCodeAt() + 10);
        } else {
            alert("Error in StrToArr(): str[" + i + "] = " + str[i]);
            return "";
            return null;
        }
    }
    return arr;
}

// ジャグリング可能なサイトスワップになっているか否かを判定する。※引数は文字列ではなく、数字の配列。
function IsJugglable(arr) {
    if (arr.length == 0) {
        return false;
    }
    var checkArr = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < 0) { //負の数が入っているものは「ジャグリング不可」とする。()
            return false;
        }
        if (checkArr[(arr[i] + i) % arr.length] != null) {
            return false;
        } else {
            checkArr[(arr[i] + i) % arr.length] = 1;
        }
    }
    return true;
}

// もしかして機能
function DidYouMean() {
    var inputStr = Form1.input.value;
    var pat = StrToArr(inputStr);
    var ssList = new Array();

    if (IsJugglable(pat)) {
        Form1.output.value = inputStr + " is jugglable.";
    } else {
        // TODO: Dealing Mulitplex and/or Sync patterns
        var sum = 0;
        var average;
        (function() {
            for (var i = 0; i < pat.length; i++) {
                sum += pat[i];
            }
        })();
        average = ~~(sum / pat.length);

        (function() { // Remove one elemenet
            // e.g. 551 => 55, 51
            for(var i = 0; i < pat.length; i++) {
                var trial_pat = pat.clone();
                trial_pat.splice(i, 1);
                if (IsJugglable(trial_pat)) {
                    ssList.push(ArrToStr(trial_pat));
                }
            }
        })();

        if (sum % pat.length == 0) {
            (function() { // Swap two element
                // e.g. 7351 => 1357, 7531
                for(var i = 0; i < pat.length; i++) {
                    for(var j = i+1; j < pat.length; j++) {
                        var trial_pat = pat.clone();
                        trial_pat[i] = pat[j];
                        trial_pat[j] = pat[i];
                        if (IsJugglable(trial_pat)) {
                            ssList.push(ArrToStr(trial_pat));
                        }
                    }
                }
            })();
            (function() { // Moved one elemenet
                // e.g. 5371 => 7531
                for (var i = 0; i < pat.length; i++) { // move element index-i to index-j
                    for (var j = 0; j < pat.length-1; j++) {
                        if (j < i-1) {
                            (function() {
                                var trial_pat = new Array();
                                Array.prototype.push.apply(trial_pat, pat.slice(0, j));
                                trial_pat[j] = pat[i];
                                Array.prototype.push.apply(trial_pat, pat.slice(j, i));
                                Array.prototype.push.apply(trial_pat, pat.slice(i+1, pat.length));
                                if (IsJugglable(trial_pat)) {
                                    ssList.push(ArrToStr(trial_pat));
                                }
                            })();
                        } else if (j > i+1) {
                            (function() {
                                var trial_pat = new Array();
                                Array.prototype.push.apply(trial_pat, pat.slice(0, i));
                                Array.prototype.push.apply(trial_pat, pat.slice(i+1, j+1));
                                trial_pat[j] = pat[i];
                                Array.prototype.push.apply(trial_pat, pat.slice(j+1, pat.length));
                                if (IsJugglable(trial_pat)) {
                                    ssList.push(ArrToStr(trial_pat));
                                }
                            })();
                        }
                    }
                }
            })();
        } else {
            (function() { // Change one element
                var diff1 = (sum % pat.length);              // (large -> small) e.g. 551 => 531
                var diff2 = pat.length - (sum % pat.length); // (small -> large) e.g. 551 => 561, 552
                for(i = 0; i < pat.length; i++) {
                    var trial_pat = pat.clone();
                    trial_pat[i] = pat[i] - diff1;
                    if (IsJugglable(trial_pat)) {
                        ssList.push(ArrToStr(trial_pat));
                    }
                    trial_pat[i] = pat[i] + diff2;
                    if (IsJugglable(trial_pat)) {
                        ssList.push(ArrToStr(trial_pat));
                    }
                }
            })();
            (function() { // Add one element (>average)
                // e.g. 551 => 5551
                var valid_sum = (average+1) * (pat.length + 1);
                var insert_value = valid_sum - sum;
                for(i = 1; i <= pat.length; i++) {
                    var trial_pat = new Array();
                    Array.prototype.push.apply(trial_pat, pat.slice(0, i));
                    trial_pat[i] = insert_value;
                    Array.prototype.push.apply(trial_pat, pat.slice(i, pat.length));
                    if (IsJugglable(trial_pat)) {
                        ssList.push(ArrToStr(trial_pat));
                    }
                }
            })();
        }
        (function() { // Add one element (element <= average)
            // e.g. 551 => 5151, 5511 (1 < average)
            // e.g. 135 => 1353 (3 == average)
            var valid_sum = average * (pat.length + 1);
            var insert_value = valid_sum - sum;
            for(i = 1; i <= pat.length; i++) {
                var trial_pat = new Array();
                Array.prototype.push.apply(trial_pat, pat.slice(0, i));
                trial_pat[i] = insert_value;
                Array.prototype.push.apply(trial_pat, pat.slice(i, pat.length));
                if (IsJugglable(trial_pat)) {
                    ssList.push(ArrToStr(trial_pat));
                }
            }
        })();

        //alert(ArrToStr(pat));

        // output
        if (ssList.length == 0) {
            Form1.output.value = inputStr + " is not jugglable.";
        } else {
            Form1.output.value = "Did you mean:\n";
            ssList = ssList.sort();
            var last = "";
            ssList.forEach(function(siteswap){
                if (last != siteswap) {
                    last = siteswap;
                    Form1.output.value += " " + siteswap + "\n";
                }
            })
        }
    }
}

