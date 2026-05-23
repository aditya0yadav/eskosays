const { connectDB, sequelize } = require('./config/database');
const { refreshSurveyRegistry, surveyRegistry, loadRegistryFromFile } = require('./modules/survey/services/survey.service');

async function run() {
    const args = process.argv.slice(2);
    const targetSlugs = [];

    if (args.includes('--goweb')) targetSlugs.push('goweb');
    if (args.includes('--zamplia')) targetSlugs.push('zamplia');

    if (targetSlugs.length === 0) {
        console.error('Error: Please specify at least one provider using --goweb or --zamplia');
        process.exit(1);
    }

    try {
        console.log(`Connecting to database...`);
        await connectDB();

        await loadRegistryFromFile();

        console.log(`Starting targeted fetch for providers: ${targetSlugs.join(', ')}...`);
        // Force fetch for the specific providers
        await refreshSurveyRegistry(true, targetSlugs);

        console.log('\n--- Fetch Summary ---');
        console.log(`Total Surveys in Registry: ${surveyRegistry.full.length}`);

        const providersFound = [...new Set(surveyRegistry.full.map(s => s.provider))];
        console.log(`Providers present in registry: ${providersFound.join(', ')}`);

        targetSlugs.forEach(slug => {
            const count = surveyRegistry.full.filter(s => s.provider === slug).length;
            console.log(`- ${slug}: ${count} surveys`);
        });

    } catch (error) {
        console.error('Fetch Failed:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

run();
