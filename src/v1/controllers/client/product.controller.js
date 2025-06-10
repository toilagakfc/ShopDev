const { where } = require("sequelize");
const ProductCategories = require("../../models/ProductCategory.model");
const Brands = require("../../models/brand.model");
const { Op } = require("sequelize");
const ProductVariants = require("../../models/productVariant.model");
const ProductImages = require("../../models/productImage.model");
const Products = require("../../models/product.model");


// danh sách sản phẩm 
// module.exports.index = async (req, res) => {
    
//     try {
//         const products = await Products.findAll({
//             where: {
//                 deleted: 0,
//                 status: 1
//             },
//             attributes: [
//                 "id",
//                 "title",
//                 "slug"
//             ],
//             include: [
//                 {
//                     model: ProductCategories,
//                     as: "categories",
//                     attributes: [
//                         'id',
//                         "name"
//                     ]
//                 },
//                 {
//                     model: ProductVariants,
//                     as: "variants",
//                     attributes: [
//                         "id",
//                         "price",
//                         "specialPrice",
//                         "discount"
//                     ],
//                     required: false,
//                     include: [
//                         {
//                             model: ProductImages,
//                             as: "images",
//                             attributes: ["id", "image"],
//                             required: false,
//                             limit: 1,
//                         }
//                     ]
//                 },
//             ],
//             order: order
//         });
//         // Định dạng dữ liệu trả về
//         const formattedProducts = products.map((product) => {
//             // lấy biến thể đầu tiên
//             const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
//             // lấy hình ảnh đầu tiên
//             const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

//             return {
//                 id: product.id,
//                 title: product.title,
//                 slug: product.slug,
//                 category: product.categories?.name || null,
//                 image: firstImage,
//                 variant: firstVariant
//                     ? {
//                         id: firstVariant.id,
//                         price: firstVariant.price,
//                         specialPrice: firstVariant.specialPrice,
//                         discount: firstVariant.discount
//                     }
//                     : null
//             };
//         });
//         res.json({
//             code: "success",
//             message: "hiển thị danh sách sản phẩm thành công.",
//             data: formattedProducts
//         });
//     } catch (error) {
//         res.status(500).json({ code: "error", message: error.message });
//     }
// }

module.exports.index = async (req, res) => {
    // Lấy tham số phân trang từ query
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 12; 
    const skip = (page - 1) * limit;

    try {
        const { count, rows: products } = await Products.findAndCountAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "title",
                "slug"
            ],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: [
                        'id',
                        "name"
                    ]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ]
                },
            ],
            limit: limit,
            offset: skip
        });
        // Định dạng dữ liệu trả về
        const formattedProducts = products.map((product) => {
            // lấy biến thể đầu tiên
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            // lấy hình ảnh đầu tiên
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                slug: product.slug,
                category: product.categories?.name || null,
                image: firstImage,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });
        res.json({
            code: "success",
            message: "hiển thị danh sách sản phẩm thành công.",
            data: formattedProducts,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                perPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}

// chi tiết sản phẩm
module.exports.detail = async (req, res) => {
    try {
        const product = await Products.findOne({
            where: {
                slug: req.params.slug,
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "title",
                "brandID",
                "categoriesID",
                "description",
                "codeProduct",
                "descriptionPromotion",
                "slug"
            ],
            include: [
                {
                    model: Brands, 
                    as: "brands",
                    attributes: ["id", "name"] 
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "color",
                        "size",
                        "price",
                        "discount",
                        "specialPrice",
                    ],
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"]
                        }

                    ]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy sản phẩm!"
            });
        }
        // // Nhóm biến thể theo màu
        // const groupedVariants = {};
        // product.variants.forEach((variant) => {
        //     if (!groupedVariants[variant.color]) {
        //         groupedVariants[variant.color] = variant.images.length > 0 ? variant.images : [];
        //     }
        // });
        // const formattedVariants = product.variants.map((variant) => {
        //     return {
        //         id: variant.id,
        //         color: variant.color,
        //         size: variant.size,
        //         price: variant.price,
        //         specialPrice: variant.specialPrice,
        //         discount: variant.discount,
        //         images: variant.images.length > 0 ? variant.images : groupedVariants[variant.color] // Gán ảnh từ biến thể đầu tiên của màu
        //     };
        // });
        res.json({
            code: "success",
            message: "Lấy chi tiết sản phẩm thành công.",
            product
        });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({
            code: "error",
            message: "Đã xảy ra lỗi khi lấy sản phẩm."
        });
    }
}

