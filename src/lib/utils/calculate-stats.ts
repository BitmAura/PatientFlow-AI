export const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const getTrendDirection = (change: number) => {
  if (change > 0) return 'up'
  if (change < 0) return 'down'
  return 'neutral'
}
