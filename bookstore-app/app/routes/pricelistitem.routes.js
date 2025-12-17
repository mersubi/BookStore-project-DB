/**
 * @swagger
 * components:
 *   schemas:
 *     PriceListItem:
 *       type: object
 *       required:
 *         - id_price_list
 *         - id_product
 *         - price
 *       properties:
 *         id_price_list:
 *           type: integer
 *           description: "ID прайс-листа"
 *           example: 1
 *         id_product:
 *           type: integer
 *           description: "ID товара"
 *           example: 5
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: "Цена товара в прайс-листе"
 *           example: 1999.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PriceListItemInput:
 *       type: object
 *       required:
 *         - id_price_list
 *         - id_product
 *         - price
 *       properties:
 *         id_price_list:
 *           type: integer
 *           example: 1
 *         id_product:
 *           type: integer
 *           example: 5
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 1999.99
 *     PriceListItemDetail:
 *       type: object
 *       properties:
 *         id_price_list:
 *           type: integer
 *         id_product:
 *           type: integer
 *         price:
 *           type: number
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         priceList:
 *           $ref: '#/components/schemas/PriceList'
 */

module.exports = app => {
    const priceListItem = require("../controllers/pricelistitem.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/pricelistitems:
     *   post:
     *     summary: Добавить товар в прайс-лист
     *     description: Создает запись о цене товара в конкретном прайс-листе
     *     tags: [PriceListItems]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PriceListItemInput'
     *     responses:
     *       201:
     *         description: Товар успешно добавлен в прайс-лист
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PriceListItem'
     *       400:
     *         description: Неверные данные (цена отрицательная или уже существует запись)
     *       404:
     *         description: Прайс-лист или товар не найден
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", priceListItem.create);

    /**
     * @swagger
     * /api/pricelistitems:
     *   get:
     *     summary: Получить все позиции прайс-листов
     *     description: Возвращает список всех записей о ценах товаров во всех прайс-листах
     *     tags: [PriceListItems]
     *     responses:
     *       200:
     *         description: Список позиций прайс-листов
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/PriceListItem'
     */
    router.get("/", priceListItem.findAll);

    /**
     * @swagger
     * /api/pricelistitems/{priceListId}/{productId}:
     *   get:
     *     summary: Получить цену товара в прайс-листе
     *     description: Возвращает информацию о цене конкретного товара в конкретном прайс-листе
     *     tags: [PriceListItems]
     *     parameters:
     *       - in: path
     *         name: priceListId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID прайс-листа
     *       - in: path
     *         name: productId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара
     *     responses:
     *       200:
     *         description: Данные о цене товара в прайс-листе
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PriceListItem'
     *       404:
     *         description: Запись не найдена
     */
    router.get("/:priceListId/:productId", priceListItem.findOne);

    /**
     * @swagger
     * /api/pricelistitems/{priceListId}/{productId}:
     *   delete:
     *     summary: Удалить товар из прайс-листа
     *     description: Удаляет запись о цене товара из прайс-листа
     *     tags: [PriceListItems]
     *     parameters:
     *       - in: path
     *         name: priceListId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID прайс-листа
     *       - in: path
     *         name: productId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара
     *     responses:
     *       200:
     *         description: Товар успешно удален из прайс-листа
     *       404:
     *         description: Запись не найдена
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:priceListId/:productId", priceListItem.delete);

    app.use('/api/pricelistitems', router);
};