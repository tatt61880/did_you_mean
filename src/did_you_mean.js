// シンプルな(多重配列でない)配列を、cloneメソッドでコピーできるようにする。
Array.prototype.clone = function() {
	return Array.apply(null, this)
}

function ArrToStr(arr) {
	var str = "";
	for (var i = 0; i < arr.length; i++) {
		if (!(typeof arr[i] === "number")) {
			alert("Error in ArrToStr(): arr[" + i + "] isn't a number. " + arr[i]);
			return "";
		}
		if (0 <= arr[i] && arr[i] <= 9) {
			str += arr[i];
		} else if (10 <= arr[i] && arr[i] <= 35) {
			str += String.fromCharCode(('a').charCodeAt() + arr[i] - 10);
		} else if (36 <= arr[i]) {
			str += "<z+" + (arr[i] - 35) + ">";
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
			alert("入力可能な文字は、0～9と、a～zです。");
			//alert("Error in StrToArr(): str[" + i + "] = " + str[i]);
			return "";
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
		var index = (arr[i] + i) % arr.length;
		if (checkArr[index] != null) {
			return false;
		} else {
			checkArr[index] = 1;
		}
	}
	return true;
}

function ave(arr) {
	var sum = 0;
	for (var i = 0, len = arr.length; i < len; ++i) {
		sum += arr[i];
	}
	return sum / arr.length;
};

var TYPE = {
	REMOVE:	"1字削除",
	CHANGE:	"1字変更",
	INSERT:	"1字挿入",
	MOVE:	"1字移動",
	SWAP:	"2字交換",
};

function ListupDidYouMean(pat) {
	var ssList = new Array();

	// TODO: Dealing Mulitplex and/or Sync patterns
	var sum = 0;
	var average;
	(function() {
		for (var i = 0, len = pat.length; i < len; i++) {
			sum += pat[i];
		}
	})();
	average = ~~(sum / pat.length);

	(function() { // Remove one element
		// e.g. 551 => 55, 51
		for(var i = 0; i < pat.length; i++) {
			var trialPat = pat.clone();
			trialPat.splice(i, 1);
			if (IsJugglable(trialPat)) {
				ssList.push([TYPE.REMOVE, trialPat]);
			}
		}
	})();

	if (sum % pat.length == 0) {
		(function() { // Swap two elements
			// e.g. 7351 => 1357, 7531
			for (var i = 0; i < pat.length; i++) {
				for (var j = i + 1; j < pat.length; j++) {
					var trialPat = pat.clone();
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
			for (var i = 0; i < pat.length; i++) { // move element index-i to index-j
				for (var j = 0; j < pat.length - 1; j++) {
					if (j < i - 1) {
						(function() {
							var trialPat = new Array();
							Array.prototype.push.apply(trialPat, pat.slice(0, j));
							trialPat[j] = pat[i];
							Array.prototype.push.apply(trialPat, pat.slice(j, i));
							Array.prototype.push.apply(trialPat, pat.slice(i+1, pat.length));
							if (IsJugglable(trialPat)) {
								ssList.push([TYPE.MOVE, trialPat]);
							}
						})();
					} else if (j > i + 1) {
						(function() {
							var trialPat = new Array();
							Array.prototype.push.apply(trialPat, pat.slice(0, i));
							Array.prototype.push.apply(trialPat, pat.slice(i+1, j+1));
							trialPat[j] = pat[i];
							Array.prototype.push.apply(trialPat, pat.slice(j+1, pat.length));
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
			var diff1 = (sum % pat.length);              // (large -> small) e.g. 551 => 531
			var diff2 = pat.length - (sum % pat.length); // (small -> large) e.g. 551 => 561, 552
			for (var i = 0; i < pat.length; i++) {
				{
					var trialPat = pat.clone();
					trialPat[i] = pat[i] - diff1;
					if (IsJugglable(trialPat)) {
						ssList.push([TYPE.CHANGE, trialPat]);
					}
				}
				{
					var trialPat = pat.clone();
					trialPat[i] = pat[i] + diff2;
					if (IsJugglable(trialPat)) {
						ssList.push([TYPE.CHANGE, trialPat]);
					}
				}
			}
		})();
		(function() { // Insert one element (>average)
			// e.g. 551 => 5551
			var validSum = (average + 1) * (pat.length + 1);
			var insertValue = validSum - sum;
			for (var i = 1; i <= pat.length; i++) {
				var trialPat = new Array();
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
		var validSum = average * (pat.length + 1);
		var insertValue = validSum - sum;
		for (var i = 1; i <= pat.length; i++) {
			var trialPat = new Array();
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

var jmjsURL = "http://yuji-k64613.github.io/jmjs/jmjs.html";

// もしかして機能
function DidYouMean(ss) {
	var resultSpan = document.getElementById("resultSpan");
	var inputStr = Form1.ss.value;
	if (typeof ss === "undefined") { // ボタンがクリックされたとき。
		location.href = location.href.split("?")[0] + "?ss=" + Form1.ss.value;
	} else { // テキストボックスでEnterされたときか、URLに ?ss=○○のパラメータがあるとき。
		inputStr = ss;
	}

	if(ss == "") {
		resultSpan.appendChild( document.createTextNode(inputStr + "何か入力してください。"));
		return;
	}
	var pat = StrToArr(inputStr);

	if (IsJugglable(pat)) {
		resultSpan.appendChild( document.createTextNode("「"));
		var link = document.createElement("a");
		link.href = jmjsURL + "?siteswap=" + inputStr;
		link.appendChild(document.createTextNode(inputStr));
		resultSpan.appendChild(link);
		resultSpan.appendChild( document.createTextNode("」はジャグリング可能な文字列です。←@yuji_k64613さんが作成した、JuggleMaster JavaScript版へのリンクです。") );
	} else {
		ssList = ListupDidYouMean(pat);
	}

	// output
	if (ssList.length == 0) {
		resultSpan.appendChild(document.createTextNode("「" + inputStr + "」はジャグリング不可能な文字列です。\n(似た文字列にもジャグリング可能な物はありません。)"));
	} else {
		resultSpan.appendChild(document.createTextNode("入力文字列: " + inputStr + "\nもしかして: (下表をご参照ください) \n"));
		var table = document.getElementById("resultTable");
		var row = table.insertRow();
		var thObj = document.createElement("th"); thObj.appendChild( document.createTextNode("Siteswap")); row.appendChild( thObj );
		var thObj = document.createElement("th"); thObj.appendChild( document.createTextNode("ボールの数")); row.appendChild( thObj );
		var thObj = document.createElement("th"); thObj.appendChild( document.createTextNode("入力文字列との関係")); row.appendChild( thObj );
		var thObj = document.createElement("th"); thObj.appendChild( document.createTextNode("@yuji_k64613さんが作成した、JuggleMaster JavaScript版へのリンク。")); row.appendChild( thObj );
		ssList = ssList.sort();
		var last = "";
		ssList.forEach(function(siteswapArray) {
			var method = siteswapArray[0];
			var siteswap = ArrToStr(siteswapArray[1]);
			var num = ave(siteswapArray[1]);
			if (last != siteswap && !siteswap.match(/</)) { // 「<z+α>」が含まれると、JavaScript版JuggleMasterへのリンクが正常にならないため、省きます。
				last = siteswap;
				var row = table.insertRow();
				row.insertCell().appendChild( document.createTextNode( siteswap ) );
				row.insertCell().appendChild( document.createTextNode( num ) );
				row.insertCell().appendChild( document.createTextNode( method ) );
				var link = document.createElement("a");
				link.href = jmjsURL + "?siteswap=" + siteswap;
				link.appendChild(document.createTextNode(link.href));
				row.insertCell().appendChild(link);
			}
		})
	}
}
