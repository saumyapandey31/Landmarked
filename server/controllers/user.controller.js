const prisma = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, avatarUrl: true, coverUrl: true, bio: true,
        homeCurrency: true, createdAt: true,
        _count: { select: { trips: true, followers: true, following: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      name, username, bio, avatarUrl, coverUrl, homeCurrency,
      country, travelPreferences, profileVisibility,
    } = req.body;

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ message: 'That username is already taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name, username, bio, avatarUrl, coverUrl, homeCurrency,
        country,
        travelPreferences: Array.isArray(travelPreferences) ? travelPreferences.join(',') : travelPreferences,
        profileVisibility,
      },
    });
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { emailNotifications, pushNotifications, journalReminders, travelReminders, marketingEmails, theme } = req.body;
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: { emailNotifications, pushNotifications, journalReminders, travelReminders, marketingEmails, theme },
      create: {
        userId: req.user.id,
        emailNotifications, pushNotifications, journalReminders, travelReminders, marketingEmails, theme,
      },
    });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
}

async function getStatistics(req, res, next) {
  try {
    const userId = Number(req.params.id);

    const trips = await prisma.trip.findMany({
      where: { userId },
      select: { countryId: true, cityId: true, startDate: true, endDate: true, budget: true },
    });

    const countries = new Set(trips.map((t) => t.countryId).filter(Boolean));
    const cities = new Set(trips.map((t) => t.cityId).filter(Boolean));

    const durations = trips
      .filter((t) => t.endDate)
      .map((t) => (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24));

    const totalSpent = trips.reduce((sum, t) => sum + (t.budget || 0), 0);

    res.json({
      statistics: {
        countriesVisited: countries.size,
        citiesVisited: cities.size,
        totalTrips: trips.length,
        longestTrip: durations.length ? Math.max(...durations) : 0,
        shortestTrip: durations.length ? Math.min(...durations) : 0,
        averageTripDuration: durations.length
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
        totalMoneySpent: totalSpent,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, getStatistics, getSettings, updateSettings, deleteAccount };
