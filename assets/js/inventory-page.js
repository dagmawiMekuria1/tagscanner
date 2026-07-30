import { createClient } from '../../vendor/supabase.js';
import XLSX from '../../vendor/xlsx.full.min.js';

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let allItems = [];
let sortColumn = 'created_at';
let sortAsc = false;

// DOM Elements
const inventoryBody = document.getElementById('inventory-body');
const tableEmpty = document.querySelector('.table-empty');
const tableLoading = document.querySelector('.table-loading');
const searchInput = document.querySelector('.search-input');
const inventoryCount = document.querySelector('.inventory-count');
const exportBtn = document.getElementById('export-btn');
const sortHeaders = document.querySelectorAll('th[data-sort]');
const signOutBtn = document.getElementById('signOutBtn');
const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

// Mobile menu toggle
if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open');
  });
}

// Auth check
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'auth.html';
    return null;
  }
  return session;
}

// Sign out
async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = 'auth.html';
}

if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
if (mobileSignOutBtn) mobileSignOutBtn.addEventListener('click', handleSignOut);

// Show/hide helpers
function showLoading() {
  if (tableLoading) {
    tableLoading.hidden = false;
    tableLoading.style.display = '';
  }
  if (tableEmpty) {
    tableEmpty.hidden = true;
  }
}

function hideLoading() {
  if (tableLoading) {
    tableLoading.hidden = true;
  }
}

function showEmpty() {
  if (tableEmpty) {
    tableEmpty.hidden = false;
  }
}

function hideEmpty() {
  if (tableEmpty) {
    tableEmpty.hidden = true;
  }
}

// Load inventory
async function loadInventory() {
  showLoading();

  try {
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allItems = data || [];
    hideLoading();
    renderTable(allItems);
  } catch (err) {
    console.error('Failed to load inventory:', err);
    hideLoading();
    if (inventoryBody) {
      inventoryBody.innerHTML = '<tr><td colspan="6" class="error-text">Failed to load inventory.</td></tr>';
    }
  }
}

// Render table
function renderTable(items) {
  if (!inventoryBody) return;

  if (!items || items.length === 0) {
    inventoryBody.innerHTML = '';
    showEmpty();
    if (inventoryCount) inventoryCount.textContent = '0 items';
    return;
  }

  hideEmpty();
  if (inventoryCount) inventoryCount.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');

  inventoryBody.innerHTML = items.map(item => `
    <tr>
      <td class="cell-image">
        ${item.image_url
          ? '<img src="' + item.image_url + '" alt="' + (item.name || 'Item') + '" class="table-thumb" loading="lazy">'
          : '<span class="placeholder-thumb">&#x1F4F7;</span>'
        }
      </td>
      <td>${escapeHtml(item.name || 'Unnamed')}</td>
      <td>${escapeHtml(item.category || 'Uncategorized')}</td>
      <td><span class="condition-badge condition-${item.condition || 'good'}">${escapeHtml(item.condition || 'Good')}</span></td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-ghost btn-sm delete-btn" data-id="${item.id}" title="Delete">&#x1F5D1;</button>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Search
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderTable(allItems);
      return;
    }

    const filtered = allItems.filter(item =>
      (item.name || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query) ||
      (item.notes || '').toLowerCase().includes(query)
    );

    renderTable(filtered);
  });
}

// Sorting
sortHeaders.forEach(th => {
  th.addEventListener('click', () => {
    const col = th.getAttribute('data-sort');

    if (sortColumn === col) {
      sortAsc = !sortAsc;
    } else {
      sortColumn = col;
      sortAsc = true;
    }

    // Update sort icons
    sortHeaders.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
    th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');

    const sorted = [...allItems].sort((a, b) => {
      let valA = a[col] || '';
      let valB = b[col] || '';

      if (col === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    renderTable(sorted);
  });
});

// Delete item
if (inventoryBody) {
  inventoryBody.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (!deleteBtn) return;

    const id = deleteBtn.getAttribute('data-id');
    if (!id) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('captures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      allItems = allItems.filter(item => item.id !== id && String(item.id) !== id);
      renderTable(allItems);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item: ' + err.message);
    }
  });
}

// Export to Excel
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    if (!allItems || allItems.length === 0) {
      alert('No items to export.');
      return;
    }

    try {
      const exportData = allItems.map(item => ({
        Name: item.name || '',
        Category: item.category || '',
        Description: item.description || '',
        Condition: item.condition || '',
        Notes: item.notes || '',
        'Date Captured': new Date(item.created_at).toLocaleDateString(),
        'Image URL': item.image_url || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      XLSX.writeFile(wb, 'snaphunt-inventory-' + Date.now() + '.xlsx');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export inventory.');
    }
  });
}

// Initialize
async function init() {
  const session = await checkAuth();
  if (!session) return;

  await loadInventory();
}

init();