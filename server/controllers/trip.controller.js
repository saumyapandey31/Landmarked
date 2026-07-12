const prisma = require('../config/db');

const tripInclude = {
  media: true,
  videos: true,
  expenses: { include: { category: true } },
  tags: { include: { tag: true } },
  country: true,
  city: true,
  user: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
};

async function createTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title, destination, country, countryId, cityId, state, latitude, longitude,
      startDate, endDate, travelType, transportation, companions,
      story, description, notes, rating, budget, privacy, coverImageUrl, tagNames, tags,
    } = req.body;

    // The "New Journal" form collects plain-text country/destination names
    // rather than internal IDs, so resolve/create the relational rows here.
    // This keeps the schema normalized without pushing ID lookups onto the
    // client.
    let resolvedCountryId = countryId ? Number(countryId) : null;
    let resolvedCityId = cityId ? Number(cityId) : null;

    if (!resolvedCountryId && country) {
      const countryRow = await prisma.country.upsert({
        where: { name: country },
        update: {},
        create: { name: country },
      });
      resolvedCountryId = countryRow.id;
    }

    if (!resolvedCityId && destination && resolvedCountryId) {
      const cityRow = await prisma.city.findFirst({
        where: { name: destination, countryId: resolvedCountryId },
      });
      resolvedCityId = cityRow
        ? cityRow.id
        : (
            await prisma.city.create({
              data: {
                name: destination,
                countryId: resolvedCountryId,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
              },
            })
          ).id;
    }

    const tagList = tagNames || (typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : tags) || [];

    const trip = await prisma.trip.create({
      data: {
        userId,
        title,
        countryId: resolvedCountryId,
        cityId: resolvedCityId,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        travelType,
        transportation,
        companions,
        story: story || description,
        notes,
        rating: rating ? Number(rating) : null,
        budget: budget ? Number(budget) : null,
        privacy: privacy || 'PUBLIC',
        coverImageUrl,
        tags: tagList.length
          ? {
              create: await Promise.all(
                tagList.map(async (name) => {
                  const tag = await prisma.tag.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                  });
                  return { tagId: tag.id };
                })
              ),
            }
          : undefined,
      },
      include: tripInclude,
    });

    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
}

async function getTrips(req, res, next) {
  try {
    const { userId, privacy } = req.query;
    const requestedUserId = userId ? Number(userId) : undefined;

    // Bugfix: an unfiltered privacy defaulted to PUBLIC even when a user
    // was requesting their OWN trips (e.g. the dashboard), which silently
    // hid every private/friends-only journal they'd just created. Only
    // default to PUBLIC-only when nobody is asking for a specific user's
    // trips (public "explore" style queries); the trip owner viewing their
    // own list gets everything, everyone else still only sees PUBLIC.
    const isOwner = requestedUserId && req.user?.id === requestedUserId;
    const where = {
      userId: requestedUserId,
      privacy: privacy ? privacy : (isOwner ? undefined : 'PUBLIC'),
    };

    const trips = await prisma.trip.findMany({
      where,
      include: tripInclude,
      orderBy: { startDate: 'desc' },
    });
    res.json({ trips });
  } catch (err) {
    next(err);
  }
}

async function getTripById(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        ...tripInclude,
        comments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

async function updateTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) } });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const {
      title, destination, country, countryId, cityId, state, latitude, longitude,
      startDate, endDate, travelType, transportation, companions,
      story, description, notes, rating, budget, privacy, coverImageUrl, tagNames, tags,
    } = req.body;

    // Same string-name → relational-ID resolution as createTrip, so the
    // edit form (which only knows plain-text country/destination) can PUT
    // straight back to this endpoint.
    let resolvedCountryId = countryId ? Number(countryId) : trip.countryId;
    let resolvedCityId = cityId ? Number(cityId) : trip.cityId;

    if (country) {
      const countryRow = await prisma.country.upsert({
        where: { name: country },
        update: {},
        create: { name: country },
      });
      resolvedCountryId = countryRow.id;
    }
    if (destination && resolvedCountryId) {
      const cityRow = await prisma.city.findFirst({ where: { name: destination, countryId: resolvedCountryId } });
      resolvedCityId = cityRow
        ? cityRow.id
        : (await prisma.city.create({ data: { name: destination, countryId: resolvedCountryId } })).id;
    }

    const tagList = tagNames || (typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : tags);

    const data = {
      title, state, travelType, transportation, companions, notes, privacy, coverImageUrl,
      countryId: resolvedCountryId,
      cityId: resolvedCityId,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      story: story ?? description,
      rating: rating !== undefined ? (rating ? Number(rating) : null) : undefined,
      budget: budget !== undefined ? (budget ? Number(budget) : null) : undefined,
    };
    // Strip undefined so a PATCH-style partial update never overwrites a
    // field the caller didn't send.
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const updated = await prisma.$transaction(async (tx) => {
      if (tagList) {
        await tx.tripTag.deleteMany({ where: { tripId: trip.id } });
        if (tagList.length) {
          const tagRows = await Promise.all(
            tagList.map((name) => tx.tag.upsert({ where: { name }, update: {}, create: { name } }))
          );
          await tx.tripTag.createMany({ data: tagRows.map((t) => ({ tripId: trip.id, tagId: t.id })) });
        }
      }
      return tx.trip.update({ where: { id: trip.id }, data, include: tripInclude });
    });

    res.json({ trip: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) } });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.trip.delete({ where: { id: trip.id } });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
}

async function addMedia(req, res, next) {
  try {
    const { url, caption, isCover } = req.body;
    const media = await prisma.tripMedia.create({
      data: { tripId: Number(req.params.id), url, caption, isCover: !!isCover },
    });
    res.status(201).json({ media });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip, addMedia };
