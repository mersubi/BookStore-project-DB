/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - article
 *         - product_type
 *         - id_category
 *       properties:
 *         id_product:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           maxLength: 50
 *           example: "Программирование на JavaScript"
 *         article:
 *           type: string
 *           maxLength: 40
 *           example: "BOOK-JS-001"
 *         product_type:
 *           type: string
 *           enum: [book, stationery]
 *           example: "book"
 *         author:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *           example: "Иван Иванов"
 *         publisher:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *           example: "Издательство"
 *         isbn:
 *           type: string
 *           nullable: true
 *           maxLength: 20
 *           example: "978-5-4461-1234-5"
 *         id_category:
 *           type: integer
 *           example: 3
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 256
 *           example: "Подробное описание товара"
 *     ProductWithPrice:
 *       type: object
 *       properties:
 *         id_product:
 *           type: integer
 *         name:
 *           type: string
 *         article:
 *           type: string
 *         product_type:
 *           type: string
 *         currentPrice:
 *           type: number
 *           format: float
 *     TopSellingProduct:
 *       type: object
 *       properties:
 *         id_product:
 *           type: integer
 *         name:
 *           type: string
 *         article:
 *           type: string
 *         totalSold:
 *           type: integer
 *     CategoryInfo:
 *       type: object
 *       properties:
 *         id_category:
 *           type: integer
 *         category_name:
 *           type: string
 *         category_description:
 *           type: string
 */

module.exports = app => {
    const product = require("../controllers/product.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/products:
     *   post:
     *     summary: Создать новый товар
     *     tags: [Products]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Product'
     *     responses:
     *       201:
     *         description: Товар успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", product.create);

    /**
     * @swagger
     * /api/products:
     *   get:
     *     summary: Получить список всех товаров
     *     tags: [Products]
     *     responses:
     *       200:
     *         description: Список товаров
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     */
    router.get("/", product.findAll);

    /**
     * @swagger
     * /api/products/{id}:
     *   get:
     *     summary: Получить товар по ID
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара (id_product)
     *     responses:
     *       200:
     *         description: Данные товара
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Товар не найден
     */
    router.get("/:id", product.findOne);

    /**
     * @swagger
     * /api/products/{id}:
     *   put:
     *     summary: Обновить товар по ID
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара (id_product)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Product'
     *     responses:
     *       200:
     *         description: Товар успешно обновлён
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Товар не найден
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.put("/:id", product.update);

    /**
     * @swagger
     * /api/products/{id}:
     *   delete:
     *     summary: Удалить товар по ID
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара (id_product)
     *     responses:
     *       200:
     *         description: Товар успешно удалён
     *       404:
     *         description: Товар не найден
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:id", product.delete);

    /**
     * @swagger
     * /api/products:
     *   delete:
     *     summary: Удалить все товары
     *     tags: [Products]
     *     responses:
     *       200:
     *         description: Все товары удалены
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/", product.deleteAll);

    /**
     * @swagger
     * /api/products/{id}/goodsgroupname:
     *   get:
     *     summary: Получить название категории товара
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара (id_product)
     *     responses:
     *       200:
     *         description: Название категории
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 category_name:
     *                   type: string
     *       404:
     *         description: Товар или категория не найдены
     */
    router.get("/:id/goodsgroupname", product.getGoodsGroupName);

    /**
     * @swagger
     * /api/products/{id}/goodsgroup:
     *   get:
     *     summary: Получить полную информацию о категории товара
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID товара (id_product)
     *     responses:
     *       200:
     *         description: Данные категории
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CategoryInfo'
     *       404:
     *         description: Товар или категория не найдены
     */
    router.get("/:id/goodsgroup", product.getGoodsGroup);

    /**
     * @swagger
     * /api/products/stats/with-prices:
     *   get:
     *     summary: Получить товары с текущими ценами
     *     tags: [Products, Statistics]
     *     responses:
     *       200:
     *         description: Список товаров с ценами
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/ProductWithPrice'
     */
    router.get("/stats/with-prices", product.getGoodsWithCurrentPrices);

    /**
     * @swagger
     * /api/products/stats/top-selling:
     *   get:
     *     summary: Получить топ продаваемых товаров
     *     tags: [Products, Statistics]
     *     responses:
     *       200:
     *         description: Топ продаваемых товаров
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/TopSellingProduct'
     */
    router.get("/stats/top-selling", product.getTopSellingGoods);

    /**
     * @swagger
     * /api/products/stats/never-sold:
     *   get:
     *     summary: Получить товары, которые никогда не продавались
     *     tags: [Products, Statistics]
     *     responses:
     *       200:
     *         description: Список непродаваемых товаров
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     */
    router.get("/stats/never-sold", product.getGoodsNeverSold);

    app.use('/api/products', router);
};