
const User = require("../models/user.model");
const Favorite = require("../models/favorite.model");
const ProductVariants = require("../models/productVariant.model");
const Products = require("../models/product.model");
const ProductImages = require("../models/productImage.model");


// danh sách yêu thích
module.exports.index = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({
                code: "error",
                message: "Vui lòng đăng nhập!"
            });
        }
        

        const favorites = await Favorite.findAll({
            where: { userId },
            include: [
                {
                    model: ProductVariants,
                    as: "productVariants",
                    attributes: [
                        "id", 
                        "price", 
                        "size", 
                        "color", 
                        "discount", 
                        "specialPrice", 
                        "ProductID"
                    ],
                    include: [
                        {
                            model: Products,
                            as: "product",
                            attributes: [
                                "id", 
                                "title", 
                                "brandID", 
                                "categoriesID", 
                                "description", 
                                "codeProduct", 
                                "slug"],
                            where: { 
                                status: 1, 
                                deleted: 0 
                            }
                        },
                        {
                            model: ProductImages,
                            as: "images", 
                            attributes: ["id", "image"], 
                            where: { 
                                deleted: 0, 
                                status: 1 } 
                        }
                        
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        if (!favorites || favorites.length === 0) {
            return res.status(200).json({
                code: "success",
                message: "Chưa có sản phẩm yêu thích."
            });
        }

        res.status(200).json({
            code: "success",
            message: "Hiển thị sản phẩm yêu thích thành công.",
            favorites
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: "error",
            message: "Đã xảy ra lỗi khi lấy danh sách yêu thích.",
            error
        });
    }
}

// thêm yêu thích
module.exports.favoritePost = async (req, res) => {
    try {
        
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({
                code: "error",
                message: "Vui lòng đăng nhập!"
            });
        }
        const { productvariantId } = req.body;

        // kiểm tra xem sản phẩm có tồn tại không
        const productVariants = await ProductVariants.findByPk(productvariantId);
        if (!productVariants) {
            return res.status(400).json({
                code: "error",
                message: "Biến thể sản phẩm không tồn tại!"
            });
        }
        // Kiểm tra xem đã tồn tại trong danh sách yêu thích chưa
        const existingFavorite = await Favorite.findOne({ where: { userId, productvariantId } });
        if (existingFavorite) {
            return res.status(400).json({
                code: "error",
                message: "Sản phẩm đã có trong yêu thích!"
            });
        }

        // thêm sản phẩm vào yêu thích
        const favorite = await Favorite.create({ userId, productvariantId });
        res.status(200).json({
            code: "success",
            message: "Thêm sản phẩm yêu thích thành công.",
            favorite
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
}

// xóa yêu thích
module.exports.favoriteDelete = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({
                code: "error",
                message: "Vui lòng đăng nhập!"
            });
        }
        const { productvariantId } = req.body;
        const userId = req.user.userId;

        
        const deleted = await Favorite.destroy({
            where: { userId, productvariantId }
        });

        if (deleted) {
            return res.status(200).json({
                code: "success",
                message: "Xóa sản phẩm yêu thích thành công.",
            });
        } else {
            return res.status(400).json({
                code: "error",
                message: "Sản phẩm không tồn tại trong danh sách yêu thích!"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
}