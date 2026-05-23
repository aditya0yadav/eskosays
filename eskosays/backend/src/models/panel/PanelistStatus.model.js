const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PanelistStatusHistory = sequelize.define('PanelistStatusHistory', {
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
        }
    },
    old_status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    new_status: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    changed_by: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'The user (admin) who made the change',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'panelist_status_history',
    timestamps: true,
    updatedAt: false,
    underscored: true
});

module.exports = PanelistStatusHistory;
