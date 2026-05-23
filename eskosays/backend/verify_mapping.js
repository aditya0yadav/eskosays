const { connectDB } = require('./src/config/database');
const MappingService = require('./src/modules/survey/services/mapping.service');

async function testMapping() {
    await connectDB();

    console.log('Testing Zamplia Marital Status Mapping...');
    const result = await MappingService.mapInternalToProvider('zamplia', 'marital_status', 'Single');
    console.log('Result for Single:', result);

    const result2 = await MappingService.mapInternalToProvider('zamplia', 'marital_status', 'Married');
    console.log('Result for Married:', result2);

    process.exit(0);
}

testMapping();
