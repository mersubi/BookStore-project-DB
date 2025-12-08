module.exports = app => {
    const product = require("../controllers/product.controller.js");
    const router = require("express").Router();

    router.post("/", product.create);
    router.get("/", product.findAll);
    router.get("/:id", product.findOne);
    router.put("/:id", product.update);
    router.delete("/:id", product.delete);
    router.delete("/", product.deleteAll);

    // Получить название категории товара по ID товара
    router.get("/:id/goodsgroupname", product.getGoodsGroupName);

    // Получить всю информацию о категории товара по ID товара
    router.get("/:id/goodsgroup", product.getGoodsGroup);

    router.get("/stats/with-prices", product.getGoodsWithCurrentPrices);
    router.get("/stats/top-selling", product.getTopSellingGoods);
    router.get("/stats/never-sold", product.getGoodsNeverSold);

    app.use('/api/products', router);
};