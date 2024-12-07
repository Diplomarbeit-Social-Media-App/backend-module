import dayjs from 'dayjs';
import type { eventType } from '../../src/types/event';
import { eventSchema } from '../../src/schema/event';
import supertest from 'supertest';
import { server } from '../../src/index';
import { UNAUTHORIZED } from 'http-status';
import db from '../../src/utils/db';
import { expect, describe, test, afterAll } from 'vitest';

interface IBodyEventType {
  body: eventType;
}

const baseEvent: eventType = {
  description: 'A very cool festival in Wels',
  endsAt: dayjs().add(1, 'day').toDate(),
  startsAt: dayjs().add(7, 'hour').toDate(),
  name: 'WelserFest',
  coverImage: 'image_asdasd.webp',
  galleryImages: ['asd'],
  location: {
    city: 'Wels',
    houseNumber: '145',
    plz: 4600,
    street: 'Messegelände',
  },
  minAge: 6,
};

const app = supertest(server);

const buildBody = (values?: Partial<eventType>): IBodyEventType => {
  return { body: { ...baseEvent, ...values } };
};

describe('Checking of event validation', () => {
  test('if event schema fails if end date is earlier than start date', async () => {
    const event: IBodyEventType = buildBody({
      startsAt: dayjs().add(2, 'day').toDate(),
    });
    const parsed = eventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  test('if event schema fails if description is too short', async () => {
    const event: IBodyEventType = buildBody({
      description: '',
    });
    const parsed = eventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  test('if event schema fails if name is too short', async () => {
    const event: IBodyEventType = buildBody({
      name: '',
    });
    const parsed = eventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  test('if event schema fails if start date is earlier than now', async () => {
    const event: IBodyEventType = buildBody({
      startsAt: dayjs().subtract(5, 'day').toDate(),
    });
    const parsed = eventSchema.safeParse(event);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBeDefined();
  });

  test('if event is parsed successfully', async () => {
    const event: IBodyEventType = buildBody({});
    const parsed = eventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
    expect(parsed.error).toBeFalsy();
    expect(parsed.data).toBeDefined();
  });
});

describe('Checking event creation via request', () => {
  test('if event creation fails if not authorized to do so', async () => {
    await app
      .post('/event')
      .expect('Content-Type', /json/)
      .expect(UNAUTHORIZED)
      .catch((err) => {
        expect(err).toContain({ error: true });
      });
  });
});

afterAll(async () => {
  // eslint-disable-next-line no-async-promise-executor
  await new Promise(async (resolve, reject) => {
    await db.$disconnect();
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});
