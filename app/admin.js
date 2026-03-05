/*
  Admin Panel JS — QR Menu
  API: http://127.0.0.1:8000
*/

const API = 'http://127.0.0.1:8000';

// ── State ──────────────────────────────────────────────
let categories = [];
let allFoods = [];
let currentSection = 'categories';
let deleteAction = null;

// ── DOM ────────────────────────────────────────────────
const categoryBody = document.getElementById('categoryBody');
const foodBody = document.getElementById('foodBody');
const addBtn = document.getElementById('addBtn');
const toastEl = document.getElementById('toast');

// ══════════════════════════════════════════════════════
// API HELPER
// ══════════════════════════════════════════════════════
async function api(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
    }
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
}

// ══════════════════════════════════════════════════════
// LOAD DATA
// ══════════════════════════════════════════════════════
async function loadData() {
    try {
        categories = await api('GET', '/category/');
        allFoods = categories.flatMap(c =>
            (c.foods || []).map(f => ({ ...f, catName: c.name, catId: c.id }))
        );
        renderCategories();
        renderFoods();
    } catch (e) {
        categoryBody.innerHTML = `<tr><td colspan="5" class="empty-row">⚠️ ${esc(e.message)}</td></tr>`;
        foodBody.innerHTML = `<tr><td colspan="7" class="empty-row">⚠️ ${esc(e.message)}</td></tr>`;
    }
}

// ══════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ══════════════════════════════════════════════════════
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const section = item.dataset.section;
        switchSection(section);
    });
});

function switchSection(section) {
    currentSection = section;

    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
    document.getElementById('section-categories').style.display = section === 'categories' ? '' : 'none';
    document.getElementById('section-foods').style.display = section === 'foods' ? '' : 'none';

    if (section === 'categories') {
        document.getElementById('pageTitle').textContent = 'Categories';
        document.getElementById('pageSub').textContent = 'Manage your menu categories';
        addBtn.textContent = '+ Add Category';
    } else {
        document.getElementById('pageTitle').textContent = 'Foods';
        document.getElementById('pageSub').textContent = 'Manage your food items';
        addBtn.textContent = '+ Add Food';
    }
}

addBtn.addEventListener('click', () => {
    if (currentSection === 'categories') openCategoryModal(null);
    else openFoodModal(null);
});

// ══════════════════════════════════════════════════════
// CATEGORIES TABLE
// ══════════════════════════════════════════════════════
function renderCategories() {
    if (!categories.length) {
        categoryBody.innerHTML = `<tr><td colspan="5" class="empty-row">No categories yet. Click "+ Add Category" to create one.</td></tr>`;
        return;
    }
    categoryBody.innerHTML = categories.map((cat, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="bold">${esc(cat.name)}</td>
      <td>${esc(cat.description)}</td>
      <td><span class="badge badge-blue">${(cat.foods || []).length} items</span></td>
      <td>
        <div class="action-btns">
          <button class="tbl-btn edit" onclick="openCategoryModal(categories[${i}])">✏️ Edit</button>
          <button class="tbl-btn del"  onclick="confirmDelete(
            'Delete category &ldquo;<b>${esc(cat.name)}</b>&rdquo;? Foods inside will be orphaned.',
            () => deleteCategory(${cat.id})
          )">🗑 Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════
// FOODS TABLE
// ══════════════════════════════════════════════════════
function renderFoods() {
    if (!allFoods.length) {
        foodBody.innerHTML = `<tr><td colspan="7" class="empty-row">No foods yet. Click "+ Add Food" to create one.</td></tr>`;
        return;
    }
    foodBody.innerHTML = allFoods.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        ${f.image
            ? `<img class="thumb" src="${esc(f.image)}" alt="${esc(f.name)}" onerror="this.outerHTML='<div class=thumb-placeholder>🍴</div>'">`
            : `<div class="thumb-placeholder">🍴</div>`}
      </td>
      <td class="bold">${esc(f.name)}</td>
      <td>${esc(f.catName)}</td>
      <td>${fmtPrice(f.price)}</td>
      <td><span class="badge ${f.is_stock !== false ? 'badge-green' : 'badge-red'}">
        ${f.is_stock !== false ? 'In Stock' : 'Out of Stock'}
      </span></td>
      <td>
        <div class="action-btns">
          <button class="tbl-btn edit" onclick="openFoodModal(allFoods[${i}])">✏️ Edit</button>
          <button class="tbl-btn del"  onclick="confirmDelete(
            'Delete food &ldquo;<b>${esc(f.name)}</b>&rdquo;?',
            () => deleteFood(${f.id})
          )">🗑 Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════
// CATEGORY MODAL
// ══════════════════════════════════════════════════════
function openCategoryModal(cat) {
    const edit = !!cat;
    document.getElementById('catModalTitle').textContent = edit ? 'Edit Category' : 'Add Category';
    document.getElementById('catId').value = cat ? cat.id : '';
    document.getElementById('catName').value = cat ? cat.name : '';
    document.getElementById('catDesc').value = cat ? cat.description : '';
    document.getElementById('catSaveBtn').textContent = edit ? 'Update' : 'Save';
    openModal('categoryModal');
    setTimeout(() => document.getElementById('catName').focus(), 80);
}

document.getElementById('categoryForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const body = {
        name: document.getElementById('catName').value.trim(),
        description: document.getElementById('catDesc').value.trim(),
    };
    const btn = document.getElementById('catSaveBtn');
    btn.disabled = true;
    try {
        if (id) {
            await api('PUT', `/category/${id}`, body);
            toast('Category updated ✓', 'ok');
        } else {
            await api('POST', '/category/', body);
            toast('Category created ✓', 'ok');
        }
        closeModal('categoryModal');
        await loadData();
    } catch (err) {
        toast('Error: ' + err.message, 'err');
    } finally {
        btn.disabled = false;
    }
});

