const db = require("../models");
const PriceList = db.priceList;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.effective_date || !req.body.category) {
        res.status(400).send({ message: "Обязательные поля: effective_date, category!" });
        return;
    }

    const priceList = {
        effective_date: req.body.effective_date,
        category: req.body.category
    };

    PriceList.create(priceList)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании списка цен."
            });
        });
};

exports.findAll = (req, res) => {
    PriceList.findAll()
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении списков цен."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    PriceList.findByPk(id)
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Список цен с id=${id} не найден.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении списка цен с id=${id}` });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;

    PriceList.update(req.body, { where: { id_price_list: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Список цен обновлён успешно." });
            else res.status(404).send({ message: `Не удалось обновить список цен с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при обновлении списка цен с id=${id}` });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    PriceList.destroy({ where: { id_price_list: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Список цен удалён успешно." });
            else res.status(404).send({ message: `Не удалось удалить список цен с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении списка цен с id=${id}` });
        });
};