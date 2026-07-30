import { createClient } from '../../vendor/supabase.js';

const supabase = createClient();

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString();
}

async function loadStats() {
  try {
    // Total items
    const { data: allItems, error: allErr } = await supabase
      .from('items')
      .select('id');

    const totalCount = allItems ? allItems.length : 0;

    // Captured today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayItems, error: todayErr } = await supabase
      .from('items')
      .select('id')
      .gte('created_at', today.toISOString());

    const todayCount = todayItems ? todayItems.length : 0;

    // Categories
    const { data: catItems, error: catErr } = await supabase
      .from('items')
      .select('category');

    const categories = new Set();
    if (catItems) {
      catItems.forEach(function(item) {
        if (item.category) categories.add(item.category);
      });
    }
    const categoryCount = categories.size;

    // Update DOM
    const totalEl = document.getElementById('statTotal');
    const todayEl = document.getElementById('statToday');
    const catEl = document.getElementById('statCategories');

    if (totalEl) totalEl.textContent = totalCount;
    if (todayEl) todayEl.textContent = todayCount;
    if (catEl) catEl.textContent = categoryCount;
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function loadRecentCaptures() {
  const grid = document.getElementById('recentGrid');
  if (!grid) return;

  try {
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Remove skeleton loaders
    const skeletons = grid.querySelectorAll('.skeleton-card');
    skeletons.forEach(function(s) { s.remove(); });

    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p class="empty-state-text">No items captured yet. Start by capturing your first item!</p></div>';
      return;
    }

    grid.innerHTML = '';
    items.forEach(function(item) {
      var imgSrc = item.image_url || '';
      var imgHtml = imgSrc
        ? '<img class="recent-card-img" src="' + imgSrc + '" alt="' + (item.name || 'Item') + '">'
        : '<div class="recent-card-img" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);background:var(--background);">No Image</div>';

      var card = document.createElement('div');
      card.className = 'recent-card';
      card.innerHTML = imgHtml +
        '<div class="recent-card-info">' +
          '<div class="recent-card-title">' + (item.name || 'Untitled') + '</div>' +
          '<div class="recent-card-meta">' +
            '<span>' + (item.category || 'Uncategorized') + '</span>' +
            '<span>' + formatDate(item.created_at) + '</span>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load recent captures:', err);
    var skeletons = grid.querySelectorAll('.skeleton-card');
    skeletons.forEach(function(s) { s.remove(); });
    grid.innerHTML = '<div class="empty-state"><p class="empty-state-text">Could not load recent items.</p></div>';
  }
}

function initThemeToggle() {
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  toggle.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

function initMobileMenu() {
  var btn = document.getElementById('mobileMenuBtn');
  var nav = document.getElementById('mobileNav');
  var closeBtn = document.getElementById('mobileNavClose');

  if (!btn || !nav) return;

  btn.addEventListener('click', function() {
    nav.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      nav.classList.remove('active');
    });
  }

  nav.addEventListener('click', function(e) {
    if (e.target === nav) {
      nav.classList.remove('active');
    }
  });
}

function init() {
  initThemeToggle();
  initMobileMenu();
  loadStats();
  loadRecentCaptures();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}