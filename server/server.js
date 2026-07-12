require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const tripRoutes = require('./routes/trip.routes');
const markerRoutes = require('./routes/marker.routes');
const userRoutes = require('./routes/user.routes');
const commentRoutes = require('./routes/comment.routes');
const likeRoutes = require('./routes/like.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const followRoutes = require('./routes/follow.routes');
const notificationRoutes = require('./routes/notification.routes');
const weatherRoutes = require('./routes/weather.routes');
const currencyRoutes = require('./routes/currency.routes');
const uploadRoutes = require('./routes/upload.routes');
const scrapbookRoutes = require('./routes/scrapbook.routes');
const bucketListRoutes = require('./routes/bucketlist.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/scrapbook', scrapbookRoutes);
app.use('/api/bucket-list', bucketListRoutes);

// central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Landmark API running on http://localhost:${PORT}`));
