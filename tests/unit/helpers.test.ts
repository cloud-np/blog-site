import { describe, it, expect } from 'vitest';
import { Helpers } from '@utils/helpers';

describe('Helpers.formatDate', () => {
  it('should format a date to US locale string', () => {
    const date = new Date('2024-01-15');
    const result = Helpers.formatDate(date);
    expect(result).toBe('January 15, 2024');
  });

  it('should handle different dates correctly', () => {
    const date = new Date('2023-12-25');
    const result = Helpers.formatDate(date);
    expect(result).toBe('December 25, 2023');
  });
});

describe('Helpers.slugify', () => {
  it('should convert a string to lowercase slug', () => {
    expect(Helpers.slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(Helpers.slugify('Hello! World?')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(Helpers.slugify('Hello   World')).toBe('hello-world');
  });

  it('should handle leading and trailing dashes', () => {
    expect(Helpers.slugify('  -Hello World-  ')).toBe('hello-world');
  });

  it('should handle multiple consecutive dashes', () => {
    expect(Helpers.slugify('Hello---World')).toBe('hello-world');
  });

  it('should preserve numbers', () => {
    expect(Helpers.slugify('Hello World 2024')).toBe('hello-world-2024');
  });

  it('should handle empty strings', () => {
    expect(Helpers.slugify('')).toBe('');
  });
});

describe('Helpers.generateCategoryData', () => {
  it('should generate category data from a set', () => {
    const categories = new Set(['JavaScript', 'TypeScript']);
    const result = Helpers.generateCategoryData(categories);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ name: 'JavaScript', slug: 'javascript' });
    expect(result).toContainEqual({ name: 'TypeScript', slug: 'typescript' });
  });

  it('should handle empty set', () => {
    const categories = new Set<string>();
    const result = Helpers.generateCategoryData(categories);
    expect(result).toEqual([]);
  });

  it('should slugify category names with spaces', () => {
    const categories = new Set(['Web Development']);
    const result = Helpers.generateCategoryData(categories);

    expect(result[0]).toEqual({ name: 'Web Development', slug: 'web-development' });
  });
});

describe('Helpers.normalizeIndex', () => {
  it('should return the same index if within bounds', () => {
    expect(Helpers.normalizeIndex(2, 5)).toBe(2);
  });

  it('should return 0 for negative index', () => {
    expect(Helpers.normalizeIndex(-1, 5)).toBe(0);
    expect(Helpers.normalizeIndex(-100, 5)).toBe(0);
  });

  it('should return last index for index >= array length', () => {
    expect(Helpers.normalizeIndex(5, 5)).toBe(4);
    expect(Helpers.normalizeIndex(10, 5)).toBe(4);
  });

  it('should return 0 for index 0', () => {
    expect(Helpers.normalizeIndex(0, 5)).toBe(0);
  });

  it('should handle edge case with array length 1', () => {
    expect(Helpers.normalizeIndex(0, 1)).toBe(0);
    expect(Helpers.normalizeIndex(1, 1)).toBe(0);
    expect(Helpers.normalizeIndex(-1, 1)).toBe(0);
  });
});
