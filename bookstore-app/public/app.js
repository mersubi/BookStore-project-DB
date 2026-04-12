/**
 * BookStore POS v1.2 - Promotions & Hierarchy Integrated
 */

let cart = [];
let currentPrices = {};
let currentPromotionDiscount = 0;

console.log("System: POS Promotions v1.2 Activated");

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGlobalListeners();
    initFormHandlers();
    loadDashboard();
    loadDropdowns();
});

// --- UI Helpers ---

function showToast(message, type = 'primary') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const id = 'toast-' + Date.now();
    const html = `
        <div id="${id}" class="toast show align-items-center text-white bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-info-circle me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 4000);
}

function closeModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }, 300);
}

// --- Navigation ---

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    const screens = document.querySelectorAll('.app-screen');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            screens.forEach(s => s.classList.add('d-none'));
            const targetScreen = document.getElementById(targetId);
            if (targetScreen) targetScreen.classList.remove('d-none');

            switch(targetId) {
                case 'dashboard-screen': loadDashboard(); break;
                case 'pos-screen': loadPosProducts(); loadPosPriceLists(); break;
                case 'catalog-screen': loadProducts(); break;
                case 'categories-screen': loadCategories(); break;
                case 'suppliers-screen': loadSuppliers(); break;
                case 'promotions-screen': loadPromotions(); break;
                case 'users-screen': loadUsers(); break;
                case 'sales-screen': loadSales(); break;
                case 'pricelists-screen': loadPriceLists(); loadDropdowns(); break;
            }
        });
    });
}

// --- Dashboard Logic ---

async function loadDashboard() {
    try {
        const [salesRes, productsRes] = await Promise.all([
            fetch('/api/sales'), fetch('/api/products')
        ]);
        const sales = await salesRes.json();
        const products = await productsRes.json();
        const today = new Date().toISOString().split('T')[0];
        const todaySales = Array.isArray(sales) ? sales.filter(s => s.sale_date.startsWith(today)) : [];
        const totalAmount = todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);
        const totalStock = Array.isArray(products) ? products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0) : 0;
        document.getElementById('statTodaySales').textContent = `${totalAmount.toLocaleString()} ₽`;
        document.getElementById('statTotalStock').textContent = `${totalStock.toLocaleString()} шт.`;
        document.getElementById('statTodayCount').textContent = todaySales.length;
        const tbody = document.getElementById('dashboardRecentSales');
        if (tbody && Array.isArray(sales)) {
            tbody.innerHTML = '';
            sales.slice(-5).reverse().forEach(s => {
                tbody.innerHTML += `<tr><td>#${s.id_sale}</td><td>${s.payment_time}</td><td class="fw-bold text-primary">${s.total_amount} ₽</td><td>${s.user ? s.user.login : 'System'}</td></tr>`;
            });
        }
    } catch (e) { console.error(e); }
}

// --- POS Terminal Logic ---

async function loadPosProducts(search = '') {
    try {
        const res = await fetch('/api/products');
        let products = await res.json();
        if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.article && p.article.toLowerCase().includes(search.toLowerCase())));
        const tbody = document.getElementById('posProductsList');
        if (!tbody) return;
        tbody.innerHTML = '';
        products.forEach(p => {
            const stock = p.stock_quantity || 0;
            const disabled = stock <= 0 ? 'disabled' : '';
            tbody.innerHTML += `<tr><td class="ps-3"><div class="fw-bold">${p.name}</div><div class="text-muted smaller">${p.article || '-'}</div></td><td><span class="badge ${stock < 5 ? 'bg-danger' : 'bg-success'}">${stock}</span></td><td class="text-end pe-3"><button class="btn btn-sm btn-primary rounded-pill" ${disabled} onclick="addToCart(${p.id_product}, '${p.name.replace(/'/g, "\\'")}')"><i class="bi bi-plus"></i> Добавить</button></td></tr>`;
        });
    } catch (e) { console.error(e); }
}

async function loadPosPriceLists() {
    const res = await fetch('/api/pricelists');
    const lists = await res.json();
    const select = document.getElementById('posPriceListSelect');
    if (!select) return;
    const val = select.value;
    select.innerHTML = '<option value="">Выберите прайс-лист...</option>';
    lists.forEach(l => { select.innerHTML += `<option value="${l.id_price_list}">${new Date(l.effective_date).toLocaleDateString()} - ${l.category}</option>`; });
    select.value = val;
}

window.addToCart = function(id, name) {
    if (!currentPrices[id]) { showToast('Товар не найден в текущем прайс-листе!', 'warning'); return; }
    const price = currentPrices[id];
    const item = cart.find(c => c.id_product === id);
    if (item) item.quantity++; else cart.push({ id_product: id, name, price, quantity: 1 });
    renderCart();
};

