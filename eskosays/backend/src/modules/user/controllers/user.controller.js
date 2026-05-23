const { User, Panelist, PersonaAttribute, AttributeDefinition, SurveyCompletion, Survey } = require('../../../models');
const surveyService = require('../../survey/services/survey.service');

/**
 * Update user avatar
 */
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        await User.update(
            { avatar_url: avatarUrl },
            { where: { id: req.user.id } }
        );

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: {
                avatarUrl: avatarUrl
            }
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update avatar'
        });
    }
};

/**
 * Get user profile info
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'avatar_url']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Get consolidated user profile summary (identity + persona)
 */
/**
 * Get consolidated user profile summary (identity + persona)
 */
/**
 * Get consolidated user profile summary (identity + persona)
 */
const getProfileSummary = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'avatar_url', 'role'],
            include: [
                {
                    model: Panelist,
                    as: 'panelist',
                    attributes: ['id', 'first_name', 'last_name', 'status', 'quality_score', 'balance', 'lifetime_earnings', 'bio', 'city', 'zip_code', 'timezone', 'country'],
                    include: [
                        {
                            model: PersonaAttribute,
                            as: 'attributes',
                            include: [
                                {
                                    model: AttributeDefinition,
                                    as: 'definition',
                                    attributes: ['key', 'title', 'type', 'options']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Flatten attributes for easier frontend consumption
        const profile = {
            id: user.id,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role,
            name: user.panelist ? `${user.panelist.first_name || ''} ${user.panelist.last_name || ''}`.trim() : null,
            panelist: user.panelist ? {
                id: user.panelist.id,
                first_name: user.panelist.first_name,
                last_name: user.panelist.last_name,
                status: user.panelist.status,
                quality_score: user.panelist.quality_score,
                balance: user.panelist.balance,
                pending_bonus: user.panelist.pending_bonus,
                completions_count: user.panelist.completions_count,
                lifetime_earnings: user.panelist.lifetime_earnings,
                bio: user.panelist.bio,
                city: user.panelist.city,
                zip_code: user.panelist.zip_code,
                timezone: user.panelist.timezone,
                country: user.panelist.country,
                responses: user.panelist.attributes.reduce((acc, attr) => {
                    acc[attr.definition.key] = {
                        value: attr.value,
                        title: attr.definition.title,
                        type: attr.definition.type
                    };
                    return acc;
                }, {})
            } : null
        };

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile summary'
        });
    }
};

/**
 * Update user profile details (Reverted to basic info only)
 */
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, bio, city, zip_code, timezone, country } = req.body;
        const userId = req.user.id;

        // Update Panelist model
        const updateData = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (bio !== undefined) updateData.bio = bio;
        if (city !== undefined) updateData.city = city;
        if (zip_code !== undefined) updateData.zip_code = zip_code;
        if (timezone !== undefined) updateData.timezone = timezone;
        if (country !== undefined) updateData.country = country;

        if (Object.keys(updateData).length > 0) {
            await Panelist.update(updateData, { where: { user_id: userId } });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Get user wallet data
 */
const getWallet = async (req, res) => {
    try {
        const panelist = await Panelist.findOne({
            where: { user_id: req.user.id }
        });

        if (!panelist) {
            return res.status(404).json({
                success: false,
                message: 'Panelist profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                balance: parseFloat(panelist.balance || 0),
                pending_bonus: parseFloat(panelist.pending_bonus || 0),
                completions_count: panelist.completions_count || 0,
                lifetime_earnings: parseFloat(panelist.lifetime_earnings || 0),
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet'
        });
    }
};

/**
 * Get stats for home dashboard
 */
const getHomeStats = async (req, res) => {
    try {
        const panelist = await Panelist.findOne({
            where: { user_id: req.user.id }
        });

        if (!panelist) {
            return res.status(404).json({
                success: false,
                message: 'Panelist profile not found'
            });
        }

        // 1. Get completions count
        const completionsCount = await SurveyCompletion.count({
            where: { panelist_id: panelist.id, status: 'complete' }
        });

        // 2. Get recent activities
        const recentCompletions = await SurveyCompletion.findAll({
            where: { panelist_id: panelist.id },
            include: [{ model: Survey, as: 'survey', attributes: ['title'] }],
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        // 3. Get available surveys count (Active Missions)
        // We'll use the survey service's in-memory registry size or count from DB
        const surveys = await surveyService.getAllSurveys(panelist.id);
        const activeMissionsCount = surveys.length;

        res.status(200).json({
            success: true,
            data: {
                balance: parseFloat(panelist.balance || 0),
                pending_bonus: parseFloat(panelist.pending_bonus || 0),
                completions_to_unlock: Math.max(0, 5 - (panelist.completions_count || 0)),
                lifetime_earnings: parseFloat(panelist.lifetime_earnings || 0),
                completions_count: completionsCount,
                active_missions_count: activeMissionsCount,
                quality_score: panelist.quality_score,
                recent_activities: recentCompletions.map(c => ({
                    title: c.survey ? c.survey.title : 'Market Research',
                    status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
                    reward: `+$${parseFloat(c.payout).toFixed(2)}`,
                    time: c.created_at
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching home stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch home stats'
        });
    }
};

module.exports = {
    updateAvatar,
    getProfile,
    getProfileSummary,
    getWallet,
    getHomeStats,
    updateProfile
};
