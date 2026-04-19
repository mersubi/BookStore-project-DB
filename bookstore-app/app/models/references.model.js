
module.exports = (db) => {
    // GoodsGroup self-reference
    db.goodsGroup.belongsTo(db.goodsGroup, {
        foreignKey: 'baseGoodsGroup',
        as: 'parent'
    });

    // Product -> GoodsGroup
    db.product.belongsTo(db.goodsGroup, {
        foreignKey: 'id_category',
        as: 'category'
    });

    // PriceListItem -> PriceList
    db.priceList.hasMany(db.priceListItem, { foreignKey: 'id_price_list' });
    db.priceListItem.belongsTo(db.priceList, {
        foreignKey: 'id_price_list'
    });

    // PriceListItem -> Product
    db.product.hasMany(db.priceListItem, { foreignKey: 'id_product' });
    db.priceListItem.belongsTo(db.product, {
        foreignKey: 'id_product'
    });

    // Sale -> PriceList
    db.sale.belongsTo(db.priceList, {
        foreignKey: 'id_price_list',
        as: 'priceList'
    });

    // SaleItem -> Sale
    db.sale.hasMany(db.saleItem, { foreignKey: 'id_sale', as: 'saleItems' });
    db.saleItem.belongsTo(db.sale, {
        foreignKey: 'id_sale'
    });

    // SaleItem -> Product
    db.saleItem.belongsTo(db.product, {
        foreignKey: 'id_product',
        as: 'product'
    });

    // Связь Товара с Поставщиком
    db.suppliers.hasMany(db.product, { foreignKey: 'supplierId' });
    db.product.belongsTo(db.suppliers, { foreignKey: 'supplierId' });

    // Связь Товара с Акцией
    db.promotions.hasMany(db.product, { foreignKey: 'promotionId' });
    db.product.belongsTo(db.promotions, { foreignKey: 'promotionId' });

    // Связь Пользователя с Продажами
    db.users.hasMany(db.sale, { foreignKey: 'userId', as: 'sales' });
    db.sale.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
};