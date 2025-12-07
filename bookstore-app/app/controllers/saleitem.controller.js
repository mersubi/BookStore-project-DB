const db = require("../models");
const SaleItem = db.saleItem;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.id_sale || !req.body.id_product || !req.body.quantity || !req.body.sale_price) {
        res.status(400).send({ message: "Обязательные поля: id_sale, id_product, quantity, sale_price!" });
        return;
    }

    const saleItem = {
        id_sale: req.body.id_sale,
        id_product: req.body.id_product,
        quantity: req.body.quantity,
        sale_price: req.body.sale_price
    };

    SaleItem.create(saleItem)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при добавлении товара в продажу."
            });
        });
};

exports.findAll = (req, res) => {
    SaleItem.findAll({ include: ["sale", "product"] })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении товаров в продажах."
            });
        });
};

exports.findOne = (req, res) => {
    const saleId = req.params.saleId;
    const productId = req.params.productId;

    SaleItem.findOne({
        where: { id_sale: saleId, id_product: productId },
        include: ["sale", "product"]
    })
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: "Запись не найдена." });
        })
        .catch(err => {
            res.status(500).send({ message: "Ошибка при получении записи." });
        });
};

exports.delete = (req, res) => {
    const saleId = req.params.saleId;
    const productId = req.params.productId;

    SaleItem.destroy({
        where: { id_sale: saleId, id_product: productId }
    })
        .then(num => {
            if (num == 1) res.send({ message: "Запись удалена успешно." });
            else res.status(404).send({ message: "Запись не найдена." });
        })
        .catch(err => {
            res.status(500).send({ message: "Ошибка при удалении записи." });
        });
};