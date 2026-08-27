export function pointsForDish(points, dishName) {
  return points
    .filter((p) => p.dish_name === dishName)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function groupByProcess(points) {
  const groups = [];
  for (const p of points) {
    let g = groups.find((g) => g.process_name === p.process_name);
    if (!g) {
      g = { process_name: p.process_name, points: [] };
      groups.push(g);
    }
    g.points.push(p);
  }
  return groups;
}

export function mediaForPoint(media, pointId) {
  return media
    .filter((m) => m.point_id === pointId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}
