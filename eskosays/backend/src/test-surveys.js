const { sequelize, connectDB } = require('./config/database');
const surveyService = require('./modules/survey/services/survey.service');
const seedingService = require('./services/seeding.service');
const { User, Panelist, PersonaAttribute, AttributeDefinition } = require('./models');

async function testFetchAndMatch() {
    try {
        await connectDB();
        await sequelize.sync();
        await seedingService.seedSurveyProviders();

        // 1. Refresh Registry (In-Memory)
        await surveyService.refreshSurveyRegistry(true);

        // 2. Mock a User and Panelist
        const [user] = await User.findOrCreate({
            where: { email: 'test@example.com' },
            defaults: {
                password_hash: 'mock_hash',
                role: 'panelist'
            }
        });

        const [panelist] = await Panelist.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                first_name: 'Test',
                last_name: 'User'
            }
        });

        // 3. Test Matching (No attributes yet, should filter out restricted surveys)
        const matched = await surveyService.getAllSurveys(panelist.id);

        // 4. Test Persistence on "Visit"
        if (matched.length > 0) {
            const first = matched[0];
            await surveyService.persistSurveyOnVisit(first.provider, first.providerSurveyId);

            // Verify count in DB
            await sequelize.query("SELECT count(*) as count FROM surveys", { type: sequelize.QueryTypes.SELECT });
        }

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

testFetchAndMatch();
