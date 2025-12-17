/**
 * @swagger
 * components:
 *   schemas:
 *     GoodsGroup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "Книги"
 *         description:
 *           type: string
 *           example: "Художественная и учебная литература"
 *         baseGoodsGroup:
 *           type: integer
 *           nullable: true
 *           description: "ID родительской категории (само-ссылка)"
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     GoodsGroupWithParent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         baseGoodsGroup:
 *           type: integer
 *         parentCategory:
 *           $ref: '#/components/schemas/GoodsGroup'
 */

module.exports = app => {
    const goodsGroup = require("../controllers/goodsgroup.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/goodsgroups:
     *   post:
     *     summary: Создать новую группу товаров
     *     tags: [GoodsGroups]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Канцтовары"
     *               description:
     *                 type: string
     *                 example: "Ручки, тетради, бумага"
     *               baseGoodsGroup:
     *                 type: integer
     *                 nullable: true
     *                 example: null
     *     responses:
     *       201:
     *         description: Группа товаров успешно создана
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GoodsGroup'
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", goodsGroup.create);

    /**
     * @swagger
     * /api/goodsgroups:
     *   get:
     *     summary: Получить все группы товаров
     *     tags: [GoodsGroups]
     *     responses:
     *       200:
     *         description: Список групп товаров
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GoodsGroup'
     */
    router.get("/", goodsGroup.findAll);

    /**
     * @swagger
     * /api/goodsgroups/{id}:
     *   get:
     *     summary: Получить группу товаров по ID
     *     tags: [GoodsGroups]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID группы товаров
     *     responses:
     *       200:
     *         description: Данные группы товаров
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GoodsGroup'
     *       404:
     *         description: Группа товаров не найдена
     */
    router.get("/:id", goodsGroup.findOne);

    /**
     * @swagger
     * /api/goodsgroups/{id}:
     *   put:
     *     summary: Обновить группу товаров по ID
     *     tags: [GoodsGroups]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID группы товаров
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Обновленное название"
     *               description:
     *                 type: string
     *                 example: "Обновленное описание"
     *               baseGoodsGroup:
     *                 type: integer
     *                 nullable: true
     *                 example: 2
     *     responses:
     *       200:
     *         description: Группа товаров успешно обновлена
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GoodsGroup'
     *       404:
     *         description: Группа товаров не найдена
     *       400:
     *         description: Неверные данные
     *       500:
     *         description: Ошибка сервера
     */
    router.put("/:id", goodsGroup.update);

    /**
     * @swagger
     * /api/goodsgroups/{id}:
     *   delete:
     *     summary: Удалить группу товаров по ID
     *     tags: [GoodsGroups]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID группы товаров
     *     responses:
     *       200:
     *         description: Группа товаров успешно удалена
     *       404:
     *         description: Группа товаров не найдена
     *       409:
     *         description: Невозможно удалить - есть связанные товары или подкатегории
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:id", goodsGroup.delete);

    /**
     * @swagger
     * /api/goodsgroups:
     *   delete:
     *     summary: Удалить все группы товаров
     *     tags: [GoodsGroups]
     *     responses:
     *       200:
     *         description: Все группы товаров удалены
     *       409:
     *         description: Невозможно удалить - есть связанные товары
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/", goodsGroup.deleteAll);

    app.use('/api/goodsgroups', router);
};