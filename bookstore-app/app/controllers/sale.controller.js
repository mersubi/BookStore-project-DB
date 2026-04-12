const db = require("../models");
const Sale = db.sale;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    if (!req.body.id_price_list || !req.body.sale_date || !req.body.total_amount || !req.body.items || !Array.isArray(req.body.items)) {
        return res.status(400).send({ message: "Обязательные поля: id_price_list, sale_date, total_amount, items (массив)!" });
    }

    try {
        await db.sequelize.transaction(async (t) => {
            const saleParams = {
                id_price_list: req.body.id_price_list,
                sale_date: req.body.sale_date,
                payment_time: req.body.payment_time || new Date().toTimeString().split(' ')[0],
                total_amount: req.body.total_amount,
                userId: req.body.userId || null
            };

            const newSale = await Sale.create(saleParams, { transaction: t });

            for (const item of req.body.items) {
                const product = await db.product.findByPk(item.id_product, { transaction: t });

                if (!product) {
                    throw new Error(`Товар с id=${item.id_product} не найден.`);
                }

                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Недостаточно товара на складе для: ${product.name}`);
                }

                product.stock_quantity -= item.quantity;
                await product.save({ transaction: t });

                await db.saleItem.create({
                    id_sale: newSale.id_sale,
                    id_product: item.id_product,
                    quantity: item.quantity,
                    sale_price: item.sale_price
                }, { transaction: t });
            }
            
            res.send(newSale);
        });
    } catch (err) {
        res.status(400).send({
            message: err.message || "Ошибка при создании продажи."
        });
    }
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