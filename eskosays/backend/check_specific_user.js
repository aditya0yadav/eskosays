require('dotenv').config({ quiet: true });
const { sequelize } = require('./src/config/database');
const User = require('./src/models/auth/User.model');
const Panelist = require('./src/models/panel/Panelist.model');

// Manuall define association for this script context
User.hasOne(Panelist, { foreignKey: 'user_id', as: 'panelist' });
Panelist.belongsTo(User, { foreignKey: 'user_id' });

const checkSpecificUser = async () => {
    try {
        await sequelize.authenticate();

        const email = 'adiworkprofile@gmail.com';
        console.log(`Checking for user: ${email}...`);

        const user = await User.findOne({
            where: { email },
            include: [{ model: Panelist, as: 'panelist' }]
        });

        if (!user) {
            console.log('❌ User NOT found in "users" table.');
            // Let's list what we DO have
            const allUsers = await User.findAll({ attributes: ['email'] });
            console.log('Available emails:', allUsers.map(u => u.email));
        } else {
            console.log('✅ User FOUND in "users" table.');
            console.log(`   ID: ${user.id}`);
            console.log(`   Role: ${user.role}`);

            if (!user.panelist) {
                console.log('❌ Panelist Profile NOT found for this user.');
                console.log('   This explains the 404 error on dashboard.');

                // Optional: Auto-fix?
                // check if we should create one
            } else {
                console.log('✅ Panelist Profile FOUND.');
                console.log(`   Panelist ID: ${user.panelist.id}`);
                console.log(`   Status: ${user.panelist.status}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkSpecificUser();
