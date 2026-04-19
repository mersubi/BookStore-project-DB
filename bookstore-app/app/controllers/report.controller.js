const db = require("../models");
const { QueryTypes } = require("sequelize");

/*
 * Реальные имена таблиц в PostgreSQL (Sequelize без force):
 *   sequelize.define("saleitem", ...)   → таблица "saleitems"
 *   sequelize.define("sale", ...)       → таблица "sales"
 *   sequelize.define("product", ...)    → таблица "products"
 *   sequelize.define("suppliers", ...)  → таблица "suppliers"
 *   sequelize.define("promotions", ...) → таблица "promotions"
 *   sequelize.define("users", ...)      → таблица "users"
 *
 * underscored: true → camelCase FK конвертируются в snake_case:
 *   supplierId  → supplier_id
 *   promotionId → promotion_id
 *   userId      → user_id
 *
 * Поля: promotions.title (не name!), users.login (не username!)
 */

// ═══════════════════════════════════════════
// РОЛЬ: КАССИР (cashier, manager, admin)
// ═══════════════════════════════════════════

/**
 * Отчёт 1 (Кассир): Итоги смены за дату
 * Фильтр: targetDate (YYYY-MM-DD)
 * Агрегации: SUM(total_amount), COUNT, AVG
 */
exports.getShiftTotals = async (req, res) => {
    const { targetDate } = req.query;
    if (!targetDate) {
        return res.status(400).json({ message: "Параметр targetDate обязателен." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                COUNT(*)               AS salescount,
                COALESCE(SUM(total_amount), 0) AS totalrevenue,
                COALESCE(AVG(total_amount), 0) AS avgcheck
             FROM sales
             WHERE sale_date >= :start
               AND sale_date <  :end`,
            {
                replacements: {
                    start: `${targetDate} 00:00:00`,
                    end:   `${targetDate} 23:59:59`
                },
                type: QueryTypes.SELECT
            }
        );
        // Возвращаем точное сообщение об ошибке в ответе для диагностики
        res.json(results[0] || { salescount: 0, totalrevenue: 0, avgcheck: 0 });
    } catch (err) {
        // Возвращаем полное сообщение об ошибке для диагностики
        res.status(500).json({ message: err.message, sql_error: err.original?.message });
    }
};

/**
 * Отчёт 2 (Кассир): Состав чека
 * Фильтр: saleId
 * Таблица: saleitems (НЕ sale_items!)
 */
exports.getReceiptDetails = async (req, res) => {
    const { saleId } = req.query;
    if (!saleId) {
        return res.status(400).json({ message: "Параметр saleId обязателен." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                p.name                               AS "productName",
                p.article                            AS "article",
                si.quantity                          AS "quantity",
                si.sale_price                        AS "unitPrice",
                (si.quantity * si.sale_price)        AS "lineTotal"
             FROM saleitems si
             JOIN products p ON si.id_product = p.id_product
             WHERE si.id_sale = :saleId
             ORDER BY p.name`,
            { replacements: { saleId }, type: QueryTypes.SELECT }
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Состав чека»: " + err.message });
    }
};

/**
 * Отчёт 3 (Кассир): Продажи по типу товара за дату
 * Таблица: saleitems
 */
exports.getSalesByProductType = async (req, res) => {
    const { productType, targetDate } = req.query;
    if (!productType || !targetDate) {
        return res.status(400).json({ message: "Параметры productType и targetDate обязательны." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                p.product_type                          AS "productType",
                COUNT(DISTINCT si.id_sale)              AS "salesCount",
                SUM(si.quantity)                        AS "totalQuantity",
                SUM(si.quantity * si.sale_price)        AS "totalRevenue"
             FROM saleitems si
             JOIN products p ON si.id_product = p.id_product
             JOIN sales    s ON si.id_sale    = s.id_sale
             WHERE p.product_type = :productType
               AND s.sale_date::date = :targetDate
             GROUP BY p.product_type`,
            { replacements: { productType, targetDate }, type: QueryTypes.SELECT }
        );
        res.json(results[0] || { message: "Нет данных для указанных фильтров." });
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Продажи по типу товара»: " + err.message });
    }
};

// ═══════════════════════════════════════════
// РОЛЬ: МЕНЕДЖЕР (manager, admin)
// ═══════════════════════════════════════════

/**
 * Отчёт 4 (Менеджер): Топ-10 продаваемых товаров в категории
 * Таблица: saleitems
 */
exports.getTopByCategory = async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) {
        return res.status(400).json({ message: "Параметр categoryId обязателен." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                p.id_product                            AS "id",
                p.name                                  AS "productName",
                p.article                               AS "article",
                SUM(si.quantity)                        AS "totalSold",
                SUM(si.quantity * si.sale_price)        AS "totalRevenue"
             FROM saleitems si
             JOIN products p ON si.id_product = p.id_product
             WHERE p.id_category = :categoryId
             GROUP BY p.id_product, p.name, p.article
             ORDER BY SUM(si.quantity) DESC
             LIMIT 10`,
            { replacements: { categoryId }, type: QueryTypes.SELECT }
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Топ в категории»: " + err.message });
    }
};

/**
 * Отчёт 5 (Менеджер): Товары без продаж за период
 * Таблица: saleitems (в подзапросе)
 */
exports.getNoSalesProducts = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: "Параметры startDate и endDate обязательны." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                p.id_product            AS "id",
                p.name                  AS "productName",
                p.article               AS "article",
                p.product_type          AS "productType",
                p.stock_quantity        AS "stockQuantity"
             FROM products p
             WHERE p.id_product NOT IN (
                 SELECT DISTINCT si.id_product
                 FROM saleitems si
                 JOIN sales s ON si.id_sale = s.id_sale
                 WHERE s.sale_date BETWEEN :startDate AND :endDate
             )
             ORDER BY p.stock_quantity DESC`,
            { replacements: { startDate, endDate }, type: QueryTypes.SELECT }
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Товары без продаж»: " + err.message });
    }
};

/**
 * Отчёт 6 (Менеджер): Продажи по поставщику за период
 * FK: products.supplier_id (Sequelize supplierId → supplier_id при underscored: true)
 */
exports.getSalesBySupplier = async (req, res) => {
    const { supplierId, startDate, endDate } = req.query;
    if (!supplierId || !startDate || !endDate) {
        return res.status(400).json({ message: "Параметры supplierId, startDate и endDate обязательны." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                sup.id                              AS "supplierId",
                sup.name                            AS "supplierName",
                COUNT(DISTINCT s.id_sale)           AS "salesCount",
                SUM(si.quantity)                    AS "totalQuantity",
                SUM(si.quantity * si.sale_price)    AS "totalRevenue"
             FROM saleitems si
             JOIN products  p   ON si.id_product  = p.id_product
             JOIN suppliers sup ON p.supplier_id  = sup.id
             JOIN sales     s   ON si.id_sale     = s.id_sale
             WHERE sup.id = :supplierId
               AND s.sale_date BETWEEN :startDate AND :endDate
             GROUP BY sup.id, sup.name`,
            { replacements: { supplierId, startDate, endDate }, type: QueryTypes.SELECT }
        );
        res.json(results[0] || { message: "Нет данных для указанных фильтров." });
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Продажи по поставщику»: " + err.message });
    }
};

// ═══════════════════════════════════════════
// РОЛЬ: АДМИНИСТРАТОР (admin)
// ═══════════════════════════════════════════

/**
 * Отчёт 7 (Админ): Финансовый — выручка по дням за период
 */
exports.getFinancialReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: "Параметры startDate и endDate обязательны." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                sale_date::date         AS "saleDate",
                COUNT(id_sale)          AS "salesCount",
                SUM(total_amount)       AS "dailyRevenue",
                MAX(total_amount)       AS "maxCheck",
                MIN(total_amount)       AS "minCheck",
                AVG(total_amount)       AS "avgCheck"
             FROM sales
             WHERE sale_date BETWEEN :startDate AND :endDate
             GROUP BY sale_date::date
             ORDER BY sale_date::date`,
            { replacements: { startDate, endDate }, type: QueryTypes.SELECT }
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Ошибка финансового отчёта: " + err.message });
    }
};

/**
 * Отчёт 8 (Админ): Эффективность кассира
 * FK: sales.user_id (Sequelize userId → user_id при underscored: true)
 * Поле: users.login (НЕ username!)
 */
exports.getCashierPerformance = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "Параметр userId обязателен." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                u.id                            AS "userId",
                u.login                         AS "login",
                COUNT(s.id_sale)                AS "totalSales",
                SUM(s.total_amount)             AS "totalRevenue",
                AVG(s.total_amount)             AS "avgCheck",
                MAX(s.total_amount)             AS "maxCheck",
                MIN(s.sale_date)                AS "firstSaleDate",
                MAX(s.sale_date)                AS "lastSaleDate"
             FROM sales s
             JOIN users u ON s.user_id = u.id
             WHERE u.id = :userId
             GROUP BY u.id, u.login`,
            { replacements: { userId }, type: QueryTypes.SELECT }
        );
        res.json(results[0] || { message: "Кассир не найден или не имеет продаж." });
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Эффективность кассира»: " + err.message });
    }
};

