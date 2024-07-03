
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!req.headers.authorization || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({
            msg:"No auth token"
        });
    }

    const token = authHeader.split(" ")[1];

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }catch(err) {
        console.log("MIDDLEWARE ERROR", err);
        return res.status(403).json({

        });
    }
    
}

module.exports = {
    authMiddleware
};