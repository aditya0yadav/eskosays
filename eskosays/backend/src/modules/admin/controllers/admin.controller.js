const {
    User, Panelist, SurveyCompletion, Survey, SurveyProvider,
    PersonaAttribute, AttributeDefinition
} = require('../../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../config/database');
const { syncRegistry, getAdminSurveys } = require('../../survey/services/survey.service');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../../../config/admin_settings.json');

// Ensure stats file exists
if (!fs.existsSync(SETTINGS_FILE)) {
    try {
        const dir = path.dirname(SETTINGS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
            displayName: 'Super Admin',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=FFD166',
            emailNotifications: true,
            systemSounds: true,
            performanceMode: false
        }));
    } catch (e) { }
}

const getDashboardStats = async (req, res) => {
    try {
        const { range = '30d' } = req.query;
        let whereRange = {};

        if (range !== 'all') {
            const dateLimit = new Date();
            if (range === 'today') dateLimit.setHours(0, 0, 0, 0);
            else if (range === '7d') dateLimit.setDate(dateLimit.getDate() - 7);
            else if (range === '30d') dateLimit.setDate(dateLimit.getDate() - 30);
            else if (range === '6m') dateLimit.setMonth(dateLimit.getMonth() - 6);
            else if (range === '1y') dateLimit.setFullYear(dateLimit.getFullYear() - 1);

            whereRange = {
                created_at: { [Op.gte]: dateLimit }
            };
        }


        const totalUsers = await User.count({ where: whereRange });


        const earningsResult = await Panelist.sum('lifetime_earnings', { where: whereRange });
        const totalEarnings = earningsResult || 0;


        const totalAttempts = await SurveyCompletion.count({ where: whereRange });
        const successfulCompletions = await SurveyCompletion.count({
            where: { ...whereRange, status: 'complete' }
        });
        const conversionRate = totalAttempts > 0 ? ((successfulCompletions / totalAttempts) * 100).toFixed(1) : "0.0";


        const topEarners = await Panelist.findAll({
            limit: 10,
            order: [['lifetime_earnings', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['email'],
            }],
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'lifetime_earnings', 'balance', 'status']
        });


        const recentUsers = await User.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: Panelist,
                as: 'panelist',
                attributes: ['first_name', 'last_name']
            }],
            attributes: ['id', 'email', 'created_at']
        });


        const chartDate = new Date();
        chartDate.setDate(chartDate.getDate() - 7);
        const signupStats = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: chartDate }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });


        const allProviders = await SurveyProvider.findAll({ attributes: ['id', 'name'] });
        const providerStats = await Promise.all(allProviders.map(async (provider) => {
            const completions = await SurveyCompletion.findAll({
                include: [{
                    model: Survey,
                    as: 'survey',
                    where: { provider_id: provider.id },
                    attributes: []
                }],
                where: whereRange,
                attributes: [
                    [sequelize.literal('SurveyCompletion.status'), 'status'],
                    [sequelize.fn('COUNT', sequelize.literal('*')), 'count']
                ],
                group: [sequelize.literal('SurveyCompletion.status')],
                raw: true
            });

            const statsMap = completions.reduce((acc, curr) => {
                const status = curr.status;
                const count = parseInt(curr.count || curr['count'] || 0);
                if (status) acc[status] = count;
                return acc;
            }, {});

            const total = Object.values(statsMap).reduce((a, b) => a + b, 0);
            const successful = statsMap['complete'] || 0;

            return {
                id: provider.id,
                name: provider.name,
                total,
                successful,
                successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0",
                breakdown: statsMap
            };
        }));


        res.json({
            success: true,
            data: {
                totalUsers,
                totalEarnings: parseFloat(totalEarnings).toFixed(2),
                conversionRate,
                topEarners,
                recentUsers: recentUsers.map(u => ({
                    id: u.id,
                    email: u.email,
                    created_at: u.created_at,
                    first_name: u.panelist?.first_name || 'Anonymous',
                    last_name: u.panelist?.last_name || '',
                    name: u.panelist ? `${u.panelist.first_name || ''} ${u.panelist.last_name || ''}`.trim() : 'Anonymous'
                })),
                signupStats,
                providerStats
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching stats', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC', status, country, startDate, endDate } = req.query;

        // Map camelCase sortBy to DB snake_case column names
        const sortColumnMap = {
            lastLogin: 'created_at', // last_login not in schema yet, fallback
            createdAt: 'created_at',
            created_at: 'created_at',
            lifetimeEarnings: 'created_at', // panelist col, fallback to user col
        };
        const resolvedSortBy = sortColumnMap[sortBy] || sortBy;
        const offset = (page - 1) * limit;

        const whereClause = {};
        const panelistWhere = {};

        if (status) panelistWhere.status = status;
        if (country) panelistWhere.country_code = country;
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (search) {
            whereClause[Op.or] = [
                { email: { [Op.like]: `%${search}%` } },
                { '$panelist.first_name$': { [Op.like]: `%${search}%` } },
                { '$panelist.last_name$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: [{
                model: Panelist,
                as: 'panelist',
                where: Object.keys(panelistWhere).length > 0 ? panelistWhere : null,
                required: Object.keys(panelistWhere).length > 0,
                attributes: ['first_name', 'last_name', 'status', 'lifetime_earnings', 'completions_count', 'balance', 'country_code']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[resolvedSortBy, order]],
            distinct: true
        });

        const users = rows.map(user => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_login: user.last_login,
            name: user.panelist ? `${user.panelist.first_name || ''} ${user.panelist.last_name || ''}`.trim() : 'N/A',
            status: user.panelist?.status || 'Active',
            lifetime_earnings: parseFloat(user.panelist?.lifetime_earnings || 0),
            balance: parseFloat(user.panelist?.balance || 0),
            completions_count: user.panelist?.completions_count || 0
        }));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: ['id', 'email', 'created_at', 'last_login', 'role', 'email_verified'],
            include: [
                {
                    model: Panelist,
                    as: 'panelist',
                    include: [
                        {
                            model: SurveyCompletion,
                            as: 'completions',
                            limit: 50,
                            order: [['created_at', 'DESC']],
                            include: [{ model: Survey, as: 'survey', attributes: ['title'] }]
                        },
                        {
                            model: PersonaAttribute,
                            as: 'attributes',
                            include: [{
                                model: AttributeDefinition,
                                as: 'definition',
                                attributes: ['key', 'title', 'type']
                            }]
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }


        const panelist = user.panelist || {};
        const activityLog = (panelist.completions || []).map(c => ({
            id: c.id,
            survey_title: c.survey ? c.survey.title : 'External Survey',
            status: c.status,
            payout: parseFloat(c.payout),
            date: c.created_at
        }));

        res.json({
            success: true,
            data: {
                profile: {
                    id: user.id,
                    email: user.email,
                    name: `${panelist.first_name || ''} ${panelist.last_name || ''}`.trim(),
                    status: panelist.status,
                    joined_at: user.created_at,
                    last_login: user.last_login,
                    verified: user.email_verified,
                    role: user.role
                },
                financials: {
                    balance: parseFloat(panelist.balance || 0),
                    lifetime_earnings: parseFloat(panelist.lifetime_earnings || 0),
                    pending_bonus: parseFloat(panelist.pending_bonus || 0)
                },
                stats: {
                    quality_score: panelist.quality_score,
                    total_surveys: panelist.completions_count || 0
                },
                attributes: (panelist.attributes || []).map(attr => ({
                    id: attr.id,
                    label: attr.definition?.title || attr.definition?.key,
                    value: attr.value,
                    type: attr.definition?.type
                })),
                activity_log: activityLog
            }
        });

    } catch (error) {
        console.error('Get User Details Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user details' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const leaders = await Panelist.findAll({
            limit: 50,
            order: [['lifetime_earnings', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['email', 'avatar_url']
            }],
            attributes: ['id', 'first_name', 'last_name', 'lifetime_earnings', 'completions_count', 'quality_score', 'country_code']
        });

        const data = leaders.map((p, index) => ({
            rank: index + 1,
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            email: p.user ? p.user.email : 'Unknown',
            avatar: p.user ? p.user.avatar_url : null,
            earnings: parseFloat(p.lifetime_earnings),
            surveys: p.completions_count,
            score: p.quality_score,
            country: p.country_code
        }));

        res.json({ success: true, data });

    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
    }
};

const getProviders = async (req, res) => {
    try {
        const providers = await SurveyProvider.findAll({
            attributes: ['id', 'name', 'slug', 'is_active', 'updated_at']
        });
        res.json({ success: true, data: providers });
    } catch (error) {
        console.error('Get Providers Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch providers' });
    }
};

const updateProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const provider = await SurveyProvider.findByPk(id);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        await provider.update({ is_active });

        // Force a registry sync to update the cache file immediately without fetching
        await syncRegistry();

        res.json({ success: true, message: `Provider ${provider.name} updated successfully` });
    } catch (error) {
        console.error('Update Provider Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update provider' });
    }
};