window.removeFromCart = function(id) {
    cart = cart.filter(c => c.id_product !== id);
    renderCart();
};

function renderCart() {
    const tbody = document.getElementById('cartList');
    if (!tbody) return;
    tbody.innerHTML = '';
    cart.forEach(item => {
        tbody.innerHTML += `<tr class="align-middle"><td><div class="fw-bold smaller text-truncate" style="max-width: 120px">${item.name}</div><div class="text-muted smaller">${item.price} ₽ x ${item.quantity}</div></td><td class="text-end"><button class="btn btn-link btn-sm text-danger p-0" onclick="removeFromCart(${item.id_product})">Удалить</button></td></tr>`;
    });
    updateCartTotal();
}

function updateCartTotal() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * currentPromotionDiscount) / 100;
    const grandTotal = subtotal - discountAmount;
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
    if (totalEl) totalEl.innerText = grandTotal.toFixed(2);
}

// --- Global Listeners ---

function initGlobalListeners() {
    document.getElementById('posSearchInput')?.addEventListener('input', (e) => loadPosProducts(e.target.value));
    document.getElementById('posPriceListSelect')?.addEventListener('change', async (e) => {
        const id = e.target.value;
        if (!id) { currentPrices = {}; cart = []; renderCart(); return; }
        const res = await fetch(`/api/pricelistitems?id_price_list=${id}`);
        const items = await res.json();
        currentPrices = {};
        items.forEach(i => currentPrices[i.id_product] = i.price);
        showToast('Прайс-лист применен'); cart = []; renderCart();
    });

    document.getElementById('posPromotionSelect')?.addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        currentPromotionDiscount = parseInt(selectedOption.dataset.discount || 0);
        updateCartTotal();
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
        const plId = document.getElementById('posPriceListSelect').value;
        if (!plId || cart.length === 0) { showToast('Выберите прайс и добавьте товары!', 'warning'); return; }
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const grandTotal = subtotal * (1 - currentPromotionDiscount / 100);
        const saleData = {
            id_price_list: parseInt(plId),
            sale_date: new Date().toISOString().split('T')[0],
            payment_time: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
            total_amount: grandTotal,
            userId: 1, items: cart.map(item => ({ id_product: item.id_product, quantity: item.quantity, sale_price: item.price * (1 - currentPromotionDiscount / 100) }))
        };
        const res = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saleData) });
        if (res.ok) { showToast('Чек успешно пробит!', 'success'); cart = []; currentPromotionDiscount = 0; document.getElementById('posPromotionSelect').value = ''; renderCart(); loadPosProducts(); loadDashboard(); }
        else { const err = await res.json(); showToast('Ошибка: ' + err.message, 'danger'); }
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('show.bs.modal', (e) => {
            const button = e.relatedTarget;
            if (button && (button.innerText.includes('Добавить') || button.innerText.includes('Создать') || button.innerText.includes('Новый'))) {
                const form = modal.querySelector('form');
                if (form) { form.reset(); const idInput = form.querySelector('.entity-id-input'); if (idInput) idInput.value = ''; }
            }
        });
    });
}

