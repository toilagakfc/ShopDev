
// const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const {asyncHandler} = require('../helpers/asynchandler.helper');
const { UnauthorizedError, NotFoundError } = require('../core/error.response');
const { getKeyTokenByUserId } = require('../services/keyToken.services');

const HEADER = {
    AUTHORIZATION: 'authorization',
    BEARER: 'Bearer',
    CLIENT_ID: 'x-client-id',
}

// Middleware để xác thực token
const createTokenPair = async (payload,publicKey,privateKey) => {
    try {
        const accessToken = jwt.sign(payload, privateKey, { expiresIn: '1h' , algorithm: 'RS256' });
        const refreshToken = jwt.sign(payload, privateKey, { expiresIn: '7d', algorithm: 'RS256' });

        jwt.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                // throw new Error("Access token verification failed: " + err.message);
                console.error("Access token verification failed:", err.message);
            }
            // console.log("Access token decoded:", decoded);
        })

        // Trả về cặp token
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new Error("Error creating token pair: " + error.message);
    }
}

const authenticateToken = asyncHandler( async (req, res, next) => {
    /*    Middleware để xác thực token
        - Lấy token từ header Authorization
        - Kiểm tra token có hợp lệ không
        - Nếu hợp lệ, gán thông tin người dùng vào req.user
        - Nếu không hợp lệ, trả về lỗi 401 Unauthorized
        */
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new NotFoundError("Client ID is required in headers");
    console.log("Client ID:", userId);
    const accessToken = req.headers[HEADER.AUTHORIZATION]; // Lấy token từ "Bearer <token>"
    console.log("Access Token:", accessToken);
    if (!accessToken) throw new NotFoundError("No authentication token provided");
    try {
        const keyToken = await getKeyTokenByUserId(userId);
        if (!keyToken) throw new NotFoundError("Key token not found for this user");

        const decoded = jwt.verify(accessToken, keyToken.publicKey, { algorithms: ['RS256'] });
        if (userId !== decoded.userId.toString()) throw new UnauthorizedError("Invalid user ID");
        req.keyToken = keyToken;
        return next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        throw new Error("Invalid or expired token");
    }
})

const verifyToken = async (token, keySecret) => {
    return await jwt.verify(token, keySecret, { algorithms: ['RS256'] });
}
module.exports = {
    createTokenPair,
    authenticateToken,
    verifyToken
}
// module.exports.authenticateToken = (req, res, next) => {
//     // bỏ qua các đường dẫn
//     // const whiteList = ['/about', '/contact', '/products'];
//     // if(whiteList.includes(req.originalUrl)) {
//     //     return next();
//     // }
    
//     const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ "Bearer <token>"

//     if (!token) {
//         return res.status(401).json({
//             code: "error",
//             message: "Không có token xác thực!",
//         });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {    
//         if (err) {
//             return res.status(401).json({
//                 code: "error",
//                 message: "Token không hợp lệ!",
//             });
//         }

//         // Gán thông tin người dùng vào req.user
//         req.user = decoded; // Đảm bảo rằng bạn gán giá trị decoded (thông tin người dùng) vào req.user
//         next();
//     });
    
// };

// module.exports.authenticateToken = (req, res, next) => {
//     // bỏ qua các đường dẫn
//     // const whiteList = ['/about', '/contact', '/products'];
//     // if(whiteList.includes(req.originalUrl)) {
//     //     return next();
//     // }
//     const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ "Bearer <token>"
//     if (!token) {
//         return res.status(401).json({
//             code: "error",
//             message: "Không có token xác thực!",
//         });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         console.log("check token", decoded)
//         req.user = {
//             email: decoded.email,
//             fullname: decoded.fullname,
//         }
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             code: "error",
//             message: "Token không hợp lệ hoặc đã hết hạn!",
//         });
//     }
    
// };