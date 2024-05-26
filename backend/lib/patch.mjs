import { BlogDb, UserDb } from "../models/db.mjs";
import {
  processRawResults,
  sendJsonErrorRes,
  sendJsonRes,
  serverErr,
} from "./utils.mjs";

export async function handlePatchBlogById(username, _id, updateData, res) {
  try {
    const user = await UserDb.findOne({ username });
    const blog = await BlogDb.findById(_id);

    if (!blog) {
      return sendJsonErrorRes(res, 404, `Blog with ID: ${_id} not found.`);
    }

    // Check if the logged-in user is the author
    if (blog.author._id.toString() !== user._id.toString()) {
      return sendJsonErrorRes(
        res,
        403,
        "You don't have permission to modify this blog."
      );
    }

    const updatedBlog = await BlogDb.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).populateAuthorSafe();

    if (!updatedBlog) {
      return sendJsonErrorRes(res, 500, "Failed to update the blog.");
    }

    return sendJsonRes(res, 200, processRawResults(updatedBlog), {
      message: `Updated Blog success.`,
    });
  } catch (error) {
    return serverErr(error, res);
  }
}
