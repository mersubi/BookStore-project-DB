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
exports.findOne = (req, res) => {
    const id = req.params.id;
    Promotion.findByPk(id)
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Акция с id=${id} не найдена.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении акции с id=${id}` });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;
    Promotion.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Акция была обновлена успешно." });
            else res.status(404).send({ message: `Не удалось обновить акцию с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при обновлении акции с id=${id}` });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;
    Promotion.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Акция была удалена успешно." });
            else res.status(404).send({ message: `Не удалось удалить акцию с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении акции с id=${id}` });
        });
};
