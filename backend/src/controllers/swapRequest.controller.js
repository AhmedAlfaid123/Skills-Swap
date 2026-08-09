const mongoose = require("mongoose");
const SwapRequest = require("../models/SwapRequest");

const STATUS = {
    pending: "pending",
    accepted: "accepted",
    rejected: "rejected",
    cancelled: "cancelled"
};

function getObjectId(value) {
    return new mongoose.Types.ObjectId(String(value));
}

function toStringId(value) {
    if (value == null) {
        return "";
    }

    return typeof value === "string" ? value : String(value);
}

function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

function badRequest(res, message) {
    return res.status(400).json({ message });
}

function forbidden(res, message) {
    return res.status(403).json({ message });
}

function notFound(res, message) {
    return res.status(404).json({ message });
}

function conflict(res, message) {
    return res.status(409).json({ message });
}

function publicUser(userDoc) {
    if (!userDoc) {
        return null;
    }

    return {
        _id: toStringId(userDoc._id),
        name: userDoc.name,
        email: userDoc.email,
        bio: userDoc.bio || "",
        avatarUrl: userDoc.avatarUrl || "",
        skillsToTeach: userDoc.skillsToTeach || [],
        skillsToLearn: userDoc.skillsToLearn || []
    };
}

function publicTrack(trackDoc) {
    if (!trackDoc) {
        return null;
    }

    return {
        _id: toStringId(trackDoc._id),
        name: trackDoc.name,
        description: trackDoc.description || ""
    };
}

function publicSkill(skillDoc, trackDoc) {
    if (!skillDoc) {
        return null;
    }

    return {
        _id: toStringId(skillDoc._id),
        name: skillDoc.name,
        trackId: publicTrack(trackDoc)
    };
}

function publicRequest(requestDoc, usersById, skillsById, tracksById) {
    const fromUser = usersById.get(toStringId(requestDoc.fromUser));
    const toUser = usersById.get(toStringId(requestDoc.toUser));
    const teachSkillDoc = skillsById.get(toStringId(requestDoc.teachSkillId));
    const learnSkillDoc = skillsById.get(toStringId(requestDoc.learnSkillId));
    const teachTrackDoc = teachSkillDoc ? tracksById.get(toStringId(teachSkillDoc.trackId)) : null;
    const learnTrackDoc = learnSkillDoc ? tracksById.get(toStringId(learnSkillDoc.trackId)) : null;

    return {
        _id: toStringId(requestDoc._id),
        fromUser: publicUser(fromUser),
        toUser: publicUser(toUser),
        teachSkillId: publicSkill(teachSkillDoc, teachTrackDoc),
        learnSkillId: publicSkill(learnSkillDoc, learnTrackDoc),
        status: requestDoc.status,
        createdAt: requestDoc.createdAt,
        updatedAt: requestDoc.updatedAt
    };
}

async function loadReferenceMaps(userIds, skillIds) {
    const users = await mongoose.connection.collection("users").find(
        { _id: { $in: [...userIds].map(getObjectId) } },
        { projection: { password: 0 } }
    ).toArray();

    const skills = await mongoose.connection.collection("skills").find(
        { _id: { $in: [...skillIds].map(getObjectId) } }
    ).toArray();

    const trackIds = new Set(skills.map((skill) => toStringId(skill.trackId)).filter(Boolean));
    const tracks = await mongoose.connection.collection("tracks").find(
        { _id: { $in: [...trackIds].map(getObjectId) } }
    ).toArray();

    return {
        usersById: new Map(users.map((user) => [toStringId(user._id), user])),
        skillsById: new Map(skills.map((skill) => [toStringId(skill._id), skill])),
        tracksById: new Map(tracks.map((track) => [toStringId(track._id), track]))
    };
}

function getSkillIdSet(skillRefs) {
    return new Set((skillRefs || []).map((ref) => toStringId(ref.skillId)).filter(Boolean));
}

function buildMatchedSkillDocs(skillRefs, allowedSkillIds, skillsById, tracksById) {
    return skillRefs
        .filter((ref) => allowedSkillIds.has(toStringId(ref.skillId)))
        .map((ref) => {
            const skillDoc = skillsById.get(toStringId(ref.skillId));
            if (!skillDoc) {
                return null;
            }

            const trackDoc = tracksById.get(toStringId(skillDoc.trackId));
            return publicSkill(skillDoc, trackDoc);
        })
        .filter(Boolean);
}

async function getCurrentUser(req, res) {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
        badRequest(res, "Invalid user context.");
        return null;
    }

    const currentUser = await mongoose.connection.collection("users").findOne({ _id: getObjectId(userId) }, { projection: { password: 0 } });

    if (!currentUser) {
        notFound(res, "User not found.");
        return null;
    }

    return currentUser;
}

