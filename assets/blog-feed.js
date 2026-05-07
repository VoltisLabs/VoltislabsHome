/**
 * Voltis Labs articles index - mirrors src/app/blog/page.tsx against Hygraph CDN.
 * - blog.html: full index (9 / page), filters, grid/list, infinite scroll.
 * - home.html: first `CONFIG.homePostsCount` items into #vl-home-blog-posts (same card markup).
 */
(function () {
  const CONFIG = {
    hygraphUrl:
      'https://eu-west-2.cdn.hygraph.com/content/cmamc2a6t01g107wczpa881tu/master',
    /** Canonical article URLs on the Next.js site (static bundle has no route per slug). */
    articleBaseUrl: 'https://voltislabs.com/blog',
    postsPerPage: 9,
    /** Homepage (home.html): first N items, same query and card markup as articles index. */
    homePostsCount: 5,
  };

  const GET_POSTS_QUERY = `
    query GetPost($first: Int!, $skip: Int!) {
      posts(first: $first, skip: $skip, orderBy: datePublished_DESC) {
        category { name }
        slug
        title
        datePublished
        featuredImage { url }
      }
    }
  `;

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const abbreviatedMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  let state = {
    posts: [],
    activeTab: 'All',
    sortOrder: 'newest',
    view: 'grid',
    loading: true,
    loadingMore: false,
    error: null,
    loadMoreError: null,
    retrying: false,
    selectedYear: null,
    selectedMonth: null,
    specificDate: '',
    dateSearchInput: '',
    invalidDateEntered: false,
    totalPostsLoaded: 0,
    hasMorePosts: true,
    postsPerPage: CONFIG.postsPerPage,
  };

  let loadLock = false;
  let observer = null;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchPosts(first, skip) {
    const res = await fetch(CONFIG.hygraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_POSTS_QUERY,
        variables: { first, skip },
      }),
    });
    const json = await res.json();
    if (json.errors && json.data == null) {
      const msg = json.errors.map((e) => e.message).filter(Boolean).join('; ');
      throw new Error(msg || 'GraphQL error');
    }
    return json;
  }

  function normalizePost(p) {
    return {
      title: p.title,
      slug: p.slug,
      datePublished: p.datePublished,
      image: p.featuredImage?.url || '',
      category:
        Array.isArray(p.category) && p.category.length > 0
          ? p.category[0].name
          : 'Uncategorized',
    };
  }

  function getUniqueYears() {
    const years = state.posts
      .map((post) => new Date(post.datePublished).getFullYear().toString())
      .filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }

  function getMonthsInYear(year) {
    const monthsInYear = state.posts
      .filter((post) => new Date(post.datePublished).getFullYear().toString() === year)
      .map((post) => {
        const date = new Date(post.datePublished);
        return {
          value: date.getMonth().toString(),
          label: date.toLocaleString('default', { month: 'long' }),
        };
      });
    const uniqueMonths = Array.from(
      new Map(monthsInYear.map((item) => [item.value, item])).values(),
    ).sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
    return uniqueMonths;
  }

  function getCategories() {
    return ['All', ...Array.from(new Set(state.posts.map((p) => p.category))).filter(Boolean)];
  }

  function getFilteredPosts() {
    return state.posts
      .filter((post) => state.activeTab === 'All' || post.category === state.activeTab)
      .filter((post) => {
        if (state.invalidDateEntered) return false;
        if (state.selectedYear) {
          const postDate = new Date(post.datePublished);
          const postYear = postDate.getFullYear().toString();
          if (postYear !== state.selectedYear) return false;
          if (state.selectedMonth) {
            const postMonth = postDate.getMonth().toString();
            if (postMonth !== state.selectedMonth) return false;
            if (state.specificDate && state.specificDate.trim() !== '') {
              const postDay = postDate.getDate().toString().padStart(2, '0');
              if (postDay !== state.specificDate) return false;
            }
          }
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.datePublished).getTime();
        const dateB = new Date(b.datePublished).getTime();
        return state.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }

  function handleDateChange(value) {
    state.dateSearchInput = value;

    if (!value) {
      state.specificDate = '';
      state.invalidDateEntered = false;
      return;
    }

    const valueLower = value.toLowerCase();
    const formatMonthDayYear = /([a-zA-Z]+)[\s,]+(\d{1,2})[\s,]*(\d{4})/i;
    const formatDayMonthYear = /(\d{1,2})[\s-/]+([a-zA-Z]{3,})[\s-/]+(\d{4})/i;
    const formatMonthYear = /([a-zA-Z]+)[\s,]*(\d{4})/i;
    const formatMonthOnly = /^([a-zA-Z]+)$/i;

    const matchFormat1 = value.match(formatMonthDayYear);
    const matchFormat2 = value.match(formatDayMonthYear);
    const matchFormat3 = value.match(formatMonthYear);
    const matchFormat4 = value.match(formatMonthOnly);

    const posts = state.posts;

    if (matchFormat1) {
      const monthName = matchFormat1[1].toLowerCase();
      const day = parseInt(matchFormat1[2], 10);
      const year = matchFormat1[3];
      const monthIndex = monthNames.findIndex((m) => monthName.startsWith(m.substring(0, 3)));
      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        const potentialMatches = posts.filter((post) => {
          const postDate = new Date(post.datePublished);
          return (
            postDate.getDate() === day &&
            postDate.getMonth() === monthIndex &&
            postDate.getFullYear().toString() === year
          );
        });
        if (potentialMatches.length > 0) {
          state.selectedYear = year;
          state.selectedMonth = monthIndex.toString();
          state.specificDate = day.toString().padStart(2, '0');
          state.invalidDateEntered = false;
        } else state.invalidDateEntered = true;
      } else state.invalidDateEntered = true;
    } else if (matchFormat2) {
      const day = parseInt(matchFormat2[1], 10);
      const monthName = matchFormat2[2].toLowerCase();
      const year = matchFormat2[3];
      const monthIndex = abbreviatedMonths.findIndex((m) => monthName.startsWith(m));
      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        const potentialMatches = posts.filter((post) => {
          const postDate = new Date(post.datePublished);
          return (
            postDate.getDate() === day &&
            postDate.getMonth() === monthIndex &&
            postDate.getFullYear().toString() === year
          );
        });
        if (potentialMatches.length > 0) {
          state.selectedYear = year;
          state.selectedMonth = monthIndex.toString();
          state.specificDate = day.toString().padStart(2, '0');
          state.invalidDateEntered = false;
        } else state.invalidDateEntered = true;
      } else state.invalidDateEntered = true;
    } else if (matchFormat3) {
      const monthName = matchFormat3[1].toLowerCase();
      const year = matchFormat3[2];
      const monthIndex = monthNames.findIndex((m) => monthName.startsWith(m.substring(0, 3)));
      if (monthIndex !== -1) {
        const potentialMatches = posts.filter((post) => {
          const postDate = new Date(post.datePublished);
          return (
            postDate.getMonth() === monthIndex && postDate.getFullYear().toString() === year
          );
        });
        if (potentialMatches.length > 0) {
          state.selectedYear = year;
          state.selectedMonth = monthIndex.toString();
          state.specificDate = '';
          state.invalidDateEntered = false;
        } else state.invalidDateEntered = true;
      } else state.invalidDateEntered = true;
    } else if (matchFormat4) {
      const monthName = matchFormat4[1].toLowerCase();
      const monthIndex = monthNames.findIndex((m) => monthName.startsWith(m));
      if (monthIndex !== -1) {
        const potentialMatches = posts.filter((post) => {
          const postDate = new Date(post.datePublished);
          return postDate.getMonth() === monthIndex;
        });
        if (potentialMatches.length > 0) {
          state.selectedMonth = monthIndex.toString();
          state.specificDate = '';
          state.invalidDateEntered = false;
        } else state.invalidDateEntered = true;
      } else {
        const partialMonthMatch = monthNames.some((m) => m.startsWith(valueLower));
        state.invalidDateEntered = !partialMonthMatch;
      }
    } else {
      const dayMatch = value.match(/^\d{1,2}$/);
      if (dayMatch) {
        const day = parseInt(dayMatch[0], 10);
        if (day >= 1 && day <= 31) {
          const dayExists = posts.some((post) => {
            const postDate = new Date(post.datePublished);
            return (
              postDate.getDate() === day &&
              (state.selectedMonth === null ||
                postDate.getMonth().toString() === state.selectedMonth) &&
              (state.selectedYear === null ||
                postDate.getFullYear().toString() === state.selectedYear)
            );
          });
          if (dayExists) {
            state.specificDate = day.toString().padStart(2, '0');
            state.invalidDateEntered = false;
          } else state.invalidDateEntered = true;
        } else state.invalidDateEntered = true;
      } else {
        const isStartOfMonthName = monthNames.some((month) => month.startsWith(valueLower));
        state.invalidDateEntered = !isStartOfMonthName;
      }
    }
  }

  function articleHref(slug) {
    return `${CONFIG.articleBaseUrl}/${encodeURIComponent(slug)}`;
  }

  function formatPostDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function skeletonHtml(view, itemCount) {
    const n = typeof itemCount === 'number' && itemCount > 0 ? itemCount : 3;
    const inner = Array.from({ length: n })
      .map(
        () => `
      <div class="vl-blog-skel vl-blog-skel--${view}">
        <div class="vl-blog-skel__thumb"><div class="vl-blog-skel__pulse"></div></div>
        <div class="vl-blog-skel__lines">
          <div class="vl-blog-skel__pulse vl-blog-skel__line"></div>
          <div class="vl-blog-skel__pulse vl-blog-skel__line vl-blog-skel__line--short"></div>
        </div>
      </div>`,
      )
      .join('');
    return `<div class="vl-blog-posts vl-blog-posts--${view}">${inner}</div>`;
  }

  function renderPostsHtml(posts, view) {
    if (posts.length === 0) {
      return `
      <div class="vl-blog-empty">
        <svg class="vl-blog-empty__icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <h3 class="vl-blog-empty__title">No articles found</h3>
        <p class="vl-blog-empty__text">Try adjusting your date filters or category selection to find more content.</p>
      </div>`;
    }

    const cards = posts
      .map((post) => {
        const href = articleHref(post.slug);
        const img = post.image
          ? `<img src="${escapeHtml(post.image)}" alt="" width="310" height="300" loading="lazy" decoding="async" />`
          : '<div class="vl-blog-card-fallback"></div>';
        const title = escapeHtml(post.title);
        const cat = escapeHtml(post.category);
        const dateStr = formatPostDate(post.datePublished);

        if (view === 'list') {
          return `
          <a class="vl-blog-item vl-blog-item--list" href="${href}" target="_blank" rel="noopener noreferrer">
            <div class="vl-blog-item__thumb">${img}</div>
            <div class="vl-blog-item__text">
              <h3 class="vl-blog-item__title">${title}</h3>
              <p class="vl-blog-item__meta"><span class="vl-blog-item__cat">${cat}</span> - ${escapeHtml(dateStr)}</p>
            </div>
          </a>`;
        }
        return `
        <a class="vl-blog-item vl-blog-item--grid" href="${href}" target="_blank" rel="noopener noreferrer">
          <div class="vl-blog-item__thumb">${img}</div>
          <div class="vl-blog-item__text">
            <h3 class="vl-blog-item__title">${title}</h3>
            <p class="vl-blog-item__meta"><span class="vl-blog-item__cat">${cat}</span> - ${escapeHtml(dateStr)}</p>
          </div>
        </a>`;
      })
      .join('');

    return `<div class="vl-blog-posts vl-blog-posts--${view}">${cards}</div>`;
  }

  function renderYearMonthUI() {
    const yearSel = $('vl-blog-year');
    const monthWrap = $('vl-blog-month-wrap');
    const monthSel = $('vl-blog-month');
    const dateWrap = $('vl-blog-date-wrap');
    const clearBtn = $('vl-blog-clear-filters');

    if (yearSel) {
      const y = state.selectedYear || '';
      yearSel.innerHTML =
        '<option value="">All Years</option>' +
        getUniqueYears()
          .map((year) => `<option value="${year}"${year === y ? ' selected' : ''}>${year}</option>`)
          .join('');
    }

    if (monthWrap && monthSel) {
      monthWrap.hidden = !state.selectedYear;
      if (state.selectedYear) {
        const months = getMonthsInYear(state.selectedYear);
        const m = state.selectedMonth || '';
        monthSel.innerHTML =
          '<option value="">All Months</option>' +
          months
            .map(
              (mo) =>
                `<option value="${mo.value}"${mo.value === m ? ' selected' : ''}>${escapeHtml(mo.label)}</option>`,
            )
            .join('');
      }
    }

    if (dateWrap) {
      dateWrap.hidden = !(state.selectedYear && state.selectedMonth);
    }

    const dateInput = $('vl-blog-date-input');
    if (dateInput && dateInput.value !== state.dateSearchInput) {
      dateInput.value = state.dateSearchInput;
    }
    const dateErr = $('vl-blog-date-error');
    if (dateErr) {
      dateErr.hidden = !state.invalidDateEntered;
      dateInput?.classList.toggle('vl-blog-input--invalid', state.invalidDateEntered);
    }

    if (clearBtn) {
      clearBtn.hidden = !(state.selectedYear || state.selectedMonth || state.specificDate);
    }
  }

  function renderCategories() {
    const container = $('vl-blog-categories');
    if (!container) return;
    if (state.loading) {
      container.innerHTML = Array.from({ length: 6 })
        .map(() => '<span class="vl-blog-cat-skel"></span>')
        .join('');
      return;
    }
    const cats = getCategories();
    /* Newspaper chips: always ghost + newspaper rail in blog.css (.vl-news-edition); never filled primary */
    container.innerHTML = cats
      .map(
        (cat) =>
          `<button type="button" class="vl-blog-cat vl-liquid-btn vl-liquid-btn--ghost vl-liquid-btn--sm${
            state.activeTab === cat ? ' vl-blog-cat--active' : ''
          }" data-category="${escapeHtml(cat)}"><span class="vl-liquid-btn__fill" aria-hidden="true"></span><span class="vl-liquid-btn__text">${escapeHtml(
            cat,
          )}</span></button>`,
      )
      .join('');
  }

  function renderCount() {
    const el = $('vl-blog-count');
    if (!el) return;
    const filtered = getFilteredPosts();
    const n = filtered.length;
    const label = n === 1 ? 'article' : 'articles';
    let text = `Showing ${n} ${label}`;
    if (state.totalPostsLoaded > 0) {
      text += ` (${state.totalPostsLoaded} total loaded)`;
    }
    el.textContent = text;
  }

  function renderError() {
    const wrap = $('vl-blog-error');
    if (!wrap) return;
    if (state.error && !state.loading && state.posts.length === 0) {
      wrap.hidden = false;
      wrap.innerHTML = `
        <div class="vl-blog-error-inner">
          <p class="vl-blog-error__title">Network Error</p>
          <p class="vl-blog-error__msg">${escapeHtml(state.error)}</p>
          <button type="button" class="vl-liquid-btn vl-liquid-btn--ghost vl-liquid-btn--sm" id="vl-blog-retry"><span class="vl-liquid-btn__fill" aria-hidden="true"></span><span class="vl-liquid-btn__text">${escapeHtml(state.retrying ? 'Retrying…' : 'Retry')}</span></button>
        </div>`;
      const btn = $('vl-blog-retry');
      if (btn && !state.retrying) {
        btn.onclick = () => initialLoad(true);
      }
    } else {
      wrap.hidden = true;
      wrap.innerHTML = '';
    }
  }

  function renderLoadMoreBlock() {
    const errEl = $('vl-blog-loadmore-error');
    if (errEl) {
      if (state.loadMoreError) {
        errEl.hidden = false;
        errEl.innerHTML = `
          <div class="vl-blog-loadmore-err">
            <p>${escapeHtml(state.loadMoreError)}</p>
            <button type="button" class="vl-liquid-btn vl-liquid-btn--ghost vl-liquid-btn--sm vl-liquid-btn--danger" id="vl-blog-retry-more"><span class="vl-liquid-btn__fill" aria-hidden="true"></span><span class="vl-liquid-btn__text">Retry</span></button>
          </div>`;
        const r = $('vl-blog-retry-more');
        if (r) {
          r.onclick = () => {
            state.loadMoreError = null;
            loadMorePosts();
            render();
          };
        }
      } else {
        errEl.hidden = true;
        errEl.innerHTML = '';
      }
    }

    const loadingMore = $('vl-blog-loading-more');
    if (loadingMore) {
      loadingMore.hidden = !state.loadingMore;
    }

    const endEl = $('vl-blog-end');
    if (endEl) {
      endEl.hidden = state.hasMorePosts || state.posts.length === 0 || !!state.error;
    }

    const sentinel = $('vl-blog-sentinel');
    if (sentinel) {
      sentinel.hidden = !state.hasMorePosts || !!state.loadMoreError;
    }
  }

  function renderViewButtons() {
    const g = $('vl-blog-view-grid');
    const l = $('vl-blog-view-list');
    if (g) {
      g.classList.toggle('vl-blog-icon-btn--on', state.view === 'grid');
      g.setAttribute('aria-pressed', state.view === 'grid' ? 'true' : 'false');
    }
    if (l) {
      l.classList.toggle('vl-blog-icon-btn--on', state.view === 'list');
      l.setAttribute('aria-pressed', state.view === 'list' ? 'true' : 'false');
    }
  }

  function render() {
    const container = $('vl-blog-posts');
    if (!container) return;

    if (state.loading) {
      container.innerHTML = skeletonHtml(state.view);
    } else if (state.error && state.posts.length === 0) {
      container.innerHTML = '';
    } else {
      container.innerHTML = renderPostsHtml(getFilteredPosts(), state.view);
    }

    renderYearMonthUI();
    renderCategories();
    renderCount();
    renderError();
    renderLoadMoreBlock();
    renderViewButtons();

    const sortEl = $('vl-blog-sort');
    if (sortEl) sortEl.value = state.sortOrder;

    setupObserver();
  }

  function setupObserver() {
    const sentinel = $('vl-blog-sentinel');
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (!sentinel || sentinel.hidden || state.loading || state.error) return;

    observer = new IntersectionObserver(
      (entries) => {
        const t = entries[0];
        if (t.isIntersecting && state.hasMorePosts && !loadLock && !state.loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );
    observer.observe(sentinel);
  }

  async function initialLoad(isRetry) {
    if (isRetry) {
      state.retrying = true;
      render();
    }
    state.loading = true;
    state.error = null;
    loadLock = true;
    render();

    try {
      const data = await fetchPosts(state.postsPerPage, 0);
      const raw = data?.data?.posts;
      const list = Array.isArray(raw) ? raw : [];
      const formatted = list.map(normalizePost);
      state.posts = formatted;
      state.totalPostsLoaded = formatted.length;
      state.hasMorePosts = formatted.length === state.postsPerPage;
      state.error = null;
    } catch (e) {
      state.error = e.message || 'Please check your network connection and try again.';
      state.posts = [];
      state.totalPostsLoaded = 0;
      state.hasMorePosts = false;
    } finally {
      state.loading = false;
      state.retrying = false;
      loadLock = false;
      render();
    }
  }

  async function loadMorePosts() {
    if (loadLock || !state.hasMorePosts || state.loadingMore) return;
    loadLock = true;
    state.loadingMore = true;
    state.loadMoreError = null;
    render();

    try {
      const data = await fetchPosts(state.postsPerPage, state.totalPostsLoaded);
      const raw = data?.data?.posts;
      const list = Array.isArray(raw) ? raw : [];
      const formatted = list.map(normalizePost);
      if (formatted.length > 0) {
        state.posts = state.posts.concat(formatted);
        state.totalPostsLoaded += formatted.length;
        if (formatted.length < state.postsPerPage) state.hasMorePosts = false;
      } else {
        state.hasMorePosts = false;
      }
    } catch (e) {
      state.loadMoreError =
        'Failed to load more articles. Please check your network connection.';
    } finally {
      state.loadingMore = false;
      loadLock = false;
      render();
    }
  }

  function bindControls() {
    const shell = document.querySelector('.vl-blog-shell');
    shell?.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'vl-blog-year') {
        state.selectedYear = t.value || null;
        state.selectedMonth = null;
        state.specificDate = '';
        render();
      } else if (t.id === 'vl-blog-month') {
        state.selectedMonth = t.value || null;
        state.specificDate = '';
        render();
      } else if (t.id === 'vl-blog-sort') {
        state.sortOrder = t.value === 'oldest' ? 'oldest' : 'newest';
        render();
      }
    });

    $('vl-blog-date-input')?.addEventListener('input', (e) => {
      handleDateChange(e.target.value);
      render();
    });

    $('vl-blog-clear-filters')?.addEventListener('click', () => {
      state.selectedYear = null;
      state.selectedMonth = null;
      state.specificDate = '';
      state.dateSearchInput = '';
      state.invalidDateEntered = false;
      const inp = $('vl-blog-date-input');
      if (inp) inp.value = '';
      render();
    });

    $('vl-blog-categories')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn) return;
      state.activeTab = btn.getAttribute('data-category');
      render();
    });

    $('vl-blog-view-grid')?.addEventListener('click', () => {
      state.view = 'grid';
      render();
    });
    $('vl-blog-view-list')?.addEventListener('click', () => {
      state.view = 'list';
      render();
    });

    $('vl-blog-back-top')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener(
      'scroll',
      () => {
        const btn = $('vl-blog-back-top');
        if (btn) btn.hidden = window.scrollY <= 300;
      },
      { passive: true },
    );
  }

  async function initHomeBlogWidget() {
    const mount = $('vl-home-blog-posts');
    const errWrap = $('vl-home-blog-error');
    if (!mount) return;

    const count = CONFIG.homePostsCount || 4;
    mount.innerHTML = skeletonHtml('list', count);
    if (errWrap) {
      errWrap.hidden = true;
      errWrap.innerHTML = '';
    }

    try {
      const data = await fetchPosts(count, 0);
      const raw = data?.data?.posts;
      const list = (Array.isArray(raw) ? raw : []).map(normalizePost).slice(0, count);
      mount.innerHTML =
        list.length > 0
          ? renderPostsHtml(list, 'list')
          : `<div class="vl-blog-posts vl-blog-posts--list"><p class="vl-home-blog__empty p2">No articles yet.</p></div>`;
    } catch (e) {
      mount.innerHTML = '';
      if (errWrap) {
        errWrap.hidden = false;
        errWrap.innerHTML = `
        <div class="vl-blog-error-inner">
          <p class="vl-blog-error__title">Network Error</p>
          <p class="vl-blog-error__msg">${escapeHtml(e.message || 'Please check your network connection and try again.')}</p>
          <button type="button" class="vl-liquid-btn" id="vl-home-blog-retry"><span class="vl-liquid-btn__fill" aria-hidden="true"></span><span class="vl-liquid-btn__text">Retry</span></button>
        </div>`;
        const r = $('vl-home-blog-retry');
        if (r) {
          r.onclick = () => {
            initHomeBlogWidget();
          };
        }
      }
    }
  }

  function init() {
    const homeMount = $('vl-home-blog-posts');
    const blogMount = $('vl-blog-posts');
    if (homeMount && !blogMount) {
      initHomeBlogWidget();
      return;
    }
    if (!blogMount) return;
    bindControls();
    initialLoad(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
