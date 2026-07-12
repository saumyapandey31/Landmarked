const prisma = require('../config/db');

const entryInclude = {
  images: { orderBy: { position: 'asc' } },
};

async function createEntry(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, caption, location, country, city, travelDate, images } = req.body;

    const entry = await prisma.scrapbookEntry.create({
      data: {
        userId,
        title,
        caption,
        location,
        country,
        city,
        travelDate: travelDate ? new Date(travelDate) : null,
        images: images?.length
          ? { create: images.map((img, i) => ({
              url: typeof img === 'string' ? img : img.url,
              caption: typeof img === 'string' ? null : img.caption,
              position: i,
            })) }
          : undefined,
      },
      include: entryInclude,
    });

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

async function getEntries(req, res, next) {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : req.user?.id;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const { search, country, city, year, sort } = req.query;

    const where = {
      userId,
      ...(country ? { country } : {}),
      ...(city ? { city } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { caption: { contains: search } },
              { location: { contains: search } },
            ],
          }
        : {}),
      ...(year
        ? {
            travelDate: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${Number(year) + 1}-01-01`),
            },
          }
        : {}),
    };

    const orderBy =
      sort === 'oldest' ? { travelDate: 'asc' } :
      sort === 'title' ? { title: 'asc' } :
      { travelDate: 'desc' };

    const entries = await prisma.scrapbookEntry.findMany({
      where,
      include: entryInclude,
      orderBy,
    });

    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

async function getEntryById(req, res, next) {
  try {
    const entry = await prisma.scrapbookEntry.findUnique({
      where: { id: Number(req.params.id) },
      include: entryInclude,
    });
    if (!entry) return res.status(404).json({ message: 'Scrapbook entry not found' });
    res.json({ entry });
  } catch (err) {
    next(err);
  }
}

async function updateEntry(req, res, next) {
  try {
    const existing = await prisma.scrapbookEntry.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Scrapbook entry not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { title, caption, location, country, city, travelDate, images } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.scrapbookImage.deleteMany({ where: { entryId: existing.id } });
        await tx.scrapbookImage.createMany({
          data: images.map((img, i) => ({
            entryId: existing.id,
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'string' ? null : img.caption,
            position: i,
          })),
        });
      }

      return tx.scrapbookEntry.update({
        where: { id: existing.id },
        data: {
          title: title ?? existing.title,
          caption,
          location,
          country,
          city,
          travelDate: travelDate ? new Date(travelDate) : existing.travelDate,
        },
        include: entryInclude,
      });
    });

    res.json({ entry: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteEntry(req, res, next) {
  try {
    const entry = await prisma.scrapbookEntry.findUnique({ where: { id: Number(req.params.id) } });
    if (!entry) return res.status(404).json({ message: 'Scrapbook entry not found' });
    if (entry.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.scrapbookEntry.delete({ where: { id: entry.id } });
    res.json({ message: 'Scrapbook entry deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEntry, getEntries, getEntryById, updateEntry, deleteEntry };
