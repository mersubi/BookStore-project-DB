const db = require("../models");
const Product = db.product;
const Op = db.Sequelize.Op;
const { QueryTypes } = db.Sequelize;

exports.create = (req, res) => {
    // В форме используется articul, в модели article. Поддержим оба варианта.
    const articleValue = req.body.articul || req.body.article;

    if (!req.body.name || !articleValue || !req.body.id_category) {
        res.status(400).send({ message: "Обязательные поля: name, articul/article, id_category!" });
        return;
    }

    const product = {
        name: req.body.name,
        article: articleValue,
        product_type: req.body.product_type || 'книга',
        author: req.body.author,
        publisher: req.body.publisher,
        isbn: req.body.isbn,
        id_category: req.body.id_category,
        description: req.body.description,
        stock_quantity: req.body.stock_quantity || 0,
        supplierId: req.body.supplierId || null,
        promotionId: req.body.promotionId || null
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
// 1. Получить название категории товара по ID товара
exports.getGoodsGroupName = (req, res) => {
    const id = req.params.id;

    db.sequelize.query(
        `SELECT gg.name 
       FROM goodsgroups gg 
       LEFT JOIN products p ON gg.id = p.id_category 
       WHERE p.id_product = :id`,
        {
            replacements: { id: id },
            type: QueryTypes.SELECT
        }
    )
        .then(result => {
            if (result.length > 0) {
                res.send({ name: result[0].name });
            } else {
                res.send({ name: 'NO_NAME_ERROR' });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении названия категории."
            });
        });
};
// 2. Получить всю информацию о категории товара по ID товара
exports.getGoodsGroup = (req, res) => {
    const id = req.params.id;

    db.sequelize.query(
        `SELECT gg.* 
       FROM goodsgroups gg 
       LEFT JOIN products p ON gg.id = p.id_category 
       WHERE p.id_product = :id`,
        {
            replacements: { id: id },
            type: QueryTypes.SELECT
        }
    )
        .then(result => {
            if (result.length > 0) {
                res.send(result[0]);
            } else {
                res.status(404).send({ message: "Категория не найдена." });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении категории."
            });
        });
};

// 3. Получить товары с ценами из активного прайс-листа (сегодняшнего)
exports.getGoodsWithCurrentPrices = (req, res) => {
    db.sequelize.query(
        `SELECT 
        p.id_product,
        p.name,
        p.article,
        pli.price,
        pl.effective_date,
        pl.category as price_category
       FROM products p
       JOIN pricelistitems pli ON p.id_product = pli.id_product
       JOIN pricelists pl ON pli.id_price_list = pl.id_price_list
       WHERE pl.effective_date = CURRENT_DATE
       ORDER BY p.name`,
        {
            type: QueryTypes.SELECT
        }
    )
        .then(result => res.send(result))
        .catch(err => res.status(500).send({ message: err.message }));
};

// 4. Получить топ-5 самых продаваемых товаров
exports.getTopSellingGoods = (req, res) => {
    db.sequelize.query(
        `SELECT 
        p.name,
        p.article,
        SUM(si.quantity) as total_sold,
        SUM(si.quantity * si.sale_price) as total_revenue
       FROM products p
       JOIN saleitems si ON p.id_product = si.id_product
       GROUP BY p.id_product, p.name, p.article
       ORDER BY total_sold DESC
       LIMIT 5`,
        {
            type: QueryTypes.SELECT
        }
    )
        .then(result => res.send(result))
        .catch(err => res.status(500).send({ message: err.message }));
};

// 5. Получить товары, которых нет в продажах (никогда не продавались)
exports.getGoodsNeverSold = (req, res) => {
    db.sequelize.query(
        `SELECT 
        p.*,
        gg.name as category_name
       FROM products p
       LEFT JOIN saleitems si ON p.id_product = si.id_product
       JOIN goodsgroups gg ON p.id_category = gg.id
       WHERE si.id_product IS NULL
       ORDER BY p.name`,
        {
            type: QueryTypes.SELECT,
            model: db.product,
            mapToModel: true
        }
    )
        .then(result => res.send(result))
        .catch(err => res.status(500).send({ message: err.message }));
};
