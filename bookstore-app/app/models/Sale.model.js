module.exports = (sequelize, Sequelize) => {
    const Sale = sequelize.define("sale", {
        id_sale: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        id_price_list: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        sale_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        payment_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        total_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER
        }
    });
    return Sale;
};