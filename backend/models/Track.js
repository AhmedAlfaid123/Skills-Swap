const mongo = require("mongoose");

const trackSchema = new mongo.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

const Track = mongo.model("Track", trackSchema);
module.exports = Track;