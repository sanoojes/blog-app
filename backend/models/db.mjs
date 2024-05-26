import mongoose from "mongoose";
import { Blog, BlogSchema, User, UserSchema } from "./dbSchema.mjs";

const MONGO_URI = "mongodb://localhost:27017/" || process.env.MONGO_URI;

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to mongodb.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const UserDb = User;
export const BlogDb = Blog;

export const addBlogToDb = async ({ title, content, author, views, tags }) => {
  try {
    const newBlog = await BlogDb.create({
      title,
      content,
      author,
      views,
      tags,
    });
    return newBlog._id;
  } catch (error) {
    if (error.code === 11000) {
      throw { code: 11000, message: "Duplicate blog exists." };
    }
    console.error("Error adding blog to Db:", error);
    throw error;
  }
};

export const addUserToDb = async ({ username, email, password, userImg }) => {
  try {
    return await UserDb.create({ username, email, password, userImg });
  } catch (error) {
    if (error.code === 11000) {
      throw {
        code: 11000,
        message: "Duplicate user with same username or email exists.",
      };
    }
    console.error("Error adding user to Db:", error);
    throw error;
  }
};
