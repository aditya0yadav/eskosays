const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AttributeDefinition = sequelize.define('AttributeDefinition', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'multi-select', 'single-select'),
        allowNull: false,
        defaultValue: 'string'
    },
    options: {
        type: DataTypes.JSON,
        allowNull: true
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'attribute_definitions',
    timestamps: true,
    underscored: true
});

module.exports = AttributeDefinition;
