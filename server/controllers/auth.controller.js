const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function recordSession(userId, req) {
  try {
    await prisma.session.create({
      data: {
        userId,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      },
    });
  } catch {
    // Session logging is best-effort — never block auth on it.
  }
}

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const token = signToken(user);
    await recordSession(user.id, req);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    await recordSession(user.id, req);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          avatarUrl: payload.picture,
        },
      });
    }

    const token = signToken(user);
    await recordSession(user.id, req);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

// NOTE: production forgot-password flow should email a signed, short-lived reset
// token. This stub issues the token directly for local development purposes.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link was sent' });

    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    // TODO: send this via email service instead of returning it directly
    res.json({ message: 'Reset token generated', resetToken });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { resetToken, newPassword } = req.body;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') throw new Error('Invalid token');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hashed } });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
}

// Invalidates every JWT issued before now for this user (bumping
// tokenVersion) and clears the session log, so "Logout from all devices"
// actually revokes access instead of just being a client-side no-op.
async function logoutAllDevices(req, res, next) {
  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.user.id }, data: { tokenVersion: { increment: 1 } } }),
      prisma.session.deleteMany({ where: { userId: req.user.id } }),
    ]);
    res.json({ message: 'Logged out of all devices' });
  } catch (err) {
    next(err);
  }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { lastActiveAt: 'desc' },
      take: 20,
    });
    res.json({ sessions, lastLogin: sessions[0]?.createdAt || null });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.password) {
      return res.status(400).json({ message: 'This account signs in with Google and has no password to change' });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    // Rotating tokenVersion here means changing your password also signs
    // out every other device — the security-conscious default.
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, tokenVersion: { increment: 1 } },
    });

    const token = signToken({ ...user, tokenVersion: user.tokenVersion + 1 });
    res.json({ message: 'Password updated', token });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register, login, googleLogin, me, forgotPassword, resetPassword,
  logoutAllDevices, getSessions, changePassword,
};
