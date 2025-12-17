/**
 * @swagger
 * components:
 *   schemas:
 *     PriceList:
 *       type: object
 *       required:
 *         - effective_date
 *         - category
 *       properties:
 *         id_price_list:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         effective_date:
 *           type: string
 *           format: date
 *           description: "Дата вступления прайс-листа в силу"
 *           example: "2024-01-15"
 *         category:
 *           type: string
 *           maxLength: 50
 *           description: "Категория прайс-листа (например, 'Основной', 'Акционный', 'Оптовый')"
 *           example: "Основной"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = app => {
    const priceList = require("../controllers/pricelist.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/pricelists:
     *   post:
     *     summary: Создать новый прайс-лист
     *     tags: [PriceLists]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - effective_date
     *               - category
     *             properties:
     *               effective_date:
     *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Основной"
 *     responses:
     *       201:
     *         description: Прайс-лист успешно создан
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PriceList'
     *       400:
     *         description: Неверные данные (неверная дата или категория)
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", priceList.create);

    /**
     * @swagger
     * /api/pricelists:
     *   get:
     *     summary: Получить все прайс-листы
     *     tags: [PriceLists]
     *     responses:
     *       200:
     *         description: Список всех прайс-листов
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/PriceList'
     */
    router.get("/", priceList.findAll);

    /**
     * @swagger
     * /api/pricelists/{id}:
     *   get:
     *     summary: Получить прайс-лист по ID
     *     tags: [PriceLists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID прайс-листа (id_price_list)
     *     responses:
     *       200:
     *         description: Данные прайс-листа
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PriceList'
     *       404:
     *         description: Прайс-лист не найден
     */
    router.get("/:id", priceList.findOne);

    /**
     * @swagger
     * /api/pricelists/{id}:
     *   put:
     *     summary: Обновить прайс-лист по ID
     *     tags: [PriceLists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID прайс-листа (id_price_list)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               effective_date:
     *                 type: string
 *                 format: date
 *                 example: "2024-02-01"
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Акционный"
 *     responses:
     *       200:
     *         description: Прайс-лист успешно обновлен
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PriceList'
     *       400:
     *         description: Неверные данные
     *       404:
     *         description: Прайс-лист не найден
     *       500:
     *         description: Ошибка сервера
     */
    router.put("/:id", priceList.update);

    /**
     * @swagger
     * /api/pricelists/{id}:
     *   delete:
     *     summary: Удалить прайс-лист по ID
     *     tags: [PriceLists]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID прайс-листа (id_price_list)
     *     responses:
     *       200:
     *         description: Прайс-лист успешно удален
     *       404:
     *         description: Прайс-лист не найден
     *       409:
     *         description: Невозможно удалить - есть связанные позиции прайс-листа
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:id", priceList.delete);

    app.use('/api/pricelists', router);
};