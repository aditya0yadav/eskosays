const { connectDB, sequelize } = require('./src/config/database');
const { AttributeDefinition } = require('./src/models');

async function updateAttributes() {
    await connectDB();

    console.log('--- Updating Attribute Definitions ---');

    // 1. Job Title Options
    // User provided provider codes 85-95, 1622428-1622432
    // We will use the text as internal values
    const jobTitleOptions = [
        "C-Level (e.g. CEO, CFO), Owner, Partner, President",
        "Vice President (EVP, SVP, AVP, VP)",
        "Director (Group Director, Sr. Director, Director)",
        "Manager (Group Manager, Sr. Manager, Manager, Program Manager)",
        "Analyst",
        "Assistant or Associate",
        "Administrative (Clerical or Support Staff)",
        "Consultant",
        "Intern",
        "Volunteer",
        "None of the above",
        "Skilled worker (doctor, nurse, engineer, lawyer, electrician, teacher, analyst etc.)",
        "Semi-skilled worker (taxi driver, sales, bartender, waiter etc.)",
        "Unskilled worker (cashier, grocery clerk, cleaner etc.)",
        "Other",
        "Prefer not to say"
    ];

    const jobTitle = await AttributeDefinition.findOne({ where: { key: 'job_title' } });
    if (jobTitle) {
        await jobTitle.update({
            type: 'single-select', // Changed from text
            options: jobTitleOptions
        });
        console.log('Updated job_title to single-select with options.');
    }

    // 2. Children Options
    // User provided codes 96-132, 477919, 477920, 500313
    const childrenOptions = [
        "None of the above", "Boy under age 1", "Girl under age 1",
        "Boy age 1", "Girl age 1", "Boy age 2", "Girl age 2",
        "Boy age 3", "Girl age 3", "Boy age 4", "Girl age 4",
        "Boy age 5", "Girl age 5", "Boy age 6", "Girl age 6",
        "Boy age 7", "Girl age 7", "Boy age 8", "Girl age 8",
        "Boy age 9", "Girl age 9", "Boy age 10", "Girl age 10",
        "Boy age 11", "Girl age 11", "Boy age 12", "Girl age 12",
        "Male teen age 13", "Female teen age 13",
        "Male teen age 14", "Female teen age 14",
        "Male teen age 15", "Female teen age 15",
        "Male teen age 16", "Female teen age 16",
        "Male teen age 17", "Female teen age 17",
        "Male teen age 18", "Female teen age 18",
        "Non-Parents"
    ];

    const children = await AttributeDefinition.findOne({ where: { key: 'children' } });
    if (children) {
        await children.update({
            // Ensure type is multi-select (already was, but good to enforce)
            type: 'multi-select',
            options: childrenOptions
        });
        console.log('Updated children to multi-select with options.');
    }

    console.log('\n--- Done ---');
    process.exit(0);
}

updateAttributes();
