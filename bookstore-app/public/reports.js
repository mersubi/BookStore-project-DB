/**
 * reports.js — RBAC-логика видимости + вызовы API отчётов
 *
 * Иерархия ролей:
 *   admin   → видит ВСЕ блоки (admin + manager + cashier)
 *   manager → видит блоки менеджера и кассира
 *   cashier → видит только блок кассира
 *
 * HTML-блоки помечены атрибутом data-min-role:
 *   data-min-role="cashier"  → доступно всем трём ролям
 *   data-min-role="manager"  → доступно manager и admin
 *   data-min-role="admin"    → только admin
 */

// ─────────────────────────────────────────────────────────────────
// БАГ 2, ЧАСТЬ 1: Сохранение роли при логине
// Этот код выполняется в app.js при успешном ответе от /api/users/login
// Ответ сервера: { message: "Успешный вход", user: { id, login, role, ... } }
//
// Пример (разместить в обработчике loginForm в app.js):
//
//   const data = await res.json();
//   localStorage.setItem('role',     data.user.role);   // 'admin' | 'manager' | 'cashier'
//   localStorage.setItem('userId',   data.user.id);
//   localStorage.setItem('username', data.user.login);
//
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// БАГ 2, ЧАСТЬ 2: RBAC — скрытие блоков по роли из localStorage
// ─────────────────────────────────────────────────────────────────

/**
 * Определяет, имеет ли роль userRole доступ к блоку с data-min-role=requiredRole.
 * Логика: admin видит всё → manager видит manager+cashier → cashier видит только cashier.
 */
function roleHasAccess(userRole, requiredRole) {
    // Порядок: чем меньше индекс — тем больше прав
    const hierarchy = ['admin', 'manager', 'cashier'];
    const userLevel = hierarchy.indexOf(userRole);
    const requiredLevel = hierarchy.indexOf(requiredRole);

    // Если роль неизвестна — запрещаем
    if (userLevel === -1 || requiredLevel === -1) return false;

    // Пользователь имеет доступ, если его уровень НЕ глубже требуемого
    // admin(0) <= cashier(2) → true  (admin видит блоки для cashier)
    // cashier(2) <= manager(1) → false (cashier НЕ видит блоки менеджера)
    return userLevel <= requiredLevel;
}

/**
 * Читает роль из localStorage и скрывает/показывает report-группы.
 * Вызывается один раз при загрузке страницы и при смене экрана.
 */
function applyReportVisibility() {
    const role = localStorage.getItem('role') || 'cashier';

    // Обновляем бейдж роли в шапке экрана отчётов
    const badge = document.getElementById('reports-role-badge');
    if (badge) {
        const labels = { admin: '👑 Администратор', manager: '📊 Менеджер', cashier: '🧾 Кассир' };
        badge.textContent = `Роль: ${labels[role] || role}`;
        // Цвет бейджа по роли
        badge.className = 'badge ' + ({
            admin: 'bg-danger',
            manager: 'bg-warning text-dark',
            cashier: 'bg-info text-dark'
        }[role] || 'bg-secondary');
    }

    // Перебираем все блоки с data-min-role и применяем видимость
    document.querySelectorAll('[data-min-role]').forEach(group => {
        const requiredRole = group.getAttribute('data-min-role');
        if (roleHasAccess(role, requiredRole)) {
            group.style.display = '';        // показываем
        } else {
            group.style.display = 'none';    // скрываем
        }
    });
}

// Применяем сразу при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    applyReportVisibility();
    loadReportDropdowns();
});

// Применяем повторно при клике на ссылку «Отчёты» в сайдбаре
document.addEventListener('DOMContentLoaded', () => {
    const reportsLink = document.getElementById('reports-nav-link');
    if (reportsLink) {
        reportsLink.addEventListener('click', () => {
            applyReportVisibility();
            loadReportDropdowns(); // обновляем выпадающие списки при каждом открытии
        });
    }
});

// ─────────────────────────────────────────────────────────────────
// Вспомогательные функции запросов к API
// ─────────────────────────────────────────────────────────────────

/** Роль для заголовка user-role в каждом запросе */
function getRole() {
    return localStorage.getItem('role') || 'cashier';
}

// ─────────────────────────────────────────────────────────────────
// Загрузка выпадающих списков из API
// ─────────────────────────────────────────────────────────────────

/**
 * Заполняет все <select> в форме отчётов актуальными данными из API.
 * Вызывается при DOMContentLoaded и при открытии экрана «Отчёты».
 */
