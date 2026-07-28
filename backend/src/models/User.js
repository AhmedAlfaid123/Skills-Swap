const mongo = require('mongoose');

const skillRefSchema = new mongo.Schema(
    {
        trackId: { type: mongo.Schema.Types.ObjectId, ref: "Track", required: true },
        skillId: { type: mongo.Schema.Types.ObjectId, ref: "Skill", required: true }
    },
    { _id: false }
);

const userSchema = new mongo.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        bio: { type: String, default: "" },
        avatarUrl: { type: String, default: "" },
        skillsToTeach: [skillRefSchema],
        skillsToLearn: [skillRefSchema]
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }

);

const User = mongo.model('User', userSchema);
module.exports = User;