const db = require("../models");
const Promotion = db.promotions;

exports.create = (req, res) => {
    if (!req.body.title || !req.body.start_date || !req.body.end_date) {
        return res.status(400).send({ message: "Обязательные поля: title, start_date, end_date!" });
    }

    const promotion = {
        title: req.body.title,
        discount_percent: req.body.discount_percent,
        start_date: req.body.start_date,
        end_date: req.body.end_date
    };

    Promotion.create(promotion)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании акции."
            });
        });
};

exports.findAll = (req, res) => {
    Promotion.findAll()
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении акций."
            });
        });
};
