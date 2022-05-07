var paravalsStr = location.href.split("?")[1];
var paravalsArray = paravalsStr.split("&");
for (var i = 0, len = paravalsArray.length; i < len; i++) {
  paraval = (paravalsArray[i]).split("=");
  if (paraval[0] == "ss") {
    onload = function(){
      var siteswap = paraval[1];
      Form1.ss.value = siteswap;
      DidYouMean(siteswap);
    }
  }
}
