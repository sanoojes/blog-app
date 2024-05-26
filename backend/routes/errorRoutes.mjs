import { Router } from "express";
import { sendJsonErrorRes } from "../lib/utils.mjs";

const ErrorRouter = Router();

ErrorRouter.all("*", (req, res) => {
  const error = "Page Not Found";
  const requestedUrl = req.originalUrl;
  return sendJsonErrorRes(res, 404, error, { requestedUrl });
});

export default ErrorRouter;
