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
    User.findAll({ attributes: { exclude: ['password'] } })
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
exports.findOne = (req, res) => {
    const id = req.params.id;
    User.findByPk(id)
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Пользователь с id=${id} не найден.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении пользователя с id=${id}` });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;
    // Используем individualHooks: true для срабатывания bcrypt hooks
    User.update(req.body, { where: { id: id }, individualHooks: true })
        .then(num => {
            if (num == 1) res.send({ message: "Пользователь был обновлен успешно." });
            else res.status(404).send({ message: `Не удалось обновить пользователя с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при обновлении пользователя с id=${id}` });
        });
};

exports.login = async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await User.findOne({ where: { login } });
        if (!user) return res.status(404).send({ message: "Пользователь не найден." });

        const isMatch = await user.validPassword(password);
        if (!isMatch) return res.status(401).send({ message: "Неверный пароль." });

        const userData = user.get({ plain: true });
        delete userData.password;
        res.send({ message: "Успешный вход", user: userData });
    } catch (err) {
        res.status(500).send({ message: "Ошибка при входе: " + err.message });
    }
};
