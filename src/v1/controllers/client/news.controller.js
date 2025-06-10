const News = require("../../models/news.model");
const NewsCategory = require("../../models/newsCategory.model");


// danh sách tin tức
module.exports.index = async (req, res) => {
    try {
        const newsList = await News.findAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: ["id", "title", "content", "image", "slug", "author", "createdAt"],
            include: [{ model: NewsCategory, as: "category", attributes: ["id", "name"] }],
            order: [["position", "DESC"]]
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách tin tức thành công.",
            newsList: newsList
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// chi tiết tin tức
module.exports.newsDetail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const newsDetail = await News.findOne({
            where: {       
                slug,
                deleted: 0,
                status: 1
            },
            attributes: [
                "id",
                "title", 
                "content", 
                "image", 
                "slug", 
                "author", 
                "createdAt",
                "Views",
                "Likes",
                "Shares"
            ],
            include: [{ model: NewsCategory, as: "category", attributes: ["id", "name"] }],
        });
        if (!newsDetail) {
            return res.status(404).json({
                code: "error",
                message: "Tin tức không tồn tại!"
            });
        }
        res.json({
            code: "success",
            message: "Hiển thị tin tức thành công.",
            newsDetail: newsDetail
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//  Lấy tin tức theo danh mục

module.exports.getNewsByCategory = async (req, res) => {
    try {
        const slug = req.params.slug;
        console.log("Slug danh mục nhận được:", slug);

        const category = await NewsCategory.findOne({
            where: { 
                slug, 
                deleted: 0,
                status: 1
            },
            attributes: ["id", "name", "slug"]
        });
        if (!category) {
            return res.status(404).json({
                code: "error",
                message: "Danh mục không tồn tại!"
            });
        }

        const newsList = await News.findAll({
            where: { 
                newsCategory: category.id, 
                deleted: 0, 
                status: 1 },
                attributes: ["id", "title", "content", "image", "slug", "author", "createdAt"],
            order: [["position", "DESC"]],
            include: [{ model: NewsCategory, as: "category", attributes: ["id", "name"] }]
        });

        res.json({
            code: "success",
            message: "Hiển thị danh sách tin tức theo danh mục thành công.",
            newsList        
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// danh mục tin tức
module.exports.categogyNews = async (req, res) => {
    try {
        const categories = await NewsCategory.findAll({
            attributes: ["id", "name", "image", "description", "slug"],
            where: { 
                deleted: 0,
                status: 1, 
            }, 
            order: [["position", "ASC"]], 
        });

        res.json({
            code: "success",
            message: "Hiển thị danh sách danh mục tin tức thành công.",
            categories: categories        
        });
        console.log(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// danh sách tin tức nổi bật
module.exports.newsFeature = async (req, res) => {
    try {
        const newsList = await News.findAll({
            where: {
                deleted: 0,
                status: 1,
                featured: 1
            },
            attributes: ["id", "title", "content", "image", "slug", "author", "createdAt", "featured", "Views"],
            include: [{ model: NewsCategory, as: "category", attributes: ["id", "name"] }],
            order: [["position", "DESC"]],
            limit: 8
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách tin tức nổi bật thành công.",
            newsList: newsList
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// tin tức trang chủ
module.exports.newsHomePage = async (req, res) => {
    try {
        const newsList = await News.findAll({
            where: {
                deleted: 0,
                status: 1
            },
            attributes: ["id", "title", "content", "image", "slug", "author", "createdAt"],
            include: [{ model: NewsCategory, as: "category", attributes: ["id", "name"] }],
            order: [["position", "DESC"]],
            limit: 8
        });
        res.json({
            code: "success",
            message: "Hiển thị danh sách tin tức thành công.",
            newsList: newsList
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};