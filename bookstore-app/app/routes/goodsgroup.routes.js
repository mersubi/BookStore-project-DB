module.exports = app => {
    const goodsGroup = require("../controllers/goodsgroup.controller.js");
    const router = require("express").Router();

    // Создать новую группу товаров
    router.post("/", goodsGroup.create);

    // Получить все группы товаров
    router.get("/", goodsGroup.findAll);

    // Получить группу товаров по id
    router.get("/:id", goodsGroup.findOne);

    // Обновить группу товаров по id
    router.put("/:id", goodsGroup.update);

    // Удалить группу товаров по id
    router.delete("/:id", goodsGroup.delete);

    // Удалить все группы товаров
    router.delete("/", goodsGroup.deleteAll);

    app.use('/api/goodsgroups', router);
};