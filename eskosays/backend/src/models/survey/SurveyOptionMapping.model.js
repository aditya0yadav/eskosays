const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SurveyOptionMapping = sequelize.define('SurveyOptionMapping', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    attribute_mapping_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'survey_attribute_mappings',
            key: 'id'
        }
    },
    internal_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'The value we store internally'
    },
    provider_value: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'The value the provider expects'
    },
    provider_option_text: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'survey_option_mappings',
    timestamps: true,
    underscored: true,
    indexes: []
});

module.exports = SurveyOptionMapping;
