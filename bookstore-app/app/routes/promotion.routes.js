/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       required:
 *         - title
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         title:
 *           type: string
 *           example: "Новогодняя распродажа"
 *         discount_percent:
 *           type: integer
 *           example: 15
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2026-12-01"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2026-12-31"
 */

module.exports = app => {
    const promotions = require("../controllers/promotion.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/promotions:
     *   post:
     *     summary: Создать новую акцию
     *     tags: [Promotions]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Promotion'
     *     responses:
     *       200:
     *         description: Акция успешно создана
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Promotion'
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", promotions.create);

    /**
     * @swagger
     * /api/promotions:
     *   get:
     *     summary: Получить список всех акций
     *     tags: [Promotions]
     *     responses:
     *       200:
     *         description: Список акций
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Promotion'
     *       500:
     *         description: Ошибка сервера
     */
    router.get("/", promotions.findAll);

    app.use('/api/promotions', router);
};
