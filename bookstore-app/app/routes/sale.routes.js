/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - id_price_list
 *         - sale_date
 *         - payment_time
 *         - total_amount
 *       properties:
 *         id_sale:
 *           type: integer
 *           readOnly: true
 *           description: "ID продажи (автоинкремент)"
 *           example: 1
 *         id_price_list:
 *           type: integer
 *           description: "ID прайс-листа, по которому совершена продажа"
 *           example: 1
 *         sale_date:
 *           type: string
 *           format: date
 *           description: "Дата продажи"
 *           example: "2024-01-15"
 *         payment_time:
 *           type: string
 *           format: time
 *           description: "Время оплаты"
 *           example: "14:30:00"
 *         total_amount:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: "Общая сумма продажи"
 *           example: 5999.97
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SaleInput:
 *       type: object
 *       required:
 *         - id_price_list
 *         - sale_date
 *         - payment_time
 *         - total_amount
 *       properties:
 *         id_price_list:
 *           type: integer
 *           example: 1
 *         sale_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         payment_time:
 *           type: string
 *           format: time
 *           example: "14:30:00"
 *         total_amount:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 5999.97
 *     SaleWithDetails:
 *       type: object
 *       properties:
 *         id_sale:
 *           type: integer
 *         id_price_list:
 *           type: integer
 *         sale_date:
 *           type: string
 *           format: date
 *         payment_time:
 *           type: string
 *           format: time
 *         total_amount:
 *           type: number
 *         priceList:
 *           $ref: '#/components/schemas/PriceList'
 *         saleItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 */

module.exports = app => {
    const sale = require("../controllers/sale.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/sales:
     *   post:
     *     summary: Создать новую продажу
     *     description: Создает запись о продаже с указанием прайс-листа, даты, времени и общей суммы
     *     tags: [Sales]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
 *             $ref: '#/components/schemas/SaleInput'
 *     responses:
 *       201:
 *         description: Продажа успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Неверные данные (отрицательная сумма, неверная дата/время)
 *       404:
 *         description: Прайс-лист не найден
 *       500:
 *         description: Ошибка сервера
 */
    router.post("/", sale.create);

    /**
     * @swagger
     * /api/sales:
     *   get:
     *     summary: Получить все продажи
     *     description: Возвращает список всех продаж
     *     tags: [Sales]
     *     responses:
     *       200:
     *         description: Список продаж
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Sale'
     */
    router.get("/", sale.findAll);

    /**
     * @swagger
     * /api/sales/{id}:
     *   get:
     *     summary: Получить продажу по ID
     *     description: Возвращает детальную информацию о конкретной продаже
     *     tags: [Sales]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
 *         schema:
 *           type: integer
 *         description: ID продажи (id_sale)
 *     responses:
 *       200:
 *         description: Данные продажи
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Продажа не найдена
 */
    router.get("/:id", sale.findOne);

    /**
     * @swagger
     * /api/sales/{id}:
     *   delete:
     *     summary: Удалить продажу по ID
     *     description: Удаляет запись о продаже и все связанные позиции продажи
     *     tags: [Sales]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
 *         schema:
 *           type: integer
 *         description: ID продажи (id_sale)
 *     responses:
 *       200:
 *         description: Продажа успешно удалена
 *       404:
 *         description: Продажа не найдена
 *       500:
 *         description: Ошибка сервера
 */
    router.delete("/:id", sale.delete);

    app.use('/api/sales', router);
};