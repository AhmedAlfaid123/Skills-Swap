const User = require("../models/User");
const Skill = require("../models/Skill");

const show = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).select('-password')
            .populate({ path: 'skillsToTeach.skillId', select: 'name' })
            .populate({ path: 'skillsToLearn.skillId', select: 'name' });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                skillsToTeach: user.skillsToTeach,
                skillsToLearn: user.skillsToLearn
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, bio, avatarUrl } = req.body;
        const userId = req.user?.id;

        const user = await User.findByIdAndUpdate(userId, { name, bio, avatarUrl }, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                skillsToTeach: user.skillsToTeach,
                skillsToLearn: user.skillsToLearn
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const updateSkills = async (req, res) => {
    try {
        const { skillsToTeach, skillsToLearn } = req.body;
        const userId = req.user?.id;

        if (!skillsToTeach && !skillsToLearn) {
            return res.status(400).json({
                success: false,
                message: "Skills must be entered"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const teachNames = [];
        if (Array.isArray(skillsToTeach)) {
            for (const item of skillsToTeach) {
                if (typeof item === 'string' && item.trim()) {
                    teachNames.push(item.trim());
                }
            }
        }

        const learnNames = [];
        if (Array.isArray(skillsToLearn)) {
            for (const item of skillsToLearn) {
                if (typeof item === 'string' && item.trim()) {
                    learnNames.push(item.trim());
                }
            }
        }

        const allSkillNames = [];
        for (const name of teachNames) {
            if (!allSkillNames.includes(name)) {
                allSkillNames.push(name);
            }
        }
        for (const name of learnNames) {
            if (!allSkillNames.includes(name)) {
                allSkillNames.push(name);
            }
        }

        const getSkills = await Skill.find({ name: { $in: allSkillNames } }).select('_id trackId name');
        const skillsByName = {};
        for (const skill of getSkills) {
            skillsByName[skill.name] = skill;
        }

        const buildRefs = (names) => {
            const refs = [];
            for (const name of names) {
                const skill = skillsByName[name];
                if (skill) {
                    refs.push({
                        trackId: skill.trackId,
                        skillId: skill._id
                    });
                }
            }
            return refs;
        };

        if (skillsToTeach) {
            user.skillsToTeach = buildRefs(teachNames);
        }
        if (skillsToLearn) {
            user.skillsToLearn = buildRefs(learnNames);
        }

        await user.save();
        
        const userU = await User.findById(userId).select('-password')
            .populate({ path: 'skillsToTeach.skillId', select: 'name' })
            .populate({ path: 'skillsToLearn.skillId', select: 'name' });
        return res.status(200).json({
            success: true,
            data: {
                id: userU._id,
                name: userU.name,
                email: userU.email,
                bio: userU.bio,
                avatarUrl: userU.avatarUrl,
                skillsToTeach: userU.skillsToTeach,
                skillsToLearn: userU.skillsToLearn
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { show, updateSkills, updateUser };