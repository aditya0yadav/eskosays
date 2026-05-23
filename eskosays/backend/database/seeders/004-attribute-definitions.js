module.exports = [
    {
        key: 'gender',
        title: 'What is your gender?',
        type: 'single-select',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
    },
    {
        key: 'age',
        title: 'What is your age?',
        type: 'number',
        options: null
    },
    {
        key: 'marital_status',
        title: 'What is your marital status?',
        type: 'single-select',
        options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other']
    },
    {
        key: 'country',
        title: 'In which country do you reside?',
        type: 'single-select',
        options: [
            'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
            'France', 'India', 'Japan', 'China', 'Brazil', 'Mexico', 'South Africa'
        ]
    },
    {
        key: 'zip_code',
        title: 'What is your zip/postal code?',
        type: 'string',
        options: null
    },
    {
        key: 'occupation',
        title: 'Which best describes your current employment status?',
        type: 'single-select',
        options: [
            'Student', 'Employed Full-time', 'Employed Part-time',
            'Self-employed', 'Unemployed', 'Retired', 'Other'
        ]
    },
    {
        key: 'income',
        title: 'What is your approximate annual household income?',
        type: 'single-select',
        options: [
            'Under $25,000', '$25,000 - $49,999', '$50,000 - $74,999',
            '$75,000 - $99,999', '$100,000 - $149,999', '$150,000+'
        ]
    },
    {
        key: 'education',
        title: 'What is your highest level of education?',
        type: 'single-select',
        options: [
            'No high school', 'High school degree', 'Some college',
            'Associate degree', 'Bachelor\'s degree', 'Master\'s degree',
            'Professional degree', 'Doctorate degree'
        ]
    },
    {
        key: 'ethnicity',
        title: 'Are you of Hispanic, Latino, or Spanish origin?',
        type: 'single-select',
        options: ['No', 'Yes', 'Prefer not to answer']
    },
    {
        key: 'race',
        title: 'What is your race?',
        type: 'single-select',
        options: ['White', 'Black/African American', 'Asian', 'Native Hawaiian/Pacific Islander', 'American Indian/Alaska Native', 'Other', 'Prefer not to answer']
    },
    {
        key: 'state',
        title: 'Which state/region do you live in?',
        type: 'single-select',
        options: [] // Will be dynamically populated or managed 
    },
    {
        key: 'city',
        title: 'Which city do you live in?',
        type: 'single-select',
        options: [] // Will be dynamically populated
    },
    {
        key: 'job_title',
        title: 'Which best describes your job role?',
        type: 'single-select',
        options: [
            'C-Level Executive (CEO, CTO, etc.)',
            'SVP / VP / Director',
            'Manager / Supervisor',
            'Administrative / Clerical',
            'Sales / Business Development',
            'Marketing / Communications',
            'Software Engineering / IT',
            'Legal / Compliance',
            'Finance / Accounting',
            'Human Resources',
            'Healthcare / Medical',
            'Education / Academic',
            'Scientific / Research',
            'Creative / Design',
            'Student',
            'Retired / Not Employed'
        ]
    },
    {
        key: 'children',
        title: 'How many children do you have under 18?',
        type: 'single-select',
        options: ['None', '1', '2', '3', '4', '5+']
    }
];
