const { sequelize, connectDB } = require('./src/config/database');

const seed = async () => {
    try {
        await connectDB();

        // 1. Attribute Definitions
        const attributeDefinitions = require('./database/seeders/004-attribute-definitions');
        const { AttributeDefinition } = require('./src/models');

        for (const def of attributeDefinitions) {
            await AttributeDefinition.upsert(def);
        }

        // 2. Clear survey cache to start fresh mapping
        const fs = require('fs');
        const path = require('path');
        const cachePath = path.join(__dirname, 'survey-cache.json');
        if (fs.existsSync(cachePath)) {
            fs.writeFileSync(cachePath, JSON.stringify([], null, 2));
        }

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

seed();
