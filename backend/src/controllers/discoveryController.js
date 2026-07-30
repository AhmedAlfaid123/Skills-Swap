const User = require('../models/User');
const Skill = require('../models/Skill');
const Track = require('../models/Track');



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

////////   هناديها كده بشكل مبدأي تقريبي 
const profileController = require('./profileController');

exports.getUserById = async (req, res) => {
  const profile = await profileController.getProfileByIdInternal(req.params.userId);
  return res.status(200).json({
    success: true,
    data: profile,
  });
};


