const db = require("../models");
const GoodsGroup = db.goodsGroup;
const Op = db.Sequelize.Op;

// Создать новую группу товаров
exports.create = (req, res) => {
    if (!req.body.name) {
        res.status(400).send({ message: "Название не может быть пустым!" });
        return;
    }

    const goodsGroup = {
        name: req.body.name,
        description: req.body.description,
        baseGoodsGroup: req.body.baseGoodsGroup || null
    };

    GoodsGroup.create(goodsGroup)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании группы товаров."
            });
        });
};

// Получить все группы товаров (с поиском по имени)
exports.findAll = (req, res) => {
    const name = req.query.name;
    const condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;

    GoodsGroup.findAll({ where: condition })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении групп товаров."
            });
        });
};

// Найти группу товаров по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    GoodsGroup.findByPk(id)
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Группа с id=${id} не найдена.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении группы с id=${id}` });
        });
};

// Обновить группу товаров по id
exports.update = (req, res) => {
    const id = req.params.id;

    GoodsGroup.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Группа товаров обновлена успешно." });
            else res.status(404).send({ message: `Не удалось обновить группу с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при обновлении группы с id=${id}` });
        });
};

// Удалить группу товаров по id
exports.delete = (req, res) => {
    const id = req.params.id;

    GoodsGroup.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Группа товаров удалена успешно." });
            else res.status(404).send({ message: `Не удалось удалить группу с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении группы с id=${id}` });
        });
};

// Удалить все группы товаров
exports.deleteAll = (req, res) => {
    GoodsGroup.destroy({ where: {}, truncate: false })
        .then(nums => res.send({ message: `${nums} групп товаров удалены.` }))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех групп."
            });
        });
};