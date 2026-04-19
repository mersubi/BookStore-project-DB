const checkRole = require("../middleware/checkRole");
const reports   = require("../controllers/report.controller.js");

module.exports = app => {
    const router = require("express").Router();

    // ─────────────────────────────────────────────────────────
    // КАССИР: доступны всем трём ролям
    // ─────────────────────────────────────────────────────────

    /**
     * @swagger
     * /api/reports/shift-totals:
     *   get:
     *     summary: "Кассир | Отчёт 1: Итоги смены за дату"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin, manager, cashier] }
     *       - in: query
     *         name: targetDate
     *         required: true
     *         schema: { type: string, format: date, example: "2025-04-19" }
     *     responses:
     *       200: { description: "Итоги смены" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/shift-totals",
        checkRole(['admin', 'manager', 'cashier']),
        reports.getShiftTotals
    );

    /**
     * @swagger
     * /api/reports/receipt:
     *   get:
     *     summary: "Кассир | Отчёт 2: Состав чека"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin, manager, cashier] }
     *       - in: query
     *         name: saleId
     *         required: true
     *         schema: { type: integer, example: 42 }
     *     responses:
     *       200: { description: "Строки чека" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/receipt",
        checkRole(['admin', 'manager', 'cashier']),
        reports.getReceiptDetails
    );

    /**
     * @swagger
     * /api/reports/by-product-type:
     *   get:
     *     summary: "Кассир | Отчёт 3: Продажи по типу товара за дату"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string }
     *       - in: query
     *         name: productType
     *         required: true
     *         schema: { type: string, enum: [книга, канцтовары] }
     *       - in: query
     *         name: targetDate
     *         required: true
     *         schema: { type: string, format: date }
     *     responses:
     *       200: { description: "Агрегированные данные по типу" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/by-product-type",
        checkRole(['admin', 'manager', 'cashier']),
        reports.getSalesByProductType
    );

    // ─────────────────────────────────────────────────────────
    // МЕНЕДЖЕР: доступны только менеджеру и администратору
    // ─────────────────────────────────────────────────────────

    /**
     * @swagger
     * /api/reports/top-by-category:
     *   get:
     *     summary: "Менеджер | Отчёт 4: Топ-10 товаров в категории"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin, manager] }
     *       - in: query
     *         name: categoryId
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200: { description: "Список топ-товаров" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/top-by-category",
        checkRole(['admin', 'manager']),
        reports.getTopByCategory
    );

    /**
     * @swagger
     * /api/reports/no-sales:
     *   get:
     *     summary: "Менеджер | Отчёт 5: Товары без продаж за период"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin, manager] }
     *       - in: query
     *         name: startDate
     *         required: true
     *         schema: { type: string, format: date }
     *       - in: query
     *         name: endDate
     *         required: true
     *         schema: { type: string, format: date }
     *     responses:
     *       200: { description: "Список неликвидов" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/no-sales",
        checkRole(['admin', 'manager']),
        reports.getNoSalesProducts
    );

    /**
     * @swagger
     * /api/reports/by-supplier:
     *   get:
     *     summary: "Менеджер | Отчёт 6: Продажи по поставщику за период"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin, manager] }
     *       - in: query
     *         name: supplierId
     *         required: true
     *         schema: { type: integer }
     *       - in: query
     *         name: startDate
     *         required: true
     *         schema: { type: string, format: date }
     *       - in: query
     *         name: endDate
     *         required: true
     *         schema: { type: string, format: date }
     *     responses:
     *       200: { description: "Выручка и объём по поставщику" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/by-supplier",
        checkRole(['admin', 'manager']),
        reports.getSalesBySupplier
    );

    // ─────────────────────────────────────────────────────────
    // АДМИНИСТРАТОР: только admin
    // ─────────────────────────────────────────────────────────

    /**
     * @swagger
     * /api/reports/financial:
     *   get:
     *     summary: "Админ | Отчёт 7: Выручка по дням за период"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin] }
     *       - in: query
     *         name: startDate
     *         required: true
     *         schema: { type: string, format: date }
     *       - in: query
     *         name: endDate
     *         required: true
     *         schema: { type: string, format: date }
     *     responses:
     *       200: { description: "Финансовый отчёт по дням" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/financial",
        checkRole(['admin']),
        reports.getFinancialReport
    );

    /**
     * @swagger
     * /api/reports/cashier-performance:
     *   get:
     *     summary: "Админ | Отчёт 8: Эффективность кассира"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin] }
     *       - in: query
     *         name: userId
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200: { description: "Статистика по кассиру" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/cashier-performance",
        checkRole(['admin']),
        reports.getCashierPerformance
    );

    /**
     * @swagger
     * /api/reports/promotion-stats:
     *   get:
     *     summary: "Админ | Отчёт 9: Статистика по акции"
     *     tags: [Reports]
     *     parameters:
     *       - in: header
     *         name: user-role
     *         required: true
     *         schema: { type: string, enum: [admin] }
     *       - in: query
     *         name: promotionId
     *         required: true
     *         schema: { type: integer }
     *     responses:
     *       200: { description: "Статистика продаж акционных товаров" }
     *       403: { description: "Нет доступа" }
     */
    router.get(
        "/promotion-stats",
        checkRole(['admin']),
        reports.getPromotionStats
    );

    app.use('/api/reports', router);
};
