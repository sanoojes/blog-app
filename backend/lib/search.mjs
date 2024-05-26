import { BlogDb, UserDb } from "../models/db.mjs";
import {
  processRawResults,
  processRawResultsArray,
  sendJsonErrorRes,
  sendJsonRes,
  serverErr,
} from "./utils.mjs";

export async function handleDefaultSearch(res) {
  try {
    const result = await BlogDb.find({}).skip(0).limit(10).populateAuthorSafe();
    return sendJsonRes(res, 200, await processRawResultsArray(result));
  } catch (error) {
    return serverErr(error, res);
  }
}

export async function handleSearchById(_id, res) {
  try {
    const result = await BlogDb.findById(_id).populateAuthorSafe();
    if (result) {
      return sendJsonRes(res, 200, processRawResults(result));
    }
    return sendJsonErrorRes(res, 404, `Blog with _id:${_id} not found.`);
  } catch (error) {
    return serverErr(error, res);
  }
}

export async function handleSearchByViews(params, res) {
  const query = { views: {} };
  if (params.viewsgt) query.views.$gt = params.viewsgt;
  if (params.viewslt) query.views.$lt = params.viewslt;

  try {
    const result = await BlogDb.find(query)
      .limit(params.limit || 10)
      .skip(params.skip || 0)
      .populateAuthorSafe();
    return sendJsonRes(res, 200, result);
  } catch (error) {
    return serverErr(error, res);
  }
}

export async function handleSearchByAuthor(params, res) {
  try {
    const authorId = await UserDb.find({ username: params.author });
    if (!authorId) {
      return sendJsonErrorRes(res, 400, `User not found !`);
    }
    const result = await BlogDb.find({ author: authorId })
      .populateAuthorSafe()
      .select("-__v -author.__v");
    return sendJsonRes(res, 200, result);
  } catch (error) {
    return serverErr(error, res);
  }
}

export async function handleSearchByTags(params, res) {
  const tagsToCheck = params.tags.split(",");
  try {
    const result = await BlogDb.find({ tags: { $in: tagsToCheck } })
      .limit(params.limit || 10)
      .skip(params.skip || 0)
      .populateAuthorSafe();
    return sendJsonRes(res, 200, result);
  } catch (error) {
    return serverErr(error, res);
  }
}
