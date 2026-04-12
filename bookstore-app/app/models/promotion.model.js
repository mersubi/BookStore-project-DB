module.exports = (sequelize, Sequelize) => {
  const Promotion = sequelize.define("promotions", {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    discount_percent: {
      type: Sequelize.INTEGER,
      validate: {
        min: 1,
        max: 100
      }
    },
    start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });

  return Promotion;
};