async function loadReportDropdowns() {
    // Отчёт 2: продажи
    const r2 = document.getElementById('r2-saleId');
    if (r2) {
        try {
            const sales = await (await fetch('/api/sales')).json();
            r2.innerHTML = '<option value="">— выберите чек —</option>';
            if (Array.isArray(sales)) {
                sales.slice().reverse().forEach(s => {
                    const date = s.sale_date ? new Date(s.sale_date).toLocaleDateString('ru-RU') : '?';
                    r2.innerHTML += `<option value="${s.id_sale}">#${s.id_sale} — ${date} — ${s.total_amount} ₽</option>`;
                });
            }
        } catch { r2.innerHTML = '<option value="">— ошибка загрузки —</option>'; }
    }

    // Отчёт 4: категории
    const r4 = document.getElementById('r4-categoryId');
    if (r4) {
        try {
            const cats = await (await fetch('/api/goodsgroups')).json();
            r4.innerHTML = '<option value="">— выберите категорию —</option>';
            if (Array.isArray(cats)) {
                cats.forEach(c => {
                    r4.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
            }
        } catch { r4.innerHTML = '<option value="">— ошибка загрузки —</option>'; }
    }

    // Отчёт 6: поставщики
    const r6 = document.getElementById('r6-supplierId');
    if (r6) {
        try {
            const sups = await (await fetch('/api/suppliers')).json();
            r6.innerHTML = '<option value="">— выберите поставщика —</option>';
            if (Array.isArray(sups)) {
                sups.forEach(s => {
                    r6.innerHTML += `<option value="${s.id || s.id_supplier}">${s.name}</option>`;
                });
            }
        } catch { r6.innerHTML = '<option value="">— ошибка загрузки —</option>'; }
    }

    // Отчёт 8: пользователи (все, с указанием роли)
    const r8 = document.getElementById('r8-userId');
    if (r8) {
        try {
            const users = await (await fetch('/api/users')).json();
            r8.innerHTML = '<option value="">— выберите пользователя —</option>';
            if (Array.isArray(users)) {
                users.forEach(u => {
                    const roleLabel = { admin: 'Администратор', manager: 'Менеджер', cashier: 'Кассир' }[u.role] || u.role;
                    r8.innerHTML += `<option value="${u.id}">${u.login} (${roleLabel})</option>`;
                });
            }
        } catch { r8.innerHTML = '<option value="">— ошибка загрузки —</option>'; }
    }

    // Отчёт 9: акции
    const r9 = document.getElementById('r9-promoId');
    if (r9) {
        try {
            const promos = await (await fetch('/api/promotions')).json();
            r9.innerHTML = '<option value="">— выберите акцию —</option>';
            if (Array.isArray(promos)) {
                promos.forEach(p => {
                    r9.innerHTML += `<option value="${p.id}">${p.title} (−${p.discount_percent}%)</option>`;
                });
            }
        } catch { r9.innerHTML = '<option value="">— ошибка загрузки —</option>'; }
    }
}

/**
 * Универсальный GET к /api/reports/<endpoint>
 * Автоматически добавляет заголовок user-role из localStorage
 */
async function fetchReport(endpoint, params = {}) {
    // Формирование URL с параметрами
    const url = new URL(`/api/reports/${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
            url.searchParams.set(k, v);
        }
    });

    const res = await fetch(url.toString(), {
        headers: { 'user-role': getRole() }
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

/** Отрисовывает объект или массив объектов в виде таблицы */
function renderResult(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!data || (Array.isArray(data) && data.length === 0)) {
        el.innerHTML = '<span class="text-muted fst-italic">Нет данных</span>';
        return;
    }

    // Если сервер вернул сообщение (а не данные)
    if (!Array.isArray(data) && data.message) {
        el.innerHTML = `<span class="text-warning"><i class="bi bi-info-circle me-1"></i>${data.message}</span>`;
        return;
    }

    const rows = Array.isArray(data) ? data : [data];
    const keys = Object.keys(rows[0]);

    const head = keys.map(k => `<th class="text-muted fw-normal small">${k}</th>`).join('');
    const body = rows.map(row =>
        `<tr>${keys.map(k => `<td class="small">${row[k] ?? '–'}</td>`).join('')}</tr>`
    ).join('');

    el.innerHTML = `
        <div class="table-responsive mt-2" style="max-height:200px;overflow-y:auto">
            <table class="table table-sm table-borderless mb-0">
                <thead class="border-bottom border-secondary"><tr>${head}</tr></thead>
                <tbody>${body}</tbody>
            </table>
        </div>`;
}

/** Показывает ошибку в контейнере результата */
function renderError(containerId, message) {
    const el = document.getElementById(containerId);
    if (el) {
        el.innerHTML = `<span class="text-danger small"><i class="bi bi-x-circle me-1"></i>${message}</span>`;
    }
}

// ─────────────────────────────────────────────────────────────────
// КАССИР — отчёты 1–3
// Эндпоинты: GET /api/reports/shift-totals
//             GET /api/reports/receipt
//             GET /api/reports/by-product-type
// ─────────────────────────────────────────────────────────────────

async function runReport1() {
    const targetDate = document.getElementById('r1-date').value;
    if (!targetDate) return renderError('r1-result', 'Укажите дату');
    try {
        renderResult('r1-result', await fetchReport('shift-totals', { targetDate }));
    } catch (e) { renderError('r1-result', e.message); }
}

async function runReport2() {
    const saleId = document.getElementById('r2-saleId').value;
    if (!saleId) return renderError('r2-result', 'Выберите чек');
    try {
        renderResult('r2-result', await fetchReport('receipt', { saleId }));
    } catch (e) { renderError('r2-result', e.message); }
}

async function runReport3() {
    const productType = document.getElementById('r3-type').value;
    const targetDate = document.getElementById('r3-date').value;
    if (!targetDate) return renderError('r3-result', 'Укажите дату');
    try {
        renderResult('r3-result', await fetchReport('by-product-type', { productType, targetDate }));
    } catch (e) { renderError('r3-result', e.message); }
}

// ─────────────────────────────────────────────────────────────────
// МЕНЕДЖЕР — отчёты 4–6
// Эндпоинты: GET /api/reports/top-by-category
//             GET /api/reports/no-sales
//             GET /api/reports/by-supplier
// ─────────────────────────────────────────────────────────────────

async function runReport4() {
    const categoryId = document.getElementById('r4-categoryId').value;
    if (!categoryId) return renderError('r4-result', 'Выберите категорию');
    try {
        renderResult('r4-result', await fetchReport('top-by-category', { categoryId }));
    } catch (e) { renderError('r4-result', e.message); }
}

async function runReport5() {
    const startDate = document.getElementById('r5-start').value;
    const endDate = document.getElementById('r5-end').value;
    if (!startDate || !endDate) return renderError('r5-result', 'Укажите период');
    try {
        renderResult('r5-result', await fetchReport('no-sales', { startDate, endDate }));
    } catch (e) { renderError('r5-result', e.message); }
}

async function runReport6() {
    const supplierId = document.getElementById('r6-supplierId').value;
    const startDate = document.getElementById('r6-start').value;
    const endDate = document.getElementById('r6-end').value;
    if (!supplierId || !startDate || !endDate) return renderError('r6-result', 'Выберите поставщика и укажите период');
    try {
        renderResult('r6-result', await fetchReport('by-supplier', { supplierId, startDate, endDate }));
    } catch (e) { renderError('r6-result', e.message); }
}

// ─────────────────────────────────────────────────────────────────
// АДМИНИСТРАТОР — отчёты 7–9
// Эндпоинты: GET /api/reports/financial
//             GET /api/reports/cashier-performance
//             GET /api/reports/promotion-stats
// ─────────────────────────────────────────────────────────────────

async function runReport7() {
    const startDate = document.getElementById('r7-start').value;
    const endDate = document.getElementById('r7-end').value;
    if (!startDate || !endDate) return renderError('r7-result', 'Укажите период');
    try {
        renderResult('r7-result', await fetchReport('financial', { startDate, endDate }));
    } catch (e) { renderError('r7-result', e.message); }
}

async function runReport8() {
    const userId = document.getElementById('r8-userId').value;
    if (!userId) return renderError('r8-result', 'Выберите кассира');
    try {
        renderResult('r8-result', await fetchReport('cashier-performance', { userId }));
    } catch (e) { renderError('r8-result', e.message); }
}

async function runReport9() {
    const promotionId = document.getElementById('r9-promoId').value;
    if (!promotionId) return renderError('r9-result', 'Выберите акцию');
    try {
        renderResult('r9-result', await fetchReport('promotion-stats', { promotionId }));
    } catch (e) { renderError('r9-result', e.message); }
}
