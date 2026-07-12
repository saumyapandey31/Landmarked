const prisma = require('../config/db');

async function addComment(req, res, next) {
  try {
    const { tripId, content } = req.body;
    if (!tripId || !content) return res.status(400).json({ message: 'tripId and content are required' });

    const comment = await prisma.comment.create({
      data: { userId: req.user.id, tripId: Number(tripId), content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const trip = await prisma.trip.findUnique({ where: { id: Number(tripId) } });
    if (trip && trip.userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: trip.userId,
          actorId: req.user.id,
          type: 'COMMENT',
          message: 'commented on your trip',
        },
      });
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const comments = await prisma.comment.findMany({
      where: { tripId: Number(req.params.tripId) },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ comments });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: Number(req.params.id) } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.comment.delete({ where: { id: comment.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { addComment, getComments, deleteComment };
