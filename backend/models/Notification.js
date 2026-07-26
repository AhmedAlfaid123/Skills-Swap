const mongo = require("mongoose");

const notificationSchema = new mongo.Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["new", "accepted", "rejected"],
            required: true
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
    }
);

const Notification = mongo.model("Notification", notificationSchema);
module.exports = Notification;