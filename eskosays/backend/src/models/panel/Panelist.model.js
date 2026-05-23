const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Panelist = sequelize.define('Panelist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country_code: {
        type: DataTypes.STRING(2),
        allowNull: true,
        validate: {
            len: [2, 2]
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'on_boarding', 'flagged', 'banned'),
        defaultValue: 'on_boarding'
    },
    quality_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    pending_bonus: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5.00
    },
    completions_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lifetime_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    profile_picture: {
        type: DataTypes.STRING(1024),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    zip_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    timezone: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'panelists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Only created_at is specified in the prompt for Panelist, but timestamps: true usually adds both. Prompt explicit only about created_at default NOW, but normally update_at is implied or ignored. I'll stick to standard true which gives both, or just created_at if strict.
    // The prompt says "created_at: TIMESTAMP (Default: NOW())" and doesn't mention updated_at for Panelist, unlike User.
    // However, Sequelize `timestamps: true` adds both. I will disable updatedAt if needed, but keeping it is usually safer.
    // Let's stick closer to the prompt:
    updatedAt: false, // Explicitly false as not requested, though often useful.
    underscored: true
});

module.exports = Panelist;
