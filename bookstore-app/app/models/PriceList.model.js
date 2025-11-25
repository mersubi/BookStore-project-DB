module.exports = (sequelize, Sequelize) => {
    const PriceList = sequelize.define("pricelist", {
        id_price_list: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        effective_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING(50),
            allowNull: false
        }
    });
    return PriceList;
};