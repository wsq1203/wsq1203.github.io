(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AMBIENT_BURST_DELAY = 3000;
  const AMBIENT_BURST_VARIANTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const enhancedCards = new WeakSet();
  const revealedNodes = new WeakSet();
  let clickEffectBound = false;
  let scrollRailBound = false;
  let loaderShown = false;
  let compactSearchBound = false;
  let compactSearchSynthetic = false;
  let searchTransitionBound = false;
  let proSearchData = null;
  let proSearchLoading = null;
  let proSearchBound = false;
  let ambientBurstBound = false;
  let imageFallbackBound = false;
  let tocRailResizeBound = false;
  let postTocPinBound = false;

  function selectAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function createLoader(text, extraClass) {
    const loader = document.createElement('div');
    loader.className = extraClass ? `pro-loader ${extraClass}` : 'pro-loader';
    loader.innerHTML = [
      '<div class="pro-loader__core">',
      '<span class="pro-loader__ring"></span>',
      '<span class="pro-loader__ring"></span>',
      '<span class="pro-loader__ring"></span>',
      '<span class="pro-loader__dot"></span>',
      '</div>',
      `<div class="pro-loader__text">${text || 'BOOTING OPS LAB'}</div>`,
      '<div class="pro-loader__bar"><span></span></div>'
    ].join('');
    return loader;
  }

  function ensureLoader() {
    if (loaderShown || reduceMotion.matches || getPageKinds().post) return;
    loaderShown = true;

    const loader = createLoader('BOOTING OPS LAB');
    document.body.appendChild(loader);

    let closeRequested = false;
    const closeLoader = () => {
      if (closeRequested) return;
      closeRequested = true;
      window.setTimeout(() => {
        loader.classList.add('pro-loader--hide');
        window.setTimeout(() => loader.remove(), 620);
      }, 760);
    };

    if (document.readyState === 'complete') {
      closeLoader();
    } else {
      window.addEventListener('load', closeLoader, { once: true });
      window.setTimeout(closeLoader, 1800);
    }
    window.setTimeout(closeLoader, 2600);
  }

  function showOutboundLoader(text) {
    if (reduceMotion.matches) return;

    document.querySelectorAll('.pro-loader').forEach(node => node.remove());
    const loader = createLoader(text || 'OPENING ENTRY', 'pro-loader--outbound');
    document.body.appendChild(loader);
    loaderShown = true;
  }

  function ensureCursorGlow() {
    if (reduceMotion.matches || getPageKinds().post || document.querySelector('.pro-cursor-glow')) return;

    const glow = document.createElement('div');
    glow.className = 'pro-cursor-glow';
    document.body.appendChild(glow);

    if (window.gsap) {
      const moveX = window.gsap.quickTo(glow, 'x', { duration: 0.45, ease: 'power3.out' });
      const moveY = window.gsap.quickTo(glow, 'y', { duration: 0.45, ease: 'power3.out' });
      window.addEventListener('pointermove', event => {
        moveX(event.clientX);
        moveY(event.clientY);
      }, { passive: true });
      return;
    }

    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  function runHeroIntro() {
    if (reduceMotion.matches || !window.gsap || document.body.dataset.proIntroDone || getPageKinds().post || !document.getElementById('site-title')) return;
    document.body.dataset.proIntroDone = 'true';

    const timeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline
      .from('#nav', {
        y: -28,
        autoAlpha: 0,
        duration: 0.8
      })
      .from('#site-title .pro-title-kicker span, #site-title .pro-title-main, #site-title .pro-title-sub', {
        y: 34,
        scale: 0.94,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08
      }, '-=0.35')
      .from('.pro-hero-console__line, #scroll-down', {
        y: 18,
        autoAlpha: 0,
        duration: 0.65,
        stagger: {
          amount: 0.42,
          from: 'start'
        }
      }, '-=0.4')
      .from('.recent-post-item, #aside-content .card-widget', {
        y: 36,
        autoAlpha: 0,
        duration: 0.8,
        stagger: {
          amount: 0.45,
          from: 'start'
        }
      }, '-=0.2');

    window.setTimeout(() => {
      window.gsap.set('#site-title .pro-title-kicker span, #site-title .pro-title-main, #site-title .pro-title-sub', {
        clearProps: 'opacity,visibility,transform'
      });
    }, 2600);
  }

  function enhanceHeroCopy() {
    const title = document.getElementById('site-title');
    const siteInfo = document.getElementById('site-info');
    if (!title || !siteInfo || title.dataset.proEnhanced) return;

    title.dataset.proEnhanced = 'true';
    title.dataset.originalTitle = title.textContent.trim();
    const kickerItems = ['ROOT SIGNAL', 'CLOUD MATRIX', 'OPS CONTROL'];
    const colors = ['var(--pro-cyan)', 'var(--pro-green)', 'var(--pro-amber)', 'var(--pro-rose)'];
    const kicker = kickerItems.map((item, index) => {
      const delay = (Math.random() * -2.4).toFixed(2);
      const duration = (1.15 + Math.random() * 1.2).toFixed(2);
      const color = colors[(index + Math.floor(Math.random() * colors.length)) % colors.length];
      return `<span class="pro-kicker-token" style="--pro-kicker-delay:${delay}s;--pro-kicker-speed:${duration}s;--pro-kicker-color:${color}">${item}</span>`;
    }).join('');

    title.innerHTML = [
      `<span class="pro-title-kicker">${kicker}</span>`,
      '<span class="pro-title-main">W.SH.QING</span>',
      '<span class="pro-title-sub">Linux / Kubernetes / Cloud Native / DevOps</span>'
    ].join('');

    if (!siteInfo.querySelector('.pro-hero-orbits')) {
      const orbits = document.createElement('div');
      orbits.className = 'pro-hero-orbits';
      orbits.innerHTML = [
        '<span class="pro-hero-orbit" style="--inset: 4%; --speed: 18s"></span>',
        '<span class="pro-hero-orbit" style="--inset: 16%; --speed: 13s"></span>',
        '<span class="pro-hero-orbit" style="--inset: 28%; --speed: 9s"></span>'
      ].join('');
      siteInfo.insertBefore(orbits, title);
    }

    const consolePanel = document.createElement('div');
    consolePanel.className = 'pro-hero-console';
    consolePanel.innerHTML = [
      '<div class="pro-hero-console__line"><span class="pro-hero-console__label">RUNBOOK</span><span class="pro-hero-console__value">106 ops entries</span></div>',
      '<div class="pro-hero-console__line"><span class="pro-hero-console__label">PLATFORM</span><span class="pro-hero-console__value">linux / k8s / cloud</span></div>',
      '<div class="pro-hero-console__line"><span class="pro-hero-console__label">SIGNAL</span><span class="pro-hero-console__value">lab status online</span></div>'
    ].join('');
    siteInfo.appendChild(consolePanel);
  }

  function buildKicker(className, items, skin) {
    const kickerItems = items || ['INFRA NOTES', 'CLOUD RUNBOOKS', 'SRE PRACTICE'];
    const colors = ['var(--pro-cyan)', 'var(--pro-green)', 'var(--pro-amber)', 'var(--pro-rose)'];
    const spans = kickerItems.map((item, index) => {
      const delay = (Math.random() * -2.4).toFixed(2);
      const duration = (1.15 + Math.random() * 1.2).toFixed(2);
      const color = colors[(index + Math.floor(Math.random() * colors.length)) % colors.length];
      return `<span class="pro-kicker-token" style="--pro-kicker-delay:${delay}s;--pro-kicker-speed:${duration}s;--pro-kicker-color:${color}">${item}</span>`;
    }).join('');

    return `<span class="${className}" data-skin="${skin || 'default'}"><i></i><em></em><strong></strong>${spans}<b></b></span>`;
  }

  function enhancePageKicker() {
    const kinds = getPageKinds();
    if (kinds.post) return;
    const pageInfo = document.getElementById('page-site-info') || (kinds.post ? document.getElementById('post-info') : null);
    if (!pageInfo || pageInfo.dataset.proKickerDone) return;

    let items = ['SYSTEM PAGE', 'FIELD LOG', 'READING MODE'];
    let skin = 'default';

    if (kinds.links) {
      items = ['PEER NODES', 'TRUST MAP', 'LINK ROUTER'];
      skin = 'links';
    } else if (kinds.tags) {
      items = ['TOPIC CLOUD', 'SIGNAL TAGS', 'KNOWLEDGE MAP'];
      skin = 'tags';
    } else if (kinds.archive) {
      items = ['TIME INDEX', 'CHANGE LOG', 'OPS HISTORY'];
      skin = 'archive';
    }

    pageInfo.dataset.proKickerDone = 'true';
    pageInfo.insertAdjacentHTML('afterbegin', buildKicker('pro-page-kicker', items, skin));
  }

  function openCompactSearch(triggerNative) {
    compactSearchSynthetic = Boolean(triggerNative && compactSearchSynthetic);

    window.setTimeout(() => {
      document.body.classList.add('pro-search-open');
      document.body.style.width = '';
      document.body.style.overflow = '';

      const dialog = document.querySelector('#local-search .search-dialog');
      if (dialog && window.getComputedStyle(dialog).display === 'none') {
        dialog.style.display = 'block';
      }

      const loading = document.getElementById('loading-database');
      if (loading) loading.remove();
      const wrap = document.querySelector('#local-search .search-wrap');
      if (wrap) wrap.style.display = 'block';

      const input = document.querySelector('#local-search-input input');
      if (input) {
        input.focus();
        input.select();
      }
      ensureProSearchEngine();
      renderProSearchResults();
    }, 90);
  }

  function closeCompactSearch() {
    document.body.classList.remove('pro-search-open');
    document.body.style.width = '';
    document.body.style.overflow = '';

    const dialog = document.querySelector('#local-search .search-dialog');
    if (dialog) {
      dialog.style.display = 'none';
      dialog.style.animation = '';
    }

    const mask = document.getElementById('search-mask');
    if (mask) {
      mask.style.display = 'none';
      mask.style.animation = '';
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match]));
  }

  function loadProSearchData() {
    if (proSearchData) return Promise.resolve(proSearchData);
    if (proSearchLoading) return proSearchLoading;

    const config = window.GLOBAL_CONFIG && window.GLOBAL_CONFIG.localSearch;
    const path = (config && config.path) || '/search.json';
    proSearchLoading = fetch(path)
      .then(response => response.json())
      .then(items => {
        proSearchData = items
          .filter(item => item && item.title && item.url)
          .map(item => ({
            title: String(item.title).trim(),
            url: String(item.url)
          }));
        return proSearchData;
      })
      .catch(() => {
        proSearchData = [];
        return proSearchData;
      });

    return proSearchLoading;
  }

  function highlightTitle(title, query) {
    const text = escapeHtml(title);
    const keyword = query.trim();
    if (!keyword) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'ig'), match => `<mark class="search-keyword">${match}</mark>`);
  }

  function updateProSearchScrollRail(list, rail) {
    if (!list || !rail) return;
    const bar = rail.querySelector('.pro-search-scroll-rail__bar');
    const dot = rail.querySelector('.pro-search-scroll-rail__dot');
    const max = Math.max(0, list.scrollHeight - list.clientHeight);

    if (!max) {
      rail.classList.add('pro-search-scroll-rail--hidden');
      if (bar) bar.style.transform = 'scaleY(0)';
      if (dot) dot.style.top = '0%';
      return;
    }

    rail.classList.remove('pro-search-scroll-rail--hidden');
    const progress = Math.min(1, Math.max(0, list.scrollTop / max));
    if (bar) bar.style.transform = `scaleY(${progress})`;
    if (dot) dot.style.top = `${progress * 100}%`;
  }

  function ensureProSearchScrollRail() {
    const container = document.getElementById('local-search-results');
    const list = container && container.querySelector('.search-result-list');
    if (!container || !list) return;

    let rail = container.querySelector('.pro-search-scroll-rail');
    if (!rail) {
      rail = document.createElement('span');
      rail.className = 'pro-search-scroll-rail';
      rail.innerHTML = '<span class="pro-search-scroll-rail__bar"></span><span class="pro-search-scroll-rail__dot"></span>';
      container.appendChild(rail);
    }

    if (!list.dataset.proScrollRailBound) {
      list.dataset.proScrollRailBound = 'true';
      list.addEventListener('scroll', () => updateProSearchScrollRail(list, rail), { passive: true });
    }

    window.requestAnimationFrame(() => updateProSearchScrollRail(list, rail));
  }

  function renderProSearchResults() {
    const input = document.querySelector('#local-search-input input');
    const container = document.getElementById('local-search-results');
    const stats = document.getElementById('local-search-stats-wrap');
    if (!input || !container || !stats) return;

    const query = input.value.trim();
    if (!query) {
      container.innerHTML = '';
      stats.innerHTML = '';
      return;
    }

    loadProSearchData().then(items => {
      const lowerQuery = query.toLowerCase();
      const results = items.filter(item => item.title.toLowerCase().includes(lowerQuery)).slice(0, 10);
      if (!results.length) {
        container.innerHTML = '';
        stats.innerHTML = `<div class="search-result-stats">找不到文章标题：${escapeHtml(query)}</div>`;
        return;
      }

      container.classList.remove('no-result');
      container.innerHTML = `<div class="search-result-list">${results.map(item => {
        const href = new URL(item.url, window.location.origin).href;
        return `<div class="local-search-hit-item"><a href="${href}"><span class="search-result-title">${highlightTitle(item.title, query)}</span></a></div>`;
      }).join('')}</div>`;
      stats.innerHTML = `<hr><div class="search-result-stats">标题匹配 ${results.length} 篇文章</div>`;
      ensureProSearchScrollRail();
    });
  }

  function ensureProSearchEngine() {
    if (proSearchBound) return;
    proSearchBound = true;
    document.addEventListener('keydown', event => {
      if (!document.body.classList.contains('pro-search-open')) return;
      const input = document.querySelector('#local-search-input input');
      if (!input || document.activeElement !== input || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.code === 'Escape' || event.code === 'Tab' || event.isComposing) return;

      if (event.code === 'Backspace') {
        event.preventDefault();
        input.value = input.value.slice(0, -1);
        renderProSearchResults();
        return;
      }

      if (event.key && event.key.length === 1) {
        event.preventDefault();
        input.value += event.key;
        renderProSearchResults();
      }
    }, true);
    document.addEventListener('input', event => {
      if (!event.target.closest('#local-search-input input')) return;
      renderProSearchResults();
    }, true);
    loadProSearchData();
  }

  function ensureTopNav() {
    if (document.querySelector('.pro-top-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'pro-top-nav';
    nav.innerHTML = [
      '<a href="/" class="pro-top-nav__item">Home</a>',
      '<button type="button" class="pro-top-nav__item pro-top-nav__search">Search</button>',
      '<a href="/archives/" class="pro-top-nav__item">Archive</a>',
      '<a href="/tags/" class="pro-top-nav__item">Tags</a>',
      '<a href="/link/" class="pro-top-nav__item">Links</a>'
    ].join('');

    nav.querySelector('.pro-top-nav__search').addEventListener('click', () => {
      openCompactSearch(true);
    });

    document.body.appendChild(nav);
  }

  function ensureCompactSearch() {
    document.body.classList.add('pro-compact-search');
    ensureProSearchEngine();
    if (compactSearchBound) return;
    compactSearchBound = true;

    const markClosed = () => closeCompactSearch();

    document.addEventListener('click', event => {
      if (event.target.closest('.pro-top-nav__search, #search-button > .search')) {
        openCompactSearch(false);
        return;
      }

      if (event.target.closest('#search-mask')) {
        markClosed();
        return;
      }

      const insideCompactSearch = event.target.closest('#local-search-input, #local-search-results, #local-search-stats-wrap');
      if (document.body.classList.contains('pro-search-open') && !insideCompactSearch) {
        window.setTimeout(markClosed, 0);
      }
    }, true);

    document.addEventListener('keydown', event => {
      if (event.code === 'Escape') markClosed();
    });
  }

  function markPageKinds() {
    const kinds = getPageKinds();
    document.body.classList.toggle('pro-archive-page', kinds.archive);
    document.body.classList.toggle('pro-tags-page', kinds.tags);
    document.body.classList.toggle('pro-links-page', kinds.links);
    document.body.classList.toggle('pro-post-page', kinds.post);
  }

  function prunePostBackgrounds() {
    if (!getPageKinds().post) return;

    const removeUniverse = () => {
      const universe = document.getElementById('universe');
      if (universe) universe.remove();
    };

    removeUniverse();

    if (document.body.dataset.proPostPruneBound) return;
    document.body.dataset.proPostPruneBound = 'true';

    const observer = new MutationObserver(removeUniverse);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 3200);
  }

  function getPageKinds() {
    return {
      archive: Boolean(document.getElementById('archive')),
      tags: Boolean(document.querySelector('.tag-cloud-list')),
      links: Boolean(document.querySelector('.flink, .pro-flink-grid, .pro-flink-card')),
      post: Boolean(document.getElementById('post') && document.getElementById('article-container'))
    };
  }

  function ensureScrollRail() {
    if (document.querySelector('.pro-scroll-rail')) return;

    const rail = document.createElement('div');
    rail.className = 'pro-scroll-rail';
    rail.innerHTML = '<span class="pro-scroll-rail__bar"></span><span class="pro-scroll-rail__dot"></span>';
    document.body.appendChild(rail);

    const bar = rail.querySelector('.pro-scroll-rail__bar');
    const dot = rail.querySelector('.pro-scroll-rail__dot');
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = `scaleY(${progress})`;
      dot.style.top = `${progress * 100}%`;
    };

    update();
    if (!scrollRailBound) {
      scrollRailBound = true;
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
    }
  }

  function updateProTocScrollRail(content, rail) {
    if (!content || !rail) return;
    const bar = rail.querySelector('.pro-toc-scroll-rail__bar');
    const dot = rail.querySelector('.pro-toc-scroll-rail__dot');
    const max = Math.max(0, content.scrollHeight - content.clientHeight);

    rail.style.top = `${content.offsetTop}px`;
    rail.style.height = `${content.clientHeight}px`;

    if (!max) {
      rail.classList.add('pro-toc-scroll-rail--hidden');
      if (bar) bar.style.transform = 'scaleY(0)';
      if (dot) dot.style.top = '0%';
      return;
    }

    rail.classList.remove('pro-toc-scroll-rail--hidden');
    const progress = Math.min(1, Math.max(0, content.scrollTop / max));
    if (bar) bar.style.transform = `scaleY(${progress})`;
    if (dot) dot.style.top = `${progress * 100}%`;
  }

  function ensureProTocScrollRail() {
    const card = document.getElementById('card-toc');
    const content = card && card.querySelector('.toc-content');
    if (!card || !content) return;

    let rail = card.querySelector('.pro-toc-scroll-rail');
    if (!rail) {
      rail = document.createElement('span');
      rail.className = 'pro-toc-scroll-rail';
      rail.innerHTML = '<span class="pro-toc-scroll-rail__bar"></span><span class="pro-toc-scroll-rail__dot"></span>';
      card.appendChild(rail);
    }

    if (!content.dataset.proTocRailBound) {
      content.dataset.proTocRailBound = 'true';
      content.addEventListener('scroll', () => updateProTocScrollRail(content, rail), { passive: true });
    }

    if (!tocRailResizeBound) {
      tocRailResizeBound = true;
      window.addEventListener('resize', () => {
        const currentCard = document.getElementById('card-toc');
        const currentContent = currentCard && currentCard.querySelector('.toc-content');
        const currentRail = currentCard && currentCard.querySelector('.pro-toc-scroll-rail');
        updateProTocScrollRail(currentContent, currentRail);
      }, { passive: true });
    }

    window.requestAnimationFrame(() => updateProTocScrollRail(content, rail));
  }

  function ensureTocPinPlaceholder(toc) {
    let placeholder = document.querySelector('.pro-toc-pin-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'pro-toc-pin-placeholder';
      toc.parentElement.insertBefore(placeholder, toc);
    }
    return placeholder;
  }

  function syncPostTocPin(forceMeasure) {
    const isPost = getPageKinds().post;
    const toc = document.getElementById('card-toc');
    if (!isPost || !toc || window.innerWidth < 901) {
      document.body.classList.remove('pro-post-toc-pinned');
      const placeholder = document.querySelector('.pro-toc-pin-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      return;
    }

    const placeholder = ensureTocPinPlaceholder(toc);
    const pinned = document.body.classList.contains('pro-post-toc-pinned');

    if (forceMeasure && pinned) {
      document.body.classList.remove('pro-post-toc-pinned');
      placeholder.style.display = 'none';
    }

    if (forceMeasure || !pinned) {
      const rect = toc.getBoundingClientRect();
      const trigger = window.scrollY + rect.top - 74;
      toc.dataset.proPinStart = String(Math.max(0, trigger));
      document.documentElement.style.setProperty('--pro-post-toc-left', `${rect.left}px`);
      document.documentElement.style.setProperty('--pro-post-toc-width', `${rect.width}px`);
      document.documentElement.style.setProperty('--pro-post-toc-height', `${rect.height}px`);
      placeholder.style.height = `${rect.height}px`;
    }

    const shouldPin = window.scrollY > Number(toc.dataset.proPinStart || 0);
    placeholder.style.display = shouldPin ? 'block' : 'none';
    document.body.classList.toggle('pro-post-toc-pinned', shouldPin);
  }

  function ensurePostTocPin() {
    syncPostTocPin(true);
    if (postTocPinBound) return;
    postTocPinBound = true;
    window.addEventListener('scroll', () => syncPostTocPin(false), { passive: true });
    window.addEventListener('resize', () => syncPostTocPin(true), { passive: true });
  }

  function revealOnScroll() {
    const kinds = getPageKinds();
    if (kinds.post) {
      const post = document.getElementById('post');
      if (post) {
        post.classList.add('pro-reveal', 'pro-in-view');
        revealedNodes.add(post);
      }
      return;
    }

    const selector = kinds.post ? '#post' : [
      '.recent-post-item',
      '#aside-content .card-widget',
      '#post',
      '#page',
      '#archive',
      '#tag',
      '#category',
      '.article-sort-item',
      '.pro-flink-card',
      '.tag-cloud-list a'
    ].join(',');
    const targets = selectAll(selector).filter(node => !revealedNodes.has(node));

    if (!targets.length) return;
    targets.forEach(node => {
      node.classList.add('pro-reveal');
      revealedNodes.add(node);
    });

    if (reduceMotion.matches || !window.IntersectionObserver) {
      targets.forEach(node => node.classList.add('pro-in-view'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        node.classList.add('pro-in-view');

        if (window.gsap) {
          const heavyPage = kinds.post && node.id === 'post';
          window.gsap.fromTo(node, {
            y: heavyPage ? 28 : 84,
            autoAlpha: 0,
            scale: heavyPage ? 1 : 0.96,
            filter: heavyPage ? 'none' : 'blur(10px)'
          }, {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: heavyPage ? 0.56 : 1.18,
            ease: 'expo.out',
            clearProps: 'transform,opacity,visibility,filter'
          });
        }

        observer.unobserve(node);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.16
    });

    targets.forEach(node => observer.observe(node));
  }

  function bindCardTilt() {
    if (reduceMotion.matches || !window.gsap) return;

    const kinds = getPageKinds();
    if (kinds.post) return;

    const selector = kinds.post
      ? '.pro-flink-card'
      : '.recent-post-item, .pro-flink-card, .article-sort-item:not(.year), .tag-cloud-list a';

    selectAll(selector).forEach(card => {
      if (enhancedCards.has(card)) return;
      enhancedCards.add(card);

      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        window.gsap.to(card, {
          rotationX: y * -4,
          rotationY: x * 5,
          y: -4,
          transformPerspective: 900,
          transformOrigin: 'center',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        if (!card.classList.contains('recent-post-item')) {
          window.gsap.to(card.querySelectorAll('.article-sort-item-title'), {
            x: x * 8,
            y: y * 5,
            duration: 0.38,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        window.gsap.to(card.querySelectorAll('.recent-post-cover img, .article-sort-item-img img'), {
          x: x * -14,
          y: y * -10,
          scale: 1.1,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        window.gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        window.gsap.to(card.querySelectorAll('.recent-post-cover img, .article-sort-item-title, .article-sort-item-img img'), {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  }

  function animateTextCards() {
    if (reduceMotion.matches || !window.gsap) return;

    selectAll('.recent-post-item .article-content').forEach((node, index) => {
      if (node.dataset.proTextDone) return;
      node.dataset.proTextDone = 'true';

      window.gsap.from(node, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.7,
        delay: Math.min(index * 0.035, 0.28),
        ease: 'power3.out',
        clearProps: 'clipPath'
      });

      const text = node.querySelector('.article-content-text');
      if (text) {
        window.gsap.from(text, {
          x: -18,
          autoAlpha: 0,
          duration: 0.58,
          delay: Math.min(index * 0.035 + 0.16, 0.42),
          ease: 'power2.out'
        });
      }
    });
  }

  function animateCounters() {
    if (reduceMotion.matches || !window.gsap || getPageKinds().post) return;

    selectAll('.length-num, .item-count').forEach(node => {
      if (node.dataset.proCountDone || !/^\d+(\.\d+)?[kKmM]?$/.test(node.textContent.trim())) return;
      node.dataset.proCountDone = 'true';
      window.gsap.from(node, {
        textShadow: '0 0 28px rgba(255, 209, 102, 0.95)',
        scale: 1.18,
        duration: 0.65,
        ease: 'back.out(1.8)'
      });
    });
  }

  function rebuildFriendLinks() {
    const flink = document.querySelector('.flink');
    if (!flink || flink.dataset.proRebuilt) return;

    const lists = selectAll('.flink-list').filter(list => list.querySelector('.flink-list-item'));
    if (!lists.length) return;

    flink.dataset.proRebuilt = 'true';
    document.body.classList.add('pro-flink-ready');

    lists.forEach((list, listIndex) => {
      const grid = document.createElement('div');
      grid.className = 'pro-flink-grid';
      grid.dataset.group = String(listIndex + 1).padStart(2, '0');

      selectAll.call(null, '.flink-list-item').filter(item => item.parentElement === list).forEach((item, itemIndex) => {
        const sourceLink = item.querySelector('a');
        const sourceImage = item.querySelector('img');
        const sourceName = item.querySelector('.flink-item-name');
        const sourceDesc = item.querySelector('.flink-item-desc');

        const href = sourceLink ? sourceLink.getAttribute('href') : '#';
        const title = (sourceName && sourceName.textContent.trim()) || (sourceLink && sourceLink.getAttribute('title')) || 'Link';
        const desc = (sourceDesc && sourceDesc.textContent.trim()) || 'External resource';
        const avatar = sourceImage ? sourceImage.getAttribute('src') : '';

        const card = document.createElement('a');
        card.className = 'pro-flink-card';
        card.href = href || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.title = title;
        card.dataset.index = String(itemIndex + 1).padStart(2, '0');

        const avatarWrap = document.createElement('span');
        avatarWrap.className = 'pro-flink-card__avatar-wrap';

        const img = document.createElement('img');
        img.className = 'pro-flink-card__avatar no-lightbox';
        img.src = avatar;
        img.alt = title;
        img.loading = 'lazy';
        img.onerror = function () {
          this.onerror = null;
          this.removeAttribute('src');
          this.classList.add('pro-image-broken');
          avatarWrap.classList.add('pro-avatar-fallback');
          avatarWrap.setAttribute('data-fallback', '404');
        };
        avatarWrap.appendChild(img);

        const body = document.createElement('span');
        body.className = 'pro-flink-card__body';

        const meta = document.createElement('span');
        meta.className = 'pro-flink-card__meta';
        meta.textContent = `NODE-${String(itemIndex + 1).padStart(2, '0')}`;

        const name = document.createElement('span');
        name.className = 'pro-flink-card__name';
        name.textContent = title;

        const description = document.createElement('span');
        description.className = 'pro-flink-card__desc';
        description.textContent = desc;

        body.append(meta, name, description);

        const signal = document.createElement('span');
        signal.className = 'pro-flink-card__signal';
        for (let index = 0; index < 3; index += 1) {
          signal.appendChild(document.createElement('span'));
        }

        card.append(avatarWrap, body, signal);
        grid.appendChild(card);
      });

      list.replaceWith(grid);
    });

    if (window.lazyLoadInstance) window.lazyLoadInstance.update();

    if (!reduceMotion.matches && window.gsap) {
      window.gsap.from('.pro-flink-card', {
        y: 44,
        autoAlpha: 0,
        scale: 0.95,
        duration: 0.82,
        stagger: {
          each: 0.035,
          from: 'start'
        },
        ease: 'expo.out',
        clearProps: 'transform,opacity,visibility'
      });
    }
  }

  function animateAmbientDetails() {
    if (reduceMotion.matches || !window.gsap) return;

    selectAll('.recent-post-item').forEach((card, index) => {
      if (card.dataset.proPulseDone) return;
      card.dataset.proPulseDone = 'true';

      window.gsap.fromTo(card, {
        '--pro-card-glow': 0
      }, {
        '--pro-card-glow': 1,
        duration: 1.1,
        delay: Math.min(index * 0.05, 0.35),
        ease: 'power2.out'
      });
    });
  }

  function applyImageFallback(img) {
    if (!img || img.dataset.proImageFallback) return;
    img.dataset.proImageFallback = 'true';
    img.onerror = null;
    img.removeAttribute('onerror');

    const friendWrap = img.closest('.pro-flink-card__avatar-wrap, .flink-item-icon, .avatar-img');
    if (friendWrap) {
      img.removeAttribute('src');
      img.classList.add('pro-image-broken');
      friendWrap.classList.add('pro-avatar-fallback');
      friendWrap.setAttribute('data-fallback', '404');
      return;
    }

    img.classList.add('pro-image-broken-generic');
    const fallback = document.createElement('span');
    fallback.className = 'pro-image-fallback';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.innerHTML = '<span>IMG</span><i></i><b></b>';
    img.insertAdjacentElement('afterend', fallback);
  }

  function bindImageFallbacks() {
    if (!imageFallbackBound) {
      imageFallbackBound = true;
      document.addEventListener('error', event => {
        if (event.target && event.target.tagName === 'IMG') applyImageFallback(event.target);
      }, true);
    }

    selectAll('img').forEach(img => {
      const src = img.currentSrc || img.getAttribute('src') || '';
      if (src.indexOf('/img/friend_404.gif') !== -1 || (img.complete && !img.naturalWidth)) {
        applyImageFallback(img);
      }
    });
  }

  function spawnTechBurst(clientX, clientY, ambient, variant) {
    if (reduceMotion.matches || document.hidden) return;

    const isPost = getPageKinds().post;
    const x = `${Math.round(clientX)}px`;
    const y = `${Math.round(clientY)}px`;
    const burst = [];
    const ambientVariant = ambient ? (variant || AMBIENT_BURST_VARIANTS[Math.floor(Math.random() * AMBIENT_BURST_VARIANTS.length)]) : '';
    const ambientClass = ambient ? ` pro-ambient-fx pro-ambient-fx--${ambientVariant}` : '';
    const ring = document.createElement('span');
    const cross = document.createElement('span');
    const glyph = document.createElement('span');

    ring.className = ambient ? `pro-click-ring pro-click-ring--ambient${ambientClass}` : 'pro-click-ring';
    cross.className = ambient ? `pro-click-cross pro-click-cross--ambient${ambientClass}` : 'pro-click-cross';
    ring.style.setProperty('--x', x);
    ring.style.setProperty('--y', y);
    cross.style.setProperty('--x', x);
    cross.style.setProperty('--y', y);
    burst.push(ring, cross);

    if (ambient) {
      glyph.className = `pro-click-glyph pro-click-glyph--ambient${ambientClass}`;
      glyph.textContent = ambientVariant.toUpperCase();
      glyph.style.setProperty('--x', x);
      glyph.style.setProperty('--y', y);
      burst.push(glyph);
    }

    const dotCount = ambient ? 4 + Math.floor(Math.random() * 5) : (isPost ? 5 : 10);
    for (let index = 0; index < dotCount; index += 1) {
      const dot = document.createElement('span');
      const angle = (Math.PI * 2 * index) / dotCount;
      const distance = ambient ? 22 + Math.random() * 34 : (isPost ? 18 + Math.random() * 26 : 34 + Math.random() * 42);
      dot.className = ambient ? `pro-click-dot pro-click-dot--ambient${ambientClass}` : 'pro-click-dot';
      dot.style.setProperty('--x', x);
      dot.style.setProperty('--y', y);
      dot.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      dot.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      burst.push(dot);
    }

    burst.forEach(node => document.body.appendChild(node));
    window.setTimeout(() => {
      burst.forEach(node => node.remove());
    }, ambient ? 1400 : 820);
  }

  function bindTechClickEffect() {
    if (clickEffectBound || reduceMotion.matches) return;
    clickEffectBound = true;

    window.addEventListener('click', event => {
      if (event.target.closest('input, textarea, select')) return;
      spawnTechBurst(event.clientX, event.clientY, false);
    }, { passive: true });
  }

  function bindAmbientBurstEffect() {
    if (ambientBurstBound || reduceMotion.matches) return;
    ambientBurstBound = true;

    const schedule = () => {
      window.setTimeout(() => {
        if (!document.hidden && window.innerWidth > 360 && window.innerHeight > 360) {
          const marginX = Math.min(180, window.innerWidth * 0.16);
          const marginY = Math.min(160, window.innerHeight * 0.18);
          const effectCount = 1 + Math.floor(Math.random() * 2);
          for (let index = 0; index < effectCount; index += 1) {
            const x = marginX + Math.random() * Math.max(1, window.innerWidth - marginX * 2);
            const y = marginY + Math.random() * Math.max(1, window.innerHeight - marginY * 2);
            const variant = AMBIENT_BURST_VARIANTS[Math.floor(Math.random() * AMBIENT_BURST_VARIANTS.length)];
            window.setTimeout(() => spawnTechBurst(x, y, true, variant), index * (160 + Math.random() * 180));
          }
        }
        schedule();
      }, AMBIENT_BURST_DELAY);
    };

    schedule();
  }

  function bindSearchResultTransition() {
    if (searchTransitionBound) return;
    searchTransitionBound = true;

    document.addEventListener('click', event => {
      const link = event.target.closest('#local-search-results a, #local-search .local-search-hit-item a');
      if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.href;
      if (!href || href.indexOf(location.origin) !== 0) return;

      event.preventDefault();
      document.body.classList.remove('pro-search-open');
      document.body.style.width = '';
      document.body.style.overflow = '';
      showOutboundLoader('OPENING ENTRY');
      window.sessionStorage.setItem('pro-search-transition', '1');

      window.setTimeout(() => {
        window.location.href = href;
      }, 320);
    }, true);
  }

  function initProMode() {
    document.body.classList.add('pro-motion-ready');
    markPageKinds();
    prunePostBackgrounds();
    ensureLoader();
    enhanceHeroCopy();
    enhancePageKicker();
    ensureTopNav();
    ensureCompactSearch();
    ensureScrollRail();
    ensureProTocScrollRail();
    ensurePostTocPin();
    ensureCursorGlow();
    rebuildFriendLinks();
    bindImageFallbacks();
    runHeroIntro();
    revealOnScroll();
    bindCardTilt();
    animateTextCards();
    animateCounters();
    animateAmbientDetails();
    bindTechClickEffect();
    bindAmbientBurstEffect();
    bindSearchResultTransition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProMode);
  } else {
    initProMode();
  }

  document.addEventListener('pjax:complete', initProMode);
  document.addEventListener('pjax:success', initProMode);
})();
