const express = require("express");
const route = express.Router();

const controller = require("../../controllers/client/favorite.controller");
const authMiddleware  = require("../../middlewares/authMiddleware");


route.get("/", authMiddleware.authenticateToken, controller.index);
route.post("/favoritePost",authMiddleware.authenticateToken, controller.favoritePost);
route.delete("/delete",authMiddleware.authenticateToken ,controller.favoriteDelete);



module.exports = route;