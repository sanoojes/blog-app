import { Router } from "express";
import { BlogDb, UserDb, addBlogToDb } from "../models/db.mjs";
import {
  validateBlog,
  validateGetBlog,
  validateUpdateBlog,
} from "../validation/validateBlog.mjs";
import {
  processRawResults,
  processRawUserResults,
  sendJsonErrorRes,
  sendJsonMessage,
  sendJsonRes,
  serverErr,
  verifyToken,
} from "../lib/utils.mjs";
import {
  handleDefaultSearch,
  handleSearchByAuthor,
  handleSearchById,
  handleSearchByTags,
  handleSearchByViews,
} from "../lib/search.mjs";
import { handlePatchBlogById } from "../lib/patch.mjs";
import authenticateJWT from "../lib/authenticateJwt.mjs";

const BlogRouter = Router();

BlogRouter.patch("/blog/update/", authenticateJWT, async (req, res) => {
  const validationResult = await validateUpdateBlog(req.body);

  if (!validationResult.success) {
    return sendJsonErrorRes(res, 400, validationResult.message);
  }

  const { id, ...updateParams } = req.body;

  await handlePatchBlogById(await req.user.username, id, updateParams, res);
});

BlogRouter.post("/blog", authenticateJWT, async (req, res) => {
  const user = await UserDb.findOne({ username: req.user.username });
  if (!user) {
    return sendJsonErrorRes(
      res,
      400,
      `You are not authorised to post blogs. Please signup.`
    );
  }

  try {
    const blog = req.body;
    try {
      if (typeof req.body !== "object") {
        return sendJsonMessage(
          res,
          400,
          "Bad request. Data is not a valid JSON object."
        );
      }
      try {
        const validationError = validateBlog(blog);

        if (validationError) {
          return sendJsonErrorRes(res, 400, validationError);
        }
      } catch (error) {
        if (error.details && error.details[0].message) {
          return sendJsonErrorRes(
            res,
            400,
            `Bad Request: ${error.details[0].message.replace(/['"]+/g, "")}`
          );
        } else {
          return serverErr(error, res);
        }
      }

      const newBlog = await addBlogToDb({
        ...blog,
        author: processRawUserResults(user),
      });
      return sendJsonMessage(res, 200, "Added Blog successfully.", {
        _id: newBlog._id,
        title: blog.title,
      });
    } catch (e) {
      if (e.code === 11000) {
        return sendJsonErrorRes(
          res,
          409,
          "Duplicate blog with same title exists."
        );
      } else {
        return serverErr(e, res);
      }
    }
  } catch (error) {
    return serverErr(error, res);
  }
});

BlogRouter.get("/blog/tags", async (req, res) => {
  async function getAllTags() {
    try {
      const allTags = await BlogDb.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: null, tags: { $addToSet: "$tags" } } },
      ]);

      const uniqueTags = allTags.length > 0 ? allTags[0].tags : [];

      return uniqueTags;
    } catch (error) {}
  }

  try {
    const allTags = await getAllTags();
    res.json(allTags);
  } catch (error) {
    serverErr(error, res);
  }
});

BlogRouter.get("/blog/search", async (req, res) => {
  const blogParams = req.query;

  console.log(`Searched for: ${JSON.stringify(blogParams)}`);

  if (!/\?.+/.test(req.url)) {
    return handleDefaultSearch(res);
  }

  if (Object.keys(req.query).length > 1)
    return sendJsonErrorRes(
      res,
      400,
      "Bad request: search using only one parameter"
    );

  const validationError = validateGetBlog(blogParams);
  if (validationError && validationError.details) {
    return sendJsonErrorRes(res, 400, validationError.details[0].message);
  }

  try {
    if (blogParams.id) {
      return handleSearchById(blogParams.id, res);
    }

    if (blogParams.viewsgt || blogParams.viewslt) {
      return handleSearchByViews(blogParams, res);
    }

    if (blogParams.author) {
      return handleSearchByAuthor(blogParams, res);
    }

    if (blogParams.tags) {
      return handleSearchByTags(blogParams, res);
    }

    return sendJsonErrorRes(res, 400, "Invalid search parameters.");
  } catch (error) {
    return serverErr(error, res);
  }
});

BlogRouter.get("/blog/views/:_id", async (req, res) => {
  const _id = req.params._id;
  const ping = req.query.ping;

  if (_id && _id.length === 24) {
    if (Boolean(ping)) {
      try {
        const updatedBlog = await BlogDb.findOneAndUpdate(
          { _id },
          { $inc: { views: 1 } },
          { new: true }
        );
        return sendJsonMessage(
          res,
          200,
          `Added one view: ${updatedBlog.views}`,
          { result: { ...processRawResults(updatedBlog) } }
        );
      } catch (error) {
        return serverErr(error, res);
      }
    } else {
      try {
        const blog = await BlogDb.findById(_id);
        return sendJsonRes(res, 200, {
          _id: blog._id,
          title: blog.title,
          views: blog.views,
        });
      } catch (error) {
        return serverErr(error, res);
      }
    }
  }
  return sendJsonErrorRes(res, 400, "Bad request: _id length must be 24");
});

BlogRouter.get("/blog/update/", async (req, res) => {
  return sendJsonErrorRes(res, 400, "Bad request. use patch method.");
});

BlogRouter.get("/blog/:_id", async (req, res) => {
  const _id = req.params._id;

  if (_id && _id.length < 24 && _id.length > 24)
    return sendJsonErrorRes(res, 400, "Bad request: _id length must be 24");
  if (_id && _id.length === 24) {
    try {
      const updatedBlogViews = await BlogDb.findOneAndUpdate(
        { _id },
        { $inc: { views: 1 } },
        { new: true }
      ).populateAuthorSafe();
      return sendJsonMessage(
        res,
        200,
        `Blog views: ${updatedBlogViews.views}`,
        {
          result: processRawResults(updatedBlogViews),
        }
      );
    } catch (error) {
      return serverErr(error, res);
    }
  } else {
    return sendJsonErrorRes(res, 400, "Bad request");
  }
});

BlogRouter.get("/blog", async (req, res) => {
  if (!/\?.+/.test(req.url)) {
    return handleDefaultSearch(res);
  }

  if (Object.keys(req.query).length >= 1)
    return sendJsonErrorRes(res, 400, "Bad request.No querys expected");
});

export default BlogRouter;