async function deleteCategory(id) {
    try {
        await api('DELETE', `/category/${id}`);
        toast('Category deleted', 'ok');
        await loadData();
    } catch (err) {
        toast('Error: ' + err.message, 'err');
    }
}

// ══════════════════════════════════════════════════════
// FOOD MODAL
// ══════════════════════════════════════════════════════
function openFoodModal(food) {
    const edit = !!food;
    document.getElementById('foodModalTitle').textContent = edit ? 'Edit Food' : 'Add Food';
    document.getElementById('foodId').value = food ? food.id : '';
    document.getElementById('foodName').value = food ? food.name : '';
    document.getElementById('foodPrice').value = food ? food.price : '';
    document.getElementById('foodImage').value = food ? (food.image || '') : '';
    document.getElementById('foodSaveBtn').textContent = edit ? 'Update' : 'Save';

    const sel = document.getElementById('foodCat');
    sel.innerHTML = categories.map(c =>
        `<option value="${c.id}" ${food && food.catId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`
    ).join('');

    openModal('foodModal');
    setTimeout(() => document.getElementById('foodName').focus(), 80);
}

document.getElementById('foodForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('foodId').value;
    const body = {
        name: document.getElementById('foodName').value.trim(),
        price: parseInt(document.getElementById('foodPrice').value),
        image: document.getElementById('foodImage').value.trim(),
        category_id: parseInt(document.getElementById('foodCat').value),
    };
    const btn = document.getElementById('foodSaveBtn');
    btn.disabled = true;
    try {
        if (id) {
            await api('PUT', `/foods/${id}`, body);
            toast('Food updated ✓', 'ok');
        } else {
            await api('POST', '/foods/', body);
            toast('Food created ✓', 'ok');
        }
        closeModal('foodModal');
        await loadData();
    } catch (err) {
        toast('Error: ' + err.message, 'err');
    } finally {
        btn.disabled = false;
    }
});

async function deleteFood(id) {
    try {
        await api('DELETE', `/foods/${id}`);
        toast('Food deleted', 'ok');
        await loadData();
    } catch (err) {
        toast('Error: ' + err.message, 'err');
    }
}

// ══════════════════════════════════════════════════════
// DELETE CONFIRM
// ══════════════════════════════════════════════════════
function confirmDelete(msg, action) {
    document.getElementById('delMsg').innerHTML = msg;
    deleteAction = action;
    openModal('deleteModal');
}

document.getElementById('confirmDelBtn').addEventListener('click', async () => {
    if (deleteAction) {
        const fn = deleteAction;
        deleteAction = null;
        closeModal('deleteModal');
        await fn();
    }
});

// ══════════════════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.dataset.close))
);
document.querySelectorAll('.modal-overlay').forEach(overlay =>
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); })
);

// ══════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════
let _tt;
function toast(msg, type = 'ok') {
    clearTimeout(_tt);
    toastEl.textContent = msg;
    toastEl.className = `toast ${type} show`;
    _tt = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════
loadData();
