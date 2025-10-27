
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

ACCEPTED_ALGORITHMS = ['RS256'];
ACCESCTOKEN_EXPIRATION = '1h'; // 1 hour
REFRESHTOKEN_EXPIRATION = '7d'; // 7 days

// Middleware để xác thực token
const createTokenPair = async (payload,publicKey,privateKey) => {
    try {
        const accessToken = jwt.sign(payload, privateKey, { expiresIn: ACCESCTOKEN_EXPIRATION , algorithm: ACCEPTED_ALGORITHMS[0] });
        const refreshToken = jwt.sign(payload, privateKey, { expiresIn: REFRESHTOKEN_EXPIRATION, algorithm: ACCEPTED_ALGORITHMS[0] });

        jwt.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                // throw new Error("Access token verification failed: " + err.message);
                // console.error("Access token verification failed:", err.message);
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
    // console.log("Client ID:", userId);
    const accessToken = req.headers[HEADER.AUTHORIZATION]; // Lấy token từ "Bearer <token>"
    // console.log("Access Token:", accessToken);
    if (!accessToken) throw new NotFoundError("No authentication token provided");
    try {
        const keyToken = await getKeyTokenByUserId(userId);
        if (!keyToken) throw new NotFoundError("Key token not found for this user");

        const decoded = jwt.verify(accessToken, keyToken.publicKey, { algorithms: ACCEPTED_ALGORITHMS });
        if (userId !== decoded.userId.toString()) throw new UnauthorizedError("Invalid user ID");
        req.keyToken = keyToken;
        return next();
    } catch (error) {
        // console.error("Token verification error:", error.message);
        throw new Error("Invalid or expired token");
    }
})

const verifyToken = async (token, keySecret) => {
    return await jwt.verify(token, keySecret, { algorithms: ACCEPTED_ALGORITHMS });
}
module.exports = {
    createTokenPair,
    authenticateToken,
    verifyToken
}
