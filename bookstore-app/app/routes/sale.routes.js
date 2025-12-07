module.exports = app => {
    const sale = require("../controllers/sale.controller.js");
    const router = require("express").Router();

    router.post("/", sale.create);
    router.get("/", sale.findAll);
    router.get("/:id", sale.findOne);
    router.delete("/:id", sale.delete);

    app.use('/api/sales', router);
};