// lấy sản phẩm mới
module.exports.newProduct = async (req, res) => {
    try {
        const products = await Products.findAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "title",
                "slug",
                "createdAt",
                "position",
            ],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: [
                        'id',
                        "name"
                    ]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ]
                },
            ],
            order: [["position", "DESC"]],
            limit: 10
        });
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                category: product.categories?.name || null,
                slug: product.slug,
                position: product.position,
                image: firstImage,
                createdAt: product.createdAt,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách sản phẩm mới nhất thành công.",
            data: formattedProducts
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}

// sản phẩm nổi bật
module.exports.featureProduct = async (req, res) => {
    try {
        const products = await Products.findAll({
            where: {
                deleted: 0,
                status: 1,
                featured: 1,
            },
            attributes: [
                "id",
                "title",
                "slug",
                "position",
                "featured"
            ],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: [
                        'id',
                        "name"
                    ]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ]
                },
            ],
            order: [["position", "DESC"]],
            limit: 10
        });
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                category: product.categories?.name || null,
                slug: product.slug,
                position: product.position,
                image: firstImage,
                featured: product.featured,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách sản phẩm nổi bật thành công.",
            data: formattedProducts
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}

// sản phẩm giảm giá 
module.exports.productSale = async (req, res) => {
    try {
        const products = await Products.findAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "title",
                "slug",
                "position",
                "featured"
            ],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: [
                        'id',
                        "name"
                    ]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ],
                    order: [["discount", "DESC"]],
                },
            ],
            limit: 10
        });
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                category: product.categories?.name || null,
                slug: product.slug,
                position: product.position,
                image: firstImage,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách Giảm giá thành công.",
            data: formattedProducts
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}

// lấy sản phẩm theo danh mục
module.exports.getProductsByCategoryId = async (req, res) => {
    try {
        console.log("Category ID received:", req.params.id)
        const { id } = req.params;
        // console.log(id)

        if (!id) {
            return res.status(400).json({
                code: "error",
                message: "Danh mục không hợp lệ!"
            });
        }
        const subCategories = await ProductCategories.findAll({
            where: { parentId: id },
            attributes: ["id"]
        });
        const categoryIds = subCategories.map(cat => cat.id);
        categoryIds.push(id);

        // Tìm sản phẩm theo danh mục
        const products = await Products.findAll({
            where: {
                categoriesID: { [Op.in]: categoryIds },
                deleted: 0,
                status: 1
            },
            attributes: ["id", "title", "slug", "position"],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: ["id", "name"]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ]
                },
            ],
            order: [["position", "DESC"]],
            limit: 6
        });

        if (products.length === 0) {
            return res.json({
                code: "success",
                message: "Không có sản phẩm nào trong danh mục này.",
                data: []
            });
        }

        // Định dạng dữ liệu trả về
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                category: product.categories?.name || null,
                slug: product.slug,
                image: firstImage,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });

        res.json({
            code: "success",
            message: "Lấy danh sách sản phẩm theo danh mục thành công.",
            data: formattedProducts
        });
    } catch (error) {
        res.status(500).json({ code: "error", message: error.message });
    }
}

// lấy sản phẩm theo slug
module.exports.getProductsByCategory = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                code: "error",
                message: "Slug danh mục không hợp lệ!"
            });
        }

        // Tìm danh mục theo slug
        const category = await ProductCategories.findOne({
            where: {
                slug: slug,
                deleted: 0,
                status: 1

            },
            attributes: ["id", "name", "slug"]
        });

        if (!category) {
            return res.status(404).json({
                code: "error",
                message: "Không tìm thấy danh mục!"
            });
        }

        let categoryIds = [category.id]; // Danh sách ID danh mục cần tìm sản phẩm

        // Kiểm tra nếu danh mục này là danh mục cha thì lấy luôn các danh mục con
        const subCategories = await ProductCategories.findAll({
            where: {
                parentId: category.id,
                deleted: 0,
                status: 1
            },
            attributes: ["id"]
        });

        if (subCategories.length > 0) {
            categoryIds = [...categoryIds, ...subCategories.map(cat => cat.id)];
        }

        // Truy vấn sản phẩm theo danh mục cha và con
        const products = await Products.findAll({
            where: {
                categoriesID: { [Op.in]: categoryIds },
                deleted: 0,
                status: 1
            },
            attributes: ["id", "title", "slug", "position"],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: ["id", "name", "slug"]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: ["id", "price", "specialPrice", "discount"],
                    required: false,
                    order: [["price", "ASC"]],
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1
                        }
                    ]
                }
            ],
            limit: 12
        });

        if (products.length === 0) {
            return res.json({
                code: "success",
                message: "Không có sản phẩm nào trong danh mục này.",
                data: []
            });
        }

        // Định dạng dữ liệu trả về
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                slug: product.slug,
                positon: product.positon,
                category: product.categories?.name || null,
                image: firstImage,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });

        res.json({
            code: "success",
            message: `${category.name} `,
            data: formattedProducts
        });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
        res.status(500).json({ code: "error", message: "Lỗi khi lấy danh sách sản phẩm." });
    }
};


