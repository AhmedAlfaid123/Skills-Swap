const mongo = require("mongoose");
const SwapRequest = require("../models/SwapRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

function successResponse(res, message, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
}

function errorResponse(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        message
    });
}

function isValidObjectId(value) {
    return mongo.Types.ObjectId.isValid(value);
}

function getObjectIdString(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    return value._id ? value._id.toString() : value.toString();
}

function skillTrackId(skill) {
    if (!skill || !skill.trackId) {
        return "";
    }

    if (typeof skill.trackId === "string") {
        return skill.trackId;
    }

    return getObjectIdString(skill.trackId);
}

function extractSkillIds(user, fieldName) {
    return (user?.[fieldName] || [])
        .map((item) => getObjectIdString(item.skillId))
        .filter(Boolean);
}

function extractTrackIds(user) {
    const trackIds = [
        ...(user?.skillsToTeach || []),
        ...(user?.skillsToLearn || [])
    ]
        .map((item) => getObjectIdString(item.trackId))
        .filter(Boolean);

    return Array.from(new Set(trackIds));
}

function computeMatchPercentage(currentUser, candidateUser) {
    const currentTeachSkillIds = extractSkillIds(currentUser, "skillsToTeach");
    const currentLearnSkillIds = extractSkillIds(currentUser, "skillsToLearn");
    const candidateTeachSkillIds = extractSkillIds(candidateUser, "skillsToTeach");
    const candidateLearnSkillIds = extractSkillIds(candidateUser, "skillsToLearn");

    const currentTrackIds = extractTrackIds(currentUser);
    const candidateTrackIds = extractTrackIds(candidateUser);

    const sharedTracks = currentTrackIds.filter((trackId) => candidateTrackIds.includes(trackId)).length;
    const teachToLearnMatches = currentTeachSkillIds.filter((skillId) => candidateLearnSkillIds.includes(skillId)).length;
    const learnToTeachMatches = currentLearnSkillIds.filter((skillId) => candidateTeachSkillIds.includes(skillId)).length;

    const sameTrackScore = sharedTracks > 0 ? 30 : 0;
    const teachScore = currentTeachSkillIds.length > 0
        ? Math.round((teachToLearnMatches / currentTeachSkillIds.length) * 35)
        : 0;
    const learnScore = currentLearnSkillIds.length > 0
        ? Math.round((learnToTeachMatches / currentLearnSkillIds.length) * 35)
        : 0;

    const crossTrackBonus = sharedTracks > 0 && teachToLearnMatches > 0 && learnToTeachMatches > 0 ? 5 : 0;

    return Math.max(0, Math.min(100, sameTrackScore + teachScore + learnScore + crossTrackBonus));
}

function populateSwapRequestQuery(query) {
    return query
        .populate("fromUser", "name avatarUrl bio")
        .populate("toUser", "name avatarUrl bio")
        .populate({
            path: "teachSkillId",
            select: "name trackId",
            populate: { path: "trackId", select: "name description" }
        })
        .populate({
            path: "learnSkillId",
            select: "name trackId",
            populate: { path: "trackId", select: "name description" }
        });
}

