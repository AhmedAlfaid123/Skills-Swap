const mongo = require("mongoose");

let jsonwebtoken;

try {
    jsonwebtoken = require("jsonwebtoken");
} catch (error) {
    jsonwebtoken = null;
}

function getBearerToken(authorizationHeader) {
    if (!authorizationHeader || typeof authorizationHeader !== "string") {
        return "";
    }

    if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
        return "";
    }

    return authorizationHeader.slice(7).trim();
}

module.exports = function authMiddleware(req, res, next) {
    const authorizationHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken = getBearerToken(authorizationHeader);
    const fallbackUserId = req.headers["x-user-id"] || req.headers["x-user"] || req.headers["x-userid"];

    try {
        if (bearerToken && jsonwebtoken && process.env.JWT_SECRET) {
            const decodedToken = jsonwebtoken.verify(bearerToken, process.env.JWT_SECRET);
            const authenticatedUser = decodedToken.user || decodedToken;
            const userId = authenticatedUser._id || authenticatedUser.id || authenticatedUser.userId || authenticatedUser.sub;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            req.user = {
                ...authenticatedUser,
                _id: userId
            };

            return next();
        }

        const token = bearerToken || fallbackUserId;

        if (token && mongo.Types.ObjectId.isValid(token)) {
            req.user = {
                _id: token
            };

            return next();
        }

        return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};