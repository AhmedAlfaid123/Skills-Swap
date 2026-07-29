const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    getMatchingUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getMyRequests
} = require("../controllers/swapRequest.controller");

router.get("/matching", authMiddleware, getMatchingUsers);
router.get("/matches", authMiddleware, getMatchingUsers);

router.post("/requests/send", authMiddleware, sendRequest);

router.get("/requests", authMiddleware, getMyRequests);

router.patch("/requests/:id/accept", authMiddleware, acceptRequest);
router.patch("/requests/:id/reject", authMiddleware, rejectRequest);
router.delete("/requests/:id/cancel", authMiddleware, cancelRequest);

module.exports = router;