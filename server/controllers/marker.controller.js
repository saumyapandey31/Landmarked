const prisma = require('../config/db');

async function createMarker(req, res, next) {
  try {
    const { type, label, latitude, longitude, countryId, cityId } = req.body;
    if (!type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'type, latitude and longitude are required' });
    }

    const marker = await prisma.travelMarker.create({
      data: {
        userId: req.user.id,
        type,
        label,
        latitude: Number(latitude),
        longitude: Number(longitude),
        countryId: countryId ? Number(countryId) : null,
        cityId: cityId ? Number(cityId) : null,
      },
    });
    res.status(201).json({ marker });
  } catch (err) {
    next(err);
  }
}

async function getMarkers(req, res, next) {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : req.user?.id;
    const markers = await prisma.travelMarker.findMany({
      where: { userId },
      include: { country: true, city: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ markers });
  } catch (err) {
    next(err);
  }
}

async function updateMarker(req, res, next) {
  try {
    const marker = await prisma.travelMarker.findUnique({ where: { id: Number(req.params.id) } });
    if (!marker) return res.status(404).json({ message: 'Marker not found' });
    if (marker.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updated = await prisma.travelMarker.update({
      where: { id: marker.id },
      data: req.body,
    });
    res.json({ marker: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteMarker(req, res, next) {
  try {
    const marker = await prisma.travelMarker.findUnique({ where: { id: Number(req.params.id) } });
    if (!marker) return res.status(404).json({ message: 'Marker not found' });
    if (marker.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await prisma.travelMarker.delete({ where: { id: marker.id } });
    res.json({ message: 'Marker deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createMarker, getMarkers, updateMarker, deleteMarker };
