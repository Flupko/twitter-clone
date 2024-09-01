const express = require("express");
const logger = require("./middlewares/logger");
const cookieParser = require("cookie-parser");
const { v2: cloudinary } = require("cloudinary");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const notificationRoutes = require("./routes/notification");

const connectMongoDb = require("./db/connectMongoDb");

require("dotenv").config();

const path = require("path");
const { log } = require("console");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
console.log(process.env.NODE_ENV);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

__dirname = path.resolve();

if (process.env.NODE_ENV === "prod") {
  // Serve static files from the "dist" directory
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  // For any route that doesn't match a static file, serve index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDb();
});
