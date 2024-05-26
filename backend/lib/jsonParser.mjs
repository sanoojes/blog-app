import { sendJsonErrorRes } from "./utils.mjs";

// Custom JSON parser middleware
export function customJsonParser(req, res, next) {
  // Check if the request method is POST or PATCH
  if (req.method === "POST" || req.method === "PATCH") {
    let rawData = "";
    req.on("data", (chunk) => {
      rawData += chunk;
    });

    req.on("end", () => {
      try {
        if (!rawData.trim()) {
          req.body = {};
        } else {
          req.body = JSON.parse(rawData);
        }
        next();
      } catch (e) {
        sendJsonErrorRes(res, 400, `Invalid JSON: ${e.message}`);
      }
    });

    req.on("error", (err) => {
      next(err);
    });
  } else {
    next();
  }
}
