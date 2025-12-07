module.exports = app => {
    const product = require("../controllers/product.controller.js");
    const router = require("express").Router();

    router.post("/", product.create);
    router.get("/", product.findAll);
    router.get("/:id", product.findOne);
    router.put("/:id", product.update);
    router.delete("/:id", product.delete);
    router.delete("/", product.deleteAll);

    app.use('/api/products', router);
};