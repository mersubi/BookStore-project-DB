const db = require("../models");
const User = db.users;

exports.create = (req, res) => {
    if (!req.body.login || !req.body.password) {
        return res.status(400).send({ message: "Обязательные поля: login, password!" });
    }

    const user = {
        login: req.body.login,
        password: req.body.password,
        role: req.body.role || 'cashier'
    };

    User.create(user)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании пользователя."
            });
        });
};

exports.findAll = (req, res) => {
    User.findAll()
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении пользователей."
            });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    User.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Пользователь удалён успешно." });
            else res.status(404).send({ message: `Не удалось удалить пользователя с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении пользователя с id=${id}` });
        });
};
