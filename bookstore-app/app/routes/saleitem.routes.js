/**
 * @swagger
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       required:
 *         - id_sale
 *         - id_product
 *         - quantity
 *         - sale_price
 *       properties:
 *         id_sale:
 *           type: integer
 *           description: "ID продажи"
 *           example: 1
 *         id_product:
 *           type: integer
 *           description: "ID товара"
 *           example: 5
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: "Количество товара"
 *           example: 3
 *         sale_price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: "Цена продажи за единицу"
 *           example: 1999.99
 *         total_price:
 *           type: number
 *           format: float
 *           readOnly: true
 *           description: "Общая стоимость (quantity × sale_price)"
 *           example: 5999.97
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SaleItemInput:
 *       type: object
 *       required:
 *         - id_sale
 *         - id_product
 *         - quantity
 *         - sale_price
 *       properties:
 *         id_sale:
 *           type: integer
 *           example: 1
 *         id_product:
 *           type: integer
 *           example: 5
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 3
 *         sale_price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 1999.99
 *     SaleItemDetail:
 *       type: object
 *       properties:
 *         id_sale:
 *           type: integer
 *         id_product:
 *           type: integer
 *         quantity:
 *           type: integer
 *         sale_price:
 *           type: number
 *         total_price:
 *           type: number
 *         sale:
 *           $ref: '#/components/schemas/Sale'
 *         product:
 *           $ref: '#/components/schemas/Product'
 */

module.exports = app => {
    const saleItem = require("../controllers/saleitem.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/saleitems:
     *   post:
     *     summary: Добавить товар в продажу
     *     description: Создает запись о товаре в конкретной продаже с указанием количества и цены
     *     tags: [SaleItems]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SaleItemInput'
     *     responses:
     *       201:
     *         description: Товар успешно добавлен в продажу
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SaleItem'
     *       400:
     *         description: Неверные данные (количество < 1, цена < 0, уже существует запись)
     *       404:
     *         description: Продажа или товар не найдены
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", saleItem.create);

    /**
     * @swagger
     * /api/saleitems:
     *   get:
     *     summary: Получить все позиции продаж
     *     description: Возвращает список всех товаров во всех продажах
     *     tags: [SaleItems]
     *     responses:
     *       200:
     *         description: Список позиций продаж
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/SaleItem'
     */
    router.get("/", saleItem.findAll);

    /**
     * @swagger
     * /api/saleitems/{saleId}/{productId}:
     *   get:
     *     summary: Получить позицию продажи
     *     description: Возвращает информацию о конкретном товаре в конкретной продаже
     *     tags: [SaleItems]
     *     parameters:
     *       - in: path
     *         name: saleId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID продажи
     *       - in: path
     *         name: productId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара
     *     responses:
     *       200:
     *         description: Данные о позиции продажи
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SaleItem'
     *       404:
     *         description: Позиция продажи не найдена
     */
    router.get("/:saleId/:productId", saleItem.findOne);

    /**
     * @swagger
     * /api/saleitems/{saleId}/{productId}:
     *   delete:
     *     summary: Удалить товар из продажи
     *     description: Удаляет запись о товаре из продажи
     *     tags: [SaleItems]
     *     parameters:
     *       - in: path
     *         name: saleId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID продажи
     *       - in: path
     *         name: productId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара
     *     responses:
     *       200:
     *         description: Товар успешно удален из продажи
     *       404:
     *         description: Позиция продажи не найдена
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:saleId/:productId", saleItem.delete);

    app.use('/api/saleitems', router);
};