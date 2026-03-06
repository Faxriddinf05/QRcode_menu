/*
  QR Code Menu — Customer Menu (read-only)
  API: http://127.0.0.1:8000
*/

const API = 'http://127.0.0.1:8000';

const pillsEl = document.getElementById('pills');
const gridEl = document.getElementById('grid');
const countBadgeEl = document.getElementById('countBadge');
const sectionTitle = document.getElementById('sectionTitle');

let categories = [];
let allFoods = [];
let activeId = null;

// ── Load ──────────────────────────────────────────────
async function loadMenu() {
    try {
        const res = await fetch(`${API}/category/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        categories = await res.json();
        allFoods = categories.flatMap(cat =>
            (cat.foods || []).map(f => ({ ...f, catName: cat.name, catId: cat.id }))
        );
        renderPills();
        renderFoods(allFoods);
    } catch (e) {
        showState('⚠️', 'Could not reach the server',
            `Make sure the backend is running at <b>${API}</b>.<br>${e.message}`);
        countBadgeEl.textContent = '0 items';
        pillsEl.innerHTML = '';
    }
}

// ── Pills ─────────────────────────────────────────────
function renderPills() {
    pillsEl.innerHTML = '';
    addPill(null, 'All', allFoods.length);
    categories.forEach(c => addPill(c.id, c.name, (c.foods || []).length));
}

function addPill(id, label, count) {
    const btn = document.createElement('button');
    btn.className = 'pill' + (activeId === id ? ' active' : '');
    btn.innerHTML = `${esc(label)} <span class="num">${count}</span>`;
    btn.onclick = () => {
        activeId = id;
        renderPills();
        const foods = id === null ? allFoods : allFoods.filter(f => f.catId === id);
        sectionTitle.textContent = id === null
            ? 'All Items'
            : (categories.find(c => c.id === id)?.name ?? 'Items');
        renderFoods(foods);
    };
    pillsEl.appendChild(btn);
}

// ── Food Cards ────────────────────────────────────────
function renderFoods(foods) {
    gridEl.innerHTML = '';
    countBadgeEl.textContent = `${foods.length} item${foods.length !== 1 ? 's' : ''}`;

    if (!foods.length) {
        showState('🍽️', 'No items here', 'This category is empty. Try another one!');
        return;
    }

    foods.forEach((food, i) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.style.cursor = 'pointer';
        const inStock = food.is_stock !== false;
        let imgHtml = food.image
            ? `<img src="${esc(food.image)}" alt="${esc(food.name)}" loading="lazy"
           onerror="this.parentElement.innerHTML='<div class=card-placeholder>🍴</div>'">`
            : `<div class="card-placeholder">🍴</div>`;

        card.innerHTML = `
      <div class="card-img">
        ${imgHtml}
        <span class="stock-badge ${inStock ? 'in-stock' : 'no-stock'}">
          ${inStock ? '● In Stock' : '✕ Out of Stock'}
        </span>
      </div>
      <div class="card-body">
        <div class="card-cat">${esc(food.catName)}</div>
        <div class="card-name">${esc(food.name)}</div>
        <div class="card-price">
          <span class="price-label">Price</span>
          <span class="price-val">${fmtPrice(food.price)}</span>
        </div>
      </div>`;

        // Open detail modal on click
        card.addEventListener('click', () => openDetailModal(food));
        gridEl.appendChild(card);
    });
}

// ── Food Detail Modal ─────────────────────────────────
const detailModal = document.getElementById('foodDetailModal');
const detailClose = document.getElementById('detailClose');

function openDetailModal(food) {
    const inStock = food.is_stock !== false;

    // Image
    document.getElementById('detailImgWrap').innerHTML = food.image
        ? `<img src="${esc(food.image)}" alt="${esc(food.name)}"
         onerror="this.parentElement.innerHTML='<div class=detail-img-placeholder>🍴</div>'">`
        : `<div class="detail-img-placeholder">🍴</div>`;

    // Text fields
    document.getElementById('detailCat').textContent = food.catName;
    document.getElementById('detailName').textContent = food.name;
    document.getElementById('detailPrice').textContent = fmtPrice(food.price);
    document.getElementById('detailCatName').textContent = food.catName;
    document.getElementById('detailId').textContent = `#${food.id}`;
    document.getElementById('detailStock').innerHTML =
        `<span class="${inStock ? 'badge-in' : 'badge-out'}">${inStock ? 'In Stock' : 'Out of Stock'}</span>`;

    detailModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    detailModal.classList.remove('open');
    document.body.style.overflow = '';
}

detailClose.addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', e => { if (e.target === detailModal) closeDetailModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetailModal(); });

// ── Helpers ───────────────────────────────────────────
function showState(icon, title, msg) {
    gridEl.innerHTML = `<div class="state">
    <div class="state-icon">${icon}</div>
    <div class="state-title">${title}</div>
    <div class="state-msg">${msg}</div>
  </div>`;
}

function esc(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtPrice(n) {
    return new Intl.NumberFormat('uz-UZ', {
        style: 'currency', currency: 'UZS', maximumFractionDigits: 0
    }).format(n);
}

loadMenu();
