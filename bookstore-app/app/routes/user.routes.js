/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - login
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *         login:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, cashier, manager]
 */

module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const router = require("express").Router();

    /**
     * @swagger
     * /api/users:
     *   post:
     *     summary: Создать нового пользователя
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Пользователь создан
     *       500:
     *         description: Ошибка сервера
     */
    router.post("/", users.create);

    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Получить список пользователей
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: Список пользователей
     *       500:
     *         description: Ошибка сервера
     */
    router.get("/", users.findAll);

    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Удалить пользователя
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Пользователь удален
     *       404:
     *         description: Пользователь не найден
     *       500:
     *         description: Ошибка сервера
     */
    router.delete("/:id", users.delete);

    app.use('/api/users', router);
};
