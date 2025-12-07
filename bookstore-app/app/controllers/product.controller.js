const db = require("../models");
const Product = db.product;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.name || !req.body.article || !req.body.id_category) {
        res.status(400).send({ message: "Обязательные поля: name, article, id_category!" });
        return;
    }

    const product = {
        name: req.body.name,
        article: req.body.article,
        product_type: req.body.product_type || 'book',
        author: req.body.author,
        publisher: req.body.publisher,
        isbn: req.body.isbn,
        id_category: req.body.id_category,
        description: req.body.description
    };

    Product.create(product)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании товара."
            });
        });
};

exports.findAll = (req, res) => {
    const name = req.query.name;
    const condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;

    Product.findAll({ where: condition, include: ["category"] })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении товаров."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Product.findByPk(id, { include: ["category"] })
        .then(data => {
            if (data) res.send(data);
            else res.status(404).send({ message: `Товар с id=${id} не найден.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при получении товара с id=${id}` });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;

    Product.update(req.body, { where: { id_product: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Товар обновлён успешно." });
            else res.status(404).send({ message: `Не удалось обновить товар с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при обновлении товара с id=${id}` });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Product.destroy({ where: { id_product: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Товар удалён успешно." });
            else res.status(404).send({ message: `Не удалось удалить товар с id=${id}.` });
        })
        .catch(err => {
            res.status(500).send({ message: `Ошибка при удалении товара с id=${id}` });
        });
};

exports.deleteAll = (req, res) => {
    Product.destroy({ where: {}, truncate: false })
        .then(nums => res.send({ message: `${nums} товаров удалены.` }))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех товаров."
            });
        });
};