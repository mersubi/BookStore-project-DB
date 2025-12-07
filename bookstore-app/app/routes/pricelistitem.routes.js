module.exports = app => {
    const priceListItem = require("../controllers/pricelistitem.controller.js");
    const router = require("express").Router();

    router.post("/", priceListItem.create);
    router.get("/", priceListItem.findAll);
    router.get("/:priceListId/:productId", priceListItem.findOne);
    router.delete("/:priceListId/:productId", priceListItem.delete);

    app.use('/api/pricelistitems', router);
};