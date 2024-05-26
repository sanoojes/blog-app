import { Router } from "express";
import {
  processRawUserResults,
  sendJsonErrorRes,
  sendJsonMessage,
  sendJsonRes,
} from "../lib/utils.mjs";
import { UserDb, addUserToDb } from "../models/db.mjs";
import {
  validateLoginData,
  validateSignupUserData,
} from "../validation/validateUser.mjs";
import { checkHashedPassword, hashPassword } from "../lib/bcryptPassword.mjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../lib/utils.mjs";

const authRouter = Router();

const refreshTokenHeaderKey = process.env.REFRESH_TOKEN_HEADER_KEY;
const accessTokenHeaderKey = process.env.ACCESS_TOKEN_HEADER_KEY;

// Route to get authentication endpoints
authRouter.get("/auth", (req, res) => {
  return sendJsonRes(res, 200, {
    login: `${req.baseUrl}/login`,
    signup: `${req.baseUrl}/signup`,
  });
});

authRouter.get("/auth/login", (req, res) => {
  return sendJsonRes(
    res,
    200,
    "Please send a POST request with your username and password to this endpoint."
  );
});

authRouter.get("/auth/signup", (req, res) => {
  return sendJsonRes(
    res,
    200,
    "User creation requires a POST request with user information like username, password, etc."
  );
});

// Route to handle user login
authRouter.post("/auth/login", async (req, res) => {
  try {
    const loginParams = req.body;
    const validationResult = await validateLoginData(loginParams);

    if (!validationResult.success) {
      return sendJsonErrorRes(res, 400, validationResult.message);
    }

    const { username, email, password } = loginParams;
    const query = username ? { username } : { email };

    const user = await UserDb.findOne(query);
    if (!user) {
      return sendJsonErrorRes(res, 404, `User not found.`);
    }

    const passwordFromDb = user.password;
    const isPasswordValid = await checkHashedPassword(password, passwordFromDb);
    if (!isPasswordValid) {
      return sendJsonErrorRes(res, 401, `Password is incorrect.`);
    }

    const accessToken = await generateAccessToken({
      username: user.username,
    });
    const refreshToken = await generateRefreshToken(user);

    res.cookie(refreshTokenHeaderKey, refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie(accessTokenHeaderKey, accessToken, {
      httpOnly: true,
      secure: true,
    });

    return sendJsonMessage(res, 200, "Login successful");
  } catch (error) {
    return sendJsonErrorRes(res, 500, `Server error.`);
  }
});

// Route to handle user signup
authRouter.post("/auth/signup", async (req, res) => {
  try {
    const signUpParams = req.body;
    const validationResult = await validateSignupUserData(signUpParams);

    if (!validationResult.success) {
      return sendJsonErrorRes(res, 400, validationResult.message);
    }

    const { username, email, password, userImg } = signUpParams;
    const hashedPassword = await hashPassword(password);

    const newUser = await addUserToDb({
      username,
      email,
      password: hashedPassword,
      userImg,
    });

    return sendJsonRes(res, 200, processRawUserResults(newUser), {
      message: "New user created successfully. Please login.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendJsonErrorRes(
        res,
        409,
        "User with the provided email/username already exists."
      );
    }
    return sendJsonErrorRes(res, 500, `Server error: ${error.message}`);
  }
});

// Route to handle token refresh
authRouter.post("/auth/refresh-token", async (req, res) => {
  try {
    const refreshToken = await req.cookies[refreshTokenHeaderKey];

    if (!refreshToken) {
      return sendJsonErrorRes(res, 403, "Refresh Token is required");
    }

    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY
    );

    const accessToken = await generateAccessToken(decoded);

    res.cookie(accessTokenHeaderKey, accessToken, {
      httpOnly: true,
      secure: true,
    });

    return sendJsonMessage(res, 200, "Refreshed access token.");
  } catch (error) {
    return sendJsonErrorRes(res, 403, "Invalid Refresh Token");
  }
});

export default authRouter;
