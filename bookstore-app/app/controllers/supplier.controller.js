const db = require("../models");
const Supplier = db.suppliers;

exports.create = (req, res) => {
    if (!req.body.name || !req.body.inn) {
        return res.status(400).send({ message: "Обязательные поля: name, inn!" });
    }

    const supplier = {
        name: req.body.name,
        inn: req.body.inn,
        phone: req.body.phone,
        address: req.body.address
    };

    Supplier.create(supplier)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании поставщика."
            });
        });
};

exports.findAll = (req, res) => {
    Supplier.findAll()
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении поставщиков."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Supplier.findByPk(id)
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Поставщик с id=${id} не найден.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении поставщика с id=${id}` });
        });
};
