/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - name
 *         - inn
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "ООО Книготорг"
 *         inn:
 *           type: string
 *           example: "1234567890"
 *         phone:
 *           type: string
 *           example: "+79001234567"
 *         address:
 *           type: string
 *           example: "г. Москва, ул. Пушкина, д. Колотушкина"
 */

module.exports = app => {
    const suppliers = require("../controllers/supplier.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/suppliers:
     *   post:
     *     summary: Создать нового поставщика
     *     tags: [Suppliers]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Supplier'
     *     responses:
     *       200:
     *         description: Поставщик успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Supplier'
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", suppliers.create);

    /**
     * @swagger
     * /api/suppliers:
     *   get:
     *     summary: Получить список всех поставщиков
     *     tags: [Suppliers]
     *     responses:
     *       200:
     *         description: Список поставщиков
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Supplier'
     *       500:
     *         description: Ошибка сервера
     */
    router.get("/", suppliers.findAll);

    /**
     * @swagger
     * /api/suppliers/{id}:
     *   get:
     *     summary: Получить поставщика по ID
     *     tags: [Suppliers]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID поставщика
     *     responses:
     *       200:
     *         description: Данные поставщика
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Supplier'
     *       404:
     *         description: Поставщик не найден
     *       500:
     *         description: Ошибка сервера
     */
    router.get("/:id", suppliers.findOne);

    app.use('/api/suppliers', router);
};