async function getMatchingUsers(req, res) {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) {
        return;
    }

    const currentTeachIds = getSkillIdSet(currentUser.skillsToTeach);
    const currentLearnIds = getSkillIdSet(currentUser.skillsToLearn);

    if (currentTeachIds.size === 0 || currentLearnIds.size === 0) {
        return res.json([]);
    }

    const candidateUsers = await mongoose.connection.collection("users").find(
        { _id: { $ne: getObjectId(currentUser._id) } },
        { projection: { password: 0 } }
    ).toArray();

    const candidateUserIds = candidateUsers.map((user) => toStringId(user._id));
    const currentSkillIds = new Set([...currentTeachIds, ...currentLearnIds]);
    const candidateSkillIds = new Set();

    candidateUsers.forEach((user) => {
        (user.skillsToTeach || []).forEach((ref) => candidateSkillIds.add(toStringId(ref.skillId)));
        (user.skillsToLearn || []).forEach((ref) => candidateSkillIds.add(toStringId(ref.skillId)));
    });

    const maps = await loadReferenceMaps(
        new Set([toStringId(currentUser._id), ...candidateUserIds]),
        new Set([...currentSkillIds, ...candidateSkillIds])
    );

    const matches = candidateUsers
        .map((candidateUser) => {
            const candidateTeachIds = getSkillIdSet(candidateUser.skillsToTeach);
            const candidateLearnIds = getSkillIdSet(candidateUser.skillsToLearn);

            const currentUserTeachSkills = buildMatchedSkillDocs(
                currentUser.skillsToTeach || [],
                candidateLearnIds,
                maps.skillsById,
                maps.tracksById
            );

            const currentUserLearnSkills = buildMatchedSkillDocs(
                currentUser.skillsToLearn || [],
                candidateTeachIds,
                maps.skillsById,
                maps.tracksById
            );

            if (currentUserTeachSkills.length === 0 || currentUserLearnSkills.length === 0) {
                return null;
            }

            const representativeSkill = currentUserLearnSkills[0] || currentUserTeachSkills[0];
            const representativeTrack = representativeSkill ? maps.tracksById.get(toStringId(representativeSkill.trackId?._id || representativeSkill.trackId)) : null;
            const coverage = currentUser.skillsToTeach.length + currentUser.skillsToLearn.length;
            const matchPercentage = coverage === 0 ? 0 : Math.min(100, Math.round(((currentUserTeachSkills.length + currentUserLearnSkills.length) / coverage) * 100));

            return {
                user: publicUser(candidateUser),
                track: publicTrack(representativeTrack),
                skillsToTeach: currentUserLearnSkills,
                skillsToLearn: currentUserTeachSkills,
                matchPercentage
            };
        })
        .filter(Boolean)
        .sort((left, right) => right.matchPercentage - left.matchPercentage || left.user.name.localeCompare(right.user.name));

    return res.json(matches);
}

async function verifyRequestPair(fromUser, toUser, teachSkillId, learnSkillId) {
    const [currentUser, targetUser] = await Promise.all([
        mongoose.connection.collection("users").findOne({ _id: getObjectId(fromUser) }),
        mongoose.connection.collection("users").findOne({ _id: getObjectId(toUser) })
    ]);

    if (!currentUser || !targetUser) {
        return null;
    }

    const currentTeachIds = getSkillIdSet(currentUser.skillsToTeach);
    const currentLearnIds = getSkillIdSet(currentUser.skillsToLearn);
    const targetTeachIds = getSkillIdSet(targetUser.skillsToTeach);
    const targetLearnIds = getSkillIdSet(targetUser.skillsToLearn);

    return currentTeachIds.has(teachSkillId) && currentLearnIds.has(learnSkillId) && targetTeachIds.has(learnSkillId) && targetLearnIds.has(teachSkillId);
}

