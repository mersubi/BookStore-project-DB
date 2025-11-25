module.exports = (sequelize, Sequelize) => {
    const PriceListItem = sequelize.define("pricelistitem", {
        id_price_list: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        id_product: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        }
    });
    return PriceListItem;
};