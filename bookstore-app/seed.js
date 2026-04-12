const db = require("./app/models");

const seed = async () => {
    try {
        console.log("Очистка и синхронизация БД...");
        await db.sequelize.sync({ force: true });
        console.log("БД очищена.");

        // 1. Компании-поставщики
        const s1 = await db.suppliers.create({ name: "ЭКСМО", inn: "7701234567", phone: "+7 (495) 123-45-67", address: "Москва, ул. Зорге, 1" });
        const s2 = await db.suppliers.create({ name: "Питер", inn: "7801234567", phone: "+7 (812) 323-45-67", address: "Санкт-Петербург, ул. Благодатная, 67" });
        const s3 = await db.suppliers.create({ name: "Альпина", inn: "7709876543", phone: "+7 (495) 789-00-11", address: "Москва, ул. 2-я Звенигородская, 13" });
        const s4 = await db.suppliers.create({ name: "Комус", inn: "7712345678", phone: "+7 (495) 999-88-77", address: "Москва, наб. Академика Туполева, 15" });

        // 2. Иерархия категорий
        // Главные категории
        const rootBooks = await db.goodsGroup.create({ name: "Книги", description: "Все виды печатной продукции" });
        const rootStationery = await db.goodsGroup.create({ name: "Канцтовары", description: "Офисные и школьные принадлежности" });

        // Подкатегории для Книг
        const c1 = await db.goodsGroup.create({ name: "Художественная литература", baseGoodsGroup: rootBooks.id });
        const c2 = await db.goodsGroup.create({ name: "Программирование", baseGoodsGroup: rootBooks.id });
        const c3 = await db.goodsGroup.create({ name: "Детские книги", baseGoodsGroup: rootBooks.id });

        // Подкатегории для Канцтоваров
        const c4 = await db.goodsGroup.create({ name: "Бумажная продукция", baseGoodsGroup: rootStationery.id });
        const c5 = await db.goodsGroup.create({ name: "Письменные принадлежности", baseGoodsGroup: rootStationery.id });

        // 3. Акции
        const prom1 = await db.promotions.create({ 
            title: "Весенняя распродажа", 
            discount_percent: 15, 
            start_date: new Date('2024-03-01'), 
            end_date: new Date('2024-05-31') 
        });

        // 4. Товары (Книги)
        const p1 = await db.product.create({
            name: "Чистый код", author: "Роберт Мартин", article: "IT-001", product_type: "книга",
            id_category: c2.id, supplierId: s2.id_supplier, stock_quantity: 15, description: "Классика программирования"
        });

        const p2 = await db.product.create({
            name: "1984", author: "Джордж Оруэлл", article: "FIC-101", product_type: "книга",
            id_category: c1.id, supplierId: s1.id_supplier, stock_quantity: 25
        });

        const p3 = await db.product.create({
            name: "Грокаем алгоритмы", author: "Адитья Бхаргава", article: "IT-002", product_type: "книга",
            id_category: c2.id, supplierId: s2.id_supplier, stock_quantity: 10, promotionId: prom1.id
        });

        // 5. Товары (Канцтовары)
        const p4 = await db.product.create({
            name: "Ежедневник А5 Escalate", article: "ST-001", product_type: "канцтовары",
            id_category: c4.id, supplierId: s4.id_supplier, stock_quantity: 100, description: "Кожаный переплет, 160 листов"
        });

        const p5 = await db.product.create({
            name: "Ручка гелевая Pilot G-2", article: "ST-002", product_type: "канцтовары",
            id_category: c5.id, supplierId: s4.id_supplier, stock_quantity: 200, description: "Синий цвет, 0.5мм"
        });

        const p6 = await db.product.create({
            name: "Набор карандашей Koh-i-Noor", article: "ST-003", product_type: "канцтовары",
            id_category: c5.id, supplierId: s4.id_supplier, stock_quantity: 50, description: "24 цвета, превосходное качество"
        });

        // 6. Пользователи
        await db.users.create({ login: "admin", password: "adminpassword", role: "admin" });
        const u2 = await db.users.create({ login: "cashier1", password: "123", role: "cashier" });

        // 7. Прайс-лист
        const pl = await db.priceList.create({ effective_date: new Date(), category: "Основной розничный" });

        // Цены
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p1.id_product, price: 1200 });
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p2.id_product, price: 450 });
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p3.id_product, price: 900 });
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p4.id_product, price: 850 });
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p5.id_product, price: 150 });
        await db.priceListItem.create({ id_price_list: pl.id_price_list, id_product: p6.id_product, price: 700 });

        // 8. Пример продажи (История)
        const sale1 = await db.sale.create({
            id_price_list: pl.id_price_list, sale_date: new Date(), payment_time: "10:15:00",
            total_amount: 2150, userId: u2.id
        });
        await db.saleItem.create({ id_sale: sale1.id_sale, id_product: p1.id_product, quantity: 1, sale_price: 1200 });
        await db.saleItem.create({ id_sale: sale1.id_sale, id_product: p3.id_product, quantity: 1, sale_price: 900 });

        console.log("Сидирование завершено успешно!");
        process.exit(0);
    } catch (err) {
        console.error("Ошибка при сидировании:", err);
        process.exit(1);
    }
};

seed();
