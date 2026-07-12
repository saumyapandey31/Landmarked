const prisma = require('../config/db');

async function toggleLike(req, res, next) {
  try {
    const { tripId } = req.body;
    const existing = await prisma.like.findUnique({
      where: { userId_tripId: { userId: req.user.id, tripId: Number(tripId) } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }

    await prisma.like.create({ data: { userId: req.user.id, tripId: Number(tripId) } });

    const trip = await prisma.trip.findUnique({ where: { id: Number(tripId) } });
    if (trip && trip.userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: trip.userId,
          actorId: req.user.id,
          type: 'LIKE',
          message: 'liked your trip',
        },
      });
    }

    res.json({ liked: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleLike };
