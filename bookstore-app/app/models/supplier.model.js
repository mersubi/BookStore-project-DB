module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define("suppliers", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    inn: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    }
  });

  return Supplier;
};
