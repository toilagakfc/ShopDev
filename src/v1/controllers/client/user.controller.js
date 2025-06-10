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
}

module.exports = new UserController();
// // quên mật khẩu
// module.exports.forgotPassword = async (req, res) => {
//     const email = req.body.email;
//     const existUser = await User.findOne({
//         where: {
//             email,
//             deleted: 0,
//             status: 1
//         },
//         raw: true
//     });
//     if (!existUser) {
//         return res.status(400).json({
//             code: "error",
//             message: "Email dùng không tồn tại!",
//         });
//     }
//     // Kiểm tra xem user có mã OTP chưa hết hạn trong database không
//     const existingOtp = await ForgotPassword.findOne({
//         where: { userId: existUser.id },
//         order: [['createdAt', 'DESC']],
//         raw: true
//     });

//     // Nếu đã có mã OTP và chưa hết hạn => không gửi mới
//     if (existingOtp && new Date(existingOtp.expireAt) > new Date()) {
//         return res.status(400).json({
//             code: "error",
//             message: "Bạn đã yêu cầu OTP trước đó. Vui lòng thử lại sau 5 phút!",
//         });
//     }
//     // Xóa mã OTP cũ đã hết hạn (nếu có)
//     await ForgotPassword.destroy({
//         where: {
//             userId: existUser.id,
//             expireAt: { [Op.lt]: new Date() } // Xóa OTP đã hết hạn
//         }
//     });
//     // Tạo OTP ngẫu nhiên
//     const otp = generateHelper.generateRandomNumber(6);
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     // việc 1: lưu email và mã OTP vào database
//     const newOtp = await ForgotPassword.create({
//         userId: existUser.id,
//         otp: hashedOtp,
//         expireAt: new Date(Date.now() + 5 * 60 * 1000) // Hết hạn sau 5 phút
//     });
//     // việc 2: gửi mã otp qua email cho user
//     const subject = "Xác thực mã OTP";
//     const text = `Mã xác thực của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong vòng 5 phút, vui lòng không cung cấp mã OTP cho bất kỳ ai.`;
//     sendMailHelper.sendMail(email, subject, text);

//     // Tự động xóa OTP sau 5 phút
//     setTimeout(async () => {
//         await ForgotPassword.destroy({
//             where: { id: newOtp.id }
//         });
//     }, 5 * 60 * 1000);
//     res.status(200).json({
//         code: "success",
//         message: "Gửi mã OTP thành công.",
//     });
// }

// // xác thực mã otp
// module.exports.otpPassword = async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         // Kiểm tra input
//         if (!email || !otp) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Vui lòng nhập email và OTP!"
//             });
//         }
//         // Tìm user theo email
//         const user = await User.findOne({
//             where: {
//                 email,
//                 deleted: 0,
//                 status: 1
//             }
//         });
//         if (!user) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Không tìm thấy tài khoản!"
//             });
//         }

//         // Tìm OTP gần nhất trong database
//         const existRecord = await ForgotPassword.findOne({
//             where: { userId: user.id },
//             order: [["createdAt", "DESC"]]
//         });

//         // Kiểm tra xem OTP có tồn tại không
//         if (!existRecord) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Mã OTP không hợp lệ!"
//             });
//         }

//         // Kiểm tra OTP đã hết hạn chưa
//         if (new Date() > existRecord.expireAt) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Mã OTP đã hết hạn!"
//             });
//         }

//         // So sánh OTP nhập vào với OTP đã mã hóa trong database
//         const isMatch = await bcrypt.compare(otp, existRecord.otp);
//         if (!isMatch) {
//             return res.status(400).json({
//                 code: "error",
//                 message: "Mã OTP không chính xác!"
//             });
//         }
//         // Xóa OTP sau khi xác minh thành công (tránh lạm dụng OTP cũ)
//         await ForgotPassword.destroy({
//             where: { userId: user.id }
//         });
//         // gửi lại mật khẩu mới random
//         const newPassword = generateHelper.generateRandomString(10);
//         const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//         await User.update({ password: hashedNewPassword }, { where: { id: user.id } });

//         // Gửi email mật khẩu mới
//         const subject = "Mật khẩu mới";
//         const text = `Mật khẩu mới của bạn là <b>${newPassword}</b>. vui lòng không cung cấp mã OTP cho bất kỳ ai.`;
//         sendMailHelper.sendMail(email, subject, text);

//         return res.status(200).json({
//             code: "success",
//             message: "Xác thực OTP thành công, mật khẩu mới đã được gửi qua email của bạn."
//         });

//     } catch (error) {
//         console.error("Lỗi xác thực OTP:", error);
//         return res.status(500).json({
//             code: "error",
//             message: "Có lỗi xảy ra, vui lòng thử lại!"
//         });
//     }
// };


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