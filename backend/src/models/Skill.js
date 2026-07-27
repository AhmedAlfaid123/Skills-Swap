const mongo = require("mongoose");

const trackSchema = new mongo.Schema(
    {
        trackId: { type: Schema.Types.ObjectId, ref: "Track", required: true },
        name: { type: String, required: true, trim: true }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

const Skill = mongo.model("Skill", skillSchema);
module.exports = Skill;