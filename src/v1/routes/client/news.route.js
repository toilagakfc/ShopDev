const express = require("express");
const route = express.Router();

const controller = require("../../controllers/client/news.controller");



route.get("/", controller.index);
route.get("/newsFeature", controller.newsFeature);
route.get("/detail/:slug", controller.newsDetail);
route.get("/category/:slug", controller.getNewsByCategory);
route.get("/category", controller.categogyNews);
route.get("/newsHome", controller.newsHomePage);
module.exports = route;