const getSurveys = async (req, res) => {
    try {
        const surveys = await getAdminSurveys();
        res.json({
            success: true,
            count: surveys.length,
            data: surveys
        });
    } catch (error) {
        console.error('Get Admin Surveys Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch registry surveys' });
    }
};

const getAdminProfile = async (req, res) => {
    try {
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        res.json({
            success: true,
            data: {
                email: process.env.ADMIN_USERNAME || 'admin@Wanhong.com',
                role: 'owner',
                ...settings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin profile' });
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        const updates = req.body;
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        const newSettings = { ...settings, ...updates };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
        res.json({ success: true, message: 'Profile updated successfully', data: newSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

const getFraudService = async (req, res) => {
    try {
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        const service = settings.fraudService || 'fingerprint';
        res.json({ success: true, data: { service } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch fraud service' });
    }
};

const updateFraudService = async (req, res) => {
    try {
        const { service } = req.body;
        if (!['fingerprint', 'ipqs'].includes(service)) {
            return res.status(400).json({ success: false, message: 'Invalid service. Must be fingerprint or ipqs.' });
        }
        
        let settings = {};
        if (fs.existsSync(SETTINGS_FILE)) {
            settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        }
        settings.fraudService = service;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, message: `Fraud service updated to ${service}`, data: { service } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update fraud service' });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserDetails,
    getLeaderboard,
    getProviders,
    updateProviderStatus,
    getSurveys,
    getAdminProfile,
    updateAdminProfile,
    getFraudService,
    updateFraudService
};
