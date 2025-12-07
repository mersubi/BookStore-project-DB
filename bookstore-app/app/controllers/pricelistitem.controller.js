const db = require("../models");
const PriceListItem = db.priceListItem;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.id_price_list || !req.body.id_product || !req.body.price) {
        res.status(400).send({ message: "Обязательные поля: id_price_list, id_product, price!" });
        return;
    }

    const priceListItem = {
        id_price_list: req.body.id_price_list,
        id_product: req.body.id_product,
        price: req.body.price
    };

    PriceListItem.create(priceListItem)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при добавлении товара в список цен."
            });
        });
};

exports.findAll = (req, res) => {
    PriceListItem.findAll({ include: ["priceList", "product"] })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении товаров в списках цен."
            });
        });
};

exports.findOne = (req, res) => {
    const priceListId = req.params.priceListId;
    const productId = req.params.productId;

    PriceListItem.findOne({
        where: { id_price_list: priceListId, id_product: productId },
        include: ["priceList", "product"]
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
    const priceListId = req.params.priceListId;
    const productId = req.params.productId;

    PriceListItem.destroy({
        where: { id_price_list: priceListId, id_product: productId }
    })
        .then(num => {
            if (num == 1) res.send({ message: "Запись удалена успешно." });
            else res.status(404).send({ message: "Запись не найдена." });
        })
        .catch(err => {
            res.status(500).send({ message: "Ошибка при удалении записи." });
        });
};