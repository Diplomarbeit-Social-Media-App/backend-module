import { expect, test, describe } from 'vitest';
import { renewTokenSchema } from '../../src/schema/auth';
import { shouldFail, shouldPass } from '../../src/utils/testUtils';

describe('Validation tests for renew token schema', () => {
  test('if empty object fails', async () => {
    const parsed = shouldFail(renewTokenSchema, { body: {} });
    expect(parsed.error?.message).toContain(
      'Ein refresh Token muss beigelegt werden!',
    );
  });
  test('if a valid body passes validation', async () => {
    shouldPass(renewTokenSchema, {
      body: {
        refresh: 'eyeaisdiasadslasd',
      },
    });
  });
});
