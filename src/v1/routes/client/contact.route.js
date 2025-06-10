const express = require("express");
const route = express.Router();

const controller = require("../../controllers/client/contact.controller")



route.post("/", controller.index);

module.exports = route;