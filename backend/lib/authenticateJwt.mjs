import { sendJsonErrorRes, verifyToken } from "./utils.mjs";

const tokenHeaderKey = process.env.ACCESS_TOKEN_HEADER_KEY;

// Middleware to authenticate JWT on protected routes
export const authenticateJWT = async (req, res, next) => {
  try {
    const token = await req.cookies[tokenHeaderKey];

    if (!token) {
      return sendJsonErrorRes(
        res,
        403,
        "A token is required for authentication"
      );
    }

    const decoded = await verifyToken(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;
    return next();
  } catch (error) {
    return sendJsonErrorRes(res, 401, "Invalid Token");
  }
};
export default authenticateJWT;
