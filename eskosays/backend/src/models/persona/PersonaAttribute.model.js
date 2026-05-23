const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PersonaAttribute = sequelize.define('PersonaAttribute', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    panelist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'panelists',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    attribute_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'attribute_definitions',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false
    },
    confidence_score: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 1.00
    }
}, {
    tableName: 'persona_attributes',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['panelist_id', 'attribute_id']
        }
    ]
});

module.exports = PersonaAttribute;
