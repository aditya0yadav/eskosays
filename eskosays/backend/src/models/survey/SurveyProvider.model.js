const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SurveyProvider = sequelize.define('SurveyProvider', {
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
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    api_key: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    auth_config: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Stores app_id, app_secret, etc. as JSON'
    },
    base_url: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    list_url: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    quota_url: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    click_url: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    qualification_url: {
        type: DataTypes.STRING(512),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'survey_providers',
    timestamps: true,
    underscored: true
});

module.exports = SurveyProvider;
