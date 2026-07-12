const prisma = require('../config/db');

async function toggleBookmark(req, res, next) {
  try {
    const { tripId } = req.body;
    const existing = await prisma.bookmark.findUnique({
      where: { userId_tripId: { userId: req.user.id, tripId: Number(tripId) } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ bookmarked: false });
    }

    await prisma.bookmark.create({ data: { userId: req.user.id, tripId: Number(tripId) } });
    res.json({ bookmarked: true });
  } catch (err) {
    next(err);
  }
}

async function getMyBookmarks(req, res, next) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      select: { tripId: true },
    });
    res.json({ tripIds: bookmarks.map((b) => b.tripId) });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleBookmark, getMyBookmarks };
