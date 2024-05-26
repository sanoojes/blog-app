import jwt from "jsonwebtoken";
import { BlogSchema } from "../models/dbSchema.mjs";

export const processRawResultsArray = (result) => {
  const processedResults = result.map((blogPost) => {
    const { _id, title, content, views, author, createdAt } = blogPost;
    return {
      _id: _id.toString(),
      title,
      content,
      views,
      author,
      createdAt,
    };
  });
  return processedResults;
};

export const processRawResults = (result) => {
  const { _id, title, content, views, author, createdAt } = result;
  const processedResults = {
    _id: _id.toString(),
    title,
    content,
    views,
    author: { ...processRawUserResults(author) },
    createdAt,
  };
  return processedResults;
};

export const processRawUserResults = (result) => {
  const { _id, username, email, userImg } = result;
  const processedResults = {
    _id: _id.toString(),
    username,
    email,
    userImg,
  };
  return processedResults;
};

export const sendJsonMessage = (response, status, message, data) => {
  const { ...otherData } = data || {};
  return response.status(status).json({
    status,
    message,
    ...otherData,
  });
};

export const sendJsonRes = (response, status, result, data) => {
  const { ...otherData } = data || {};
  return response.status(status).json({
    status,
    result,
    ...otherData,
  });
};

export const sendJsonErrorRes = (response, status, error, data) => {
  const { ...otherData } = data || {};
  return response.status(status).json({
    status,
    error,
    ...otherData,
  });
};
export const sendRes = (response, status, message) =>
  response.status(status).body({
    status,
    message,
  });

export const serverErr = (error, response) => {
  console.error(error);
  return sendJsonRes(response, 500, "Server Internal error.");
};

export const generateAccessToken = async (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" } // Access token expires in 1 day
  );
};

export const generateRefreshToken = async (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: "30d" } // Refresh token expires in 30 days
  );
};

export const verifyToken = async (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error("Invalid token");
  }
};
