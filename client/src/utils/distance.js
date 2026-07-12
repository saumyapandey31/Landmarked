function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Sums straight-line distance between trips in chronological order — a real,
// if approximate, "distance traveled" figure computed from actual trip coordinates.
export function totalDistanceTraveled(trips = []) {
  const sorted = [...trips].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += haversineKm(sorted[i - 1], sorted[i]);
  }
  return Math.round(total);
}
