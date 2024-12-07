import { SafeParseReturnType, ZodSchema } from 'zod';
import { expect } from 'vitest';

const shouldFail = <T>(
  schema: ZodSchema,
  test: object,
): SafeParseReturnType<T, T> => {
  const parsed = schema.safeParse(test);
  expect(parsed.data).toBeUndefined();
  expect(parsed.error).toBeDefined();
  expect(parsed.success).toBe(false);
  return parsed;
};

const shouldPass = <T>(
  schema: ZodSchema,
  test: object,
): SafeParseReturnType<T, T> => {
  const parsed = schema.safeParse(test);
  expect(parsed.data).toBeDefined();
  expect(parsed.error).toBeUndefined();
  expect(parsed.success).toBe(true);
  return parsed;
};

export { shouldPass, shouldFail };
