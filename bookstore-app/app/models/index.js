const dbConfig = require('../config/db.config.js');

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    operatorsAliases: false,

    define: {
        underscored: true,  // snake_case вместо camelCase
    },

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.goodsGroup = require('./goods-group.model.js')(sequelize, Sequelize);
db.product = require('./Product.model.js')(sequelize, Sequelize);
db.priceList = require('./PriceList.model.js')(sequelize, Sequelize);
db.sale = require('./Sale.model.js')(sequelize, Sequelize);
db.priceListItem = require('./PriceListItem.model.js')(sequelize, Sequelize);
db.saleItem = require('./SaleItem.model.js')(sequelize, Sequelize);
db.suppliers = require("./supplier.model.js")(sequelize, Sequelize);
db.promotions = require("./promotion.model.js")(sequelize, Sequelize);

require("./references.model.js")(db)
module.exports = db;