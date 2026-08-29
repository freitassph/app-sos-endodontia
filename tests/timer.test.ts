import { describe, expect, it } from 'vitest';
import { durationMinutesOptions } from '../src/lib/timer';

describe('clinical timer duration parsing', () => {
  it('preserves both ends of a duration range', () => {
    expect(durationMinutesOptions('5-10 min')).toEqual([5, 10]);
  });

  it('returns one choice for a fixed duration', () => {
    expect(durationMinutesOptions('3 min')).toEqual([3]);
  });

  it('returns an empty list for content without minutes', () => {
    expect(durationMinutesOptions('reavaliar em 24h')).toEqual([]);
  });
});
