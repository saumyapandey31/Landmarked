const prisma = require('../config/db');

async function toggleFollow(req, res, next) {
  try {
    const followingId = Number(req.params.userId);
    if (followingId === req.user.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const existing = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId } },
    });

    if (existing) {
      await prisma.follower.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    }

    await prisma.follower.create({ data: { followerId: req.user.id, followingId } });

    await prisma.notification.create({
      data: {
        userId: followingId,
        actorId: req.user.id,
        type: 'FOLLOW',
        message: 'started following you',
      },
    });

    res.json({ following: true });
  } catch (err) {
    next(err);
  }
}

async function getFollowers(req, res, next) {
  try {
    const followers = await prisma.follower.findMany({
      where: { followingId: Number(req.params.userId) },
      include: { follower: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.json({ followers: followers.map((f) => f.follower) });
  } catch (err) {
    next(err);
  }
}

async function getFollowing(req, res, next) {
  try {
    const following = await prisma.follower.findMany({
      where: { followerId: Number(req.params.userId) },
      include: { following: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.json({ following: following.map((f) => f.following) });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleFollow, getFollowers, getFollowing };
