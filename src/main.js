(function() {
  'use strict';

  window.addEventListener('DOMContentLoaded', function() {
    const elemSearch = document.getElementById('search');
    const elemSiteswapInput = document.getElementById('siteswap');

    elemSearch.addEventListener('click', searched);
    elemSiteswapInput.addEventListener('change', searched);

    function searched() {
      const siteswapStr = elemSiteswapInput.value;
      location.href = location.href.split('?')[0] + '?ss=' + siteswapStr;
      search(siteswapStr);
    }

    const paravalsStr = location.href.split('?')[1];
    if (paravalsStr === undefined) return;

    for (const paravals of paravalsStr.split('&')) {
      const paraval = paravals.split('=');
      if (paraval[0] == 'ss') {
        const siteswapStr = paraval[1];
        elemSiteswapInput.value = siteswapStr;
        search(siteswapStr);
      }
    }
  });

  function search(siteswap) {
    DidYouMean(siteswap); // eslint-disable-line no-undef
  }
})();
