module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        login: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM('admin', 'cashier', 'manager'),
            defaultValue: 'cashier'
        }
    });

    return User;
};
