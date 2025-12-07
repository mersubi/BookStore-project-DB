module.exports = app => {
    const priceList = require("../controllers/pricelist.controller.js");
    const router = require("express").Router();

    router.post("/", priceList.create);
    router.get("/", priceList.findAll);
    router.get("/:id", priceList.findOne);
    router.put("/:id", priceList.update);
    router.delete("/:id", priceList.delete);

    app.use('/api/pricelists', router);
};