const express = require("express");
const route = express.Router();

const controller = require("../../controllers/client/user.controller");
const {asyncHandler}  = require("../../helpers/asynchandler.helper");
const {authenticateToken} = require("../../middlewares/authMiddleware");

route.post("/register", asyncHandler(controller.register));
route.post("/login", asyncHandler(controller.login));

//Authentication routes
route.use(authenticateToken); // Apply authentication middleware to all routes below


route.post("/logout", asyncHandler(controller.logout));
route.post("/refresh-token", asyncHandler(controller.refreshToken));
route.post("/password/forgot", controller.forgotPassword);
// route.post("/password/otp", controller.otpPassword);
// route.post("/password/change", authMiddleware.authenticateToken ,controller.changePassword);
// route.get("/profile", authMiddleware.authenticateToken ,controller.profile);
// route.patch("/updateProfile", authMiddleware.authenticateToken,controller.updateProfile);
// route.get("/account", authMiddleware.authenticateToken ,controller.getAccount);
module.exports = route;