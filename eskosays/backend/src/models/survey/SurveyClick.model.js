const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SurveyClick = sequelize.define('SurveyClick', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    panelist_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    provider_survey_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    survey_id: {
        type: DataTypes.UUID,
        allowNull: true // May be null if survey not yet in surveys table
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'disqualified', 'overquota', 'terminated'),
        defaultValue: 'pending'
    },
    entry_link: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'survey_clicks',
    timestamps: true,
    underscored: true
});

module.exports = SurveyClick;
