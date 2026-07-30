const mongo = require("mongoose");

const skillSchema = new mongo.Schema(
    {
        name: { type: String, required: true, trim: true },
        trackId: { type: mongo.Schema.Types.ObjectId, ref: "Track", required: true },
        description: { type: String, default: "" }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

const Skill = mongo.model("Skill", skillSchema);
module.exports = Skill;
