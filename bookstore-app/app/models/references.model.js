
module.exports = (db) => {
    // GoodsGroup self-reference
    db.goodsGroup.belongsTo(db.goodsGroup, {
        foreignKey: 'baseGoodsGroup'
    });

    // Product -> GoodsGroup
    db.product.belongsTo(db.goodsGroup, {
        foreignKey: 'id_category'
    });

    // PriceListItem -> PriceList
    db.priceListItem.belongsTo(db.priceList, {
        foreignKey: 'id_price_list'
    });

    // PriceListItem -> Product
    db.priceListItem.belongsTo(db.product, {
        foreignKey: 'id_product'
    });

    // Sale -> PriceList
    db.sale.belongsTo(db.priceList, {
        foreignKey: 'id_price_list'
    });

    // SaleItem -> Sale
    db.saleItem.belongsTo(db.sale, {
        foreignKey: 'id_sale'
    });

    // SaleItem -> Product
    db.saleItem.belongsTo(db.product, {
        foreignKey: 'id_product'
    });
};