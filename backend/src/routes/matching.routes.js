const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    getMatchingUsers,
    sendRequest,
    getSentRequests,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getMyRequests
} = require("../controllers/swapRequest.controller");

router.get("/matching", authMiddleware, getMatchingUsers);
router.get("/matches", authMiddleware, getMatchingUsers);

router.post("/swap-requests", authMiddleware, sendRequest);
router.post("/requests/send", authMiddleware, sendRequest);

router.get("/swap-requests/sent", authMiddleware, getSentRequests);
router.get("/swap-requests/received", authMiddleware, getReceivedRequests);
router.get("/requests", authMiddleware, getMyRequests);

router.patch("/swap-requests/:id/accept", authMiddleware, acceptRequest);
router.patch("/swap-requests/:id/reject", authMiddleware, rejectRequest);
router.patch("/swap-requests/:id/cancel", authMiddleware, cancelRequest);

router.patch("/requests/:id/accept", authMiddleware, acceptRequest);
router.patch("/requests/:id/reject", authMiddleware, rejectRequest);
router.delete("/requests/:id/cancel", authMiddleware, cancelRequest);

module.exports = router;