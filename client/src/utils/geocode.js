/**
 * Reverse geocodes lat/lon into a human place name using OpenStreetMap's free
 * Nominatim API — no backend changes, no API key needed. Users never type
 * latitude/longitude by hand; we resolve it the moment they click the globe.
 */
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await res.json();
    const address = data.address || {};

    const city = address.city || address.town || address.village || address.county || '';
    const state = address.state || '';
    const country = address.country || '';

    const label = [city, country].filter(Boolean).join(', ') || data.display_name || 'Unknown location';

    return { label, city, state, country };
  } catch {
    return { label: 'Unknown location', city: '', state: '', country: '' };
  }
}
