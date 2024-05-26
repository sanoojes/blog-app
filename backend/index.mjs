import "dotenv/config";
import express from "express";
import { connectToDB } from "./models/db.mjs";
import { customJsonParser } from "./lib/jsonParser.mjs";
import BlogRouter from "./routes/BlogRoutes.mjs";
import ErrorRouter from "./routes/ErrorRoutes.mjs";
import authRouter from "./routes/authRoutes.mjs";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3000;

const app = express();

await connectToDB();

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(customJsonParser);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Am Alive.");
});

//Handle /auth route
app.use(authRouter);

// Handle /blog route
app.use(BlogRouter);

// Handle Route error
app.use(ErrorRouter);

app.listen(PORT, () => console.log(`Server is running at PORT:${PORT}`));
