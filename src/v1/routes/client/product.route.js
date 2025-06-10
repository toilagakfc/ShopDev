const express = require("express");
const route = express.Router();

const controller = require("../../controllers/client/product.controller");


// product
route.get("/", controller.index);
route.get("/detail/:slug", controller.detail);
route.get("/newProduct", controller.newProduct);
route.get("/feature", controller.featureProduct);
route.get("/productSale", controller.productSale);
route.get("/search", controller.search);


// category
route.get("/category", controller.category);
route.get("/categoryParent", controller.categoryParent);
route.get("/category/:slug", controller.getProductsByCategory);
route.get("/categoryID/:id", controller.getProductsByCategoryId);
route.get("/brands", controller.brands);
module.exports = route;