function initFormHandlers() {
    const forms = [
        { id: 'addProductForm', url: '/api/products', modal: 'addProductModal', reload: loadProducts },
        { id: 'addCategoryForm', url: '/api/goodsgroups', modal: 'addCategoryModal', reload: loadCategories },
        { id: 'addSupplierForm', url: '/api/suppliers', modal: 'addSupplierModal', reload: loadSuppliers },
        { id: 'addPriceListForm', url: '/api/pricelists', modal: 'addPriceListModal', reload: loadPriceLists },
        { id: 'addPromotionForm', url: '/api/promotions', modal: 'addPromotionModal', reload: loadPromotions },
        { id: 'addUserForm', url: '/api/users', modal: 'addUserModal', reload: loadUsers }
    ];
    forms.forEach(f => {
        const form = document.getElementById(f.id);
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const id = data.id || form.querySelector('.entity-id-input')?.value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${f.url}/${id}` : f.url;
            if (f.id === 'addCategoryForm' && !data.base_goods_group) data.base_goods_group = null;
            if (f.id === 'addProductForm') data.stock_quantity = Number(data.stock_quantity || 0);
            try {
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                if (res.ok) { closeModal(f.modal); showToast('Запись сохранена!', 'success'); f.reload(); loadDropdowns(); }
                else { const err = await res.json(); showToast(err.message || 'Ошибка сохранения', 'danger'); }
            } catch (e) { showToast('Ошибка сети', 'danger'); }
        });
    });
}

// --- Data loaders for Tables ---

function buildCategoryTree(categories, parentId = null, level = 0) {
    let tree = [];
    categories.filter(c => (c.baseGoodsGroup || c.base_goods_group) == parentId).forEach(node => {
        tree.push({ ...node, level });
        const children = buildCategoryTree(categories, node.id, level + 1);
        if (children.length > 0) tree = tree.concat(children);
    });
    return tree;
}

async function loadCategories() {
    const res = await fetch('/api/goodsgroups');
    const flatList = await res.json();
    const sortedList = buildCategoryTree(flatList);
    const tbody = document.getElementById('categoriesList');
    if (!tbody) return;
    tbody.innerHTML = '';
    sortedList.forEach(c => {
        const prefix = c.level > 0 ? '<i class="bi bi-arrow-return-right me-2 text-muted"></i>' : '';
        tbody.innerHTML += `<tr><td>${c.id}</td><td style="padding-left: ${c.level * 20}px"><div class="d-flex align-items-center">${prefix}<span class="${c.level === 0 ? 'fw-bold' : ''}">${c.name}</span></div></td><td><small class="text-muted">${c.description || '-'}</small></td><td><button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal('goodsgroups', ${c.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('goodsgroups', ${c.id})"><i class="bi bi-trash"></i></button></td></tr>`;
    });
}

async function loadProducts() {
    const res = await fetch('/api/products');
    const list = await res.json();
    const tbody = document.getElementById('productsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(p => {
        tbody.innerHTML += `<tr><td>${p.id_product || p.id}</td><td class="fw-bold">${p.name}</td><td>${p.author || '-'}</td><td><code>${p.article || '-'}</code></td><td><span class="badge ${p.stock_quantity < 10 ? 'bg-danger' : 'bg-secondary'}">${p.stock_quantity || 0}</span></td><td><button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal('products', ${p.id_product || p.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('products', ${p.id_product || p.id})"><i class="bi bi-trash"></i></button></td></tr>`;
    });
}

async function loadSuppliers() {
    const res = await fetch('/api/suppliers');
    const list = await res.json();
    const tbody = document.getElementById('suppliersList');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(s => {
        tbody.innerHTML += `<tr><td>${s.id_supplier || s.id}</td><td class="fw-bold">${s.name}</td><td>${s.inn || '-'}</td><td>${s.phone || '-'}</td><td><button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal('suppliers', ${s.id_supplier || s.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('suppliers', ${s.id_supplier || s.id})"><i class="bi bi-trash"></i></button></td></tr>`;
    });
}

async function loadPriceLists() {
    const res = await fetch('/api/pricelists');
    const list = await res.json();
    const tbody = document.getElementById('priceListsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(pl => {
        tbody.innerHTML += `<tr><td>${new Date(pl.effective_date).toLocaleDateString()}</td><td>${pl.category}</td><td class="text-end"><button class="btn btn-sm btn-primary py-0" onclick="openPriceList(${pl.id_price_list})">Открыть</button><button class="btn btn-sm btn-link text-info p-0 ms-2" onclick="openEditModal('pricelists', ${pl.id_price_list})"><i class="bi bi-pencil"></i></button></td></tr>`;
    });
}

async function loadPromotions() {
    const res = await fetch('/api/promotions');
    const list = await res.json();
    const tbody = document.getElementById('promotionsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(p => {
        tbody.innerHTML += `<tr><td>${p.title}</td><td><span class="badge bg-warning text-dark">${p.discount_percent}%</span></td><td>${new Date(p.start_date).toLocaleDateString()}</td><td>${new Date(p.end_date).toLocaleDateString()}</td><td><button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal('promotions', ${p.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('promotions', ${p.id})"><i class="bi bi-trash"></i></button></td></tr>`;
    });
}

async function loadUsers() {
    const res = await fetch('/api/users');
    const list = await res.json();
    const tbody = document.getElementById('usersList');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(u => {
        tbody.innerHTML += `<tr><td class="fw-bold">${u.login}</td><td><span class="badge bg-secondary">${u.role}</span></td><td>${new Date(u.createdAt).toLocaleDateString()}</td><td><button class="btn btn-sm btn-outline-info me-1" onclick="openEditModal('users', ${u.id})"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteEntity('users', ${u.id})"><i class="bi bi-trash"></i></button></td></tr>`;
    });
}

async function loadSales() {
    const res = await fetch('/api/sales');
    const list = await res.json();
    const tbody = document.getElementById('salesList');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach(s => {
        tbody.innerHTML += `<tr><td>#${s.id_sale}</td><td>${new Date(s.sale_date).toLocaleDateString()}</td><td>${s.payment_time}</td><td class="fw-bold">${s.total_amount} ₽</td><td>${s.user ? s.user.login : 'System'}</td><td><button class="btn btn-sm btn-outline-primary" onclick="viewSaleDetails(${s.id_sale})"><i class="bi bi-eye"></i> Чек</button></td></tr>`;
    });
}

