export type Trail = {
  id: string;
  name: string;
  distanceKm: number;
  elevationM: number;
  notes: string;
};

/** Sample data so links like trailnotes://trail/42 have something to show. */
export const TRAILS: Trail[] = [
  {
    id: '42',
    name: 'Ridge Loop',
    distanceKm: 8.4,
    elevationM: 410,
    notes: 'Windy at the top. Start before 7am in summer.',
  },
  {
    id: 'wadi-shawka',
    name: 'Wadi Shawka Dam Trail',
    distanceKm: 5.2,
    elevationM: 290,
    notes: 'Rocky in places. Bring plenty of water.',
  },
  {
    id: 'cedar-falls',
    name: 'Cedar Falls',
    distanceKm: 3.1,
    elevationM: 120,
    notes: 'Easy family walk. The falls are best after rain.',
  },
];

export function findTrail(id: string): Trail | undefined {
  return TRAILS.find(t => t.id === id);
}
