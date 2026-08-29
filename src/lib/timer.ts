export const durationMinutesOptions = (duration: string): number[] => {
  if (!/\bmin\b/i.test(duration)) return [];
  const range = duration.match(/(\d+)\s*[-–]\s*(\d+)\s*min/i);
  if (range) return [...new Set([Number(range[1]), Number(range[2])])].filter((value) => value > 0);
  const fixed = duration.match(/(\d+)\s*min/i);
  return fixed && Number(fixed[1]) > 0 ? [Number(fixed[1])] : [];
};
