module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        id_product: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        article: {
            type: Sequelize.STRING(40),
            allowNull: false
        },
        product_type: {
            type: Sequelize.ENUM('book', 'stationery'),
            allowNull: false
        },
        author: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        publisher: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        isbn: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        id_category: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING(256),
            allowNull: true
        }
    });
    return Product;
};