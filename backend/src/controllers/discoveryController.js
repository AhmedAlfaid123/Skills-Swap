const User = require('../models/User');
const Skill = require('../models/Skill');
const mongo = require('mongoose');



async function toListItem(userDoc) {
  const teachSkillIds = userDoc.skillsToTeach.map((s) => s.skillId);
  const learnSkillIds = userDoc.skillsToLearn.map((s) => s.skillId);
 
  const [teachSkills, learnSkills] = await Promise.all([
    Skill.find({ _id: { $in: teachSkillIds } }).select('name'),
    Skill.find({ _id: { $in: learnSkillIds } }).select('name'),
  ]);
 
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    avatarUrl: userDoc.avatarUrl || '',
    skillsToTeach: teachSkills.map((s) => s.name),
    skillsToLearn: learnSkills.map((s) => s.name),
  };
}
 

//Pagination
async function paginatedListResponse(res, filter, page, limit) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  const data = await Promise.all(users.map(toListItem));
  return res.status(200).json({ success: true, data: { users: data, total, page, limit } });
}


//api 1 get all users 
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return await paginatedListResponse(res, {}, page, limit);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
};

//api2 skill
exports.searchBySkill = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      return res.status(400).json({ success: false, message: 'skill query param is required', code: 'MISSING_SKILL' });
    }
 
    const matchingSkills = await Skill.find({ name: { $regex: skill, $options: 'i' } }).select('_id');
    const skillIds = matchingSkills.map((s) => s._id);
 
    const filter = {
      $or: [
        { 'skillsToTeach.skillId': { $in: skillIds } },
        { 'skillsToLearn.skillId': { $in: skillIds } },
      ],
    };
 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return await paginatedListResponse(res, filter, page, limit);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
};

//api 3 api
exports.filterByTrack = async (req, res) => {
  try {
    const { trackId } = req.query;
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId query param is required', code: 'MISSING_TRACK' });
    }
 
    const trackSkills = await Skill.find({ trackId }).select('_id');
    const skillIds = trackSkills.map((s) => s._id);
 
    const filter = {
      $or: [
        { 'skillsToTeach.skillId': { $in: skillIds } },
        { 'skillsToLearn.skillId': { $in: skillIds } },
      ],
    };
 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    return await paginatedListResponse(res, filter, page, limit);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongo.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID', code: 'INVALID_ID' });
    }

    const user = await User.findById(userId).select('-password')
      .populate('skillsToTeach.trackId', 'name')
      .populate('skillsToTeach.skillId', 'name')
      .populate('skillsToLearn.trackId', 'name')
      .populate('skillsToLearn.skillId', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    const skillsToTeach = (user.skillsToTeach || []).map((s) => ({
      trackId: s.trackId?._id?.toString() || s.trackId?.toString() || '',
      trackName: s.trackId?.name || '',
      skillId: s.skillId?._id?.toString() || s.skillId?.toString() || '',
      skillName: s.skillId?.name || ''
    }));

    const skillsToLearn = (user.skillsToLearn || []).map((s) => ({
      trackId: s.trackId?._id?.toString() || s.trackId?.toString() || '',
      trackName: s.trackId?.name || '',
      skillId: s.skillId?._id?.toString() || s.skillId?.toString() || '',
      skillName: s.skillId?.name || ''
    }));

    return res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        skillsToTeach,
        skillsToLearn,
        createdAt: user.createdAt
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
};


