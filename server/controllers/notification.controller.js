const prisma = require('../config/db');

async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: Number(req.params.id) } });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
    res.json({ notification: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markRead };
