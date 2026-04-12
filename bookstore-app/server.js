require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
var corsOptions = {
    origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to bookstore-app application." });
});
const db = require("./app/models");
db.sequelize.sync() //{ force: true }
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });



// set port, listen for requests
const PORT = process.env.PORT || 8080;

// Swagger конфигурация
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BookStore API",
            version: "1.0.0",
            description: "API для книжного магазина",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Development server",
            },
        ],
        components: {
            schemas: {}, //Пустой объект, который заполнится из аннотаций
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./app/routes/*.js"], // Путь к файлам с аннотациями
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

require("./app/routes/goodsgroup.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/pricelist.routes")(app);
require("./app/routes/pricelistitem.routes")(app);
require("./app/routes/sale.routes")(app);
require("./app/routes/saleitem.routes")(app);
require("./app/routes/supplier.routes")(app);
require("./app/routes/promotion.routes")(app);
require("./app/routes/user.routes")(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});