const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SurveyAttributeMapping = sequelize.define('SurveyAttributeMapping', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'survey_providers',
            key: 'id'
        }
    },
    internal_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Matches AttributeDefinition.key'
    },
    provider_question_key: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    provider_question_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    provider_question_title: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'survey_attribute_mappings',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['provider_id', 'internal_key']
        },
        {
            unique: true,
            fields: ['provider_id', 'provider_question_key']
        }
    ]
});

module.exports = SurveyAttributeMapping;
