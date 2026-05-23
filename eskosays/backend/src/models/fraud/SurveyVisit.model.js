const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * SurveyVisit — tracks every anonymous visit to a survey link.
 *
 * A "visit" is recorded the moment the frontend sends a fingerprint-check
 * request. If the same fingerprint OR the same IP has already visited the
 * same survey, the system flags / blocks the new attempt.
 */
const SurveyVisit = sequelize.define('SurveyVisit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    survey_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Provider-specific survey identifier',
    },
    platform: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g. goweb | zamplia',
    },
    fingerprint_hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: 'SHA-256 hex of the browser fingerprint sent by frontend',
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
        comment: 'IPv4 or IPv6 address extracted by the backend',
    },
    user_agent: {
        type: DataTypes.STRING(512),
        allowNull: true,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        comment: 'Fraud trust score 0-100. Higher = more trustworthy.',
    },
    status: {
        type: DataTypes.ENUM('new', 'flagged', 'blocked'),
        defaultValue:  'new',
        comment: 'new=first time | flagged=duplicate signal | blocked=denied',
    },
}, {
    tableName: 'survey_visits',
    timestamps: true,           // created_at + updated_at
    underscored: true,          // snake_case column names
    indexes: [
        // Enforce one fingerprint per survey — also used as fast lookup
        { unique: true, fields: ['fingerprint_hash', 'survey_id'] },
    ],
});

module.exports = SurveyVisit;
