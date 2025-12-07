module.exports = app => {
    const saleItem = require("../controllers/saleitem.controller.js");
    const router = require("express").Router();

    router.post("/", saleItem.create);
    router.get("/", saleItem.findAll);
    router.get("/:saleId/:productId", saleItem.findOne);
    router.delete("/:saleId/:productId", saleItem.delete);

    app.use('/api/saleitems', router);
};