const db = require("../models");
const Sale = db.sale;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.id_price_list || !req.body.sale_date || !req.body.total_amount) {
        res.status(400).send({ message: "Обязательные поля: id_price_list, sale_date, total_amount!" });
        return;
    }

    const sale = {
        id_price_list: req.body.id_price_list,
        sale_date: req.body.sale_date,
        payment_time: req.body.payment_time || new Date().toTimeString().split(' ')[0],
        total_amount: req.body.total_amount
    };

    Sale.create(sale)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании продажи."
            });
        });
};

exports.findAll = (req, res) => {
    Sale.findAll({ include: ["priceList"] })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении продаж."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Sale.findByPk(id, { include: ["priceList"] })
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Продажа с id=${id} не найдена.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении продажи с id=${id}` });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Sale.destroy({ where: { id_sale: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Продажа удалена успешно." });
            else res.status(404).send({ message: `Не удалось удалить продажу с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении продажи с id=${id}` });
        });
};