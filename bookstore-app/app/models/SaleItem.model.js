module.exports = (sequelize, Sequelize) => {
    const SaleItem = sequelize.define("saleitem", {
        id_sale: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        id_product: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        sale_price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        }
    });
    return SaleItem;
};