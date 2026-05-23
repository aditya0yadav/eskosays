const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AttributeCategory = sequelize.define('AttributeCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'attribute_categories',
    timestamps: true,
    underscored: true
});

module.exports = AttributeCategory;
