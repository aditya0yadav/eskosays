const { connectDB, sequelize } = require('./src/config/database');
const { AttributeDefinition } = require('./src/models');

async function addCityState() {
    await connectDB();

    console.log('--- Adding City and State Attributes ---');

    const usStates = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
        "District of Columbia"
    ];

    const newAttributes = [
        {
            key: 'city',
            title: 'What city do you live in?',
            type: 'string', // Free text
            options: null
        },
        {
            key: 'state',
            title: 'What state do you live in?',
            type: 'single-select',
            options: usStates
        }
    ];

    for (const attr of newAttributes) {
        const [def, created] = await AttributeDefinition.findOrCreate({
            where: { key: attr.key },
            defaults: attr
        });

        if (!created) {
            // Update to ensure options are set (especially for State)
            await def.update({
                title: attr.title,
                type: attr.type,
                options: attr.options
            });
            console.log(`Updated attribute: ${attr.key}`);
        } else {
            console.log(`Created attribute: ${attr.key}`);
        }
    }

    console.log('\n--- Done ---');
    process.exit(0);
}

addCityState();
