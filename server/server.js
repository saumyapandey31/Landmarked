require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const tripRoutes = require("./routes/trip.routes");
const markerRoutes = require("./routes/marker.routes");
const userRoutes = require("./routes/user.routes");
const commentRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const followRoutes = require("./routes/follow.routes");
const notificationRoutes = require("./routes/notification.routes");
const weatherRoutes = require("./routes/weather.routes");
const currencyRoutes = require("./routes/currency.routes");
const uploadRoutes = require("./routes/upload.routes");
const scrapbookRoutes = require("./routes/scrapbook.routes");
const bucketListRoutes = require("./routes/bucketlist.routes");

const app = express();

/* ===========================
   CORS Configuration
=========================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, curl, etc.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ===========================
   Middleware
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===========================
   Health Check
=========================== */

app.get("/", (req, res) => {
  res.send("🚀 Landmarked Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===========================
   API Routes
=========================== */

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/markers", markerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/scrapbook", scrapbookRoutes);
app.use("/api/bucket-list", bucketListRoutes);

/* ===========================
   Error Handler
=========================== */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ===========================
   Start Server
=========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Landmarked API running at http://localhost:${PORT}`);
});