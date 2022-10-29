(function() {
  'use strict';

  window.addEventListener('DOMContentLoaded', function() {
    const elemSearch = document.getElementById('search');
    elemSearch.addEventListener('click', function() {
      const elemSiteswapInput = document.getElementById('siteswap');
      const siteswapStr = elemSiteswapInput.value;
      location.href = location.href.split('?')[0] + '?ss=' + siteswapStr;
      search(siteswapStr);
    });

    const paravalsStr = location.href.split('?')[1];
    if (paravalsStr === undefined) return;

    for (const paravals of paravalsStr.split('&')) {
      const paraval = paravals.split('=');
      if (paraval[0] == 'ss') {
        const siteswapStr = paraval[1];
        const elemSiteswapInput = document.getElementById('siteswap');
        elemSiteswapInput.value = siteswapStr;
        search(siteswapStr);
      }
    }
  });

  function search(siteswap) {
    DidYouMean(siteswap); // eslint-disable-line no-undef
  }
})();
