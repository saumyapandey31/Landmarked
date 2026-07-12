const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function protect(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // A single indexed lookup on the primary key — cheap enough not to hurt
  // request latency, and what makes "logout from all devices" / "change
  // password signs out other sessions" actually revoke access instead of
  // waiting out the token's natural expiry. This is a *separate* try/catch
  // from the JWT check above on purpose: if this lookup fails for an
  // infra reason (DB hiccup, a pending migration that hasn't added the
  // tokenVersion column yet), a genuinely valid, freshly-issued token
  // should still be allowed through rather than getting force-logged-out.
  if (decoded.tokenVersion !== undefined) {
    try {
      const current = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { tokenVersion: true },
      });
      if (!current) {
        return res.status(401).json({ message: 'Session expired, please log in again' });
      }
      if (current.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({ message: 'Session expired, please log in again' });
      }
    } catch (err) {
      console.error('tokenVersion revocation check failed, allowing request through:', err.message);
    }
  }

  req.user = decoded;
  next();
}

// attaches req.user if a valid token is present, but doesn't block the request
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
}

module.exports = { protect, optionalAuth };