async function sendRequest(req, res) {
    const currentUserId = toStringId(req.user?._id);
    const { toUser, teachSkillId, learnSkillId } = req.body || {};

    if (!isValidObjectId(currentUserId) || !isValidObjectId(toUser) || !isValidObjectId(teachSkillId) || !isValidObjectId(learnSkillId)) {
        return badRequest(res, "All request identifiers must be valid.");
    }

    if (toStringId(toUser) === currentUserId) {
        return badRequest(res, "You cannot send a request to yourself.");
    }

    const isValidPair = await verifyRequestPair(currentUserId, toUser, toStringId(teachSkillId), toStringId(learnSkillId));
    if (!isValidPair) {
        return badRequest(res, "The selected skills do not form a valid swap pair.");
    }

    const existingRequest = await SwapRequest.findOne({
        fromUser: getObjectId(currentUserId),
        toUser: getObjectId(toUser),
        teachSkillId: getObjectId(teachSkillId),
        learnSkillId: getObjectId(learnSkillId),
        status: STATUS.pending
    });

    if (existingRequest) {
        return conflict(res, "A pending request for this skill pair already exists.");
    }

    let request;

    try {
        request = await SwapRequest.create({
            fromUser: getObjectId(currentUserId),
            toUser: getObjectId(toUser),
            teachSkillId: getObjectId(teachSkillId),
            learnSkillId: getObjectId(learnSkillId),
            status: STATUS.pending
        });
    } catch (error) {
        if (error?.code === 11000) {
            return conflict(res, "A pending request for this skill pair already exists.");
        }

        throw error;
    }

    const maps = await loadReferenceMaps(
        new Set([currentUserId, toStringId(toUser)]),
        new Set([toStringId(teachSkillId), toStringId(learnSkillId)])
    );

    return res.status(201).json(publicRequest(request.toObject(), maps.usersById, maps.skillsById, maps.tracksById));
}

async function getRequestsByDirection(req, res, direction) {
    const currentUserId = req.user?._id;

    if (!isValidObjectId(currentUserId)) {
        return badRequest(res, "Invalid user context.");
    }

    const filter = direction === "received"
        ? { toUser: getObjectId(currentUserId) }
        : { fromUser: getObjectId(currentUserId) };

    const requests = await SwapRequest.find(filter).sort({ createdAt: -1 }).lean();

    if (requests.length === 0) {
        return res.json([]);
    }

    const relatedUserIds = new Set([toStringId(currentUserId)]);
    const relatedSkillIds = new Set();

    requests.forEach((request) => {
        relatedUserIds.add(toStringId(request.fromUser));
        relatedUserIds.add(toStringId(request.toUser));
        relatedSkillIds.add(toStringId(request.teachSkillId));
        relatedSkillIds.add(toStringId(request.learnSkillId));
    });

    const maps = await loadReferenceMaps(relatedUserIds, relatedSkillIds);

    return res.json(requests.map((request) => publicRequest(request, maps.usersById, maps.skillsById, maps.tracksById)));
}

async function getMyRequests(req, res) {
    const type = String(req.query?.type || "").toLowerCase();

    if (type === "received") {
        return getRequestsByDirection(req, res, "received");
    }

    return getRequestsByDirection(req, res, "sent");
}

async function getSentRequests(req, res) {
    return getRequestsByDirection(req, res, "sent");
}

async function getReceivedRequests(req, res) {
    return getRequestsByDirection(req, res, "received");
}

async function updateRequestStatus(req, res, nextStatus) {
    const currentUserId = toStringId(req.user?._id);
    const requestId = req.params.id;

    if (!isValidObjectId(currentUserId) || !isValidObjectId(requestId)) {
        return badRequest(res, "Invalid request identifier.");
    }

    const request = await SwapRequest.findById(requestId);

    if (!request) {
        return notFound(res, "Swap request not found.");
    }

    const isSentByCurrentUser = toStringId(request.fromUser) === currentUserId;
    const isReceivedByCurrentUser = toStringId(request.toUser) === currentUserId;

    if (nextStatus === STATUS.cancelled && !isSentByCurrentUser) {
        return forbidden(res, "Only the sender can cancel this request.");
    }

    if ((nextStatus === STATUS.accepted || nextStatus === STATUS.rejected) && !isReceivedByCurrentUser) {
        return forbidden(res, "Only the recipient can update this request.");
    }

    if (request.status !== STATUS.pending) {
        return conflict(res, `This request has already been ${request.status}.`);
    }

    if (nextStatus === STATUS.accepted) {
        const isValidPair = await verifyRequestPair(
            toStringId(request.fromUser),
            toStringId(request.toUser),
            toStringId(request.teachSkillId),
            toStringId(request.learnSkillId)
        );

        if (!isValidPair) {
            return conflict(res, "This swap is no longer valid because one or both users changed their skills.");
        }
    }

    request.status = nextStatus;
    await request.save();

    const relatedUserIds = new Set([toStringId(request.fromUser), toStringId(request.toUser)]);
    const relatedSkillIds = new Set([toStringId(request.teachSkillId), toStringId(request.learnSkillId)]);
    const maps = await loadReferenceMaps(relatedUserIds, relatedSkillIds);

    return res.json(publicRequest(request.toObject(), maps.usersById, maps.skillsById, maps.tracksById));
}

async function acceptRequest(req, res) {
    return updateRequestStatus(req, res, STATUS.accepted);
}

async function rejectRequest(req, res) {
    return updateRequestStatus(req, res, STATUS.rejected);
}

async function cancelRequest(req, res) {
    return updateRequestStatus(req, res, STATUS.cancelled);
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
