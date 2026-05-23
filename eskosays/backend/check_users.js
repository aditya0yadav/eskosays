require('dotenv').config({ quiet: true });
const { sequelize } = require('./src/config/database');
const User = require('./src/models/auth/User.model');
const Panelist = require('./src/models/panel/Panelist.model');

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const userCount = await User.count();
        const panelistCount = await Panelist.count();

        console.log('--------------------------------');
        console.log(`Total Users (Auth): ${userCount}`);
        console.log(`Total Panelists (Profiles): ${panelistCount}`);
        console.log('--------------------------------');

        // List first 5 users to verify
        const users = await User.findAll({
            limit: 5,
            attributes: ['id', 'email', 'role', 'created_at']
        });

        if (users.length > 0) {
            console.log('Sample Users:');
            users.forEach(u => console.log(`- [${u.role}] ${u.email} (ID: ${u.id})`));
        }

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await sequelize.close();
    }
};

checkUsers();