/**
 * Отчёт 9 (Админ): Статистика по акции
 * FK: products.promotion_id (Sequelize promotionId → promotion_id)
 * Поле: promotions.title (НЕ name!)
 */
exports.getPromotionStats = async (req, res) => {
    const { promotionId } = req.query;
    if (!promotionId) {
        return res.status(400).json({ message: "Параметр promotionId обязателен." });
    }
    try {
        const results = await db.sequelize.query(
            `SELECT
                pr.id                                           AS "promotionId",
                pr.title                                        AS "promotionTitle",
                pr.discount_percent                             AS "discountPercent",
                COUNT(DISTINCT p.id_product)                    AS "productsInPromo",
                COALESCE(SUM(si.quantity), 0)                   AS "totalSold",
                COALESCE(SUM(si.quantity * si.sale_price), 0)   AS "totalRevenue"
             FROM promotions pr
             LEFT JOIN products  p  ON p.promotion_id  = pr.id
             LEFT JOIN saleitems si ON si.id_product   = p.id_product
             WHERE pr.id = :promotionId
             GROUP BY pr.id, pr.title, pr.discount_percent`,
            { replacements: { promotionId }, type: QueryTypes.SELECT }
        );
        res.json(results[0] || { message: "Акция не найдена." });
    } catch (err) {
        res.status(500).json({ message: "Ошибка отчёта «Статистика по акции»: " + err.message });
    }
};
