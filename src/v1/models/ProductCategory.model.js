const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");


const ProductCategories = sequelize.define('ProductCategories', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    parentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    deleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'productcategories',
    timestamps: false,
});
ProductCategories.hasMany(ProductCategories, { as: "subCategories", foreignKey: "parentID" });
ProductCategories.belongsTo(ProductCategories, { as: "parentCategory", foreignKey: "parentID" });


module.exports = ProductCategories;
