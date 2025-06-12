// const User = require("../../models/user.model");
// const bcrypt = require("bcrypt");
// const { raw } = require("body-parser");
// const jwt = require('jsonwebtoken');
// const { where, Op } = require("sequelize");
// const ForgotPassword = require("../../models/forgotpass.model");
// const { getInfoData } = require("../../utils");

const UserService = require("../../services/user.services");
const {SuccessResponse, CreatedResponse} = require("../../core/success.response");
// const generateHelper = require("../../helpers/generate.helper");
// const sendMailHelper = require("../../helpers/sendMail.helper");
// const { get } = require("https");


class UserController  {
    // Khởi tạo controller
    // Các phương thức sẽ được định nghĩa ở đây
    
    register = async (req, res, next) => {
        new CreatedResponse({
            message: "Đăng ký thành công!",
            data: await UserService.register(req.body)
        }).send(res);
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Đăng nhập thành công!",
            data: await UserService.login(req.body)
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Đăng xuất thành công!",
            data: await UserService.logout(req.keyToken)
        }).send(res);
    }

    refreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Làm mới token thành công!",
            data: await UserService.handleRefreshToken(req.body.refreshToken)
        }).send(res);
    }

    forgotPassword = async (req, res, next) => {  
        new SuccessResponse({
            message: "Gửi mã OTP thành công!",
            data: await UserService.forgotPassword(req.body.email)
        }).send(res);
    }

    verifyOtp = async (req, res, next) => {
        new SuccessResponse({
            message: "Xác thực mã OTP thành công!",
            data: await UserService.verifyOtp(req.body)
        }).send(res);
    }
}

module.exports = new UserController();


// // đổi mật khẩu
// module.exports.changePassword = async (req, res) => {
//     try {
//         const { oldPassword, newPassword } = req.body;
//         const userId = req.user.userId;

//         if (!req.user || !req.user.userId) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Thông tin người dùng không hợp lệ!",
//             });
//         }

//         if (!oldPassword || !newPassword) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới!",
//             });
//         }

//         // Tìm user trong database
//         const user = await User.findOne({
//             where: {
//                 id: userId,
//                 deleted: 0,
//                 status: 1
//             }
//         });
//         if (!user) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Tài khoản không tồn tại!",
//             });
//         }

//         // Kiểm tra mật khẩu cũ
//         const isMatch = await bcrypt.compare(oldPassword, user.password);
//         if (!isMatch) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Mật khẩu cũ không chính xác!",
//             });
//         }

//         // Mã hóa mật khẩu mới
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Cập nhật mật khẩu mới
//         await User.update({ password: hashedPassword }, { where: { id: userId } });

//         return res.status(200).json({
//             code: "success",
//             message: "Đổi mật khẩu thành công!",
//         });

//     } catch (error) {
//         console.error("Lỗi đổi mật khẩu:", error);
//         return res.status(500).json({
//             code: "error",
//             message: "Có lỗi xảy ra, vui lòng thử lại sau!",
//         });
//     }
// };

// // hiển thị thông tin cá nhân
// module.exports.profile = async (req, res) => {
//     try {

//         const user = await User.findOne({
//             attributes: [
//                 "id",
//                 "fullname",
//                 "email",
//                 "address",
//                 "phone",
//                 "image",
//                 "birthday",
//                 "gender",
//                 "createdAt"
//             ],
//             where: {
//                 id:req.user.userId,
//                 deleted: 0,
//                 status:1
//             },
//             raw:true
//         });

//         if (!user) {
//             return res.status(404).json({ error: "Người dùng không tồn tại!" });
//         }
//         console.log(user)
//         res.status(200).json({
//             code: "success",
//             message: "Hiển thị thông tin thành công!",
//             user: user
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Lỗi khi lấy thông tin người dùng!" });
//     }
// };

// // thay đổi thông tin
// module.exports.updateProfile = async (req, res) => {
//     const { fullname, email, address, phone, image, birthday, gender } = req.body;
//     if (!req.user || !req.user.userId) {
//         return res.status(401).json({ message: "Token không hợp lệ hoặc không có quyền truy cập!" });
//     }

//     try {
//         const user = await User.findOne({
//             where: {
//                 id: req.user.userId, 
//                 deleted: 0,
//                 status:1
//             }
//         });

//         if (!user) {
//             return res.status(404).json({ message: "Người dùng không tồn tại" });
//         }

//         // Cập nhật thông tin người dùng
//         const updatedUser = await user.update({
//             fullname,
//             address,
//             phone,
//             image,
//             birthday,
//             gender,
//         });
//         const responseUser = {
//             fullname: updatedUser.fullname,
//             email: updatedUser.email,
//             address: updatedUser.address,
//             phone: updatedUser.phone,
//             image: updatedUser.image,
//             birthday: updatedUser.birthday,
//             gender: updatedUser.gender,
//             createdAt: updatedUser.createdAt
//         };
//         res.status(200).json({
//             code: "success",
//             message: "Cập nhật thông tin người dùng thành công!",
//             user: responseUser
//         });
//     } catch (error) {
//         console.error("Error details:", error); // Log chi tiết lỗi
//         return res.status(500).json({
//             message: "Đã xảy ra lỗi khi cập nhật thông tin người dùng!",
//             error: error.message
//         });
//     }
// }

// // module.exports.getAccount = async (req, res) => {
// //     const user = req.user
    
// //     res.status(200).json({
// //         code: "success",
// //         message: "lấy thông tin người dùng thành công!",
// //         user
        
// //     });
// // }