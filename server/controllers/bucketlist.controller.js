const prisma = require('../config/db');

async function createItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { destination, country, continent, notes, priority, estimatedBudget, bestSeason, travelType } = req.body;

    const item = await prisma.bucketListItem.create({
      data: {
        userId,
        destination,
        country,
        continent,
        notes,
        priority: priority || 'MEDIUM',
        estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
        bestSeason,
        travelType,
      },
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function getItems(req, res, next) {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : req.user?.id;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const { search, continent, sort, includeArchived, includeCompleted } = req.query;

    const where = {
      userId,
      ...(continent ? { continent } : {}),
      ...(includeArchived === 'true' ? {} : { isArchived: false }),
      ...(includeCompleted === 'false' ? { isCompleted: false } : {}),
      ...(search
        ? {
            OR: [
              { destination: { contains: search } },
              { country: { contains: search } },
              { notes: { contains: search } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === 'budget' ? { estimatedBudget: 'asc' } :
      sort === 'alphabetical' ? { destination: 'asc' } :
      sort === 'oldest' ? { createdAt: 'asc' } :
      { createdAt: 'desc' };

    // Priority sort needs an explicit rank since Prisma can't order an
    // enum by "importance" natively — fetch then sort in JS for that case.
    let items = await prisma.bucketListItem.findMany({ where, orderBy });
    if (sort === 'priority') {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      items = items.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const existing = await prisma.bucketListItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Bucket list item not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const {
      destination, country, continent, notes, priority,
      estimatedBudget, bestSeason, travelType, isCompleted, isArchived,
    } = req.body;

    const updated = await prisma.bucketListItem.update({
      where: { id: existing.id },
      data: {
        destination: destination ?? existing.destination,
        country,
        continent,
        notes,
        priority,
        estimatedBudget: estimatedBudget !== undefined ? (estimatedBudget ? Number(estimatedBudget) : null) : undefined,
        bestSeason,
        travelType,
        isCompleted,
        isArchived,
      },
    });

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const item = await prisma.bucketListItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Bucket list item not found' });
    if (item.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.bucketListItem.delete({ where: { id: item.id } });
    res.json({ message: 'Bucket list item deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createItem, getItems, updateItem, deleteItem };