// tìm kiếm sản phẩm
module.exports.search = async (req, res) => {
    try {
        const { query } = req.query;
        console.log("Query:", query);

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm.' });
        }

        // Tìm kiếm sản phẩm theo tiêu chí title hoặc description
        const products = await Products.findAll({
            where: {
                deleted: 0,  
                status: 1,    
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            },
            attributes: [
                "id",
                "title",
                "slug",
                "position",
            ],
            include: [
                {
                    model: ProductCategories,
                    as: "categories",
                    attributes: [
                        'id',
                        "name"
                    ]
                },
                {
                    model: ProductVariants,
                    as: "variants",
                    attributes: [
                        "id",
                        "price",
                        "specialPrice",
                        "discount"
                    ],
                    required: false,
                    include: [
                        {
                            model: ProductImages,
                            as: "images",
                            attributes: ["id", "image"],
                            required: false,
                            limit: 1,
                        }
                    ],
                    order: [["discount", "DESC"]],
                },
            ],
            order: [["position", "DESC"]],
        });

        if (products.length === 0) {
            return res.status(404).json({ 
                code: "error",
                message: "Không tìm thấy sản phẩm phù hợp." });
        }

        // Format lại dữ liệu để trả về
        const formattedProducts = products.map((product) => {
            const firstVariant = product.variants?.length > 0 ? product.variants[0] : null;
            const firstImage = firstVariant?.images?.length > 0 ? firstVariant.images[0].image : null;

            return {
                id: product.id,
                title: product.title,
                category: product.categories?.name || null,
                slug: product.slug,
                position: product.position,
                image: firstImage,
                variant: firstVariant
                    ? {
                        id: firstVariant.id,
                        price: firstVariant.price,
                        specialPrice: firstVariant.specialPrice,
                        discount: firstVariant.discount
                    }
                    : null
            };
        });

        // Trả về kết quả
        return res.status(200).json({
            code: "success",
            message: "Tìm kiếm sản phẩm thành công.",
            data: formattedProducts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
    }
};
// hết danh sach sản phẩm

// danh mục sản phẩm
module.exports.category = async (req, res) => {
    try {
        const categories = await ProductCategories.findAll({
            where: {
                deleted: 0,
                status: 1,
                parentID: null
            },
            include: [
                {
                    model: ProductCategories,
                    as: "subCategories",
                },
            ], attributes: [
                "id",
                "name",
                "image",
                "description",
                "slug",
                "parentID",
                "position"
            ]
        });

        if (!categories) {
            return res.status(404).json({
                code: "error",
                message: "Danh mục không tồn tại!"
            });
        }
        res.json({
            code: "success",
            message: "Hiển thị danh mục sản phẩm thành công.",
            categories: categories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// danh mục sản phẩm cha
module.exports.categoryParent = async (req, res) => {
    try {
        const categoryParent = await ProductCategories.findAll({
            where: {
                deleted: 0,
                status: 1,
                parentID: null
            },
            attributes: [
                "id",
                "name",
                "image",
                "description",
                "slug",
                "parentID",
                "position"
            ]
        })
        res.json({
            code: "success",
            message: "Hiển thị danh mục sản phẩm thành công.",
            categoryParent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// hết danh muc sản phẩm

// Thương hiệu
module.exports.brands = async (req, res) => {
    try {
        const brands = await Brands.findAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "name",
                "image",
                "description",
                "slug",
                "position"
            ]
        })
        return res.status(200).json({
            code: "success",
            message: "Tìm kiếm sản phẩm thành công.",
            brands
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách thương hiệu' });
    }

}
// hết thương hiệu
