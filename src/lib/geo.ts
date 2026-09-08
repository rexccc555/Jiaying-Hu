/** 球面距离（公里），用于粗略车程估算。 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLng = deg2rad(b.lng - a.lng);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

/** 市区/区域粗略平均车速假设（km/h），用于车程估算。 */
export function estimateDriveMinutes(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  avgKmh = 45,
): number {
  const km = haversineKm(from, to);
  const mins = Math.round((km / avgKmh) * 60);
  return Math.min(120, Math.max(10, mins));
}
