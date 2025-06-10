const express = require("express");
const route = express.Router();


// const authMiddleware  = require("../middlewares/authMiddleware");

route.use("/user", require("./client/user.route"));


// route.use("/news", require("./client/news.route"));
// route.use("/contact", require("./client/contact.route"));
// route.use("/products", require("./client/product.route"));
// route.use("/cart", require("./client/cart.route"));
// route.use("/favorite", require("./client/favorite.route"));
// route.use("/order", require("./client/order.route"));    


module.exports = route