async function getMatchingUsers(req, res) {
    try {
        const currentUserId = req.user && req.user._id;

        if (!currentUserId || !isValidObjectId(currentUserId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const currentUser = await User.findById(currentUserId)
            .populate({ path: "skillsToTeach.trackId", select: "name description" })
            .populate({ path: "skillsToTeach.skillId", select: "name trackId", populate: { path: "trackId", select: "name description" } })
            .populate({ path: "skillsToLearn.trackId", select: "name description" })
            .populate({ path: "skillsToLearn.skillId", select: "name trackId", populate: { path: "trackId", select: "name description" } });

        if (!currentUser) {
            return errorResponse(res, "Current user not found.", 404);
        }

        const users = await User.find({ _id: { $ne: currentUserId } })
            .populate({ path: "skillsToTeach.trackId", select: "name description" })
            .populate({ path: "skillsToTeach.skillId", select: "name trackId", populate: { path: "trackId", select: "name description" } })
            .populate({ path: "skillsToLearn.trackId", select: "name description" })
            .populate({ path: "skillsToLearn.skillId", select: "name trackId", populate: { path: "trackId", select: "name description" } });

        const matches = users
            .map((user) => ({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    avatarUrl: user.avatarUrl,
                    skillsToTeach: user.skillsToTeach,
                    skillsToLearn: user.skillsToLearn
                },
                matchPercentage: computeMatchPercentage(currentUser, user)
            }))
            .filter((entry) => entry.matchPercentage > 0)
            .sort((left, right) => right.matchPercentage - left.matchPercentage);

        return successResponse(res, "Matches fetched successfully.", matches);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function sendRequest(req, res) {
    try {
        const fromUser = req.user && req.user._id;
        const { toUser, teachSkillId, learnSkillId } = req.body || {};

        if (!fromUser || !isValidObjectId(fromUser)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        if (!toUser || !teachSkillId || !learnSkillId) {
            return errorResponse(res, "toUser, teachSkillId, and learnSkillId are required.", 400);
        }

        if (!isValidObjectId(toUser) || !isValidObjectId(teachSkillId) || !isValidObjectId(learnSkillId)) {
            return errorResponse(res, "toUser, teachSkillId, and learnSkillId must be valid ids.", 400);
        }

        if (getObjectIdString(fromUser) === getObjectIdString(toUser)) {
            return errorResponse(res, "You cannot send a swap request to yourself.", 400);
        }

        const existingPendingRequest = await SwapRequest.findOne({
            fromUser,
            toUser,
            teachSkillId,
            learnSkillId,
            status: "pending"
        });

        if (existingPendingRequest) {
            return errorResponse(res, "A pending request for this skill pair already exists.", 409);
        }

        const swapRequest = await SwapRequest.create({
            fromUser,
            toUser,
            teachSkillId,
            learnSkillId,
            status: "pending"
        });

        await Notification.create({
            userId: toUser,
            type: "new",
            message: "You have a new swap request"
        });

        const populatedRequest = await populateSwapRequestQuery(SwapRequest.findById(swapRequest._id));

        return successResponse(res, "Swap request created successfully.", populatedRequest, 201);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function getSentRequests(req, res) {
    try {
        const userId = req.user && req.user._id;

        if (!userId || !isValidObjectId(userId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const requests = await populateSwapRequestQuery(
            SwapRequest.find({ fromUser: userId }).sort({ createdAt: -1 })
        );

        return successResponse(res, "Sent requests fetched successfully.", requests);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function getReceivedRequests(req, res) {
    try {
        const userId = req.user && req.user._id;

        if (!userId || !isValidObjectId(userId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const requests = await populateSwapRequestQuery(
            SwapRequest.find({ toUser: userId }).sort({ createdAt: -1 })
        );

        return successResponse(res, "Received requests fetched successfully.", requests);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function acceptRequest(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user && req.user._id;

        if (!isValidObjectId(id)) {
            return errorResponse(res, "Invalid request id.", 400);
        }

        if (!userId || !isValidObjectId(userId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const swapRequest = await SwapRequest.findById(id);

        if (!swapRequest) {
            return errorResponse(res, "Request not found.", 404);
        }

        if (getObjectIdString(swapRequest.toUser) !== getObjectIdString(userId)) {
            return errorResponse(res, "You are not allowed to accept this request.", 403);
        }

        if (swapRequest.status !== "pending") {
            return errorResponse(res, `Request is already ${swapRequest.status}.`, 400);
        }

        swapRequest.status = "accepted";
        await swapRequest.save();

        await Notification.create({
            userId: swapRequest.fromUser,
            type: "accepted",
            message: "Your swap request was accepted"
        });

        const populatedRequest = await populateSwapRequestQuery(SwapRequest.findById(swapRequest._id));

        return successResponse(res, "Swap request accepted successfully.", populatedRequest);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function rejectRequest(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user && req.user._id;

        if (!isValidObjectId(id)) {
            return errorResponse(res, "Invalid request id.", 400);
        }

        if (!userId || !isValidObjectId(userId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const swapRequest = await SwapRequest.findById(id);

        if (!swapRequest) {
            return errorResponse(res, "Request not found.", 404);
        }

        if (getObjectIdString(swapRequest.toUser) !== getObjectIdString(userId)) {
            return errorResponse(res, "You are not allowed to reject this request.", 403);
        }

        if (swapRequest.status !== "pending") {
            return errorResponse(res, `Request is already ${swapRequest.status}.`, 400);
        }

        swapRequest.status = "rejected";
        await swapRequest.save();

        await Notification.create({
            userId: swapRequest.fromUser,
            type: "rejected",
            message: "Your swap request was rejected"
        });

        const populatedRequest = await populateSwapRequestQuery(SwapRequest.findById(swapRequest._id));

        return successResponse(res, "Swap request rejected successfully.", populatedRequest);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function cancelRequest(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user && req.user._id;

        if (!isValidObjectId(id)) {
            return errorResponse(res, "Invalid request id.", 400);
        }

        if (!userId || !isValidObjectId(userId)) {
            return errorResponse(res, "Invalid authenticated user.", 401);
        }

        const swapRequest = await SwapRequest.findById(id);

        if (!swapRequest) {
            return errorResponse(res, "Request not found.", 404);
        }

        if (getObjectIdString(swapRequest.fromUser) !== getObjectIdString(userId)) {
            return errorResponse(res, "Only the sender can cancel this request.", 403);
        }

        if (swapRequest.status !== "pending") {
            return errorResponse(res, `Cannot cancel a request that is already ${swapRequest.status}.`, 400);
        }

        swapRequest.status = "cancelled";
        await swapRequest.save();

        const populatedRequest = await populateSwapRequestQuery(SwapRequest.findById(swapRequest._id));

        return successResponse(res, "Swap request cancelled successfully.", populatedRequest);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

async function getMyRequests(req, res) {
    try {
        const { type } = req.query || {};

        if (type === "sent") {
            return getSentRequests(req, res);
        }

        return getReceivedRequests(req, res);
    } catch (err) {
        return errorResponse(res, err.message || "Something went wrong.");
    }
}

module.exports = {
    getMatchingUsers,
    sendRequest,
    getSentRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getMyRequests
};