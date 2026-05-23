require('dotenv').config({ quiet: true });
const { sequelize } = require('./src/config/database');
const User = require('./src/models/auth/User.model');
const Panelist = require('./src/models/panel/Panelist.model');
const { v4: uuidv4 } = require('uuid');

// Manually define association
User.hasOne(Panelist, { foreignKey: 'user_id', as: 'panelist' });
Panelist.belongsTo(User, { foreignKey: 'user_id' });

const repairUser = async () => {
    try {
        await sequelize.authenticate();

        const email = 'adiworkprofile@gmail.com';
        console.log(`Repairing user: ${email}...`);

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User NOT found. Cannot repair.');
            return;
        }

        // Check if panelist exists
        const existingPanelist = await Panelist.findOne({ where: { user_id: user.id } });
        if (existingPanelist) {
            console.log('✅ Panelist profile already exists.');
            return;
        }

        // Create Panelist
        console.log('creating new panelist profile...');
        const newPanelist = await Panelist.create({
            id: uuidv4(),
            user_id: user.id,
            first_name: 'Aditya', // Default
            last_name: 'User',    // Default
            status: 'active',
            balance: 0.00,
            lifetime_earnings: 0.00,
            quality_score: 100
        });

        console.log('✅ Panelist profile created successfully!');
        console.log(`   ID: ${newPanelist.id}`);

    } catch (error) {
        console.error('Error repairing user:', error);
    } finally {
        await sequelize.close();
    }
};

repairUser();
