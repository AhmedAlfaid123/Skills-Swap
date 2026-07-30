const mongo = require("mongoose");

const swapRequestSchema = new mongo.Schema(
    {
        fromUser: { type: mongo.Schema.Types.ObjectId, ref: "User", required: true },
        toUser: { type: mongo.Schema.Types.ObjectId, ref: "User", required: true },
        teachSkillId: { type: mongo.Schema.Types.ObjectId, ref: "Skill", required: true },
        learnSkillId: { type: mongo.Schema.Types.ObjectId, ref: "Skill", required: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

const SwapRequest = mongo.model("SwapRequest", swapRequestSchema);
module.exports = SwapRequest;