// --- Entity Actions ---

window.deleteEntity = async function(entity, id) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    const res = await fetch(`/api/${entity}/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Запись удалена', 'success'); document.querySelector('.nav-link.active')?.click(); loadDropdowns(); }
    else showToast('Ошибка при удалении', 'danger');
};

window.openEditModal = async function(entity, id) {
    const modalMap = { 'products':'addProductModal', 'goodsgroups':'addCategoryModal', 'suppliers':'addSupplierModal', 'pricelists':'addPriceListModal', 'promotions':'addPromotionModal', 'users':'addUserModal' };
    const modalEl = document.getElementById(modalMap[entity]);
    if (!modalEl) return;
    try {
        const res = await fetch(`/api/${entity}/${id}`);
        const data = await res.json();
        const form = modalEl.querySelector('form');
        for (let key in data) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) { if (input.type === 'date') input.value = data[key].split('T')[0]; else if (input.type !== 'password') input.value = data[key]; }
        }
        form.querySelector('.entity-id-input').value = id;
        new bootstrap.Modal(modalEl).show();
    } catch (e) { showToast('Ошибка загрузки', 'danger'); }
};

async function loadDropdowns() {
    const [groupsRes, suppliersRes, productsRes, promoRes] = await Promise.all([ fetch('/api/goodsgroups'), fetch('/api/suppliers'), fetch('/api/products'), fetch('/api/promotions') ]);
    if (groupsRes.ok) {
        const tree = buildCategoryTree(await groupsRes.json());
        const formatOption = (g) => `<option value="${g.id}">${'— '.repeat(g.level)}${g.name}</option>`;
        const cats = document.getElementById('categorySelect');
        const parents = document.getElementById('parentCategorySelect');
        if (cats) cats.innerHTML = '<option value="">Выберите категорию...</option>' + tree.map(formatOption).join('');
        if (parents) parents.innerHTML = '<option value="">Нет (корневая)</option>' + tree.map(formatOption).join('');
    }
    if (suppliersRes.ok) {
        const list = await suppliersRes.json();
        const sel = document.getElementById('supplierSelect');
        if (sel) sel.innerHTML = '<option value="">Выберите...</option>' + list.map(s => `<option value="${s.id_supplier || s.id}">${s.name}</option>`).join('');
    }
    if (promoRes.ok) {
        const list = await promoRes.json();
        const posPromo = document.getElementById('posPromotionSelect');
        if (posPromo) posPromo.innerHTML = '<option value="">Без акции</option>' + list.map(p => `<option value="${p.id}" data-discount="${p.discount_percent}">${p.title} (-${p.discount_percent}%)</option>`).join('');
    }
    if (productsRes.ok) {
        const list = await productsRes.json();
        const sel = document.getElementById('priceListProductSelect');
        if (sel) sel.innerHTML = '<option value="">Выберите товар...</option>' + list.map(p => `<option value="${p.id_product}">${p.name}</option>`).join('');
    }
}

// --- Price List Management ---

async function openPriceList(id) {
    document.getElementById('activePriceListId').textContent = id;
    document.getElementById('currentPriceListIdInput').value = id;
    const res = await fetch(`/api/pricelistitems?id_price_list=${id}`);
    const items = await res.json();
    const tbody = document.getElementById('priceListItemsTable');
    tbody.innerHTML = '';
    items.forEach(i => {
        tbody.innerHTML += `<tr><td>${i.product ? i.product.name : 'Unknown'}</td><td class="fw-bold">${i.price} ₽</td><td class="text-end"><button class="btn btn-sm btn-link text-danger p-0" onclick="deletePriceListItem(${i.id_price_list}, ${i.id_product})"><i class="bi bi-x-circle"></i></button></td></tr>`;
    });
}
window.openPriceList = openPriceList;

window.deletePriceListItem = async function(plId, pId) {
    if (!confirm('Удалить цену?')) return;
    if ((await fetch(`/api/pricelistitems/${plId}/${pId}`, { method: 'DELETE' })).ok) { showToast('Цена удалена'); openPriceList(plId); }
};

document.getElementById('addPriceListItemForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch('/api/pricelistitems', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (res.ok) { e.target.reset(); document.getElementById('currentPriceListIdInput').value = data.id_price_list; openPriceList(data.id_price_list); showToast('Цена добавлена'); }
    else showToast('Ошибка', 'warning');
});
