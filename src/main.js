(function () {
  'use strict';

  const maxLength = 100;
  const jmjsURL = 'https://yuji-k64613.github.io/jmjs/jmjs.html';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('search-form');
    const input = document.getElementById('siteswap');
    const status = document.getElementById('result-status');
    const results = document.getElementById('results');
    const body = document.getElementById('result-body');
    const copyStatus = document.getElementById('copy-status');
    const copyURL = document.getElementById('copy-url');
    const share = document.getElementById('share');
    let composing = false;
    let searchedValue = '';

    input.addEventListener('compositionstart', () => {
      composing = true;
    });
    input.addEventListener('compositionend', () => {
      composing = false;
    });
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (composing) return;
      if (search()) updateURL(searchedValue);
    });
    document.getElementById('clear').addEventListener('click', () => {
      input.value = '';
      resetResults();
      updateURL('');
      input.focus();
    });
    for (const button of form.querySelectorAll('[data-example]')) {
      button.addEventListener('click', () => {
        input.value = button.dataset.example;
        resetResults();
        updateURL('');
        input.focus();
      });
    }
    copyURL.addEventListener('click', () => {
      copyText(searchURL(searchedValue).href, '検索URL');
    });
    window.addEventListener('popstate', readURL);
    readURL();

    function resetResults() {
      body.replaceChildren();
      results.hidden = true;
      status.textContent = '';
      status.classList.remove('error');
      copyStatus.textContent = '';
      copyURL.disabled = true;
      share.hidden = true;
      input.removeAttribute('aria-invalid');
      searchedValue = '';
    }

    function searchURL(value) {
      const url = new URL(location.href);
      if (value === '') url.searchParams.delete('ss');
      else url.searchParams.set('ss', value);
      return url;
    }

    function updateURL(value) {
      const url = searchURL(value);
      if (url.href !== location.href) history.pushState(null, '', url);
    }

    function readURL() {
      const value = new URL(location.href).searchParams.get('ss');
      input.value = value || '';
      if (value === null) resetResults();
      else search();
    }

    function search() {
      resetResults();
      const value = window.normalizeSiteswap(input.value);
      input.value = value;
      if (value === '') return showError('サイトスワップを入力してください。');
      if (value.length > maxLength) {
        return showError('検索できるのは100文字までです。');
      }
      const pattern = window.strToArr(value);
      if (pattern === null) {
        return showError('入力できる文字は0〜9とa〜zです。');
      }

      searchedValue = value;
      copyURL.disabled = false;
      const shareURL = new URL('https://twitter.com/intent/tweet');
      shareURL.searchParams.set('text', 'もしかしてサイトスワップ: ' + value);
      shareURL.searchParams.set('url', searchURL(value).href);
      share.href = shareURL.href;
      share.hidden = false;

      if (window.isJugglable(pattern)) {
        status.append('「' + value + '」はジャグリング可能です。 ');
        status.append(createViewerLink(value));
        return true;
      }

      const candidates = window.groupCandidates(
        window.listupDidYouMean(pattern)
      );
      if (candidates.length === 0) {
        status.textContent =
          '「' +
          value +
          '」はジャグリングできません。検索範囲内に候補はありませんでした。';
        return true;
      }

      status.textContent =
        '「' +
        value +
        '」はジャグリングできません。似た候補が' +
        candidates.length +
        '件見つかりました。';
      const fragment = document.createDocumentFragment();
      for (const candidate of candidates) {
        const row = document.createElement('tr');
        const code = document.createElement('code');
        code.textContent = candidate.siteswap;
        row.insertCell().append(code);
        row.insertCell().textContent = candidate.balls;
        const methods = row.insertCell();
        for (const method of candidate.methods) {
          const badge = document.createElement('span');
          badge.className = 'method';
          badge.textContent = method;
          methods.append(badge);
        }
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'copy-button';
        copy.textContent = 'コピー';
        copy.setAttribute('aria-label', candidate.siteswap + 'をコピー');
        copy.addEventListener('click', () => {
          copyText(candidate.siteswap, candidate.siteswap);
        });
        actions.append(copy, createViewerLink(candidate.siteswap));
        row.insertCell().append(actions);
        fragment.append(row);
      }
      body.append(fragment);
      results.hidden = false;
      return true;
    }

    function showError(message) {
      status.textContent = message;
      status.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      return false;
    }

    async function copyText(text, label) {
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          // 権限などでコピーできない場合は従来のコピー方法も試す。
        }
      }
      if (!copied) {
        const previousFocus = document.activeElement;
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.className = 'clipboard-text';
        textarea.readOnly = true;
        document.body.append(textarea);
        textarea.select();
        try {
          copied = document.execCommand('copy');
        } catch {
          copied = false;
        }
        textarea.remove();
        if (previousFocus) previousFocus.focus({ preventScroll: true });
      }
      if (copied) copyStatus.textContent = label + 'をコピーしました。';
      else {
        copyStatus.textContent =
          'コピーできませんでした。文字列やアドレスバーのURLを選択してコピーしてください。';
      }
    }

    function createViewerLink(value) {
      const link = document.createElement('a');
      const url = new URL(jmjsURL);
      url.searchParams.set('siteswap', value);
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '動きを見る';
      link.setAttribute('aria-label', value + 'の動きを見る（新しいタブ）');
      return link;
    }
  });
})();
