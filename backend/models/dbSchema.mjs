import mongoose, { Schema } from "mongoose";

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userImg: { type: String, required: true },
});

// Blog Schema
export const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  views: { type: Number, default: 0 },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

BlogSchema.query.populateAuthorSafe = function () {
  return this.populate({
    path: "author",
    select: "-password -__v",
  });
};

export const User = mongoose.model("User", UserSchema);
export const Blog = mongoose.model("Blog", BlogSchema);
